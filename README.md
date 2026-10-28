# TaskBoard

Fikirden tamamlanana. Sade ve bağımsız bir Kanban uygulaması.

React + TypeScript · Express + TypeScript · PostgreSQL + Prisma. Next.js içermez.

![Masaüstü görünümü](docs/desktop.png)

[Telefon görünümü](docs/mobile.png)

## Özellikler

- Pano ve özel sütun oluşturma
- Kart oluşturma, düzenleme, silme
- Sütunlar arası sürükle bırak; klavye için kart ayrıntısında sütun seçimi
- Etiket, görevli, öncelik, son tarih ve arama
- Pano bazında ilerleme özeti

## Yerel kurulum

Gereksinimler: Node.js 22.12+, npm ve Docker Compose. PostgreSQL için Docker yerine kendi sunucunu kullanacaksan backend/.env içindeki DATABASE_URL değerini değiştir.

```sh
git clone https://github.com/hassanbera/taskboard.git
cd taskboard
npm ci
npm run db:up
npm run setup
npm run dev
```

- Arayüz: http://localhost:5173
- API: http://localhost:4101/api
- Sağlık: http://localhost:4101/api/health
- Yerel PostgreSQL: localhost:55441

`npm run setup`, yoksa backend/.env dosyasını örnekten oluşturur; Prisma Client üretir, sürümlenmiş migration'ları uygular ve örnek verileri ekler. Seed yalnızca boş uygulamaya demo kayıtları ekler, mevcut kayıtları silmez. Compose sadece PostgreSQL'i başlatır; API ve arayüz host üzerinde çalışır. `npm run db:down` veritabanını durdurur; volume içindeki veriler korunur.

## Mimari

```text
frontend/src/
  App.tsx                  # Kullanıcı akışları ve ekran
  components/ui.tsx        # Ortak arayüz bileşenleri
  lib/api.ts               # HTTP istemcisi
  types.ts                 # İstemci veri tipleri
backend/
  prisma/schema.prisma     # Kalıcı veri modeli
  prisma/migrations/       # Sürümlenmiş PostgreSQL migration'ları
  prisma.config.ts         # Prisma CLI bağlantı yapılandırması
  prisma/seed.ts            # Tekrarlanabilir demo kurulumu
  src/modules/taskboard/
    taskboard.model.ts       # Girdi şemaları, tipler ve model kuralları
    taskboard.repository.ts  # Prisma ve veritabanı işlemleri
    taskboard.service.ts     # İş akışları ve iş kuralları
    taskboard.controller.ts  # HTTP giriş / çıkış
    taskboard.routes.ts      # Endpoint eşlemeleri
  src/config/              # Ortam ve Prisma bağlantısı
  src/common/              # Merkezi hata yönetimi
```

İstek akışı: Route → Controller → Service → Repository → Prisma → PostgreSQL. Controller veritabanına erişmez. İlişkiler, indeksler ve silme davranışları Prisma şemasında tanımlıdır. Repository, iş akışının ihtiyaç duyduğu atomik transaction'ları sağlar.

## API

Başarılı yanıtlar `{ "data": ... }`, hatalar `{ "error": "..." }` biçimindedir. Geçersiz girdi 400, eksik kayıt 404, çakışma 409 döndürür.

| Yöntem         | Yol                     | İşlem                              |
| -------------- | ----------------------- | ---------------------------------- |
| GET            | /api/health             | Veritabanı bağlantısı dahil sağlık |
| GET / POST     | /api/boards             | Panolar / yeni pano                |
| GET            | /api/boards/:id         | Sütunları ve kartlarıyla pano      |
| POST           | /api/boards/:id/columns | Sütun ekle                         |
| POST           | /api/cards              | Kart ekle                          |
| PATCH / DELETE | /api/cards/:id          | Kart düzenle / sil                 |
| PATCH          | /api/cards/:id/move     | Aynı panoda sütun değiştir         |

## Doğrulama

```sh
npm run typecheck
npm test
npm run build
```

Testler gerçek PostgreSQL üzerinde HTTP API ve kritik iş kurallarını doğrular. Test komutu kendine ait rastgele isimli bir veritabanı oluşturur, migration uygular ve test sonunda yalnızca bu veritabanını siler. Geliştirme worker’ı ve demo verileri testlere karışmaz. Yerel veritabanı kullanıcısında CREATEDB yetkisi gerekir; Compose ve CI kullanıcısında bu yetki vardır. CI migration, tip kontrolü, test ve build adımlarını çalıştırır. Yerelde test öncesi `npm run setup` çalışmış olmalıdır.

## Yapılandırma ve sınırlar

- Bu sürüm tek çalışma alanlı bir portfolyo demosudur. Giriş ve kullanıcı bazında veri izolasyonu içermez; tüm ziyaretçiler aynı demo kayıtlarını görür ve değiştirir. Özel müşteri verisiyle veya erişimi kısıtlanmamış üretim API'si olarak kullanmadan önce kimlik doğrulama ve yetkilendirme eklenmelidir.
- Sunucu ve Vite geliştirme arayüzü varsayılan olarak yalnızca yerel makineyi dinler. Her proje kendi PostgreSQL volume ve portlarını kullanır.
- Parola ve bağlantı bilgileri yalnızca yerel demo içindir; gerçek dağıtımda environment secret kullan. .env dosyaları Git'e eklenmez.
- Üretim arayüzü için `frontend/dist` statik olarak sunulabilir. Aynı origin altında `/api` isteklerini Express sunucusuna yönlendir. Express'i `npm start -w backend` ile başlat; ters proxy/container kullanırken `HOST=0.0.0.0` değerini dağıtım ortamında tanımla.
- Backend derlemesi ve Prisma migration işlemleri dağıtımda ayrı adımlardır. Sürümler package-lock.json ile sabitlenir; bu başlangıç Prisma 7.10.1 kullanır.
- Sürükleme kartı hedef sütunun sonuna taşır; sütun içi özel sıralama bu sürümde yoktur. İlerleme, son sütundaki kart oranıdır. Görevli alanı metindir; kullanıcı hesabı değildir.

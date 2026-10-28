import { useEffect, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  CheckCircle2,
  Clock3,
  ListTodo,
  CalendarDays,
  AlignLeft,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { api, message, date } from './lib/api';
import { Shell, Modal, Notice, Stat, Loading, Empty } from './components/ui';
import type { Board, BoardSummary, Card } from './types';
export default function App() {
  const [boards, setBoards] = useState<BoardSummary[]>([]),
    [board, setBoard] = useState<Board | null>(null);
  const [selected, setSelected] = useState(''),
    [search, setSearch] = useState(''),
    [error, setError] = useState('');
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<'board' | 'column' | 'card' | null>(null),
    [editing, setEditing] = useState<Card | null>(null),
    [target, setTarget] = useState('');
  async function refresh(id = selected) {
    const list = await api<BoardSummary[]>('/boards');
    setBoards(list);
    const next = id || list[0]?.id || '';
    setSelected(next);
    setBoard(next ? await api<Board>('/boards/' + next) : null);
  }
  useEffect(() => {
    refresh()
      .catch((e) => setError(message(e)))
      .finally(() => setLoading(false));
  }, []);
  async function choose(id: string) {
    setLoading(true);
    try {
      await refresh(id);
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }
  async function mutate(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
      setModal(null);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function move(cardId: string, columnId: string) {
    await mutate(() =>
      api('/cards/' + cardId + '/move', { method: 'PATCH', body: JSON.stringify({ columnId }) }),
    );
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (modal === 'board') {
      setBusy(true);
      try {
        const created = await api<Board>('/boards', {
          method: 'POST',
          body: JSON.stringify({ name: f.get('name'), description: f.get('description') }),
        });
        await refresh(created.id);
        setModal(null);
      } catch (e) {
        setError(message(e));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (modal === 'column') {
      await mutate(() =>
        api('/boards/' + selected + '/columns', {
          method: 'POST',
          body: JSON.stringify({ name: f.get('name') }),
        }),
      );
      return;
    }
    const body = {
      title: f.get('title'),
      description: f.get('description'),
      assignee: f.get('assignee'),
      label: f.get('label'),
      priority: f.get('priority'),
      dueDate: f.get('dueDate') || null,
      ...(!editing ? { columnId: target } : {}),
    };
    await mutate(() =>
      api(editing ? '/cards/' + editing.id : '/cards', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      }),
    );
  }
  const all = board?.columns.flatMap((c) => c.cards) ?? [],
    done = board?.columns.at(-1)?.cards.length ?? 0;
  const progress = all.length ? Math.round((done / all.length) * 100) : 0;
  function newCard(columnId: string) {
    setTarget(columnId);
    setEditing(null);
    setModal('card');
  }
  return (
    <Shell
      title="Görev panosu"
      active="Panolar"
      subtitle="İşleri görünür kıl. Bir sonraki adıma odaklan."
      actions={
        <button className="primary" onClick={() => setModal('board')}>
          <Plus size={18} />
          Yeni pano
        </button>
      }
    >
      <Notice error={error} clear={() => setError('')} />
      <div className="stats">
        <Stat
          label="Toplam görev"
          value={all.length}
          detail="Bu panodaki tüm kartlar"
          icon={<LayoutGrid size={18} />}
        />
        <Stat
          label="Devam eden"
          value={board?.columns.slice(1, -1).reduce((n, c) => n + c.cards.length, 0) ?? 0}
          detail="Şu anda odaklandıklarımız"
          icon={<Clock3 size={18} />}
        />
        <Stat
          label="Tamamlanan"
          value={done}
          detail="Bir adım daha ileri"
          icon={<CheckCircle2 size={18} />}
        />
        <Stat
          label="İlerleme"
          value={progress + '%'}
          detail="Son sütundaki görev oranı"
          icon={<ListTodo size={18} />}
        />
      </div>
      <section className="surface board-surface">
        <div className="section-toolbar">
          <div className="toolbar-title">
            <span className="square-icon">
              <LayoutGrid size={18} />
            </span>
            <select aria-label="Pano seç" value={selected} onChange={(e) => choose(e.target.value)}>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <span className="badge">{all.length} görev</span>
          </div>
          <label className="search">
            <Search size={16} />
            <input
              placeholder="Kartlarda ara…"
              aria-label="Kartlarda ara"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {board && (
          <div className="board-description">
            {board.description}
            <div className="progress-track">
              <span style={{ width: progress + '%' }} />
            </div>
          </div>
        )}
        {loading ? (
          <Loading />
        ) : !board ? (
          <Empty>İlk panonu oluşturarak başla.</Empty>
        ) : (
          <div className="kanban">
            {board.columns.map((column, i) => (
              <section
                key={column.id}
                className={'kanban-column col-' + i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain');
                  if (all.some((c) => c.id === id) && !busy) void move(id, column.id);
                }}
              >
                <div className="column-heading">
                  <span className="column-dot" />
                  <h3>{column.name}</h3>
                  <span className="count">{column.cards.length}</span>
                  <button
                    className="icon-button"
                    aria-label={column.name + ' sütununa kart ekle'}
                    onClick={() => newCard(column.id)}
                  >
                    <Plus size={17} />
                  </button>
                </div>
                <div className="column-cards">
                  {column.cards
                    .filter((c) =>
                      (c.title + c.label + c.assignee)
                        .toLocaleLowerCase('tr')
                        .includes(search.toLocaleLowerCase('tr')),
                    )
                    .map((card) => (
                      <button
                        key={card.id}
                        className="task-card"
                        draggable={!busy}
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', card.id)}
                        onClick={() => {
                          setEditing(card);
                          setModal('card');
                        }}
                      >
                        <span
                          className={
                            'tag tag-' +
                            (['Tasarım', 'Frontend', 'Backend', 'İçerik'].indexOf(card.label) + 1)
                          }
                        >
                          {card.label}
                        </span>
                        <strong>{card.title}</strong>
                        {card.description && <p>{card.description}</p>}
                        <div className="task-meta">
                          <span className={'priority ' + card.priority.toLowerCase()}>
                            {card.priority === 'HIGH'
                              ? '↑ Yüksek'
                              : card.priority === 'LOW'
                                ? '↓ Düşük'
                                : '— Normal'}
                          </span>
                          {card.description && <AlignLeft size={14} />}
                        </div>
                        <div className="task-bottom">
                          {card.dueDate ? (
                            <span>
                              <CalendarDays size={13} />
                              {date(card.dueDate)}
                            </span>
                          ) : (
                            <span>Tarih yok</span>
                          )}
                          <span className="assignee" title={card.assignee || 'Atanmamış'}>
                            {card.assignee
                              ? card.assignee.slice(0, 2).toLocaleUpperCase('tr')
                              : '–'}
                          </span>
                        </div>
                      </button>
                    ))}
                  <button className="add-card" onClick={() => newCard(column.id)}>
                    <Plus size={16} />
                    Görev ekle
                  </button>
                </div>
              </section>
            ))}
            <button className="add-column" onClick={() => setModal('column')}>
              <Plus size={17} />
              Sütun ekle
            </button>
          </div>
        )}
      </section>
      <div className="hint">
        <ArrowRight size={15} />
        Kartları sürükleyerek taşı. Ayrıntıları düzenlemek için bir karta tıkla.
      </div>
      {modal && (
        <Modal
          title={
            modal === 'board'
              ? 'Yeni pano'
              : modal === 'column'
                ? 'Yeni sütun'
                : editing
                  ? 'Görev ayrıntıları'
                  : 'Yeni görev'
          }
          close={() => setModal(null)}
        >
          <Notice error={error} clear={() => setError('')} />
          <form onSubmit={submit}>
            {modal !== 'card' ? (
              <>
                <label>
                  Ad
                  <input name="name" required maxLength={modal === 'board' ? 100 : 60} autoFocus />
                </label>
                {modal === 'board' && (
                  <label>
                    Açıklama
                    <textarea name="description" maxLength={500} />
                  </label>
                )}
              </>
            ) : (
              <>
                <label>
                  Görev başlığı
                  <input
                    name="title"
                    required
                    maxLength={160}
                    defaultValue={editing?.title}
                    autoFocus
                  />
                </label>
                <label>
                  Açıklama
                  <textarea
                    name="description"
                    maxLength={2000}
                    defaultValue={editing?.description}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Etiket
                    <input
                      name="label"
                      required
                      maxLength={30}
                      defaultValue={editing?.label ?? 'Genel'}
                    />
                  </label>
                  <label>
                    Görevli
                    <input name="assignee" maxLength={80} defaultValue={editing?.assignee} />
                  </label>
                  <label>
                    Öncelik
                    <select name="priority" defaultValue={editing?.priority ?? 'NORMAL'}>
                      <option value="LOW">Düşük</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Yüksek</option>
                    </select>
                  </label>
                  <label>
                    Son tarih
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={editing?.dueDate?.slice(0, 10)}
                    />
                  </label>
                </div>
                {editing && (
                  <label>
                    Sütuna taşı
                    <select
                      value={editing.columnId}
                      disabled={busy}
                      onChange={async (e) => {
                        await move(editing.id, e.target.value);
                      }}
                    >
                      {board?.columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
            <div className="form-actions">
              {editing && modal === 'card' && (
                <button
                  type="button"
                  className="danger"
                  disabled={busy}
                  onClick={() => {
                    if (confirm('Bu görev silinsin mi?'))
                      void mutate(() => api('/cards/' + editing.id, { method: 'DELETE' }));
                  }}
                >
                  <Trash2 size={16} />
                  Sil
                </button>
              )}
              <button type="button" className="secondary" onClick={() => setModal(null)}>
                Vazgeç
              </button>
              <button className="primary" disabled={busy}>
                {busy ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Shell>
  );
}

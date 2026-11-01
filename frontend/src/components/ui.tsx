import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from 'react';
import { LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { NativeSelect } from './ui/native-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
export function UiButton({
  className = '',
  type = 'submit',
  color: _color,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  if (className === 'task-card') return <button className={className} type={type} {...props} />;
  return (
    <Button
      className={className}
      variant={
        className.includes('danger')
          ? 'destructive'
          : className.includes('primary') || className.includes('selected')
            ? 'default'
            : className.includes('secondary')
              ? 'outline'
              : 'ghost'
      }
      size={className.includes('icon-button') ? 'icon' : 'default'}
      type={type}
      {...props}
    />
  );
}
export function UiInput({ size: _size, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} />;
}
export function UiTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Textarea {...props} />;
}
export function UiSelect({ size: _size, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <NativeSelect {...props} />;
}
export function Shell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  active: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="taskboard-workspace">
      <aside className="project-rail">
        <a href="/" aria-label="TaskBoard">
          <LayoutGrid size={25} />
        </a>
        <span className="rail-divider" />
        <span className="rail-project" title="Görev panoları">
          TB
        </span>
      </aside>
      <div className="project-content">
        <header className="project-header">
          <a href="/">TaskBoard</a>
          <span>Proje çalışma alanı</span>
        </header>
        <main className="project-main">
          <div className="page-heading">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function Notice({ error, clear }: { error: string; clear: () => void }) {
  return error ? (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
      <Button variant="ghost" size="sm" onClick={clear}>
        Kapat
      </Button>
    </Alert>
  ) : null;
}
export function Stat({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <Card className="stat py-0 shadow-none">
      <CardContent className="p-4">
        <span className="stat-label">
          {icon}
          {label}
        </span>
        <strong className="stat-value">{value}</strong>
        <small className="stat-detail">{detail}</small>
      </CardContent>
    </Card>
  );
}
export function Loading() {
  return (
    <div className="empty" role="status">
      <Skeleton className="h-5 w-40" />
      Panolar yükleniyor…
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, children, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8', className)} {...props}>
      <div className="grid gap-1">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-primary">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}

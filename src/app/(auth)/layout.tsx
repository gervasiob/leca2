import { PaintBucketIcon } from '@/components/icons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-lg font-semibold">
        <PaintBucketIcon className="h-6 w-6 text-primary" />
        <span className="font-headline">Fábrica de Pintura</span>
      </div>
      {children}
    </div>
  );
}

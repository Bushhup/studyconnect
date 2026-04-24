"use client";

import { usePathname } from 'next/navigation';
import { Logo } from "./logo";

export function Footer() {
  const pathname = usePathname();

  // Hide global footer on portal pages to avoid duplication
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/faculty') || pathname?.startsWith('/student')) {
    return null;
  }

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold font-headline text-lg tracking-tight">StudyConnect</span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} StudyConnect Enterprise. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
            Connecting Minds • Building Futures
          </p>
        </div>
      </div>
    </footer>
  );
}

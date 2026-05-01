
"use client";

import { usePathname } from 'next/navigation';
import { Logo } from "./logo";
import { cn } from '@/lib/utils';

export function Footer() {
  const pathname = usePathname();

  // Hide global footer on portal pages to avoid duplication with internal layouts
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/faculty') || pathname?.startsWith('/student')) {
    return null;
  }

  const isHomePage = pathname === '/';

  return (
    <footer className={cn(
      "border-t",
      isHomePage ? "bg-slate-950 text-white border-white/5" : "bg-secondary/30"
    )}>
      <div className="container py-16 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold font-headline text-xl tracking-tight">StudyConnect</span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-3">
          <p className={cn(
            "text-sm font-medium",
            isHomePage ? "text-white/50" : "text-muted-foreground"
          )}>
            © {new Date().getFullYear()} StudyConnect Enterprise. All rights reserved.
          </p>
          <p className={cn(
            "text-[10px] uppercase tracking-[0.2em] font-bold",
            isHomePage ? "text-primary/60" : "text-muted-foreground/60"
          )}>
            Connecting Minds • Building Futures
          </p>
        </div>
      </div>
    </footer>
  );
}

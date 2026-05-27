"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { UserNav } from './user-nav';
import { MobileUserNav } from './mobile-user-nav';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/achievements', label: 'Milestones' },
  { href: '/gallery', label: 'Campus' },
  { href: '/events', label: 'Events' },
];

export function Header() {
  const pathname = usePathname();

  // Hide header on portal pages where sidebars/hubs take priority
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/faculty') || pathname?.startsWith('/student')) {
    return null;
  }

  const isHomePage = pathname === '/';

  return (
    <header className={cn(
      "w-full transition-all duration-500 h-16 flex items-center border-b z-50",
      isHomePage 
        ? "absolute top-0 bg-black/20 backdrop-blur-xl border-white/10" 
        : "sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-border/40"
    )}>
      <div className="container mx-auto h-full flex items-center px-4">
        <Link href="/" className="flex items-center gap-3 mr-auto group">
          <div className="p-1.5 bg-white rounded-xl shadow-lg transition-transform group-hover:scale-105">
            <Logo className="h-7 w-7 text-primary" />
          </div>
          <span className={cn(
            "font-bold font-headline text-xl tracking-tight transition-colors",
            isHomePage ? "text-white" : "text-foreground"
          )}>StudyConnect<span className="text-primary">.</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-all duration-300 relative py-1 hover:text-primary',
                pathname === link.href 
                  ? 'text-primary' 
                  : (isHomePage ? 'text-white/80 hover:text-white' : 'text-muted-foreground')
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4 ml-4 md:ml-20">
          <div className="hidden sm:block">
            <UserNav />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className={cn(
                "lg:hidden rounded-xl h-10 w-10 transition-all",
                isHomePage ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-primary/20"
              )}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="rounded-r-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background">
              <div className="h-2 w-full bg-primary" />
              <div className="p-8 flex flex-col h-full">
                <SheetHeader className="mb-10 text-left">
                  <Link href="/" className="flex items-center gap-4">
                    <Logo className="h-10 w-10 text-primary" />
                    <span className="font-bold font-headline text-2xl tracking-tighter">StudyConnect</span>
                  </Link>
                  <SheetDescription className="text-xs font-medium uppercase tracking-widest pt-2">Institutional Navigator</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'text-2xl font-headline font-bold transition-all hover:pl-2 flex items-center justify-between group',
                        pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {link.label}
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Menu className="h-4 w-4 -rotate-90" />
                      </div>
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-10 pb-6">
                  <MobileUserNav />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

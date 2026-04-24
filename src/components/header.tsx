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
  { href: '/achievements', label: 'Achievements' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/events', label: 'Events' },
];

export function Header() {
  const pathname = usePathname();

  // Hide global header on admin, faculty, and student pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/faculty') || pathname?.startsWith('/student')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-4 mr-auto hover:opacity-90 transition-opacity">
          <Logo className="h-9 w-9 text-primary" />
          <span className="font-bold font-headline text-xl tracking-tight">StudyConnect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-3 ml-4 md:ml-8">
          <div className="flex items-center gap-3">
            <UserNav />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden rounded-xl">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="rounded-r-[2rem]">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Access the main navigation links and your user portal.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col h-full pt-4">
                <div className="border-b pb-6">
                  <Link href="/" className="flex items-center gap-4">
                    <Logo className="h-10 w-10 text-primary" />
                    <span className="font-bold font-headline text-2xl">StudyConnect</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-5 mt-10">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'text-xl font-bold transition-all hover:pl-2 hover:text-primary',
                        pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                 <div className="mt-auto border-t pt-8 pb-4">
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

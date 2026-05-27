
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from "./logo";
import { cn } from '@/lib/utils';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  ArrowRight,
  ShieldCheck,
  Globe,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const pathname = usePathname();

  // Hide global footer on portal pages to avoid duplication with internal layouts
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/faculty') || pathname?.startsWith('/student')) {
    return null;
  }

  const isHomePage = pathname === '/';

  return (
    <footer className={cn(
      "border-t pt-20 pb-10 transition-colors duration-500",
      isHomePage ? "bg-slate-950 text-white border-white/5" : "bg-card text-foreground"
    )}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* COLUMN 1: IDENTITY */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <div className="p-2 bg-white rounded-xl shadow-lg">
                <Logo className="h-8 w-8 text-primary" />
              </div>
              <span className="font-bold font-headline text-2xl tracking-tighter">StudyConnect</span>
            </Link>
            <p className={cn(
              "text-sm font-body leading-relaxed max-w-xs",
              isHomePage ? "text-white/60" : "text-muted-foreground"
            )}>
              Empowering the next generation of academic leaders through a unified, AI-driven institutional ecosystem. Connecting minds and building futures since 1982.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Youtube, label: 'YouTube' },
              ].map((social) => (
                <button 
                  key={social.label}
                  className={cn(
                    "p-2 rounded-lg transition-all hover:-translate-y-1",
                    isHomePage ? "bg-white/5 hover:bg-primary hover:text-white" : "bg-muted hover:bg-primary hover:text-white"
                  )}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* COLUMN 2: ACADEMICS */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Academic Hub</h4>
            <ul className="space-y-4">
              {[
                { label: 'Milestones & Research', href: '/achievements' },
                { label: 'Campus Life Gallery', href: '/gallery' },
                { label: 'Academic Calendar', href: '/events' },
                { label: 'Admission Policy', href: '#' },
                { label: 'Institutional Bio Data', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className={cn(
                      "text-sm font-bold flex items-center group transition-all",
                      isHomePage ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <ArrowRight className="h-3 w-3 mr-0 opacity-0 transition-all group-hover:mr-2 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: SECURE PORTALS */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Secure Gateways</h4>
            <ul className="space-y-4">
              {[
                { label: 'Administrator Login', href: '/login' },
                { label: 'Faculty Management', href: '/login' },
                { label: 'Student Journey Portal', href: '/login' },
                { label: 'Identity Verification', href: '#' },
                { label: 'Alumni Network', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className={cn(
                      "text-sm font-bold flex items-center group transition-all",
                      isHomePage ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <ArrowRight className="h-3 w-3 mr-0 opacity-0 transition-all group-hover:mr-2 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER / CONTACT */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Stay Connected</h4>
            <div className={cn(
              "p-6 rounded-[1.5rem] border",
              isHomePage ? "bg-white/5 border-white/10" : "bg-muted border-border"
            )}>
              <p className="text-xs font-bold mb-4">Subscribe for Institutional Updates</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="email@college.edu" 
                  className={cn(
                    "h-10 rounded-xl border-none text-xs",
                    isHomePage ? "bg-white/10 text-white placeholder:text-white/30" : "bg-white"
                  )}
                />
                <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className={cn("flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight", isHomePage ? "text-white/40" : "text-muted-foreground")}>
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Main Campus, Academic Block 4
              </div>
              <div className={cn("flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight", isHomePage ? "text-white/40" : "text-muted-foreground")}>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                ISO 9001:2015 Certified Ecosystem
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className={cn(
          "pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6",
          isHomePage ? "border-white/10 text-white/40" : "border-border text-muted-foreground"
        )}>
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-bold font-headline">© {new Date().getFullYear()} StudyConnect Enterprise Institute.</p>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Connecting Minds • Building Futures</p>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-wider">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Sitemap</Link>
            <div className="flex items-center gap-1.5 text-primary">
              <Globe className="h-3 w-3" />
              <span>EN-US</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

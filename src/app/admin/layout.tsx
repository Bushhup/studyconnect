'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Building2, 
  BookOpen, Calendar, FileSpreadsheet, ClipboardCheck, 
  BarChart3, FileText, Settings, Bell, Activity, UserCog,
  Search, LogOut, Menu, X, GripHorizontal, FileUser, Users, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppTheme } from '@/components/theme-provider';

const collegeId = 'study-connect-college';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, keywords: 'overview, stats, analytics' },
  { href: '/admin/departments', label: 'Departments', icon: Building2, keywords: 'divisions, faculty, students, restructure' },
  { href: '/admin/users', label: 'Identity Hub', icon: UserCog, keywords: 'users, management, accounts, faculty, students' },
  { href: '/admin/alumni', label: 'Alumni Registry', icon: GraduationCap, keywords: 'graduates, completed, history' },
  { href: '/admin/courses', label: 'Curriculum', icon: BookOpen, keywords: 'subjects, modules' },
  { href: '/admin/content', label: 'Site Content', icon: FileText, keywords: 'events, achievements, public, post' },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck, keywords: 'presence, monitoring' },
  { href: '/admin/reports', label: 'Analytics', icon: BarChart3, keywords: 'performance, data' },
  { href: '/admin/notifications', label: 'Broadcasts', icon: Bell, keywords: 'announcements, alerts' },
  { href: '/admin/logs', label: 'System Logs', icon: Activity, keywords: 'audit, security, history' },
  { href: '/admin/settings', label: 'Config', icon: Settings, keywords: 'configuration, theme, layout' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hubRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { auth, firestore } = useFirebase();
  const { user } = useUser();
  const isMobile = useIsMobile();
  const { theme } = useAppTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [loopProgress, setLoopProgress] = useState(0);
  const [position, setPosition] = useState({ x: -1000, y: -1000 }); // Initialize far off-screen
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startAngle, setStartAngle] = useState(0);
  const [startRotation, setStartRotation] = useState(0);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [startLoopProgress, setStartLoopProgress] = useState(0);

  // User Profile
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile } = useDoc(profileRef);

  const isHOD = profile?.role === 'hod';

  const filteredLinks = useMemo(() => {
    return adminLinks.filter(link => {
      if (isHOD) {
        return !['/admin/logs', '/admin/settings', '/admin/users'].includes(link.href);
      }
      return true;
    });
  }, [isHOD]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof adminLinks>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const EDGE_MARGIN = isMobile ? 40 : 48;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - EDGE_MARGIN,
        y: window.innerHeight - (isMobile ? 80 : 100)
      });
    }
  }, [isMobile, EDGE_MARGIN]);

  useEffect(() => {
    if (!isOpen || isRotating || isDragging || filteredLinks.length === 0) return;
    
    const interval = setInterval(() => {
      if (theme.navStyle === 'wheel') {
        setRotation(prev => (prev + 0.15) % 360);
      } else {
        setLoopProgress(prev => (prev + 0.04) % filteredLinks.length);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isOpen, isRotating, isDragging, theme.navStyle, filteredLinks.length]);

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = filteredLinks.filter(link => 
        link.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.keywords?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery, filteredLinks]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    });
  };

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const getAngle = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - position.x;
    const dy = clientY - position.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, [position.x, position.y]);

  const startRotating = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isOpen || isDragging) return;
    e.stopPropagation();
    setIsRotating(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (theme.navStyle === 'wheel') {
      setStartAngle(getAngle(clientX, clientY));
      setStartRotation(rotation);
    } else {
      setStartDragPos({ x: clientX, y: clientY });
      setStartLoopProgress(loopProgress);
    }
  };

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

    if (isDragging) {
      const padding = 40;
      const newX = Math.min(Math.max(clientX - dragOffset.x, padding), window.innerWidth - padding);
      const newY = Math.min(Math.max(clientY - dragOffset.y, padding), window.innerHeight - padding);
      setPosition({ x: newX, y: newY });
    }

    if (isRotating) {
      if (theme.navStyle === 'wheel') {
        const currentAngle = getAngle(clientX, clientY);
        const angleDiff = currentAngle - startAngle;
        setRotation(startRotation + angleDiff);
      } else {
        const count = filteredLinks.length;
        if (count > 0) {
          const dx = clientX - startDragPos.x;
          const dy = clientY - startDragPos.y;
          
          const isAtBottom = position.y > window.innerHeight - 100;
          const isAtTop = position.y < 100;
          
          if (isAtBottom || isAtTop) {
            const units = dx / (window.innerWidth / count);
            setLoopProgress(((startLoopProgress - units) % count + count) % count);
          } else {
            const units = dy / (window.innerHeight / count);
            setLoopProgress(((startLoopProgress - units) % count + count) % count);
          }
        }
      }
    }
  }, [isDragging, isRotating, dragOffset, startAngle, startRotation, theme.navStyle, position, startDragPos, startLoopProgress, getAngle, filteredLinks.length]);

  const onEnd = useCallback(() => {
    if (isDragging) {
      const distLeft = position.x;
      const distRight = window.innerWidth - position.x;
      const distTop = position.y;
      const distBottom = window.innerHeight - position.y;
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      let snapX = position.x;
      let snapY = position.y;

      if (minDist === distLeft) snapX = EDGE_MARGIN;
      else if (minDist === distRight) snapX = window.innerWidth - EDGE_MARGIN;
      else if (minDist === distTop) snapY = EDGE_MARGIN;
      else if (minDist === distBottom) snapY = window.innerHeight - EDGE_MARGIN;

      setPosition({ x: snapX, y: snapY });
    }
    setIsDragging(false);
    setIsRotating(false);
  }, [isDragging, position, EDGE_MARGIN]);

  useEffect(() => {
    if (isDragging || isRotating) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, isRotating, onMove, onEnd]);

  const hubDimensions = isMobile ? 300 : 440;
  const hubRadius = isMobile ? 120 : 170;

  const getLinearTransform = (index: number) => {
    if (typeof window === 'undefined') return '';
    const count = filteredLinks.length;
    if (count === 0) return '';
    const effectiveIndex = ((index - loopProgress) % count + count) % count;
    const isAtBottom = position.y > window.innerHeight - 100;
    const isAtTop = position.y < 100;
    const isAtLeft = position.x < 100;
    const lineOffset = isMobile ? 60 : 80;

    if (isAtBottom || isAtTop) {
      const totalWidth = window.innerWidth;
      const spacing = totalWidth / count;
      const xOnScreen = effectiveIndex * spacing;
      const tx = xOnScreen - position.x + (spacing / 2);
      const ty = isAtBottom ? -lineOffset : lineOffset;
      return `translate(${tx}px, ${ty}px)`;
    } else {
      const totalHeight = window.innerHeight;
      const spacing = totalHeight / count;
      const yOnScreen = effectiveIndex * spacing;
      const ty = yOnScreen - position.y + (spacing / 2);
      const tx = isAtLeft ? lineOffset : -lineOffset;
      return `translate(${tx}px, ${ty}px)`;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden relative">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex-1 max-w-md hidden md:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Institutional Search (e.g. Dept, Section)..." 
                className="pl-10 bg-muted/50 border-none h-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setIsSearchOpen(true)}
              />
              {isSearchOpen && (
                <div className="absolute top-12 left-0 w-full bg-card border shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 border-b bg-muted/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Quick Navigation</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {searchResults.length > 0 ? (
                      searchResults.map(link => (
                        <button
                          key={link.href}
                          onClick={() => {
                            router.push(link.href);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors group text-left"
                        >
                          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                            <link.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{link.label}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">Admin Module</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No matching modules found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-foreground capitalize">{isHOD ? 'Department Head' : 'Administrator'}</span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{isHOD ? profile?.departmentId : 'Master Portal'}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full border-2 border-transparent hover:border-border">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10">
                    <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">{profile?.firstName?.[0] || 'AD'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-48 bg-card text-card-foreground border-border shadow-xl">
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold cursor-pointer gap-2 focus:bg-destructive/10">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-background">
          {children}
        </main>

        {mounted && (
          <div 
            ref={hubRef}
            className="fixed z-50 flex items-center justify-center select-none"
            style={{ 
              left: `${position.x}px`, 
              top: `${position.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={() => !isDragging && !isMobile && setIsOpen(true)}
            onMouseLeave={() => !isRotating && !isDragging && !isMobile && setIsOpen(false)}
            onClick={() => isMobile && setIsOpen(!isOpen)}
          >
            <div 
              className={cn(
                "absolute transition-all duration-700 ease-out pointer-events-none perspective-[1200px]",
                isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"
              )}
              style={{ 
                width: `${hubDimensions}px`, 
                height: `${hubDimensions}px`,
                transform: theme.navStyle === 'wheel' ? `rotate(${rotation}deg)` : 'none'
              }}
              onMouseDown={startRotating}
              onTouchStart={startRotating}
            >
              {filteredLinks.map((link, index) => {
                const isActive = pathname === link.href;
                const angle = (index / filteredLinks.length) * 360;
                const radius = hubRadius;
                const style = theme.navStyle === 'wheel' 
                  ? { transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle + rotation}deg)` }
                  : { transform: `translate(-50%, -50%) ${getLinearTransform(index)}` };

                return (
                  <div
                    key={link.href}
                    className={cn(
                      "absolute left-1/2 top-1/2 pointer-events-auto",
                      theme.navStyle === 'wheel' ? "transition-transform duration-500" : "transition-none"
                    )}
                    style={style}
                  >
                    <Link
                      href={link.href}
                      draggable={false}
                      className={cn(
                        "flex items-center gap-0 hover:gap-3 px-0 hover:px-4 h-10 md:h-12 rounded-full transition-all duration-500 ease-in-out shadow-xl border-2 group relative overflow-hidden",
                        isActive 
                          ? "bg-primary text-white border-white w-10 md:w-12 hover:w-44 z-10" 
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-primary hover:text-white w-10 md:w-12 hover:w-44"
                      )}
                    >
                      <div className="flex items-center justify-center min-w-[2.5rem] md:min-w-[3rem] h-full">
                        <link.icon className={cn("w-4 h-4 md:w-5 md:h-5 flex-shrink-0 transition-transform", isActive ? "scale-110" : "group-hover:rotate-12")} />
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-opacity duration-300 delay-100 pr-2">
                        {link.label}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>

            <div 
              onMouseDown={startDragging}
              onTouchStart={startDragging}
              className={cn(
                "relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-950 flex items-center justify-center cursor-move shadow-2xl transition-all duration-500 border-4",
                isOpen ? "border-primary scale-110 bg-slate-900" : "border-slate-800",
                isDragging && "scale-125 shadow-primary/40 ring-4 ring-primary/20"
              )}
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
              {isDragging ? <GripHorizontal className="w-5 h-5 text-white" /> : (isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />)}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.5); }
      `}</style>
    </div>
  );
}
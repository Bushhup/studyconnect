'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  BookOpen, Calendar, FileSpreadsheet, ClipboardCheck, 
  BarChart3, FileText, Settings, Bell, Activity, UserCog,
  Search, LogOut
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

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: UserCog },
  { href: '/admin/students', label: 'Students', icon: GraduationCap },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/classes', label: 'Classes', icon: Calendar },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/marks', label: 'Marks', icon: FileSpreadsheet },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/admin/reports', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/resources', label: 'Resources', icon: FileText },
  { href: '/admin/notifications', label: 'Announcements', icon: Bell },
  { href: '/admin/logs', label: 'Logs', icon: Activity },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const ITEM_HEIGHT = 70; // Height of each dial item in pixels
const VISIBLE_ITEMS = 7; // Number of items to calculate the arc for

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dialRef = useRef<HTMLDivElement>(null);
  
  // Find the initial index based on the current pathname
  const initialIndex = adminLinks.findIndex(link => link.href === pathname);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const [scrollOffset, setScrollOffset] = useState(initialIndex !== -1 ? initialIndex * ITEM_HEIGHT : 0);
  
  // Handle wheel scrolling for the dial
  const handleWheel = useCallback((e: React.WheelEvent) => {
    setScrollOffset(prev => {
      const newOffset = prev + e.deltaY * 0.5;
      // Clamp or Loop logic can go here. For infinite loop feel, we use modulo logic in rendering.
      return newOffset;
    });
  }, []);

  // Sync selected index with scroll position
  useEffect(() => {
    const calculatedIndex = Math.round(scrollOffset / ITEM_HEIGHT);
    const normalizedIndex = ((calculatedIndex % adminLinks.length) + adminLinks.length) % adminLinks.length;
    if (normalizedIndex !== selectedIndex) {
      setSelectedIndex(normalizedIndex);
    }
  }, [scrollOffset, selectedIndex]);

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Rotary Dial Sidebar */}
      <aside 
        className="w-24 md:w-32 bg-slate-900 flex flex-col items-center justify-center relative z-40 border-r border-white/5"
        onWheel={handleWheel}
      >
        <div className="absolute top-8 z-50">
           <Link href="/admin/dashboard" className="block p-2 bg-primary rounded-2xl shadow-lg shadow-primary/20">
             <div className="w-8 h-8 flex items-center justify-center text-white">
                <LayoutDashboard className="w-5 h-5" />
             </div>
           </Link>
        </div>

        {/* The Dial Container */}
        <div 
          className="relative w-full h-full flex flex-col items-center justify-center perspective-[1000px]"
          style={{ perspective: '800px' }}
        >
          {/* Visual Indicator / Center Highlight */}
          <div className="absolute left-0 right-0 h-[70px] bg-white/5 pointer-events-none z-0 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary" />
          
          <div 
            ref={dialRef}
            className="w-full transition-transform duration-500 ease-out preserve-3d"
            style={{ transform: `translateY(${-scrollOffset + (ITEM_HEIGHT * selectedIndex)}px)` }}
          >
            {adminLinks.map((link, index) => {
              // Calculate relative distance for 3D effect
              // We simulate infinite scrolling by repeating items or just focusing on the current view
              const diff = (index - selectedIndex);
              const rotation = diff * 20; // 20 degrees per item
              const opacity = Math.max(0, 1 - Math.abs(diff) * 0.25);
              const scale = Math.max(0.7, 1 - Math.abs(diff) * 0.1);
              const translateZ = Math.abs(diff) * -50; // Move items back as they move away
              const isActive = index === selectedIndex;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "absolute left-0 right-0 flex flex-col items-center justify-center transition-all duration-300",
                    isActive ? "text-primary" : "text-slate-400"
                  )}
                  style={{
                    height: `${ITEM_HEIGHT}px`,
                    top: `${index * ITEM_HEIGHT}px`,
                    opacity: opacity,
                    transform: `rotateX(${rotation}deg) translateZ(${translateZ}px) scale(${scale})`,
                    pointerEvents: Math.abs(diff) > 3 ? 'none' : 'auto'
                  }}
                  onClick={(e) => {
                    setScrollOffset(index * ITEM_HEIGHT);
                  }}
                >
                  <link.icon className={cn("transition-all duration-300", isActive ? "w-7 h-7" : "w-5 h-5")} />
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-tighter mt-1 animate-in fade-in slide-in-from-bottom-1">
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-8 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full border-2 border-transparent hover:border-white/10">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-slate-800 text-white font-bold">A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="rounded-xl w-48 ml-4">
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold cursor-pointer gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search campus directory..." className="pl-10 bg-slate-100/50 border-none h-10 rounded-xl focus-visible:ring-primary/20" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-800">Administrator</span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Master Portal</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-500" />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}


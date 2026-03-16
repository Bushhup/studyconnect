
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  BookOpen, Calendar, FileSpreadsheet, ClipboardCheck, 
  BarChart3, FileText, Settings, Bell, Activity, UserCog,
  Search, LogOut, Menu, X, GripHorizontal
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hubRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startAngle, setStartAngle] = useState(0);
  const [startRotation, setStartRotation] = useState(0);

  const EDGE_MARGIN = 48; // Snapping distance

  // Initialize position
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - EDGE_MARGIN,
        y: window.innerHeight - 100
      });
    }
  }, []);

  // Auto-rotate effect when open
  useEffect(() => {
    if (!isOpen || isRotating || isDragging) return;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.15) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, isRotating, isDragging]);

  const handleLogout = () => {
    router.replace('/login');
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

  const getAngle = (clientX: number, clientY: number) => {
    const dx = clientX - position.x;
    const dy = clientY - position.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const startRotating = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isOpen || isDragging) return;
    e.stopPropagation();
    setIsRotating(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartAngle(getAngle(clientX, clientY));
    setStartRotation(rotation);
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
      const currentAngle = getAngle(clientX, clientY);
      const angleDiff = currentAngle - startAngle;
      setRotation(startRotation + angleDiff);
    }
  }, [isDragging, isRotating, dragOffset, position.x, position.y, startAngle, startRotation]);

  const onEnd = useCallback(() => {
    if (isDragging) {
      // Snapping Logic
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
  }, [isDragging, position]);

  useEffect(() => {
    if (isDragging || isRotating) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, isRotating, onMove, onEnd]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden relative">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search campus directory..." className="pl-10 bg-slate-100/50 border-none h-10 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-800">Administrator</span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Master Portal</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full border-2 border-transparent hover:border-slate-100">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-48">
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold cursor-pointer gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>

        {/* Floating Hub Navigation */}
        <div 
          ref={hubRef}
          className="fixed z-50 flex items-center justify-center select-none"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseEnter={() => !isDragging && setIsOpen(true)}
          onMouseLeave={() => !isRotating && !isDragging && setIsOpen(false)}
        >
          {/* Circular Menu */}
          <div 
            className={cn(
              "absolute transition-all duration-700 ease-out pointer-events-none perspective-[1200px]",
              isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
            style={{ 
              width: '400px', 
              height: '400px',
              transform: `rotate(${rotation}deg)` 
            }}
            onMouseDown={startRotating}
            onTouchStart={startRotating}
          >
            {adminLinks.map((link, index) => {
              const angle = (index / adminLinks.length) * 360;
              const radius = 160;
              const isActive = pathname === link.href;

              return (
                <div
                  key={link.href}
                  className="absolute left-1/2 top-1/2 pointer-events-auto"
                  style={{
                    transform: `
                      translate(-50%, -50%) 
                      rotate(${angle}deg) 
                      translateY(-${radius}px) 
                      rotate(-${angle + rotation}deg)
                    `
                  }}
                >
                  <Link
                    href={link.href}
                    draggable={false}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 shadow-xl border-2 group relative",
                      isActive 
                        ? "bg-primary text-white border-white scale-125 z-10" 
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-primary hover:text-white"
                    )}
                  >
                    <link.icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:rotate-12")} />
                    
                    {/* Label with Slate-700 for high readability against light backgrounds */}
                    <span className={cn(
                      "absolute -bottom-9 whitespace-nowrap text-[10px] font-bold uppercase tracking-tighter transition-all duration-300",
                      isActive 
                        ? "opacity-100 translate-y-0 text-primary" 
                        : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 text-slate-700"
                    )}>
                      {link.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Hub Trigger Icon */}
          <div 
            onMouseDown={startDragging}
            onTouchStart={startDragging}
            className={cn(
              "relative w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center cursor-move shadow-2xl transition-all duration-500 border-4",
              isOpen ? "border-primary scale-110 bg-slate-900" : "border-slate-800",
              isDragging && "scale-125 shadow-primary/40 ring-4 ring-primary/20"
            )}
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
            {isDragging ? <GripHorizontal className="w-5 h-5 text-white" /> : (isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />)}
          </div>
        </div>
      </div>

      <style jsx global>{`
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

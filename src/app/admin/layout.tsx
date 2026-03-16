
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  BookOpen, Calendar, FileSpreadsheet, ClipboardCheck, 
  BarChart3, FileText, Settings, Bell, Activity, UserCog,
  Search, LogOut, Menu, X
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
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Auto-rotate effect for the "loop" feel
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden relative">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
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

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar pb-32">
          {children}
        </main>

        {/* Floating Circular Hub Navigation */}
        <div 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Circular Menu Items Container */}
          <div 
            className={cn(
              "absolute transition-all duration-700 ease-out pointer-events-none perspective-[1200px] preserve-3d",
              isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
            style={{ 
              width: '450px', 
              height: '450px',
              transform: `rotate(${rotation}deg)` 
            }}
          >
            {adminLinks.map((link, index) => {
              const angle = (index / adminLinks.length) * 360;
              const radius = 180; // Distance from center
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
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 shadow-xl border-2 group",
                      isActive 
                        ? "bg-primary text-white border-white scale-125 z-10" 
                        : "bg-white text-slate-600 border-slate-100 hover:border-primary hover:text-primary hover:scale-110"
                    )}
                  >
                    <link.icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:rotate-12")} />
                    <span className={cn(
                      "absolute -bottom-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-tighter transition-all duration-300",
                      isActive ? "opacity-100 translate-y-0 text-primary" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    )}>
                      {link.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Center Trigger Icon */}
          <div className={cn(
            "relative w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-500 border-4",
            isOpen ? "border-primary scale-110 bg-slate-800" : "border-white"
          )}>
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
            {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1200 {
          perspective: 1200px;
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
        /* Glow effect for active hub */
        @keyframes hub-glow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  );
}

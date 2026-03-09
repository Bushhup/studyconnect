'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  BookOpen, Calendar, FileSpreadsheet, ClipboardCheck, 
  BarChart3, FileText, Settings, Bell, Activity, UserCog,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { href: '/admin/users', label: 'Users', icon: UserCog, color: 'text-purple-500' },
  { href: '/admin/students', label: 'Students', icon: GraduationCap, color: 'text-emerald-500' },
  { href: '/admin/faculty', label: 'Faculty', icon: Users, color: 'text-amber-500' },
  { href: '/admin/departments', label: 'Departments', icon: Building2, color: 'text-pink-500' },
  { href: '/admin/classes', label: 'Classes', icon: Calendar, color: 'text-indigo-500' },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, color: 'text-cyan-500' },
  { href: '/admin/marks', label: 'Marks', icon: FileSpreadsheet, color: 'text-orange-500' },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck, color: 'text-rose-500' },
  { href: '/admin/reports', label: 'Analytics', icon: BarChart3, color: 'text-violet-500' },
  { href: '/admin/resources', label: 'Resources', icon: FileText, color: 'text-teal-500' },
  { href: '/admin/notifications', label: 'Announcements', icon: Bell, color: 'text-yellow-500' },
  { href: '/admin/logs', label: 'Activity Logs', icon: Activity, color: 'text-slate-500' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <aside className={cn("bg-white border-r transition-all duration-300 flex flex-col sticky top-0 h-screen z-40", isCollapsed ? "w-20" : "w-64")}>
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && <span className="font-headline font-bold text-xl tracking-tight">AdminPortal</span>}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto hover:bg-slate-50">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1 pb-10">
            {adminLinks.map((link) => (
              <Button key={link.href} asChild variant={pathname === link.href ? 'secondary' : 'ghost'} className={cn("w-full justify-start rounded-xl mb-1", pathname === link.href ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-slate-50", isCollapsed ? "px-0 justify-center h-12" : "px-4 py-6")}>
                <Link href={link.href}>
                  <link.icon className={cn("h-5 w-5 shrink-0", pathname === link.href ? "text-primary" : link.color)} />
                  {!isCollapsed && <span className="ml-3 font-bold truncate">{link.label}</span>}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className={cn("flex items-center p-2 rounded-2xl hover:bg-slate-50 transition-all", isCollapsed ? "justify-center" : "gap-3")}>
             <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">A</AvatarFallback>
             </Avatar>
             {!isCollapsed && <div className="truncate"><p className="text-sm font-bold text-slate-800">Administrator</p><p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Master Control</p></div>}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Global directory search..." className="pl-10 bg-slate-50 border-none h-10 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5 text-slate-500" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full overflow-hidden border-2 border-transparent hover:border-slate-100"><Avatar className="h-9 w-9"><AvatarFallback className="bg-slate-100 font-bold">A</AvatarFallback></Avatar></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-48">
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold cursor-pointer gap-2"><LogOut className="h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto bg-[#F1F5F9]">{children}</main>
      </div>
    </div>
  );
}

function LogOut(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  )
}

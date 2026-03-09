'use client';

import { useUser, useFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  BookOpen, Calendar, FileSpreadsheet, ClipboardCheck, 
  BarChart3, FileText, Settings, Bell, Activity, UserCog,
  Search, Mail, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
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
  const { user, isUserLoading, logout } = useUser() as any;
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isUserLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (isUserLoading || !user) {
    return <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <aside className={cn("bg-white border-r transition-all duration-300 flex flex-col sticky top-0 h-screen z-40", isCollapsed ? "w-20" : "w-64")}>
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && <span className="font-headline font-bold text-xl">EduPortal</span>}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {adminLinks.map((link) => (
              <Button key={link.href} asChild variant={pathname === link.href ? 'secondary' : 'ghost'} className={cn("w-full justify-start", pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground", isCollapsed ? "px-0 justify-center h-12" : "px-4 py-6")}>
                <Link href={link.href}>
                  <link.icon className={cn("h-5 w-5 shrink-0", pathname === link.href ? "text-primary" : link.color)} />
                  {!isCollapsed && <span className="ml-3 truncate">{link.label}</span>}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
             <Avatar className="h-9 w-9">
                <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
             </Avatar>
             {!isCollapsed && <div className="truncate"><p className="text-sm font-bold">{user.firstName}</p></div>}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6">
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 bg-slate-50 border-none h-9" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0"><Avatar className="h-8 w-8"><AvatarFallback>A</AvatarFallback></Avatar></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

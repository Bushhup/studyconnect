
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
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

const collegeId = 'study-connect-college';

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
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!authUser || !firestore) return null;
    return doc(firestore, 'colleges', collegeId, 'users', authUser.uid);
  }, [authUser, firestore]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/login');
    }
    if (!isProfileLoading && profile && profile.role !== 'admin') {
      router.replace('/profile');
    }
  }, [authUser, isUserLoading, profile, isProfileLoading, router]);

  // Faster initial check: if we are loading but have cached authUser, we can start showing the shell
  if (isUserLoading && !authUser) {
    return <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  // If no auth user yet, or profile mismatch, keep showing loading until redirect
  if (!authUser || (isProfileLoading && !profile)) {
    return <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Authorizing Admin Session...</p>
      </div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r transition-all duration-300 flex flex-col sticky top-0 h-screen z-40 shadow-sm",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-headline font-bold text-xl tracking-tight">EduPortal</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {adminLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={pathname === link.href ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start transition-all group",
                  pathname === link.href 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed ? "px-0 justify-center h-12" : "px-4 py-6"
                )}
              >
                <Link href={link.href} title={isCollapsed ? link.label : ""}>
                  <link.icon className={cn("h-5 w-5 shrink-0", pathname === link.href ? "text-primary" : link.color)} />
                  {!isCollapsed && <span className="ml-3 truncate">{link.label}</span>}
                  {!isCollapsed && pathname === link.href && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t mt-auto">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
             <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={authUser?.photoURL || ''} />
                <AvatarFallback>{authUser?.email?.[0].toUpperCase()}</AvatarFallback>
             </Avatar>
             {!isCollapsed && (
               <div className="flex flex-col truncate">
                 <span className="text-sm font-semibold truncate">{profile?.firstName} {profile?.lastName}</span>
                 <span className="text-xs text-muted-foreground truncate capitalize">{profile?.role}</span>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students, faculty, or reports..." 
                className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-medium bg-primary/5 text-primary border-primary/10 hover:bg-primary/10">
              <Plus className="h-4 w-4" /> Add Student
            </Button>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Mail className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                   <Avatar className="h-8 w-8 hover:ring-2 ring-primary/20 transition-all">
                      <AvatarImage src={authUser?.photoURL || ''} />
                      <AvatarFallback>A</AvatarFallback>
                   </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/logs')}>Activity Log</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={() => router.push('/login')}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

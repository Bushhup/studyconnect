
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  BookOpen, Calendar, FileSpreadsheet, ClipboardCheck, 
  BarChart3, FileText, Settings, Bell, Activity, UserCog
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const collegeId = 'study-connect-college';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: UserCog },
  { href: '/admin/students', label: 'Student Management', icon: GraduationCap },
  { href: '/admin/faculty', label: 'Faculty Management', icon: Users },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/classes', label: 'Class Management', icon: Calendar },
  { href: '/admin/courses', label: 'Course/Subjects', icon: BookOpen },
  { href: '/admin/marks', label: 'Marks Management', icon: FileSpreadsheet },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { href: '/admin/resources', label: 'Resources Mgmt', icon: FileText },
  { href: '/admin/notifications', label: 'Announcements', icon: Bell },
  { href: '/admin/logs', label: 'System Logs', icon: Activity },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

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

  if (isUserLoading || isProfileLoading) {
    return <div className="flex h-screen items-center justify-center">Loading Admin Portal...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card sticky top-16 h-[calc(100vh-4rem)]">
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {adminLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={pathname === link.href ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 px-4 py-2 text-sm font-medium",
                  pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  Award,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/login');
  };

  // Static Profile Data
  const profile = {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo.user@college.edu',
    role: 'student',
    id: 'STU-2024-001'
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
          <div>
            <h1 className="text-4xl font-headline font-bold">Welcome, {profile.firstName}</h1>
            <p className="text-muted-foreground font-body capitalize">
              {profile.role} Portal • {profile.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLogout} variant="outline" size="sm" className="font-headline rounded-full">
              Logout
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <PortalCard title="My Courses" description="View your active courses and grades." icon={BookOpen} link="/admin/courses" />
          <PortalCard title="Campus Life" description="Check out upcoming events and clubs." icon={Calendar} link="/events" />
          <PortalCard title="Achievements" description="View your academic awards and honors." icon={Award} link="/achievements" />
        </div>

        <Card className="border-none shadow-sm bg-primary/5 rounded-[2rem] overflow-hidden">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <LayoutDashboard className="h-5 w-5 text-primary" /> Quick Access
             </CardTitle>
             <CardDescription>Jump to the administration dashboard for the prototype.</CardDescription>
           </CardHeader>
           <CardContent>
             <Button asChild size="lg" className="w-full md:w-fit font-headline font-bold rounded-xl shadow-lg shadow-primary/20">
               <Link href="/admin/dashboard">Launch Admin Portal →</Link>
             </Button>
           </CardContent>
         </Card>

        <Card className="mt-12 border-none shadow-sm bg-slate-50 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" /> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm font-body">
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Full Name</p>
              <p className="text-lg font-bold text-slate-800">{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Email Address</p>
              <p className="text-lg font-bold text-slate-800">{profile.email}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">User ID</p>
              <p className="text-lg font-mono font-bold text-slate-800">{profile.id}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Role</p>
              <p className="text-lg font-bold text-slate-800 capitalize">{profile.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PortalCard({ title, description, icon: Icon, link }: { title: string, description: string, icon: any, link: string }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
      <CardHeader>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
        <CardDescription className="font-body line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="link" className="p-0 font-headline font-bold text-primary group-hover:translate-x-1 transition-transform">
          <Link href={link}>Access Module →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  PlusCircle, 
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

  // Static Profile
  const profile = {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@college.edu',
    role: 'student',
    id: 'DEMO-12345'
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
          <div>
            <h1 className="text-4xl font-headline font-bold">Welcome, {profile.firstName}</h1>
            <p className="text-muted-foreground font-body">
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Portal • {profile.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLogout} variant="outline" size="sm" className="font-headline">
              Logout
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <PortalCard title="My Courses" description="View your active courses and grades." icon={BookOpen} link="/admin/courses" />
          <PortalCard title="Campus Life" description="Check out upcoming events and clubs." icon={Calendar} link="/events" />
          <PortalCard title="Achievements" description="View your academic awards and honors." icon={Award} link="/achievements" />
        </div>

        <Card className="border-primary bg-primary/5">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <LayoutDashboard className="h-5 w-5" /> Quick Access
             </CardTitle>
             <CardDescription>Jump to the administration dashboard for the prototype.</CardDescription>
           </CardHeader>
           <CardContent>
             <Button asChild size="lg" className="w-full md:w-fit font-headline">
               <Link href="/admin/dashboard">Launch Admin Portal →</Link>
             </Button>
           </CardContent>
         </Card>

        <Card className="mt-12 bg-muted/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Settings className="w-5 h-5" /> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm font-body">
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Full Name</p>
              <p className="text-lg">{profile.firstName} {profile.lastName}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Email Address</p>
              <p className="text-lg">{profile.email}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">User ID</p>
              <p className="font-mono text-xs truncate">{profile.id}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Role</p>
              <p className="text-lg capitalize">{profile.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PortalCard({ title, description, icon: Icon, link }: { title: string, description: string, icon: any, link: string }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group border-primary/10">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
        <CardDescription className="font-body line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="link" className="p-0 font-headline group-hover:translate-x-1 transition-transform">
          <Link href={link}>Access Module →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

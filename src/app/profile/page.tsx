'use client';

import { useUser, useAuth, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { doc } from 'firebase/firestore';
import { 
  User as UserIcon, 
  Settings, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  GraduationCap, 
  PlusCircle, 
  Image as ImageIcon,
  Award
} from 'lucide-react';
import Link from 'next/link';

const collegeId = 'study-connect-college';

export default function ProfilePage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  // Memoize the document reference for the user's profile
  const userProfileRef = useMemoFirebase(() => {
    if (!authUser || !firestore) return null;
    return doc(firestore, 'colleges', collegeId, 'users', authUser.uid);
  }, [authUser, firestore]);

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      router.replace('/login');
    }
  }, [authUser, isAuthLoading, router]);

  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-destructive font-bold">Error loading profile: {profileError.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Retry</Button>
      </div>
    );
  }

  const role = profile?.role || 'student';

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
          <div>
            <h1 className="text-4xl font-headline font-bold">Welcome, {profile?.firstName || 'User'}</h1>
            <p className="text-muted-foreground font-body">
              {role.charAt(0).toUpperCase() + role.slice(1)} Portal • {profile?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLogout} variant="outline" size="sm" className="font-headline">
              Logout
            </Button>
          </div>
        </header>

        {role === 'admin' && <AdminPortal />}
        {role === 'faculty' && <FacultyPortal />}
        {role === 'student' && <StudentPortal />}

        <Card className="mt-12 bg-muted/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Settings className="w-5 h-5" /> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm font-body">
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Full Name</p>
              <p className="text-lg">{profile?.firstName} {profile?.lastName}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Email Address</p>
              <p className="text-lg">{profile?.email}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">User ID</p>
              <p className="font-mono text-xs truncate">{profile?.id}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Member Since</p>
              <p className="text-lg">March 2024</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentPortal() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <PortalCard 
        title="My Courses" 
        description="View your active courses and grades."
        icon={BookOpen}
        link="/courses"
      />
      <PortalCard 
        title="Campus Life" 
        description="Check out upcoming events and clubs."
        icon={Calendar}
        link="/events"
      />
      <PortalCard 
        title="Achievements" 
        description="View your academic awards and honors."
        icon={Award}
        link="/achievements"
      />
    </div>
  );
}

function FacultyPortal() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <PortalCard 
        title="Class Management" 
        description="Manage students and course materials."
        icon={GraduationCap}
        link="/faculty/classes"
      />
      <PortalCard 
        title="Post Events" 
        description="Organize new workshops or seminars."
        icon={PlusCircle}
        link="/events"
      />
      <PortalCard 
        title="Research" 
        description="Update your research publications."
        icon={BookOpen}
        link="/achievements"
      />
    </div>
  );
}

function AdminPortal() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <PortalCard 
        title="User Directory" 
        description="Manage student and faculty accounts."
        icon={UserIcon}
        link="/admin/users"
      />
      <PortalCard 
        title="Campus Content" 
        description="Update gallery and announcements."
        icon={ImageIcon}
        link="/gallery"
      />
      <PortalCard 
        title="Security & Logs" 
        description="Monitor system access and permissions."
        icon={ShieldCheck}
        link="/admin/logs"
      />
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
        <CardDescription className="font-body">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="link" className="p-0 font-headline">
          <Link href={link}>Access Portal →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

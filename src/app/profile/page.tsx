
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useUser, 
  useFirebase,
  useFirestore, 
  useDoc, 
  useMemoFirebase,
  updateDocumentNonBlocking 
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  Award,
  Settings,
  LayoutDashboard,
  Loader2,
  UserCircle,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const collegeId = 'study-connect-college';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real profile data
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  // Form state for editing
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    });
  };

  const handleOpenEdit = () => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
    }
    setIsEditOpen(true);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !firestore) return;

    setIsSubmitting(true);
    const ref = doc(firestore, 'colleges', collegeId, 'users', user.uid);
    
    updateDocumentNonBlocking(ref, {
      firstName,
      lastName,
      updatedAt: new Date().toISOString()
    });

    toast({
      title: 'Profile Updated',
      description: 'Your personal information has been successfully synchronized.'
    });

    setIsSubmitting(false);
    setIsEditOpen(false);
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing your portal...</p>
      </div>
    );
  }

  // Handle case where user is the .env admin or has no Firestore record
  const isAdmin = !profile && !isProfileLoading && !user;
  const displayProfile = profile || {
    firstName: isAdmin ? 'System' : 'Unknown',
    lastName: isAdmin ? 'Administrator' : 'User',
    email: isAdmin ? process.env.NEXT_PUBLIC_ADMIN_EMAIL : user?.email,
    role: isAdmin ? 'admin' : 'Guest',
    id: user?.uid || 'N/A'
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-xl ring-1 ring-slate-100">
               <AvatarImage src={profile?.photoURL} />
               <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                 {displayProfile.firstName?.[0]}{displayProfile.lastName?.[0]}
               </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-headline font-bold">Welcome, {displayProfile.firstName}</h1>
              <p className="text-muted-foreground font-body capitalize flex items-center gap-2 mt-1">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                  {displayProfile.role} Portal
                </span>
                • {displayProfile.email}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isAdmin && (
              <Button onClick={handleOpenEdit} variant="outline" className="gap-2 rounded-full font-headline border-primary/20 hover:bg-primary/5">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </Button>
            )}
            <Button onClick={handleLogout} variant="ghost" className="rounded-full font-headline text-muted-foreground hover:text-red-500">
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
             <CardTitle className="flex items-center gap-2 text-xl font-headline">
               <LayoutDashboard className="h-5 w-5 text-primary" /> Institutional Controls
             </CardTitle>
             <CardDescription>Access the management dashboard to oversee academic operations.</CardDescription>
           </CardHeader>
           <CardContent>
             <Button asChild size="lg" className="w-full md:w-fit font-headline font-bold rounded-xl shadow-lg shadow-primary/20 h-12 px-8">
               <Link href="/admin/dashboard">Launch Admin Portal →</Link>
             </Button>
           </CardContent>
         </Card>

        <Card className="mt-12 border-none shadow-sm bg-slate-50/50 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" /> Account Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm font-body">
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Full Name</p>
              <p className="text-lg font-bold text-slate-800">{displayProfile.firstName} {displayProfile.lastName}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Email Address</p>
              <p className="text-lg font-bold text-slate-800 truncate">{displayProfile.email}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">User / UID</p>
              <p className="text-sm font-mono font-bold text-slate-800 truncate">{displayProfile.id}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Status</p>
              <p className="text-lg font-bold text-emerald-600 capitalize">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" /> Edit Personal Information
            </DialogTitle>
            <DialogDescription>
              Update your institutional record. Changes reflect across all modules.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                <Input 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="bg-slate-50 border-none h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                <Input 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="bg-slate-50 border-none h-12 rounded-xl"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
               <p className="text-[10px] text-muted-foreground italic">
                 * Email and Role are managed by the administration and cannot be changed here.
               </p>
            </div>

            <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight shadow-lg shadow-primary/20 rounded-xl mt-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PortalCard({ title, description, icon: Icon, link }: { title: string, description: string, icon: any, link: string }) {
  return (
    <Card className="hover:shadow-xl transition-all duration-500 group border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
      <CardHeader>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:rotate-6">
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

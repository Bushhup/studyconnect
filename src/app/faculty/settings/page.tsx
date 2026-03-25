'use client';

import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useMemoFirebase 
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  UserCircle, Mail, Building2, Bell, 
  Shield, Key, Globe, LogOut, 
  Camera, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';

const collegeId = 'study-connect-college';

export default function FacultySettings() {
  const { toast } = useToast();
  const router = useRouter();
  const { auth, user } = useFirebase();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading } = useDoc(userDocRef);

  const handleSave = () => {
    toast({ title: 'Preferences Updated', description: 'Your portal settings have been synchronized.' });
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing faculty profile...</p>
      </div>
    );
  }

  const facultyName = profile ? `Dr. ${profile.firstName} ${profile.lastName}` : 'Dr. Sarah Smith';
  const facultyEmail = profile?.email || 'sarah.smith@college.edu';

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Portal Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage your professional profile and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold rounded-xl h-11">
              <UserCircle className="h-4 w-4" /> Professional Profile
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <Bell className="h-4 w-4" /> Notification Rules
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <Shield className="h-4 w-4" /> Security & Privacy
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-11" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout Session
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 border-b border-slate-50">
                 <CardTitle className="text-lg">Faculty Identity</CardTitle>
                 <CardDescription>Update your public information and department details.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                       <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-1 ring-slate-100">
                          <AvatarImage src={profile?.photoURL} />
                          <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                            {profile?.firstName?.[0] || 'F'}{profile?.lastName?.[0] || 'P'}
                          </AvatarFallback>
                       </Avatar>
                       <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg border-2 border-white">
                          <Camera className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                          <Input defaultValue={facultyName} className="bg-slate-50 border-none h-11 rounded-xl" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                          <Input defaultValue={facultyEmail} readOnly className="bg-slate-50 border-none h-11 rounded-xl text-muted-foreground" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department</Label>
                          <Input defaultValue={profile?.departmentId || "Engineering & Technology"} readOnly className="bg-slate-50 border-none h-11 rounded-xl text-muted-foreground" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Staff ID</Label>
                          <Input defaultValue={profile?.id?.slice(0, 8).toUpperCase() || "F-2024-882"} readOnly className="bg-slate-50 border-none h-11 rounded-xl text-muted-foreground" />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader>
                 <CardTitle className="text-lg">Application Settings</CardTitle>
                 <CardDescription>Control alerts and regional portal preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Email Notifications</Label>
                       <p className="text-xs text-muted-foreground">Receive daily summaries of student submissions.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <Separator className="bg-slate-50" />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Automatic Attendance Summary</Label>
                       <p className="text-xs text-muted-foreground">Generate weekly attendance reports for assigned classes.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <Separator className="bg-slate-50" />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Show Student Performance Badges</Label>
                       <p className="text-xs text-muted-foreground">Display performance indicators in the student directory.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
              </CardContent>
              <CardContent className="pt-0 flex justify-end">
                 <Button onClick={handleSave} className="gap-2 rounded-xl shadow-lg shadow-primary/20 font-bold uppercase tracking-tight h-11 px-8">
                    <CheckCircle2 className="h-4 w-4" /> Save Preferences
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-lg">Security & Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Key className="h-5 w-5 text-slate-400" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">Change Portal Password</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Last changed 3 months ago</p>
                       </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

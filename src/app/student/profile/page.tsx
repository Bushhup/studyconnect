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
import { 
  User, Mail, Phone, MapPin, Building2, 
  GraduationCap, Calendar, Edit3, Lock,
  Camera, UserCircle, Clock, Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const collegeId = 'study-connect-college';

export default function StudentProfile() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading } = useDoc(userDocRef);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing academic record...</p>
      </div>
    );
  }

  const studentName = profile ? `${profile.firstName} ${profile.lastName}` : 'Alex Johnson';
  const studentEmail = profile?.email || 'alex.j@college.edu';
  const studentUsername = profile?.username || 'alex_j_2024';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Identity & Records</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and institutional profile.</p>
        </div>
        <Button onClick={() => toast({ title: 'Request Sent', description: 'Institutional data updates require admin approval.' })} variant="outline" className="rounded-full gap-2 border-slate-200 shadow-sm bg-white">
          <Edit3 className="h-4 w-4" /> Request Profile Update
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pb-8 border-b border-slate-50">
              <div className="relative mx-auto w-fit">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-1 ring-slate-100">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">
                    {studentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg border-2 border-white">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-2xl font-headline font-bold mt-4">{studentName}</CardTitle>
              <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">@{studentUsername}</p>
              <Badge className="mt-2 bg-emerald-50 text-emerald-600 border-none px-4 py-1">Active Enrollment</Badge>
            </CardHeader>
            <CardContent className="pt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{studentEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>+1 (555) 012-3456</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>West Campus Housing, Block B</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-white rounded-[2.5rem] p-6 relative overflow-hidden">
            <GraduationCap className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 rotate-12" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <UserCircle className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Institutional Status</p>
              </div>
              <div>
                <p className="text-xl font-bold">Good Standing</p>
                <p className="text-xs text-white/60">No disciplinary flags on record.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-headline font-bold">Academic Registration</CardTitle>
              <CardDescription>Verified details from the institutional directory.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Student ID', value: profile?.id?.slice(0, 8).toUpperCase() || '2024CS01', icon: User },
                { label: 'Department', value: profile?.departmentId || 'Engineering & Technology', icon: Building2 },
                { label: 'Degree Program', value: 'Bachelor of Technology (UG)', icon: GraduationCap },
                { label: 'Major Specialization', value: 'Computer Science', icon: CheckCircle2 },
                { label: 'Current Semester', value: 'Semester 5', icon: Calendar },
                { label: 'Year of Admission', value: '2022', icon: Clock },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">{item.label}</p>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all">
                    <item.icon className="h-4 w-4 text-primary opacity-40" />
                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold">Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Change Portal Password</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Last changed 2 months ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full group-hover:text-primary">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCircle, Mail, Building2, Bell, 
  Shield, Key, Globe, LogOut, Palette,
  Camera, CheckCircle2, Loader2, Check,
  Layout, Type, Monitor, GripVertical, CircleDot
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAppTheme, type BackgroundTheme, type PrimaryTheme, type TextTheme, type NavStyle } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

const bgThemes: { id: BackgroundTheme; name: string; color: string }[] = [
  { id: 'default', name: 'Cloud Gray', color: 'bg-[#F1F5F9]' },
  { id: 'white', name: 'Paper White', color: 'bg-white border' },
  { id: 'navy', name: 'Midnight Blue', color: 'bg-[#0F172A]' },
  { id: 'black', name: 'Absolute Black', color: 'bg-black' },
];

const primaryThemes: { id: PrimaryTheme; name: string; color: string }[] = [
  { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500' },
  { id: 'emerald', name: 'Forest Green', color: 'bg-emerald-500' },
  { id: 'violet', name: 'Deep Purple', color: 'bg-violet-600' },
  { id: 'amber', name: 'Golden Sun', color: 'bg-amber-500' },
];

const navStyles: { id: NavStyle; name: string; desc: string; icon: any }[] = [
  { id: 'wheel', name: 'Orbital Wheel', desc: 'Classic circular rotating carousel.', icon: CircleDot },
  { id: 'straight', name: 'Linear Edge', desc: 'Icons extend in a dynamic straight line.', icon: GripVertical },
];

export default function FacultySettings() {
  const { toast } = useToast();
  const router = useRouter();
  const { auth, user } = useFirebase();
  const firestore = useFirestore();
  const { theme, setBg, setPrimary, setText, setNavStyle } = useAppTheme();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading } = useDoc(userDocRef);

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

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Portal Configuration</h1>
        <p className="text-muted-foreground mt-1">Personalize your teaching workspace and professional profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <UserCircle className="h-4 w-4" /> Professional Profile
           </Button>
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold rounded-xl h-11">
              <Palette className="h-4 w-4" /> Modular Theming
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <Bell className="h-4 w-4" /> Notifications
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-11" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout Session
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-lg">Experience Builder</CardTitle>
                 <CardDescription>Independently configure each aspect of your portal's visual presentation.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Tabs defaultValue="background" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-11 bg-slate-50 p-1 rounded-xl mb-6">
                       <TabsTrigger value="background" className="gap-2 rounded-lg text-xs font-bold">
                         <Monitor className="h-3.5 w-3.5" /> Workspace
                       </TabsTrigger>
                       <TabsTrigger value="common" className="gap-2 rounded-lg text-xs font-bold">
                         <Type className="h-3.5 w-3.5" /> Text
                       </TabsTrigger>
                       <TabsTrigger value="special" className="gap-2 rounded-lg text-xs font-bold">
                         <Layout className="h-3.5 w-3.5" /> Accents
                       </TabsTrigger>
                       <TabsTrigger value="navigation" className="gap-2 rounded-lg text-xs font-bold">
                         <GripVertical className="h-3.5 w-3.5" /> Nav
                       </TabsTrigger>
                    </TabsList>

                    <TabsContent value="background" className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in-50">
                       {bgThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setBg(t.id)}
                            className={cn(
                              "group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                              theme.bg === t.id ? "border-primary bg-primary/5" : "border-slate-50 hover:border-slate-100 bg-white"
                            )}
                          >
                            <div className={cn("h-10 w-10 rounded-full shadow-inner", t.color)} />
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">{t.name}</span>
                            {theme.bg === t.id && <div className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full"><Check className="h-2 w-2" /></div>}
                          </button>
                       ))}
                    </TabsContent>

                    <TabsContent value="common" className="space-y-3 animate-in fade-in-50">
                       {['soft', 'standard', 'vivid'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setText(mode as any)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                              theme.text === mode ? "border-primary bg-primary/5" : "border-slate-50 bg-white"
                            )}
                          >
                            <p className="text-sm font-bold capitalize">{mode} Intensity</p>
                            {theme.text === mode && <Check className="h-4 w-4 text-primary" />}
                          </button>
                       ))}
                    </TabsContent>

                    <TabsContent value="special" className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in-50">
                       {primaryThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setPrimary(t.id)}
                            className={cn(
                              "group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                              theme.primary === t.id ? "border-primary bg-primary/5" : "border-slate-50 hover:border-slate-100 bg-white"
                            )}
                          >
                            <div className={cn("h-10 w-10 rounded-lg shadow-md", t.color)} />
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">{t.name}</span>
                            {theme.primary === t.id && <div className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full"><Check className="h-2 w-2" /></div>}
                          </button>
                       ))}
                    </TabsContent>

                    <TabsContent value="navigation" className="space-y-3 animate-in fade-in-50">
                       {navStyles.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setNavStyle(s.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                              theme.navStyle === s.id ? "border-primary bg-primary/5" : "border-slate-50 bg-white"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn("p-2 rounded-lg", theme.navStyle === s.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                                <s.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{s.name}</p>
                                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                              </div>
                            </div>
                            {theme.navStyle === s.id && <Check className="h-4 w-4 text-primary" />}
                          </button>
                       ))}
                    </TabsContent>
                 </Tabs>
              </CardContent>
           </Card>

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
                          <Input value={profile?.email || ''} readOnly className="bg-slate-50 border-none h-11 rounded-xl text-muted-foreground" />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

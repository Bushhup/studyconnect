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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCircle, Bell, Shield, Key, 
  Globe, LogOut, Palette, Check,
  Monitor, Type, Layout, Camera,
  CircleDot, GripVertical, Loader2
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
  { id: 'rose', name: 'Velvet Rose', color: 'bg-rose-500' },
];

const navStyles: { id: NavStyle; name: string; desc: string; icon: any }[] = [
  { id: 'wheel', name: 'Orbital Wheel', desc: 'Classic circular rotating carousel.', icon: CircleDot },
  { id: 'straight', name: 'Linear Dynamic', desc: 'Icons extend in a dynamic straight line.', icon: GripVertical },
];

export default function StudentSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const { auth, user } = useFirebase();
  const firestore = useFirestore();
  const { theme, setBg, setPrimary, setText, setNavStyle } = useAppTheme();

  // Fetch student profile from the institutional directory
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);

  const { data: profile, isLoading } = useDoc(userDocRef);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: 'Preferences Saved',
      description: 'Your workspace settings have been updated across your portal.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing student profile...</p>
      </div>
    );
  }

  const studentName = profile ? `${profile.firstName} ${profile.lastName}` : 'Student User';
  const studentInitials = profile ? `${profile.firstName?.[0]}${profile.lastName?.[0]}` : 'ST';

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Portal Configuration</h1>
        <p className="text-muted-foreground mt-1 font-body">Personalize your academic workspace and communication preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <UserCircle className="h-4 w-4" /> Personal Profile
           </Button>
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold rounded-xl h-11">
              <Palette className="h-4 w-4" /> Workspace Builder
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <Bell className="h-4 w-4" /> Alert Rules
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-11" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Exit Portal
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-lg font-headline">Modular Identity Builder</CardTitle>
                 <CardDescription>Custom-build your interface by adjusting workspace, text, and navigation styles.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Tabs defaultValue="background" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-12 bg-muted p-1 rounded-xl mb-8">
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
                         <GripVertical className="h-3.5 w-3.5" /> Nav Hub
                       </TabsTrigger>
                    </TabsList>

                    <TabsContent value="background" className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in-50">
                       {bgThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setBg(t.id)}
                            className={cn(
                              "group relative flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all duration-300",
                              theme.bg === t.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/20 bg-muted/30"
                            )}
                          >
                            <div className={cn("h-10 w-10 rounded-full shadow-inner", t.color)} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.bg === t.id ? "text-primary" : "text-muted-foreground")}>{t.name}</span>
                            {theme.bg === t.id && <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg"><Check className="h-2.5 w-2.5" /></div>}
                          </button>
                       ))}
                    </TabsContent>

                    <TabsContent value="common" className="space-y-3 animate-in fade-in-50">
                       {[
                         { id: 'soft', name: 'Low Intensity (Soft)', desc: 'Reduced eye strain for long study sessions.' },
                         { id: 'standard', name: 'Modern Balanced (Standard)', desc: 'The default optimized StudyConnect experience.' },
                         { id: 'vivid', name: 'High Visibility (Vivid)', desc: 'Maximum contrast for data-heavy views.' }
                       ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setText(t.id as any)}
                            className={cn(
                              "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                              theme.text === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20 bg-muted/30"
                            )}
                          >
                            <div>
                              <p className={cn("text-base font-bold", theme.text === t.id ? "text-primary" : "text-foreground")}>{t.name}</p>
                              <p className="text-xs text-muted-foreground font-body">{t.desc}</p>
                            </div>
                            {theme.text === t.id && <Check className="h-5 w-5 text-primary" />}
                          </button>
                       ))}
                    </TabsContent>

                    <TabsContent value="special" className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in-50">
                       {primaryThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setPrimary(t.id)}
                            className={cn(
                              "group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all",
                              theme.primary === t.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/20 bg-muted/30"
                            )}
                          >
                            <div className={cn("h-10 w-10 rounded-lg shadow-lg", t.color)} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.primary === t.id ? "text-primary" : "text-muted-foreground")}>{t.name}</span>
                            {theme.primary === t.id && <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg"><Check className="h-2.5 w-2.5" /></div>}
                          </button>
                       ))}
                    </TabsContent>

                    <TabsContent value="navigation" className="space-y-4 animate-in fade-in-50">
                       {navStyles.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setNavStyle(s.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                              theme.navStyle === s.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/20 bg-muted/30"
                            )}
                          >
                            <div className="flex items-center gap-5">
                              <div className={cn("p-4 rounded-2xl shadow-sm", theme.navStyle === s.id ? "bg-primary text-white" : "bg-card text-muted-foreground")}>
                                <s.icon className="h-6 w-6" />
                              </div>
                              <div>
                                <p className={cn("text-base font-bold", theme.navStyle === s.id ? "text-primary" : "text-foreground")}>{s.name}</p>
                                <p className="text-xs text-muted-foreground font-body">{s.desc}</p>
                              </div>
                            </div>
                            {theme.navStyle === s.id && <Check className="h-5 w-5 text-primary" />}
                          </button>
                       ))}
                    </TabsContent>
                 </Tabs>
                 <div className="mt-8 flex justify-end">
                    <Button onClick={handleSavePreferences} className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">Save Workspace Preferences</Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pb-6 border-b border-border/50">
                 <CardTitle className="text-lg font-headline">Institutional Identity</CardTitle>
                 <CardDescription>Verified information from the college directory.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                       <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-1 ring-border/50">
                          <AvatarImage src={profile?.photoURL} />
                          <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                            {studentInitials}
                          </AvatarFallback>
                       </Avatar>
                       <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg border-2 border-background">
                          <Camera className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 w-full">
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                          <Input value={studentName} readOnly className="bg-muted border-none h-12 rounded-xl font-bold opacity-80" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Portal Email</Label>
                          <Input value={profile?.email || ''} readOnly className="bg-muted border-none h-12 rounded-xl text-muted-foreground font-medium opacity-80" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                          <Input value={profile?.departmentId?.toUpperCase().replace('DEPT-', '') || 'Unassigned'} readOnly className="bg-muted border-none h-12 rounded-xl font-bold opacity-80" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Semester</Label>
                          <Input value={`Semester ${profile?.semester || 'N/A'}`} readOnly className="bg-muted border-none h-12 rounded-xl font-bold opacity-80" />
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

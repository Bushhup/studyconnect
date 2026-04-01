'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCircle, Bell, Shield, Key, 
  Globe, LogOut, Palette, Check,
  Monitor, Type, Layout, Camera
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAppTheme, type BackgroundTheme, type PrimaryTheme, type TextTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const bgThemes: { id: BackgroundTheme; name: string; color: string }[] = [
  { id: 'default', name: 'Modern Gray', color: 'bg-slate-100' },
  { id: 'white', name: 'Pure White', color: 'bg-white border' },
  { id: 'navy', name: 'Deep Navy', color: 'bg-[#0F172A]' },
  { id: 'black', name: 'Midnight', color: 'bg-black' },
];

const primaryThemes: { id: PrimaryTheme; name: string; color: string }[] = [
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'emerald', name: 'Green', color: 'bg-emerald-500' },
  { id: 'violet', name: 'Purple', color: 'bg-violet-600' },
  { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
];

export default function StudentSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const { auth } = useFirebase();
  const { theme, setBg, setPrimary, setText } = useAppTheme();

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Portal Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage your modular theme and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <UserCircle className="h-4 w-4" /> Portal Profile
           </Button>
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold rounded-xl h-11">
              <Palette className="h-4 w-4" /> Visual Identity
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <Bell className="h-4 w-4" /> Alert Rules
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-11" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Exit Portal
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-lg font-headline font-bold">Modular Theming</CardTitle>
                 <CardDescription>Custom-build your interface by adjusting background, text, and special accents.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Tabs defaultValue="background" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-11 bg-slate-50 p-1 rounded-xl mb-6">
                       <TabsTrigger value="background" className="gap-2 rounded-lg text-xs font-bold">
                         <Monitor className="h-3.5 w-3.5" /> 1. Workspace
                       </TabsTrigger>
                       <TabsTrigger value="common" className="gap-2 rounded-lg text-xs font-bold">
                         <Type className="h-3.5 w-3.5" /> 2. Common Text
                       </TabsTrigger>
                       <TabsTrigger value="special" className="gap-2 rounded-lg text-xs font-bold">
                         <Layout className="h-3.5 w-3.5" /> 3. Special Text
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
                       {[
                         { id: 'soft', name: 'Low Contrast (Soft)', desc: 'Reduced eye strain for nighttime study.' },
                         { id: 'standard', name: 'Medium Contrast (Standard)', desc: 'The balanced StudyConnect experience.' },
                         { id: 'vivid', name: 'High Contrast (Vivid)', desc: 'Sharp text for better legibility.' }
                       ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setText(t.id as any)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                              theme.text === t.id ? "border-primary bg-primary/5" : "border-slate-50 bg-white"
                            )}
                          >
                            <div>
                              <p className="text-sm font-bold">{t.name}</p>
                              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                            </div>
                            {theme.text === t.id && <Check className="h-4 w-4 text-primary" />}
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
                 </Tabs>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pb-6 border-b border-slate-50">
                 <CardTitle className="text-lg font-headline font-bold">Personal Identity</CardTitle>
                 <CardDescription>Update your public information and avatar.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                       <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-1 ring-slate-100">
                          <AvatarImage src="https://i.pravatar.cc/150?u=student" />
                          <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">AJ</AvatarFallback>
                       </Avatar>
                       <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg border-2 border-white">
                          <Camera className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                          <Input defaultValue="Alex Johnson" className="bg-slate-50 border-none h-11 rounded-xl font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                          <Input defaultValue="alex_j_2024" readOnly className="bg-slate-50 border-none h-11 rounded-xl text-muted-foreground" />
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
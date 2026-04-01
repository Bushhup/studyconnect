'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  UserCircle, Bell, Shield, Key, 
  Globe, LogOut, Camera, CheckCircle2, 
  ChevronRight, Smartphone, Eye, Palette, Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAppTheme, type Theme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const themes: { id: Theme; name: string; color: string }[] = [
  { id: 'default', name: 'Ocean Blue', color: 'bg-blue-500' },
  { id: 'emerald', name: 'Forest Green', color: 'bg-emerald-500' },
  { id: 'midnight', name: 'Midnight Deep', color: 'bg-indigo-600' },
  { id: 'sunset', name: 'Golden Sun', color: 'bg-amber-500' },
  { id: 'rose', name: 'Velvet Rose', color: 'bg-rose-500' },
  { id: 'white', name: 'Paper White', color: 'bg-white border' },
  { id: 'black', name: 'Stellar Black', color: 'bg-slate-950' },
  { id: 'navy', name: 'Deep Navy', color: 'bg-blue-900' },
];

export default function StudentSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const { auth } = useFirebase();
  const { theme, setTheme } = useAppTheme();

  const handleSave = () => {
    toast({ title: 'Preferences Synchronized', description: 'Your portal settings have been updated globally.' });
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Portal Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and notification settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <UserCircle className="h-4 w-4" /> Portal Profile
           </Button>
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold rounded-xl h-11">
              <Palette className="h-4 w-4" /> Experience Theme
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl h-11">
              <Bell className="h-4 w-4" /> Alerts & Rules
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-11" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Exit Portal
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-lg font-headline font-bold">Personalize Experience</CardTitle>
                 <CardDescription>Select a color theme and background that suits your style. This will reflect across your entire student workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          "group relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                          theme === t.id ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200 bg-white"
                        )}
                      >
                        <div className={cn("h-10 w-10 rounded-full shadow-inner", t.color)} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-tight", theme === t.id ? "text-primary" : "text-slate-500")}>
                          {t.name}
                        </span>
                        {theme === t.id && (
                          <div className="absolute -top-2 -right-1 bg-primary text-white p-1 rounded-full shadow-lg">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                 </div>
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

           <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-lg font-headline font-bold">Alert Preferences</CardTitle>
                 <CardDescription>Control how you receive academic updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Assignment Reminders</Label>
                       <p className="text-xs text-muted-foreground">Notify me 48 hours before task deadlines.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <Separator className="bg-slate-50" />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Grade Notifications</Label>
                       <p className="text-xs text-muted-foreground">Alert me immediately when marks are published.</p>
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
        </div>
      </div>
    </div>
  );
}
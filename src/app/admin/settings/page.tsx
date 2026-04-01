'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Bell, Globe, Database, UserCog, Mail, Key, Palette, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'default', name: 'Ocean Blue', color: 'bg-blue-500' },
  { id: 'emerald', name: 'Forest Green', color: 'bg-emerald-500' },
  { id: 'midnight', name: 'Midnight Indigo', color: 'bg-indigo-600' },
  { id: 'sunset', name: 'Golden Sunset', color: 'bg-amber-500' },
  { id: 'rose', name: 'Velvet Rose', color: 'bg-rose-500' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useAppTheme();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-1">Control institutional parameters, security policies, and portal features.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl">
              <Shield className="h-4 w-4" /> Security & Privacy
           </Button>
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold rounded-xl">
              <Palette className="h-4 w-4" /> Portal Personalization
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl">
              <Bell className="h-4 w-4" /> Notification Rules
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl">
              <Database className="h-4 w-4" /> Data Management
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm bg-white rounded-[2rem]">
              <CardHeader>
                 <CardTitle className="text-lg">Visual Identity</CardTitle>
                 <CardDescription>Customize the interface colors across all administrative portals.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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

           <Card className="border-none shadow-sm bg-white rounded-[2rem]">
              <CardHeader>
                 <CardTitle className="text-lg">Security Controls</CardTitle>
                 <CardDescription>Configure global authentication and session policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Two-Factor Authentication (2FA)</Label>
                       <p className="text-xs text-muted-foreground">Require additional verification for administrative access.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Public Student Registration</Label>
                       <p className="text-xs text-muted-foreground">Allow students to create accounts without manual provisioning.</p>
                    </div>
                    <Switch />
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white rounded-[2rem]">
              <CardHeader>
                 <CardTitle className="text-lg">Integration Keys</CardTitle>
                 <CardDescription>API endpoints and external service connection strings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">SMTP Service Key</Label>
                    <div className="flex gap-2">
                       <Input type="password" value="********************************" readOnly className="bg-slate-50 border-none font-mono h-11" />
                       <Button variant="outline" size="sm" className="font-bold h-11 rounded-xl">Reveal</Button>
                    </div>
                 </div>
              </CardContent>
              <CardContent className="pt-0 flex justify-end">
                 <Button className="gap-2 shadow-lg shadow-primary/20 font-bold uppercase tracking-tight h-12 px-8 rounded-xl">
                    Save Changes
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
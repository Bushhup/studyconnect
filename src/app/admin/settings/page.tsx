
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Bell, Globe, Database, UserCog, Mail, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-1">Control institutional parameters, security policies, and portal features.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold">
              <Shield className="h-4 w-4" /> Security & Privacy
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <Bell className="h-4 w-4" /> Notification Rules
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <Globe className="h-4 w-4" /> Portal Personalization
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <Database className="h-4 w-4" /> Data Management
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm">
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
                 <Separator />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Session Timeout</Label>
                       <p className="text-xs text-muted-foreground">Automatically log out inactive users after a period of time.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Input type="number" defaultValue={30} className="w-16 h-8 text-center bg-slate-50" />
                       <span className="text-xs font-bold text-slate-500">Mins</span>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
              <CardHeader>
                 <CardTitle className="text-lg">Integration Keys</CardTitle>
                 <CardDescription>API endpoints and external service connection strings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">SMTP Service Key</Label>
                    <div className="flex gap-2">
                       <Input type="password" value="********************************" readOnly className="bg-slate-50 border-none font-mono" />
                       <Button variant="outline" size="sm" className="font-bold">Reveal</Button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Google Analytics ID</Label>
                    <Input value="G-V7S8X9W2P1" className="bg-slate-50 border-none font-mono" />
                 </div>
              </CardContent>
              <CardContent className="pt-0 flex justify-end">
                 <Button className="gap-2 shadow-lg shadow-primary/20 font-bold uppercase tracking-tight">
                    Save Changes
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

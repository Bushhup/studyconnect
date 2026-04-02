'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Bell, Database, Palette, Check, 
  Layout, Type, Sparkles, Monitor
} from 'lucide-react';
import { useAppTheme, type BackgroundTheme, type PrimaryTheme, type TextTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const bgThemes: { id: BackgroundTheme; name: string; color: string }[] = [
  { id: 'default', name: 'Cloud Gray', color: 'bg-[#F1F5F9]' },
  { id: 'white', name: 'Paper White', color: 'bg-white border' },
  { id: 'navy', name: 'Midnight Blue', color: 'bg-[#0F172A]' },
  { id: 'black', name: 'Absolute Black', color: 'bg-black' },
  { id: 'slate', name: 'Dark Slate', color: 'bg-[#334155]' },
];

const primaryThemes: { id: PrimaryTheme; name: string; color: string }[] = [
  { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500' },
  { id: 'emerald', name: 'Forest Green', color: 'bg-emerald-500' },
  { id: 'violet', name: 'Deep Purple', color: 'bg-violet-600' },
  { id: 'amber', name: 'Golden Sun', color: 'bg-amber-500' },
  { id: 'rose', name: 'Velvet Rose', color: 'bg-rose-500' },
];

const textThemes: { id: TextTheme; name: string; desc: string }[] = [
  { id: 'soft', name: 'Soft Gray', desc: 'Gentle on the eyes for long reading sessions.' },
  { id: 'standard', name: 'Modern Sans', desc: 'Balanced contrast for daily management.' },
  { id: 'vivid', name: 'High Contrast', desc: 'Maximum readability for data-heavy views.' },
];

export default function SettingsPage() {
  const { theme, setBg, setPrimary, setText } = useAppTheme();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-1">Control institutional parameters, modular themes, and portal features.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-1">
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl">
              <Shield className="h-4 w-4" /> Security & Privacy
           </Button>
           <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary font-bold rounded-xl">
              <Palette className="h-4 w-4" /> Visual Builder
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl">
              <Bell className="h-4 w-4" /> Notifications
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground rounded-xl">
              <Database className="h-4 w-4" /> Data & Sync
           </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-0">
                 <CardTitle className="text-xl flex items-center gap-2">
                   <Sparkles className="h-5 w-5 text-primary" /> Visual Identity Builder
                 </CardTitle>
                 <CardDescription>Mix and match visual parameters to create your custom workspace environment.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                 <Tabs defaultValue="background" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-12 bg-muted p-1 rounded-xl mb-8">
                       <TabsTrigger value="background" className="gap-2 rounded-lg">
                         <Monitor className="h-4 w-4" /> 1. Background
                       </TabsTrigger>
                       <TabsTrigger value="common" className="gap-2 rounded-lg">
                         <Type className="h-4 w-4" /> 2. Common Text
                       </TabsTrigger>
                       <TabsTrigger value="special" className="gap-2 rounded-lg">
                         <Layout className="h-4 w-4" /> 3. Special Accents
                       </TabsTrigger>
                    </TabsList>

                    <TabsContent value="background" className="space-y-6 animate-in fade-in-50 duration-500">
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {bgThemes.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setBg(t.id)}
                              className={cn(
                                "group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                                theme.bg === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20 bg-muted/30"
                              )}
                            >
                              <div className={cn("h-12 w-12 rounded-full shadow-inner ring-4 ring-offset-2 ring-transparent group-hover:ring-primary/10", t.color)} />
                              <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.bg === t.id ? "text-primary" : "text-muted-foreground")}>
                                {t.name}
                              </span>
                              {theme.bg === t.id && (
                                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </button>
                          ))}
                       </div>
                    </TabsContent>

                    <TabsContent value="common" className="space-y-6 animate-in fade-in-50 duration-500">
                       <div className="grid gap-4">
                          {textThemes.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setText(t.id)}
                              className={cn(
                                "flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                                theme.text === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20 bg-muted/30"
                              )}
                            >
                              <div className="space-y-1">
                                <p className={cn("text-base font-bold", theme.text === t.id ? "text-primary" : "text-foreground")}>{t.name}</p>
                                <p className="text-xs text-muted-foreground">{t.desc}</p>
                              </div>
                              {theme.text === t.id && <Check className="h-5 w-5 text-primary" />}
                            </button>
                          ))}
                       </div>
                    </TabsContent>

                    <TabsContent value="special" className="space-y-6 animate-in fade-in-50 duration-500">
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {primaryThemes.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setPrimary(t.id)}
                              className={cn(
                                "group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                                theme.primary === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20 bg-muted/30"
                              )}
                            >
                              <div className={cn("h-12 w-12 rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform", t.color)} />
                              <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.primary === t.id ? "text-primary" : "text-muted-foreground")}>
                                {t.name}
                              </span>
                              {theme.primary === t.id && (
                                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </button>
                          ))}
                       </div>
                    </TabsContent>
                 </Tabs>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-card rounded-[2rem]">
              <CardHeader>
                 <CardTitle className="text-lg">Global Parameters</CardTitle>
                 <CardDescription>System-wide security and accessibility settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">2FA Authorization</Label>
                       <p className="text-xs text-muted-foreground">Require mobile verification for admin changes.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <Separator className="bg-border/50" />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold">Public Student Directory</Label>
                       <p className="text-xs text-muted-foreground">Allow searching student records via public homepage.</p>
                    </div>
                    <Switch />
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
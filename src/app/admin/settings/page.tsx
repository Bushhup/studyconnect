'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Bell, Database, Palette, Check, 
  Layout, Type, Sparkles, Monitor, CircleDot, GripVertical,
  Lock, Globe, UserCheck, Smartphone, History, RefreshCcw,
  AlertCircle, ShieldCheck, Mail, Calendar, Activity,
  ArrowRight
} from 'lucide-react';
import { useAppTheme, type BackgroundTheme, type PrimaryTheme, type TextTheme, type NavStyle } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const navStyles: { id: NavStyle; name: string; desc: string; icon: any }[] = [
  { id: 'wheel', name: 'Orbital Wheel', desc: 'Icons rotate in a circular carousel format.', icon: CircleDot },
  { id: 'straight', name: 'Linear Dynamic', desc: 'Icons align in a straight path based on edge.', icon: GripVertical },
];

type SettingsSection = 'security' | 'visual' | 'notifications' | 'data';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setBg, setPrimary, setText, setNavStyle } = useAppTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('visual');

  const handleSave = () => {
    toast({
      title: 'Configuration Synchronized',
      description: 'System parameters have been updated across the institutional cloud.'
    });
  };

  const navItems = [
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'visual', label: 'Visual Builder', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Sync', icon: Database },
  ];

  return (
    <div className="space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-1 font-body">Control institutional parameters, modular themes, and portal features.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Navigation */}
        <Card className="border-none shadow-sm bg-card rounded-[2rem] p-2 overflow-hidden sticky top-24">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as SettingsSection)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                  activeSection === item.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn("h-4 w-4", activeSection === item.id ? "text-white" : "text-primary")} />
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Identity Protection</CardTitle>
                        <CardDescription>Configure authentication and access protocols.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-primary" /> 2FA Authorization
                        </Label>
                        <p className="text-xs text-muted-foreground">Require mobile verification for all administrative modifications.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" /> Public Student Directory
                        </Label>
                        <p className="text-xs text-muted-foreground">Allow searching student records via the public institutional landing page.</p>
                      </div>
                      <Switch />
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold flex items-center gap-2">
                          <History className="h-4 w-4 text-primary" /> Auto-Session Logout
                        </Label>
                        <p className="text-xs text-muted-foreground">Automatically terminate idle administrative sessions after 30 minutes.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                  <CardContent className="pt-0 border-t border-dashed mt-4 flex justify-end">
                    <Button onClick={handleSave} className="rounded-xl h-11 px-8 mt-4 font-bold shadow-lg shadow-primary/20">
                      Save Security Rules
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'visual' && (
              <motion.div
                key="visual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Visual Identity Builder</CardTitle>
                        <CardDescription>Independently configure each aspect of the portal environment.</CardDescription>
                      </div>
                    </div>
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

                      <TabsContent value="background" className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in-50 duration-500">
                        {bgThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setBg(t.id)}
                            className={cn(
                              "group relative flex flex-col items-center gap-3 p-6 rounded-[1.5rem] border-2 transition-all duration-300",
                              theme.bg === t.id ? "border-primary bg-primary/5 scale-[1.02] shadow-md" : "border-border hover:border-primary/20 bg-muted/30"
                            )}
                          >
                            <div className={cn("h-12 w-12 rounded-full shadow-inner ring-4 ring-offset-2 ring-transparent group-hover:ring-primary/10", t.color)} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.bg === t.id ? "text-primary" : "text-muted-foreground")}>
                              {t.name}
                            </span>
                            {theme.bg === t.id && (
                              <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg scale-110">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        ))}
                      </TabsContent>

                      <TabsContent value="common" className="space-y-3 animate-in fade-in-50 duration-500">
                        {textThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setText(t.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300",
                              theme.text === t.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/20 bg-muted/30"
                            )}
                          >
                            <div className="space-y-1 text-left">
                              <p className={cn("text-base font-bold", theme.text === t.id ? "text-primary" : "text-foreground")}>{t.name}</p>
                              <p className="text-xs text-muted-foreground font-body">{t.desc}</p>
                            </div>
                            {theme.text === t.id && <Check className="h-5 w-5 text-primary" />}
                          </button>
                        ))}
                      </TabsContent>

                      <TabsContent value="special" className="grid grid-cols-2 sm:grid-cols-5 gap-4 animate-in fade-in-50 duration-500">
                        {primaryThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setPrimary(t.id)}
                            className={cn(
                              "group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300",
                              theme.primary === t.id ? "border-primary bg-primary/5 scale-[1.02] shadow-md" : "border-border hover:border-primary/20 bg-muted/30"
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
                      </TabsContent>

                      <TabsContent value="navigation" className="space-y-4 animate-in fade-in-50 duration-500">
                        {navStyles.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setNavStyle(s.id)}
                            className={cn(
                              "w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                              theme.navStyle === s.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/20 bg-muted/30"
                            )}
                          >
                            <div className={cn("p-4 rounded-2xl shadow-sm transition-colors", theme.navStyle === s.id ? "bg-primary text-white" : "bg-card text-muted-foreground")}>
                              <s.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className={cn("text-base font-bold", theme.navStyle === s.id ? "text-primary" : "text-foreground")}>{s.name}</p>
                              <p className="text-xs text-muted-foreground font-body">{s.desc}</p>
                            </div>
                            {theme.navStyle === s.id && <Check className="h-5 w-5 text-primary" />}
                          </button>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Institutional Broadcast Rules</CardTitle>
                        <CardDescription>Manage how alerts are delivered across the college.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      {[
                        { label: 'Global System Alerts', icon: AlertCircle, desc: 'Critical system-wide updates and downtime notices.' },
                        { label: 'Academic Reminders', icon: Calendar, desc: 'Automatic alerts for faculty/students regarding deadlines.' },
                        { label: 'Email Delivery Synchronization', icon: Mail, desc: 'Sync all portal notifications with institutional email IDs.' },
                        { label: 'Performance Milestone Alerts', icon: Activity, desc: 'Notify HODs when departmental average thresholds are crossed.' },
                      ].map((rule) => (
                        <div key={rule.label} className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all group">
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-card rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                              <rule.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-sm font-bold">{rule.label}</Label>
                              <p className="text-xs text-muted-foreground font-body">{rule.desc}</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardContent className="pt-0 border-t border-dashed mt-4 flex justify-end">
                    <Button onClick={handleSave} className="rounded-xl h-11 px-8 mt-4 font-bold shadow-lg shadow-primary/20">
                      Update Notification Engine
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                  <CardHeader>
                     <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Infrastructure & Sync</CardTitle>
                        <CardDescription>Monitor database health and perform system-wide maintenance.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 space-y-4">
                         <div className="flex items-center gap-3">
                           <ShieldCheck className="h-6 w-6 text-emerald-600" />
                           <p className="font-bold text-emerald-900">Database Integrity</p>
                         </div>
                         <p className="text-xs text-emerald-700/80 leading-relaxed font-body">
                           Institutional identity nodes and hierarchical records are synchronized with 99.9% uptime.
                         </p>
                         <Button variant="outline" className="w-full bg-white/50 border-emerald-200 text-emerald-700 font-bold gap-2 hover:bg-white rounded-xl">
                            <RefreshCcw className="h-3.5 w-3.5" /> Force Metadata Sync
                         </Button>
                      </div>

                      <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 space-y-4">
                         <div className="flex items-center gap-3">
                           <Activity className="h-6 w-6 text-blue-600" />
                           <p className="font-bold text-blue-900">System Logs</p>
                         </div>
                         <p className="text-xs text-blue-700/80 leading-relaxed font-body">
                           Audit trail active. Currently tracking 52 concurrent administrative sessions across departments.
                         </p>
                         <Button variant="outline" asChild className="w-full bg-white/50 border-blue-200 text-blue-700 font-bold gap-2 hover:bg-white rounded-xl">
                            <Link href="/admin/logs">Access Audit Trail <ArrowRight className="h-3.5 w-3.5" /></Link>
                         </Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-dashed">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">Danger Zone</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="destructive" className="flex-1 rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-red-500/10">
                          <RefreshCcw className="h-4 w-4" /> Decommission Inactive Nodes
                        </Button>
                        <Button variant="outline" className="flex-1 border-destructive/20 text-destructive hover:bg-red-50 rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest gap-2">
                           <ShieldCheck className="h-4 w-4" /> Reset Identity Keys
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
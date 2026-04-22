
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Lock, 
  UserCheck, 
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useFirebase } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

type UserRole = 'student' | 'faculty' | 'admin' | 'hod';
const collegeId = 'study-connect-college';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!selectedRole) return;
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Ensure Google selection is always prompted
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (!googleUser.email) {
        throw new Error('Google account must have a primary email address.');
      }

      // Directly lookup by email address (which is the document ID)
      const userRef = doc(firestore, 'colleges', collegeId, 'users', googleUser.email);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        throw new Error('Your email is not registered in the institutional directory. Please contact the administrator.');
      }

      const userData = userSnap.data();

      // Verify Role
      if (userData.role !== selectedRole && !(selectedRole === 'admin' && userData.role === 'admin')) {
        await signOut(auth);
        throw new Error(`This account is registered as a ${userData.role}, not a ${selectedRole}.`);
      }

      // Link Auth UID to Directory Record
      await updateDoc(userRef, {
        uid: googleUser.uid,
        lastLogin: new Date().toISOString(),
        photoURL: googleUser.photoURL,
        authProvider: 'google'
      });

      // If Admin, ensure root marker exists
      if (userData.role === 'admin') {
        const rootAdminRef = doc(firestore, 'admins', googleUser.uid);
        await setDoc(rootAdminRef, { id: googleUser.uid, email: googleUser.email }, { merge: true });
      }

      toast({ title: 'Authentication Successful', description: `Welcome back, ${userData.firstName}.` });
      
      const routes = {
        admin: '/admin/dashboard',
        hod: '/admin/dashboard',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      };
      
      router.push(routes[userData.role as keyof typeof routes] || '/profile');

    } catch (error: any) {
      console.error('Google Auth Error:', error);
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: error.message || 'Institutional verification failed.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !selectedRole) return;

    setIsLoading(true);
    try {
      const email = username.includes('@') ? username : `${username}@college.edu`;
      const userRef = doc(firestore, 'colleges', collegeId, 'users', email);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Identity not found in directory.');
      }

      const userData = userSnap.data();
      
      if (userData.password !== password) {
        throw new Error('Invalid institutional password.');
      }

      // For prototypes, we assume directory match equals auth
      // Real apps would use signInWithEmailAndPassword after directory sync
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (ae) {
        console.warn('Firebase Auth user may not exist yet, using directory match for bypass.');
      }

      const routes = {
        admin: '/admin/dashboard',
        hod: '/admin/dashboard',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      };
      router.push(routes[userData.role as keyof typeof routes] || '/profile');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background selection:bg-primary/20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-5xl"
          >
            <div className="text-center mb-12 space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex justify-center"
              >
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-border/50">
                  <Logo className="h-12 w-12" />
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground tracking-tight">
                Institutional Access
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-body">
                Select your specialized portal to access grades, faculty resources, and administrative tools.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <RoleCard 
                role="student" 
                title="Student Portal" 
                description="Monitor your academic journey, attendance, and internal marks." 
                icon={GraduationCap} 
                color="blue"
                onClick={() => setSelectedRole('student')} 
              />
              <RoleCard 
                role="faculty" 
                title="Faculty Portal" 
                description="Manage section-wise rosters, grade entries, and study materials." 
                icon={BookOpen} 
                color="emerald"
                onClick={() => setSelectedRole('faculty')} 
              />
              <RoleCard 
                role="admin" 
                title="Admin Command" 
                description="Master control for institutional hierarchy, users, and global configuration." 
                icon={ShieldCheck} 
                color="violet"
                onClick={() => setSelectedRole('admin')} 
              />
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><Building2 className="h-4 w-4" /> Accredited Institution</div>
               <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><UserCheck className="h-4 w-4" /> Secure Auth Layer</div>
               <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><Sparkles className="h-4 w-4" /> v7.4 Stable</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-card/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/20">
              <div className="h-2 w-full bg-primary" />
              <CardHeader className="space-y-4 pt-8">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-fit p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest" 
                  onClick={() => setSelectedRole(null)}
                >
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Selection
                </Button>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-headline font-bold capitalize">{selectedRole} Authentication</CardTitle>
                  <CardDescription className="font-body text-base">Enter your credentials to access the StudyConnect ecosystem.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl gap-3 font-bold border-border bg-background hover:bg-muted transition-all text-sm"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 3.86-.98 5.15-2.67l-3.57-2.77c-.98.66-2.23 1.06-3.58 1.06-2.76 0-5.09-1.87-5.93-4.39H.43v2.83C2.24 20.67 6.83 23 12 23z" fill="#34A853"/>
                    <path d="M6.07 14.23c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.24H.43C.16 8.13 0 9.04 0 10s.16 1.87.43 2.76l5.64-4.53z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 6.83 1 2.24 3.33.43 7.24l5.64 2.83C6.91 7.25 9.24 5.38 12 5.38z" fill="#EA4335"/>
                  </svg>
                  Sign in with Institutional Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold">
                    <span className="bg-card px-4 text-muted-foreground tracking-[0.2em]">Or Directory Login</span>
                  </div>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Institutional Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        required 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="h-14 pl-12 bg-muted border-none rounded-2xl text-sm font-medium focus-visible:ring-primary/20" 
                        placeholder="name@college.edu"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Secure Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="h-14 pl-12 bg-muted border-none rounded-2xl text-sm font-medium focus-visible:ring-primary/20" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl mt-4" type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Access Workspace'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="bg-muted/30 py-6 justify-center flex-col gap-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="h-3 w-3 text-emerald-500" /> Linked to StudyConnect Identity Provider
                </p>
                <div className="h-1 w-24 bg-border/40 rounded-full" />
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoleCard({ title, description, icon: Icon, color, onClick }: any) {
  const themes = {
    blue: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 ring-blue-500/5",
    emerald: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 ring-emerald-500/5",
    violet: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 ring-violet-500/5"
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="group cursor-pointer h-full border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card rounded-[2.5rem] p-1 overflow-hidden"
        onClick={onClick}
      >
        <div className="p-8 flex flex-col h-full items-center text-center">
          <div className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 ring-8",
            themes[color as keyof typeof themes]
          )}>
            <Icon className="w-10 h-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
          </div>
          <CardTitle className="font-headline text-2xl mb-3 text-foreground group-hover:text-primary transition-colors">{title}</CardTitle>
          <CardDescription className="text-muted-foreground font-body leading-relaxed mb-8 flex-grow">
            {description}
          </CardDescription>
          <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 uppercase tracking-widest">
            Enter Portal <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}


'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';

export function MobileUserNav() {
  const router = useRouter();
  const { auth, user } = useFirebase();

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/');
    });
  };

  if (!user) {
    return (
      <Button asChild className="w-full rounded-xl h-12">
        <Link href="/login">Portal Login</Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/profile" className="flex items-center gap-4 p-2 rounded-2xl hover:bg-accent/5 transition-all">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {user.displayName?.[0] || user.email?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-base font-bold text-slate-800">{user.displayName || 'Institutional User'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </Link>
      
      <div className="grid gap-2">
        <Button asChild variant="outline" className="justify-start gap-3 h-12 rounded-xl">
          <Link href="/profile">
            <User className="h-4 w-4" /> View Profile
          </Link>
        </Button>
        <Button onClick={handleLogout} variant="destructive" className="justify-start gap-3 h-12 rounded-xl">
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </div>
    </div>
  );
}

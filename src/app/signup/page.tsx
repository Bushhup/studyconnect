'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Restricted access. Redirect users back to login as only admins can create users.
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground animate-pulse font-headline">Redirecting to login portal...</p>
    </div>
  );
}
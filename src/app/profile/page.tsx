'use client';

import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is found, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };

  if (isUserLoading || !user) {
    return (
        <div className="container mx-auto py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </CardContent>
            </Card>
      </div>
    );
  }

  if (userError) {
    return <p>Error: {userError.message}</p>;
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-bold">Email:</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="font-bold">UID:</p>
            <p className="text-sm text-muted-foreground">{user.uid}</p>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="font-headline">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

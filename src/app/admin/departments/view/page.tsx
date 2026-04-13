'use client';

import { Suspense } from 'react';
import DepartmentViewClient from './view-client';
import { Loader2 } from 'lucide-react';

export default function DepartmentViewPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Initializing portal...</p>
      </div>
    }>
      <DepartmentViewClient />
    </Suspense>
  );
}

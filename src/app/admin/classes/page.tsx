
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Clock, MapPin, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

export default function ClassManagementPage() {
  const firestore = useFirestore();

  const classesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'classes');
  }, [firestore]);

  const { data: classes, isLoading } = useCollection(classesQuery);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Sections & Classes</h1>
          <p className="text-muted-foreground mt-1">Manage class schedules, student groups, and room allocations.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Create New Class
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes?.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-all border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-widest">
                    Section {item.name.split(' ').pop()}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-headline mt-2">{item.name}</CardTitle>
                <CardDescription className="text-xs">Computer Science Department</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-semibold">45</span> Students
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Lab 302</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Mon, Wed • 09:00 AM - 11:00 AM</span>
                </div>
                <div className="pt-4 border-t">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-600">JW</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Dr. James Wilson</span>
                        <span className="text-[10px] text-muted-foreground">Class Instructor</span>
                      </div>
                   </div>
                </div>
                <Button variant="outline" className="w-full mt-2 font-bold text-xs">View Full Roster</Button>
              </CardContent>
            </Card>
          ))}
          {classes?.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl">
              <p className="text-muted-foreground font-medium">No classes scheduled yet.</p>
              <Button variant="link" className="text-primary font-bold">Add your first section</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

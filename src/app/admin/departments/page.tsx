'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2, ArrowRight, Users, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

const DEPT_CSV_COLUMNS: CsvColumn[] = [
  { key: 'name', label: 'Department Name', description: 'The official academic title.', example: 'School of Bio-Engineering', required: true },
  { key: 'headOfDept', label: 'H.O.D', description: 'Name of the primary lead.', example: 'Dr. Sarah Miller', required: true },
];

export default function DepartmentManagement() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [hod, setHod] = useState('');

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';
  const isHOD = profile?.role === 'hod';

  const deptQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    if (isHOD && profile?.departmentId) {
      return query(collection(firestore, 'colleges', collegeId, 'departments'), where('id', '==', profile.departmentId));
    }
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore, user, isHOD, profile?.departmentId]);

  const { data: departments, isLoading } = useCollection(deptQuery);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !isAdmin) return;

    const deptRef = collection(firestore, 'colleges', collegeId, 'departments');
    addDocumentNonBlocking(deptRef, {
      id: crypto.randomUUID(),
      name,
      headOfDept: hod,
      createdAt: new Date().toISOString()
    });

    toast({ title: 'Department Created', description: `${name} has been added to the institution.` });
    setName(''); setHod('');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Institutional Architecture</h1>
          <p className="text-muted-foreground mt-1">Manage academic divisions and their assigned resources.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <CsvImportDialog 
              title="Bulk Create Departments"
              description="Import multiple academic divisions at once."
              columns={DEPT_CSV_COLUMNS}
            />
            <Button onClick={() => (document.getElementById('deptName') as any)?.focus()} className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> New Division
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {isAdmin && (
          <Card className="h-fit bg-card border-none shadow-sm rounded-2xl lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle className="text-lg">Register Department</CardTitle>
              <CardDescription>Add a new academic node to the system.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deptName">Division Name</Label>
                  <Input id="deptName" value={name} onChange={(e) => setName(e.target.value)} required className="bg-muted border-none shadow-none h-11" placeholder="e.g. Mechanical Engineering" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hod">Head of Department</Label>
                  <Input id="hod" value={hod} onChange={(e) => setHod(e.target.value)} placeholder="e.g. Dr. Jane Doe" className="bg-muted border-none shadow-none h-11" />
                </div>
                <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight">
                  <Plus className="mr-2 h-4 w-4" /> Create Node
                </Button>
              </CardContent>
            </form>
          </Card>
        )}

        <div className={cn(isAdmin ? "lg:col-span-3" : "col-span-full")}>
          {isLoading || profileLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing Divisions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments?.map((dept) => (
                <Card key={dept.id} className="group hover:shadow-md transition-all border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                  <div className="h-2 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-primary/5 rounded-2xl">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold text-[9px] uppercase tracking-tighter">ID: {dept.id.slice(0, 6)}</Badge>
                    </div>
                    <CardTitle className="text-xl font-headline mt-4">{dept.name}</CardTitle>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">H.O.D: {dept.headOfDept || 'TBD'}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-muted/50 rounded-xl">
                        <Users className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-[10px] font-bold">Faculty</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted/50 rounded-xl">
                        <GraduationCap className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-[10px] font-bold">Students</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted/50 rounded-xl">
                        <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-[10px] font-bold">Subjects</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full rounded-xl h-11 font-bold group-hover:bg-primary group-hover:text-white transition-all">
                      <Link href={`/admin/departments/${dept.id}`}>
                        Manage Division <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {departments?.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="font-bold text-muted-foreground">No departments registered yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  return <span className={`px-2 py-0.5 rounded-full text-[10px] border ${className}`}>{children}</span>;
}

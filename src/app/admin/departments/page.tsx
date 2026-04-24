'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const collegeId = 'study-connect-college';

const DEPT_CSV_COLUMNS: CsvColumn[] = [
  { key: 'name', label: 'Department Name', description: 'Official academic title.', example: 'Mechanical Engineering', required: true },
  { key: 'headOfDept', label: 'H.O.D', description: 'Lead faculty name.', example: 'Dr. John Doe', required: true },
  { key: 'programType', label: 'Program', description: 'UG or PG.', example: 'UG', required: true },
  { key: 'totalSemesters', label: 'Duration', description: 'Total number of semesters.', example: '8', required: false },
];

export default function DepartmentManagement() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [hod, setHod] = useState('');
  const [programType, setProgramType] = useState<'UG' | 'PG'>('UG');
  const [totalSemesters, setTotalSemesters] = useState('8');

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  const deptQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);
  const { data: departments, isLoading } = useCollection(deptQuery);

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !isAdmin) return;

    const id = name.toLowerCase().replace(/\s+/g, '-').slice(0, 15) + '-' + Math.random().toString(36).substr(2, 4);
    const deptRef = doc(firestore, 'colleges', collegeId, 'departments', id);
    
    setDocumentNonBlocking(deptRef, {
      id,
      name,
      headOfDept: hod,
      programType,
      totalSemesters: parseInt(totalSemesters),
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'Division Provisioned', description: `${name} has been added to the institutional architecture.` });
    setName(''); setHod(''); setProgramType('UG'); setTotalSemesters('8');
  };

  const handleImport = (data: any[]) => {
    data.forEach(item => {
      if (!item.name) return;
      const id = item.name.toLowerCase().replace(/\s+/g, '-').slice(0, 15) + '-' + Math.random().toString(36).substr(2, 4);
      const deptRef = doc(firestore, 'colleges', collegeId, 'departments', id);
      setDocumentNonBlocking(deptRef, {
        ...item,
        id,
        totalSemesters: parseInt(item.totalSemesters || '8'),
        createdAt: new Date().toISOString()
      }, { merge: true });
    });
  };

  const handleDelete = (deptId: string, deptName: string) => {
    if (!isAdmin) return;
    const deptRef = doc(firestore, 'colleges', collegeId, 'departments', deptId);
    deleteDocumentNonBlocking(deptRef);
    toast({ title: 'Division Decommissioned', description: `${deptName} has been removed from the hierarchy.` });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Academic Divisions</h1>
          <p className="text-muted-foreground mt-1">Structure your institution by managing departments and program metadata.</p>
        </motion.div>
        {isAdmin && (
          <div className="flex gap-2">
            <CsvImportDialog 
              title="Bulk Dept Import"
              description="Register multiple academic divisions via CSV mapping."
              columns={DEPT_CSV_COLUMNS}
              onImport={handleImport}
            />
            <Button onClick={() => (document.getElementById('deptName') as any)?.focus()} className="gap-2 shadow-lg shadow-primary/20 rounded-full h-11 px-6">
              <Plus className="h-4 w-4" /> New Division
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {isAdmin && (
          <Card className="h-fit bg-card border-none shadow-sm rounded-[2rem] lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="text-lg">Register Department</CardTitle>
              <CardDescription>Define a new academic program node.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Division Name</Label>
                  <Input id="deptName" value={name} onChange={(e) => setName(e.target.value)} required className="bg-muted border-none h-12 rounded-xl" placeholder="e.g. Bio-Engineering" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lead / H.O.D</Label>
                  <Input value={hod} onChange={(e) => setHod(e.target.value)} placeholder="Dr. Jane Doe" className="bg-muted border-none h-12 rounded-xl" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Type</Label>
                    <Select value={programType} onValueChange={(v: any) => setProgramType(v)}>
                      <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UG">UG</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Sems</Label>
                    <Input type="number" value={totalSemesters} onChange={(e) => setTotalSemesters(e.target.value)} className="bg-muted border-none h-12 rounded-xl" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 font-bold uppercase tracking-tight shadow-lg shadow-primary/20 rounded-2xl mt-2">
                  Initialize Node
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
              <AnimatePresence>
                {departments?.map((dept, idx) => (
                  <motion.div 
                    key={dept.id} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group hover:shadow-md transition-all border-none shadow-sm bg-card rounded-[2rem] overflow-hidden flex flex-col h-full">
                      <div className="h-2 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
                      <CardHeader className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div className="p-3 bg-primary/5 rounded-2xl">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] uppercase tracking-tighter px-3 h-6 flex items-center">
                              {dept.programType || 'UG'} • {dept.totalSemesters || 8} Sems
                            </Badge>
                            {isAdmin && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Decommission Division?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Confirming the deletion of <strong>{dept.name}</strong> will remove all curricular mapping from the master hierarchy.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl border-none bg-muted">Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90 rounded-xl" onClick={() => handleDelete(dept.id, dept.name)}>
                                      Confirm Removal
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-xl font-headline mt-6 group-hover:text-primary transition-colors">{dept.name}</CardTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">H.O.D: {dept.headOfDept || 'TBD'}</p>
                      </CardHeader>
                      <CardContent className="pt-4 border-t border-dashed mt-auto">
                        <Button asChild variant="ghost" className="w-full rounded-xl h-11 font-bold group-hover:bg-primary group-hover:text-white transition-all text-[11px] uppercase gap-2">
                          <Link href={`/admin/department-portal?id=${dept.id}`}>
                            Management Portal <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {departments?.length === 0 && !isAdmin && (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-muted/20">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="font-bold text-muted-foreground">No academic divisions have been initialized.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("px-2 py-0.5 rounded-full text-[10px] border", className)}>{children}</span>;
}

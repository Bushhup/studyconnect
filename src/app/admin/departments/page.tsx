
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCollection, useMemoFirebase, useFirestore, useUser, useDoc, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2, ArrowRight, Trash2, Edit3, Save, Layers } from 'lucide-react';
import Link from 'next/link';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { placeholderImages } from '@/lib/placeholder-images';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

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
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Creation Form State
  const [name, setName] = useState('');
  const [hod, setHod] = useState('');
  const [programType, setProgramType] = useState<'UG' | 'PG'>('UG');
  const [totalSemesters, setTotalSemesters] = useState('8');

  // Editing State
  const [editingDept, setEditingDept] = useState<any>(null);
  const [editData, setEditData] = useState({
    name: '',
    headOfDept: '',
    programType: 'UG' as 'UG' | 'PG',
    totalSemesters: '8'
  });

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  const deptQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);
  const { data: departments, isLoading } = useCollection(deptQuery);

  const deptImages = placeholderImages.filter(img => img.category === 'Departments');

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
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setEditData({
      name: dept.name || '',
      headOfDept: dept.headOfDept || '',
      programType: (dept.programType as 'UG' | 'PG') || 'UG',
      totalSemesters: dept.totalSemesters?.toString() || '8'
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !isAdmin) return;

    const deptRef = doc(firestore, 'colleges', collegeId, 'departments', editingDept.id);
    updateDocumentNonBlocking(deptRef, {
      name: editData.name,
      headOfDept: editData.headOfDept,
      programType: editData.programType,
      totalSemesters: parseInt(editData.totalSemesters),
      updatedAt: new Date().toISOString()
    });

    toast({ title: 'Division Updated', description: `${editData.name} details have been synchronized.` });
    setIsEditOpen(false);
  };

  const handleImport = (data: any[]) => {
    data.forEach(item => {
      if (!item.name) return;
      const id = item.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20);
      const deptRef = doc(firestore, 'colleges', collegeId, 'departments', id);
      
      setDocumentNonBlocking(deptRef, {
        ...item,
        id,
        totalSemesters: parseInt(item.totalSemesters || '8'),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    
    toast({ title: 'Bulk Sync Triggered', description: `Processing ${data.length} academic divisions.` });
  };

  const handleDelete = (deptId: string, deptName: string) => {
    if (!isAdmin) return;
    const deptRef = doc(firestore, 'colleges', collegeId, 'departments', deptId);
    deleteDocumentNonBlocking(deptRef);
    toast({ title: 'Division Decommissioned', description: `${deptName} has been removed from the hierarchy.` });
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 pt-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">Academic Divisions</h1>
          </div>
          <p className="text-muted-foreground text-lg">Manage the primary structural pillars of your institution.</p>
        </motion.div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <CsvImportDialog 
              title="Bulk Dept Import"
              description="Register multiple academic divisions via CSV mapping."
              columns={DEPT_CSV_COLUMNS}
              onImport={handleImport}
            />
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-xl shadow-primary/20 rounded-full h-12 px-8 font-bold text-sm uppercase tracking-widest">
                  <Plus className="h-5 w-5" /> New Division
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card max-w-md p-0 overflow-hidden">
                <div className="h-2 w-full bg-primary" />
                <div className="p-8">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-headline flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-primary" /> Register Division
                    </DialogTitle>
                    <DialogDescription className="text-base">Define a new academic program node in the institution.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Division Name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-muted border-none h-14 rounded-2xl text-lg px-6" placeholder="e.g. Bio-Engineering" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Head of Department (Dean)</Label>
                      <Input value={hod} onChange={(e) => setHod(e.target.value)} placeholder="Dr. Jane Doe" className="bg-muted border-none h-14 rounded-2xl px-6" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Degree Type</Label>
                        <Select value={programType} onValueChange={(v: any) => setProgramType(v)}>
                          <SelectTrigger className="bg-muted border-none h-14 rounded-2xl px-6 font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                            <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Total Semesters</Label>
                        <Input type="number" value={totalSemesters} onChange={(e) => setTotalSemesters(e.target.value)} className="bg-muted border-none h-14 rounded-2xl px-6 font-bold" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-16 font-bold uppercase tracking-widest shadow-xl shadow-primary/20 rounded-[1.5rem] mt-4 text-sm">
                      Initialize Academic Node
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="px-4">
        {isLoading || profileLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="relative">
              <Loader2 className="animate-spin h-12 w-12 text-primary opacity-20" />
              <Building2 className="h-5 w-5 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Syncing Divisions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {departments?.map((dept, idx) => {
                const displayImage = deptImages[idx % deptImages.length];
                return (
                  <motion.div 
                    key={dept.id} 
                    layout
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 100 }}
                  >
                    <Card className="group hover:shadow-2xl transition-all duration-500 border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden flex flex-col h-full relative">
                      <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        {isAdmin && (
                          <>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg text-primary hover:bg-primary hover:text-white transition-all"
                              onClick={(e) => { e.preventDefault(); handleOpenEdit(dept); }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg text-destructive hover:bg-destructive hover:text-white transition-all"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-2xl font-headline">Decommission Division?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-base">
                                    Are you sure you want to remove <strong>{dept.name}</strong>? This will detach all associated courses and classes from the hierarchy.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-3 pt-4">
                                  <AlertDialogCancel className="rounded-2xl border-none bg-muted h-12 px-6 font-bold uppercase text-[10px]">Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90 rounded-2xl h-12 px-6 font-bold uppercase text-[10px]" onClick={() => handleDelete(dept.id, dept.name)}>
                                    Confirm Removal
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>

                      <div className="h-56 relative overflow-hidden">
                        <Image
                          src={displayImage.imageUrl}
                          alt={displayImage.description}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          data-ai-hint={displayImage.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8">
                           <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-bold text-[8px] uppercase tracking-wider px-3 h-6 rounded-full">
                              {dept.programType || 'UG'} Program
                            </Badge>
                            <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-bold text-[8px] uppercase tracking-wider px-3 h-6 rounded-full">
                              {dept.totalSemesters || 8} Semesters
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl font-headline font-bold text-white leading-tight">
                            {dept.name}
                          </CardTitle>
                        </div>
                      </div>

                      <CardContent className="pt-8 px-8 pb-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/40 p-5 rounded-[1.5rem] border border-transparent hover:border-primary/10 transition-all group/hod mb-6">
                           <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover/hod:scale-110 transition-transform">
                             <Layers className="h-5 w-5 text-primary" />
                           </div>
                           <div className="flex-1">
                             <p className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-50 mb-0.5">Head of Department</p>
                             <p className="font-bold text-foreground text-sm truncate">{dept.headOfDept || 'Unassigned'}</p>
                           </div>
                        </div>

                        <Button asChild variant="ghost" className="w-full rounded-[1.25rem] h-14 font-bold group-hover:bg-primary group-hover:text-white transition-all duration-300 text-[10px] uppercase tracking-[0.2em] gap-3 bg-muted/50 hover:shadow-xl hover:shadow-primary/20 mt-auto">
                          <Link href={`/admin/department-portal?id=${dept.id}`}>
                            Access Division Hub <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {departments?.length === 0 && !isLoading && (
              <div className="col-span-full py-40 text-center border-4 border-dashed rounded-[4rem] bg-muted/10 border-muted-foreground/10 flex flex-col items-center gap-8">
                <div className="relative">
                  <Building2 className="h-24 w-24 text-muted-foreground/10" strokeWidth={1} />
                  <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-headline font-bold text-foreground">No Academic Divisions</p>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">Your institutional hierarchy is currently empty. Start by registering your first department or use the bulk import tool.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="rounded-full px-12 h-14 font-bold uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl shadow-primary/20 scale-110 hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5" /> Initialize First Node
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Department Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card max-w-md p-0 overflow-hidden">
          <div className="h-2 w-full bg-primary" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-headline flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-primary" /> Modify Division
              </DialogTitle>
              <DialogDescription className="text-base">Update the institutional metadata for the selected department.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-50">Division Name</Label>
                <Input 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                  required 
                  className="bg-muted border-none h-14 rounded-2xl px-6 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-50">Head of Department (Lead)</Label>
                <Input 
                  value={editData.headOfDept} 
                  onChange={(e) => setEditData({...editData, headOfDept: e.target.value})} 
                  className="bg-muted border-none h-14 rounded-2xl px-6"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase ml-1 opacity-50">Program Type</Label>
                  <Select value={editData.programType} onValueChange={(v: any) => setEditData({...editData, programType: v})}>
                    <SelectTrigger className="bg-muted border-none h-14 rounded-2xl px-6 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UG">UG</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase ml-1 opacity-50">Total Semesters</Label>
                  <Input 
                    type="number" 
                    value={editData.totalSemesters} 
                    onChange={(e) => setEditData({...editData, totalSemesters: e.target.value})} 
                    className="bg-muted border-none h-14 rounded-2xl px-6 font-bold"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-16 font-bold uppercase tracking-widest shadow-xl shadow-primary/20 rounded-[1.5rem] mt-4 text-sm">
                <Save className="mr-2 h-5 w-5" /> Save Division Changes
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

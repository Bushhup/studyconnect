'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2, FileSpreadsheet } from 'lucide-react';
import { CsvImportDialog, type CsvColumn } from '@/components/CsvImportDialog';

const collegeId = 'study-connect-college';

const DEPT_CSV_COLUMNS: CsvColumn[] = [
  { key: 'name', label: 'Department Name', description: 'The official academic title.', example: 'School of Bio-Engineering', required: true },
  { key: 'headOfDept', label: 'H.O.D', description: 'Name of the primary lead.', example: 'Dr. Sarah Miller', required: true },
];

export default function DepartmentManagement() {
  const firestore = useFirestore();
  const { user, isUserLoading: userLoading } = useUser();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [hod, setHod] = useState('');

  const deptQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore, user]);

  const { data: departments, isLoading: collectionLoading } = useCollection(deptQuery);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const deptRef = collection(firestore, 'colleges', collegeId, 'departments');
    addDocumentNonBlocking(deptRef, {
      id: crypto.randomUUID(),
      name,
      headOfDept: hod,
    });

    toast({ title: 'Department Created', description: `${name} has been added.` });
    setName(''); setHod('');
  };

  const isLoading = userLoading || collectionLoading;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">Manage academic divisions and faculty assignments.</p>
        </div>
        <CsvImportDialog 
          title="Bulk Create Departments"
          description="Import multiple academic divisions at once by uploading a list of names and heads of departments."
          columns={DEPT_CSV_COLUMNS}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="h-fit bg-card border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Add New Department</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deptName">Department Name</Label>
                <Input id="deptName" value={name} onChange={(e) => setName(e.target.value)} required className="bg-muted border-none shadow-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hod">Head of Department</Label>
                <Input id="hod" value={hod} onChange={(e) => setHod(e.target.value)} placeholder="e.g., Dr. James Wilson" className="bg-muted border-none shadow-none" />
              </div>
              <Button type="submit" className="w-full h-11 font-bold">
                <Plus className="mr-2 h-4 w-4" /> Create Department
              </Button>
            </CardContent>
          </form>
        </Card>

        <Card className="lg:col-span-2 bg-card border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Academic Departments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-none">
                    <TableHead className="pl-6 font-bold text-foreground">Name</TableHead>
                    <TableHead className="font-bold text-foreground">H.O.D</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map((dept) => (
                    <TableRow key={dept.id} className="border-border hover:bg-muted/30">
                      <TableCell className="pl-6 font-bold text-foreground">{dept.name}</TableCell>
                      <TableCell className="text-muted-foreground">{dept.headOfDept || 'Not Assigned'}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="text-primary font-bold">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {departments?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">No departments found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

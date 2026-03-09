
'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Loader2 } from 'lucide-react';

const collegeId = 'study-connect-college';

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
      <div>
        <h1 className="text-3xl font-headline font-bold">Department Management</h1>
        <p className="text-muted-foreground">Manage academic divisions and faculty assignments.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add New Department</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deptName">Department Name</Label>
                <Input id="deptName" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hod">Head of Department</Label>
                <Input id="hod" value={hod} onChange={(e) => setHod(e.target.value)} placeholder="e.g., Dr. James Wilson" />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Create Department
              </Button>
            </CardContent>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Academic Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>H.O.D</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.headOfDept || 'Not Assigned'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {departments?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No departments found.</TableCell>
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

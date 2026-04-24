'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap, Search, Filter, Loader2, Mail, ExternalLink, Award, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const collegeId = 'study-connect-college';

export default function AlumniRegistryPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [search, setSearch] = useState('');

  const alumniQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'student'), where('status', '==', 'alumni'));
  }, [firestore, user]);

  const deptsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);

  const { data: alumni, isLoading } = useCollection(alumniQuery);
  const { data: depts } = useCollection(deptsQuery);

  const filteredAlumni = alumni?.filter(a => 
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    String(a.batchYear || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">Alumni Registry</h1>
          <p className="text-muted-foreground mt-1">Directory of graduated students and institutional legacy records.</p>
        </div>
        <Button variant="outline" className="rounded-full gap-2 bg-card border-primary/20 text-primary font-bold">
          <GraduationCap className="h-4 w-4" /> Global Alumni Portal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5 rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-primary font-bold uppercase text-[10px] tracking-widest">Total Alumni</CardDescription>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl">{alumni?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Placement Rate</CardDescription>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">94.2%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or batch year..." 
                className="pl-10 h-11 rounded-xl bg-muted border-none shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="ghost" className="gap-2 text-xs font-bold uppercase tracking-tight text-primary">
              <Filter className="h-3.5 w-3.5" /> Filter Results
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="pl-6 py-4 font-bold text-foreground">Alumni Identity</TableHead>
                  <TableHead className="font-bold text-foreground">Department</TableHead>
                  <TableHead className="font-bold text-foreground">Batch</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-foreground">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.map((a) => {
                  const dept = depts?.find(d => d.id === a.departmentId);
                  return (
                    <TableRow key={a.id} className="group hover:bg-muted/30 border-border">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary font-bold uppercase">{a.firstName?.[0]}{a.lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-foreground">{a.firstName} {a.lastName}</p>
                            <p className="text-[10px] font-bold text-primary uppercase">ID: {a.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-muted-foreground">{dept?.name || 'Academic Graduate'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase text-[9px] px-3">{a.batchYear || 'Legacy'}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary"><Mail className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted"><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredAlumni.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-20 text-center text-muted-foreground italic">No alumni records found matching your search.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
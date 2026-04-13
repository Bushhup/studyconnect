
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Award, Plus, ArrowLeft, FileText, Send, Trash2, Globe, Loader2, UserCheck, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const collegeId = 'study-connect-college';

export default function ContentManagementPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // User Profile
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);

  const isAdmin = profile?.role === 'admin';
  const isHOD = profile?.role === 'hod';
  const userDeptId = profile?.departmentId;

  // Form States
  const [tagline, setTagline] = useState('');
  const [stats, setStats] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('Academic');
  const [eventFaculty, setEventFaculty] = useState('');
  const [eventDept, setEventDept] = useState(isHOD ? userDeptId : 'Global');

  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementYear, setAchievementYear] = useState(new Date().getFullYear().toString());
  const [achievementDesc, setAchievementDesc] = useState('');
  const [achievementCategory, setAchievementCategory] = useState('Academic');
  const [achievementFaculty, setAchievementFaculty] = useState('');
  const [achievementDept, setAchievementDept] = useState(isHOD ? userDeptId : 'Global');

  // Fetch Metadata
  const deptsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);
  const { data: departments } = useCollection(deptsQuery);

  const facultyQuery = useMemoFirebase(() => query(collection(firestore, 'colleges', collegeId, 'users'), where('role', '==', 'faculty')), [firestore]);
  const { data: facultyMembers } = useCollection(facultyQuery);

  // Data Fetching
  const profileRef = useMemoFirebase(() => doc(firestore, 'colleges', collegeId), [firestore]);
  const eventsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'colleges', collegeId, 'events');
    if (isHOD) return query(base, where('departmentId', '==', userDeptId));
    return base;
  }, [firestore, isHOD, userDeptId]);

  const achievementsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'colleges', collegeId, 'achievements');
    if (isHOD) return query(base, where('departmentId', '==', userDeptId));
    return base;
  }, [firestore, isHOD, userDeptId]);

  const { data: collegeProfile } = useDoc(profileRef);
  const { data: events, isLoading: eventsLoading } = useCollection(eventsRef);
  const { data: achievements, isLoading: achievementsLoading } = useCollection(achievementsRef);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setDocumentNonBlocking(profileRef, {
      tagline: tagline || collegeProfile?.tagline,
      statisticHighlights: stats.split(',').map(s => s.trim()).filter(Boolean) || collegeProfile?.statisticHighlights,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: 'Profile Updated', description: 'Homepage information has been synchronized.' });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventDesc) return;

    const ref = collection(firestore, 'colleges', collegeId, 'events');
    addDocumentNonBlocking(ref, {
      id: crypto.randomUUID(),
      title: eventTitle,
      date: eventDate,
      description: eventDesc,
      location: eventLocation || 'Main Campus',
      category: eventCategory,
      facultyInCharge: eventFaculty,
      departmentId: isHOD ? userDeptId : eventDept,
      createdAt: new Date().toISOString()
    });

    toast({ title: 'Event Published', description: 'New event added to institutional calendar.' });
    setEventTitle(''); setEventDate(''); setEventDesc(''); setEventLocation('');
  };

  const handleCreateAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementTitle || !achievementDesc) return;

    const ref = collection(firestore, 'colleges', collegeId, 'achievements');
    addDocumentNonBlocking(ref, {
      id: crypto.randomUUID(),
      title: achievementTitle,
      year: parseInt(achievementYear),
      description: achievementDesc,
      category: achievementCategory,
      facultyInCharge: achievementFaculty,
      departmentId: isHOD ? userDeptId : achievementDept,
      createdAt: new Date().toISOString()
    });

    toast({ title: 'Achievement Recorded', description: 'Milestone has been added to the archives.' });
    setAchievementTitle(''); setAchievementDesc('');
  };

  const handleDelete = (type: 'events' | 'achievements', id: string) => {
    const ref = doc(firestore, 'colleges', collegeId, type, id);
    deleteDocumentNonBlocking(ref);
    toast({ title: 'Record Removed', description: 'Item has been deleted from the database.' });
  };

  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <div className="max-w-5xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <h1 className="text-4xl font-headline font-bold flex items-center gap-3 text-foreground">
          <FileText className="text-primary" /> Institutional Content
        </h1>
        <p className="text-muted-foreground mt-2">
          {isHOD ? `Manage milestones and events for ${userDeptId}.` : 'Global control for public milestones and campus calendar.'}
        </p>
      </div>

      <Tabs defaultValue="events" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-card border shadow-sm rounded-xl">
          {isAdmin && <TabsTrigger value="profile" className="gap-2"><Globe className="h-4 w-4" /> Homepage</TabsTrigger>}
          <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" /> Events</TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2"><Award className="h-4 w-4" /> Achievements</TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="profile" className="mt-6">
            <Card className="shadow-lg border-none rounded-[2rem] bg-card">
              <CardHeader>
                <CardTitle>Homepage Identity</CardTitle>
                <CardDescription>Control primary messaging and high-level statistics.</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Institutional Tagline</Label>
                    <Input 
                      defaultValue={collegeProfile?.tagline} 
                      onChange={(e) => setTagline(e.target.value)} 
                      placeholder="e.g. Connecting Minds, Building Futures" 
                      className="bg-muted border-none h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Statistic Highlights (Comma separated)</Label>
                    <Input 
                      defaultValue={collegeProfile?.statisticHighlights?.join(', ')} 
                      onChange={(e) => setStats(e.target.value)} 
                      placeholder="e.g. 100+ Programs, 5000+ Students" 
                      className="bg-muted border-none h-12 rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                    <Send className="mr-2 h-4 w-4" /> Update Identity
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="events" className="mt-6 space-y-8">
          <Card className="shadow-lg border-none rounded-[2rem] bg-card">
            <CardHeader>
              <CardTitle>Register Campus Event</CardTitle>
              <CardDescription>Publish activity details to the public timeline.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateEvent}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g., National Tech Symposium" required className="bg-muted border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select onValueChange={setEventCategory} value={eventCategory}>
                      <SelectTrigger className="bg-muted border-none h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="bg-muted border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Main Auditorium" className="bg-muted border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Faculty In-Charge</Label>
                    <Select onValueChange={setEventFaculty} value={eventFaculty}>
                      <SelectTrigger className="bg-muted border-none h-11"><SelectValue placeholder="Select Faculty" /></SelectTrigger>
                      <SelectContent>
                        {facultyMembers?.map(f => (
                          <SelectItem key={f.id} value={`${f.firstName} ${f.lastName}`}>Dr. {f.firstName} {f.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <Label>Owning Department</Label>
                    <Select onValueChange={setEventDept} value={eventDept}>
                      <SelectTrigger className="bg-muted border-none h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Global">Global / Institutional</SelectItem>
                        {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <Textarea value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} placeholder="Describe the event purpose and target audience..." className="min-h-[100px] bg-muted border-none rounded-xl" required />
                </div>
                <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> Publish Event
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/30">
              <CardTitle>Active Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead className="pl-6 font-bold">Event</TableHead>
                    <TableHead className="font-bold">In-Charge</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => (
                    <TableRow key={event.id} className="border-border/50">
                      <TableCell className="pl-6">
                        <p className="font-bold text-foreground">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{format(new Date(event.date), 'MMM dd, yyyy')}</p>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{event.facultyInCharge || 'TBD'}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">{event.category}</Badge></TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete('events', event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6 space-y-8">
          <Card className="shadow-lg border-none rounded-[2rem] bg-card">
            <CardHeader>
              <CardTitle>Document Milestone</CardTitle>
              <CardDescription>Archive significant achievements for the college community.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateAchievement}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Achievement Title</Label>
                    <Input value={achievementTitle} onChange={(e) => setAchievementTitle(e.target.value)} placeholder="e.g., Winners: National Robotics Challenge" required className="bg-muted border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={achievementCategory} onChange={(e) => setAchievementCategory(e.target.value)} placeholder="Academic / Research" className="bg-muted border-none h-11" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Input type="number" value={achievementYear} onChange={(e) => setAchievementYear(e.target.value)} required className="bg-muted border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Faculty</Label>
                    <Select onValueChange={setAchievementFaculty} value={achievementFaculty}>
                      <SelectTrigger className="bg-muted border-none h-11"><SelectValue placeholder="Select Lead" /></SelectTrigger>
                      <SelectContent>
                        {facultyMembers?.map(f => (
                          <SelectItem key={f.id} value={`${f.firstName} ${f.lastName}`}>Dr. {f.firstName} {f.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Select onValueChange={setAchievementDept} value={achievementDept}>
                        <SelectTrigger className="bg-muted border-none h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Global">Institutional</SelectItem>
                          {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Achievement Details</Label>
                  <Textarea value={achievementDesc} onChange={(e) => setAchievementDesc(e.target.value)} placeholder="Provide context about why this is a milestone..." className="min-h-[100px] bg-muted border-none rounded-xl" required />
                </div>
                <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> Save Record
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/30">
              <CardTitle>Achievement Archives</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead className="pl-6 font-bold">Milestone</TableHead>
                    <TableHead className="font-bold">Year</TableHead>
                    <TableHead className="font-bold">Lead</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements?.map((ach) => (
                    <TableRow key={ach.id} className="border-border/50">
                      <TableCell className="pl-6 font-bold text-foreground">{ach.title}</TableCell>
                      <TableCell className="text-sm font-medium">{ach.year}</TableCell>
                      <TableCell className="text-xs">{ach.facultyInCharge || 'N/A'}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete('achievements', ach.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

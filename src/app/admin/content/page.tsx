'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Award, Plus, ArrowLeft, FileText, Send, Trash2, Globe, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const collegeId = 'study-connect-college';

export default function ContentManagementPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Profile Form State
  const [tagline, setTagline] = useState('');
  const [stats, setStats] = useState('');

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('Academic');

  // Achievement Form State
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementYear, setAchievementYear] = useState(new Date().getFullYear().toString());
  const [achievementDesc, setAchievementDesc] = useState('');
  const [achievementCategory, setAchievementCategory] = useState('Academic');

  // Fetch Data
  const profileRef = useMemoFirebase(() => doc(firestore, 'colleges', collegeId), [firestore]);
  const eventsRef = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'events'), [firestore]);
  const achievementsRef = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'achievements'), [firestore]);

  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);
  const { data: events, isLoading: eventsLoading } = useCollection(eventsRef);
  const { data: achievements, isLoading: achievementsLoading } = useCollection(achievementsRef);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;

    setDocumentNonBlocking(profileRef, {
      tagline: tagline || profile?.tagline,
      statisticHighlights: stats.split(',').map(s => s.trim()).filter(Boolean) || profile?.statisticHighlights,
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
      createdAt: new Date().toISOString()
    });

    toast({ title: 'Event Published', description: 'New event added to public calendar.' });
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
      createdAt: new Date().toISOString()
    });

    toast({ title: 'Achievement Added', description: 'Academic milestone recorded.' });
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
          <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
        </Button>
        <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
          <FileText className="text-primary" /> Content Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage public institutional information, milestones, and the campus calendar.</p>
      </div>

      <Tabs defaultValue="events" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-white border shadow-sm rounded-xl">
          <TabsTrigger value="profile" className="gap-2"><Globe className="h-4 w-4" /> Institutional Profile</TabsTrigger>
          <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" /> Campus Events</TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2"><Award className="h-4 w-4" /> Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="shadow-lg border-none rounded-[2rem]">
            <CardHeader>
              <CardTitle>Homepage Identity</CardTitle>
              <CardDescription>Control the primary messaging and statistics displayed on the homepage.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Institutional Tagline</Label>
                  <Input 
                    defaultValue={profile?.tagline} 
                    onChange={(e) => setTagline(e.target.value)} 
                    placeholder="e.g. Connecting Minds, Building Futures" 
                    className="bg-slate-50 border-none h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statistic Highlights (Comma separated)</Label>
                  <Input 
                    defaultValue={profile?.statisticHighlights?.join(', ')} 
                    onChange={(e) => setStats(e.target.value)} 
                    placeholder="e.g. 100+ Programs, 5000+ Students, 95% Placement" 
                    className="bg-slate-50 border-none h-12 rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold px-1">Max 4 items recommended for layout.</p>
                </div>
                <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                  <Send className="mr-2 h-4 w-4" /> Update Homepage Identity
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6 space-y-8">
          <Card className="shadow-lg border-none rounded-[2rem]">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Details will appear on the public Events calendar.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateEvent}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle">Event Title</Label>
                  <Input id="eventTitle" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g., Annual Tech Symposium" required className="bg-slate-50 border-none h-11" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date</Label>
                    <Input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="bg-slate-50 border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Location</Label>
                    <Input id="eventLocation" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Main Auditorium" className="bg-slate-50 border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={eventCategory} onChange={(e) => setEventCategory(e.target.value)} placeholder="Academic / Cultural" className="bg-slate-50 border-none h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDesc">Description</Label>
                  <Textarea id="eventDesc" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} placeholder="Tell us more about the event..." className="min-h-[120px] bg-slate-50 border-none rounded-xl" required />
                </div>
                <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                  <Send className="mr-2 h-4 w-4" /> Publish to Calendar
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader>
              <CardTitle>Manage Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-6 font-bold">Event Title</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="pl-6 font-bold">{event.title}</TableCell>
                      <TableCell>{format(new Date(event.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{event.category}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete('events', event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!events?.length && !eventsLoading && (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No events scheduled.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6 space-y-8">
          <Card className="shadow-lg border-none rounded-[2rem]">
            <CardHeader>
              <CardTitle>Record Achievement</CardTitle>
              <CardDescription>Document academic or research milestones for the community.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateAchievement}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="achTitle">Achievement Name</Label>
                  <Input id="achTitle" value={achievementTitle} onChange={(e) => setAchievementTitle(e.target.value)} placeholder="e.g., Top Ranked Engineering School" required className="bg-slate-50 border-none h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="achYear">Year</Label>
                    <Input id="achYear" type="number" value={achievementYear} onChange={(e) => setAchievementYear(e.target.value)} required className="bg-slate-50 border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="achCat">Category</Label>
                    <Input id="achCat" value={achievementCategory} onChange={(e) => setAchievementCategory(e.target.value)} placeholder="Academic / Research" className="bg-slate-50 border-none h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achDesc">Milestone Details</Label>
                  <Textarea id="achDesc" value={achievementDesc} onChange={(e) => setAchievementDesc(e.target.value)} placeholder="Describe the significance..." className="min-h-[120px] bg-slate-50 border-none rounded-xl" required />
                </div>
                <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> Save Achievement
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader>
              <CardTitle>Archive Management</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-6 font-bold">Title</TableHead>
                    <TableHead className="font-bold">Year</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements?.map((ach) => (
                    <TableRow key={ach.id}>
                      <TableCell className="pl-6 font-bold">{ach.title}</TableCell>
                      <TableCell>{ach.year}</TableCell>
                      <TableCell>{ach.category}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete('achievements', ach.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!achievements?.length && !achievementsLoading && (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No achievements recorded.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

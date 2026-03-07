'use client';

import { useState } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Award, Plus, ArrowLeft, FileText, Send } from 'lucide-react';
import Link from 'next/link';

const collegeId = 'study-connect-college';

export default function ContentManagementPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementYear, setAchievementYear] = useState(new Date().getFullYear().toString());
  const [achievementDesc, setAchievementDesc] = useState('');
  const [achievementCategory, setAchievementCategory] = useState('academic');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventDesc) return;

    const eventsRef = collection(firestore, 'colleges', collegeId, 'events');
    addDocumentNonBlocking(eventsRef, {
      id: crypto.randomUUID(),
      collegeId,
      title: eventTitle,
      dateTime: new Date(eventDate).toISOString(),
      description: eventDesc,
      location: eventLocation || 'Main Campus',
    });

    toast({ title: 'Event Published', description: 'New event has been added to the calendar.' });
    setEventTitle(''); setEventDate(''); setEventDesc(''); setEventLocation('');
  };

  const handleCreateAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementTitle || !achievementDesc) return;

    const achievementsRef = collection(firestore, 'colleges', collegeId, 'achievements');
    addDocumentNonBlocking(achievementsRef, {
      id: crypto.randomUUID(),
      collegeId,
      title: achievementTitle,
      year: parseInt(achievementYear),
      description: achievementDesc,
      category: achievementCategory,
    });

    toast({ title: 'Achievement Added', description: 'Success milestone has been recorded.' });
    setAchievementTitle(''); setAchievementDesc('');
  };

  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
        </Button>
        <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
          <FileText className="text-primary" /> Content Management
        </h1>
        <p className="text-muted-foreground mt-2">Publish announcements, events, and milestones for the college community.</p>
      </div>

      <Tabs defaultValue="events" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" /> Campus Events</TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2"><Award className="h-4 w-4" /> Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Details will appear on the public Events calendar.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateEvent}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle">Event Title</Label>
                  <Input id="eventTitle" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g., Annual Tech Symposium" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date & Time</Label>
                    <Input id="eventDate" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Location</Label>
                    <Input id="eventLocation" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Main Auditorium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDesc">Description</Label>
                  <Textarea id="eventDesc" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} placeholder="Tell us more about the event..." className="min-h-[120px]" required />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Publish Event
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Record Achievement</CardTitle>
              <CardDescription>Document academic or research milestones.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateAchievement}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="achTitle">Achievement Name</Label>
                  <Input id="achTitle" value={achievementTitle} onChange={(e) => setAchievementTitle(e.target.value)} placeholder="e.g., Top Ranked Engineering School" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="achYear">Year</Label>
                    <Input id="achYear" type="number" value={achievementYear} onChange={(e) => setAchievementYear(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="achCat">Category</Label>
                    <Input id="achCat" value={achievementCategory} onChange={(e) => setAchievementCategory(e.target.value)} placeholder="Academic / Research" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achDesc">Milestone Details</Label>
                  <Textarea id="achDesc" value={achievementDesc} onChange={(e) => setAchievementDesc(e.target.value)} placeholder="Describe the significance of this achievement..." className="min-h-[120px]" required />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Save Achievement
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

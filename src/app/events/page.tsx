'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';

const collegeId = 'study-connect-college';

export default function EventsPage() {
  const firestore = useFirestore();
  const today = startOfDay(new Date());

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'events');
  }, [firestore]);

  const { data: events, isLoading } = useCollection(eventsQuery);

  const upcomingEvents = events
    ?.filter(event => !isBefore(new Date(event.date), today))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const pastEvents = events
    ?.filter(event => isBefore(new Date(event.date), today))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  const EventCard = ({ event }: { event: any }) => (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg border-none shadow-sm rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2 font-body font-bold uppercase text-[10px] tracking-widest">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{format(new Date(event.date), 'MMMM dd, yyyy')}</span>
            </div>
            <Badge variant="outline" className="font-headline text-[9px] uppercase border-primary/20 text-primary">{event.category}</Badge>
        </div>
        <CardTitle className="font-headline text-xl">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-body text-muted-foreground text-sm leading-relaxed">{event.description}</p>
        {event.location && (
          <p className="mt-4 text-[10px] font-bold uppercase text-slate-400">📍 {event.location}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          Campus Calendar
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
          Explore upcoming workshops, cultural festivals, and academic symposiums.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing events...</p>
        </div>
      ) : (
        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-headline font-bold mb-8 border-b pb-4">
              Upcoming Events
            </h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12 bg-white/50 rounded-[2rem] border-2 border-dashed">
                No upcoming events scheduled. Check back soon!
              </p>
            )}
          </section>

          <section>
            <h2 className="text-3xl font-headline font-bold mb-8 border-b pb-4">
              Past Milestones
            </h2>
             {pastEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
               <p className="text-muted-foreground text-center py-8">
                No past events recorded.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

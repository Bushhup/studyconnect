
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2, UserCheck, Building2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, isBefore, startOfDay } from 'date-fns';

const collegeId = 'study-connect-college';

export default function EventsPage() {
  const firestore = useFirestore();
  const today = startOfDay(new Date());

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'events');
  }, [firestore]);

  const deptsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore]);

  const { data: events, isLoading } = useCollection(eventsQuery);
  const { data: departments } = useCollection(deptsQuery);

  const upcomingEvents = events
    ?.filter(event => !isBefore(new Date(event.date), today))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const pastEvents = events
    ?.filter(event => isBefore(new Date(event.date), today))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  const EventCard = ({ event }: { event: any }) => {
    const dept = departments?.find(d => d.id === event.departmentId);
    
    return (
      <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl border-none shadow-sm rounded-[2rem] overflow-hidden bg-card group">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(event.date), 'MMMM dd, yyyy')}</span>
              </div>
              <Badge className="font-headline text-[9px] uppercase border-none bg-slate-100 text-slate-600">{event.category}</Badge>
          </div>
          <CardTitle className="font-headline text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</CardTitle>
          
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dashed">
            {event.facultyInCharge && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                In-Charge: {event.facultyInCharge}
              </div>
            )}
            {dept && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                {dept.name}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="font-body text-muted-foreground text-sm leading-relaxed line-clamp-4">{event.description}</p>
          {event.location && (
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase text-primary/60 bg-primary/5 w-fit px-3 py-1 rounded-lg">
              <MapPin className="h-3 w-3" /> {event.location}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground tracking-tight">
          Campus Calendar
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
          From departmental seminars to global cultural festivals, track every heartbeat of our vibrant campus life.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing events...</p>
        </div>
      ) : (
        <div className="space-y-24">
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-3xl font-headline font-bold text-foreground">
                Upcoming Experiences
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-[3rem] border-2 border-dashed border-border/50">
                <p className="text-muted-foreground italic">No upcoming events scheduled. Check back later!</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-3xl font-headline font-bold text-muted-foreground">
                Archived Milestones
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>
             {pastEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
               <p className="text-muted-foreground text-center py-8">
                The archives are currently empty.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

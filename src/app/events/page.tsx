import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { events, CollegeEvent } from '@/lib/data';
import { Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function EventsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter(event => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const EventCard = ({ event }: { event: CollegeEvent }) => (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2 font-body">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.date), 'MMMM dd, yyyy')}</span>
            </div>
            <Badge variant="outline" className="font-headline">{event.category}</Badge>
        </div>
        <CardTitle className="font-headline text-xl">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-body text-muted-foreground">{event.description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          Events Calendar
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
          Stay updated with the latest happenings at StudyConnect.
        </p>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-3xl font-headline font-bold mb-8 border-b pb-4">
            Upcoming Events
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <EventCard key={index} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8 font-body">
              No upcoming events scheduled. Check back soon!
            </p>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-headline font-bold mb-8 border-b pb-4">
            Past Events
          </h2>
           {pastEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event, index) => (
                <EventCard key={index} event={event} />
              ))}
            </div>
          ) : (
             <p className="text-muted-foreground text-center py-8 font-body">
              No past events to show.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

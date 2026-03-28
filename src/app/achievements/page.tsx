'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal, Loader2 } from 'lucide-react';

const collegeId = 'study-connect-college';

export default function AchievementsPage() {
  const firestore = useFirestore();
  
  const achievementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'achievements');
  }, [firestore]);

  const { data: achievements, isLoading } = useCollection(achievementsQuery);

  const achievementsByYear = achievements?.reduce((acc, achievement) => {
    const year = achievement.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(achievement);
    return acc;
  }, {} as Record<number, any[]>) || {};

  const sortedYears = Object.keys(achievementsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          Our Achievements
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
          Celebrating the milestones and successes of our students and faculty.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing milestones...</p>
        </div>
      ) : (
        <Accordion type="single" collapsible defaultValue={sortedYears[0]?.toString()} className="w-full max-w-4xl mx-auto">
          {sortedYears.map((year) => (
            <AccordionItem key={year} value={year.toString()}>
              <AccordionTrigger className="text-2xl font-headline hover:no-underline">
                Year {year}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-6 pt-4">
                  {achievementsByYear[year].map((achievement, index) => (
                    <Card key={index} className="transition-all duration-300 hover:shadow-md border-none shadow-sm rounded-2xl">
                      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="p-3 bg-accent/10 rounded-full">
                           <Medal className="w-6 h-6 text-accent" />
                        </div>
                        <CardTitle className="font-headline text-xl">{achievement.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground font-body">{achievement.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {sortedYears.length === 0 && (
            <div className="text-center py-20 text-muted-foreground italic">
              No milestones have been recorded yet.
            </div>
          )}
        </Accordion>
      )}
    </div>
  );
}

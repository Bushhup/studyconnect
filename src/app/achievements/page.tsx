
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
import { Medal, Loader2, UserCheck, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const collegeId = 'study-connect-college';

export default function AchievementsPage() {
  const firestore = useFirestore();
  
  const achievementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'achievements');
  }, [firestore]);

  const deptsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'departments');
  }, [firestore]);

  const { data: achievements, isLoading } = useCollection(achievementsQuery);
  const { data: departments } = useCollection(deptsQuery);

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
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
          Institutional Milestones
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
          Celebrating the excellence, research breakthroughs, and global successes of our academic community.
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
            <AccordionItem key={year} value={year.toString()} className="border-none mb-4">
              <AccordionTrigger className="text-3xl font-headline font-bold hover:no-underline bg-card p-6 rounded-2xl shadow-sm border border-border/50 transition-all data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                Year {year}
              </AccordionTrigger>
              <AccordionContent className="bg-card p-6 rounded-b-2xl shadow-sm border border-border/50 border-t-0">
                <div className="grid gap-6">
                  {achievementsByYear[year].map((achievement, index) => {
                    const dept = departments?.find(d => d.id === achievement.departmentId);
                    return (
                      <Card key={index} className="transition-all duration-300 hover:shadow-md border-none shadow-none bg-muted/30 rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                          <div className="p-3 bg-primary/10 rounded-xl">
                             <Medal className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <CardTitle className="font-headline text-xl text-foreground">{achievement.title}</CardTitle>
                              <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary font-bold">{achievement.category}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2">
                              {achievement.facultyInCharge && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                  <UserCheck className="h-3 w-3 text-primary" />
                                  Lead: {achievement.facultyInCharge}
                                </div>
                              )}
                              {dept && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                  <Building2 className="h-3 w-3 text-primary" />
                                  {dept.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground font-body leading-relaxed">{achievement.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {sortedYears.length === 0 && (
            <div className="text-center py-20 text-muted-foreground italic bg-card rounded-[2rem] border-2 border-dashed">
              No institutional milestones recorded for this period.
            </div>
          )}
        </Accordion>
      )}
    </div>
  );
}

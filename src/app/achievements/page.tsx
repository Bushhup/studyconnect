import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { achievements, Achievement } from '@/lib/data';
import { Medal } from 'lucide-react';

export default function AchievementsPage() {
  const achievementsByYear = achievements.reduce((acc, achievement) => {
    const year = achievement.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(achievement);
    return acc;
  }, {} as Record<number, Achievement[]>);

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

      <Accordion type="single" collapsible defaultValue={sortedYears[0]?.toString()} className="w-full max-w-4xl mx-auto">
        {sortedYears.map((year) => (
          <AccordionItem key={year} value={year.toString()}>
            <AccordionTrigger className="text-2xl font-headline hover:no-underline">
              Year {year}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-6 pt-4">
                {achievementsByYear[year].map((achievement, index) => (
                  <Card key={index} className="transition-all duration-300 hover:shadow-md">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                      <div className="p-3 bg-accent rounded-full">
                         <Medal className="w-6 h-6 text-accent-foreground" />
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
      </Accordion>
    </div>
  );
}

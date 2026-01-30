import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, FlaskConical, Library, Medal, Users, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';

const stats = [
  { value: '100+', label: 'Programs', icon: BookOpen },
  { value: '5000+', label: 'Students', icon: Users },
  { value: '50+', label: 'Research Labs', icon: FlaskConical },
  { value: '95%', label: 'Placement Rate', icon: Medal },
];

const facilities = [
  {
    name: 'State-of-the-Art Labs',
    description: 'Equipped with the latest technology for hands-on learning and research.',
    icon: FlaskConical,
    imageHint: 'modern laboratory',
  },
  {
    name: 'Comprehensive Library',
    description: 'A vast collection of books, journals, and digital resources.',
    icon: Library,
    imageHint: 'university library',
  },
  {
    name: 'Modern Sports Complex',
    description: 'Facilities for a wide range of indoor and outdoor sports and fitness activities.',
    icon: Dumbbell,
    imageHint: 'sports complex',
  },
];

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'home-hero');

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[70vh]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-primary/70" />
          <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center text-primary-foreground px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              StudyConnect
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl font-body">
              Connecting Minds, Building Futures. Discover a place where innovation and tradition meet to create the leaders of tomorrow.
            </p>
            <Button asChild size="lg" className="mt-8 font-headline">
              <Link href="/gallery">
                Explore Campus <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="stats" className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto h-12 w-12 text-primary" strokeWidth={1.5} />
                  <p className="mt-2 text-3xl md:text-4xl font-bold font-headline text-primary">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground font-body">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="facilities" className="py-12 md:py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                World-Class Facilities
              </h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
                Our campus is designed to provide students with a conducive environment for learning, research, and personal growth.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <Card key={facility.name} className="flex flex-col text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit">
                      <facility.icon className="h-8 w-8" strokeWidth={1.5} />
                    </div>
                    <CardTitle className="font-headline pt-4">{facility.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground font-body">{facility.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

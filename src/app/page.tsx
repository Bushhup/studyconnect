import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, FlaskConical, Library, Medal, Users, Dumbbell, Quote, Cpu, Palette, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const programs = [
  {
    name: 'Engineering & Tech',
    description: 'Cutting-edge curriculum focused on AI, Robotics, and Sustainable Design.',
    icon: Cpu,
    imageId: 'gallery-lab-3',
  },
  {
    name: 'Arts & Humanities',
    description: 'Exploring human expression through history, literature, and visual arts.',
    icon: Palette,
    imageId: 'gallery-library-1',
  },
  {
    name: 'Business & Law',
    description: 'Developing ethical leaders prepared for the global market and policy challenges.',
    icon: Briefcase,
    imageId: 'gallery-campus-3',
  },
];

const testimonials = [
    {
        name: 'Jessica Miller',
        program: 'Computer Science',
        quote: 'The hands-on projects and supportive faculty at StudyConnect prepared me for a successful career in tech. I felt challenged and inspired every day.',
        imageId: 'testimonial-1',
    },
    {
        name: 'David Chen',
        program: 'Biotechnology',
        quote: 'The research opportunities here are incredible. I was able to work in a state-of-the-art lab and contribute to meaningful scientific discoveries.',
        imageId: 'testimonial-2',
    },
    {
        name: 'Sophia Rodriguez',
        program: 'Business Administration',
        quote: 'StudyConnect’s focus on entrepreneurship helped me launch my own startup. The mentorship and resources available to students are top-notch.',
        imageId: 'testimonial-3',
    },
];

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'home-hero');
  const aboutImage = placeholderImages.find(p => p.id === 'about-us-image');

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
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="font-headline">
                <Link href="/gallery">
                  Explore Campus <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-headline bg-white/10 hover:bg-white/20 border-white/30 text-white">
                <Link href="/signup">Apply Now</Link>
              </Button>
            </div>
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

        <section id="programs" className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                Diverse Academic Programs
              </h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
                From technical masteries to creative explorations, find your path at StudyConnect.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((program) => {
                const image = placeholderImages.find(p => p.id === program.imageId);
                return (
                  <Card key={program.name} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-video">
                      {image && (
                        <Image
                          src={image.imageUrl}
                          alt={program.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          data-ai-hint={image.imageHint}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-4 left-4">
                        <program.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-headline">{program.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground font-body">{program.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="link" className="p-0 font-headline group-hover:translate-x-1 transition-transform">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="py-12 md:py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                {aboutImage && (
                  <Image
                    src={aboutImage.imageUrl}
                    alt={aboutImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={aboutImage.imageHint}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                  About StudyConnect
                </h2>
                <p className="text-lg text-muted-foreground font-body mb-4">
                  Founded on the principles of excellence, innovation, and community, StudyConnect has been a beacon of higher learning for over a century. We are dedicated to nurturing the next generation of leaders, thinkers, and innovators.
                </p>
                <p className="text-muted-foreground font-body">
                  Our diverse range of programs, world-class faculty, and vibrant campus life create an environment where students can thrive academically, personally, and professionally. We believe in learning by doing, and we provide our students with ample opportunities for hands-on experience, research, and real-world problem-solving.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                What Our Students Say
              </h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
                Hear from the bright minds who call StudyConnect home.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => {
                const image = placeholderImages.find(p => p.id === testimonial.imageId);
                return (
                  <Card key={testimonial.name} className="flex flex-col bg-card hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="pt-6 flex-grow flex flex-col items-center text-center">
                      <Quote className="w-8 h-8 text-primary mb-4" />
                      <p className="text-muted-foreground font-body italic">"{testimonial.quote}"</p>
                    </CardContent>
                    <CardFooter className="flex-col items-center pt-0 pb-6">
                      {image && (
                          <Avatar className="mx-auto h-20 w-20 mb-4 border-2 border-primary">
                              <AvatarImage src={image.imageUrl} alt={testimonial.name} data-ai-hint={image.imageHint} />
                              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                      )}
                      <p className="font-bold font-headline text-lg">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.program}</p>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-headline font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg md:text-xl font-body mb-10 max-w-2xl mx-auto opacity-90">
              Join thousands of students building their future at StudyConnect. Admissions are open for the upcoming semester.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="font-headline">
                <Link href="/signup">Apply Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-headline bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link href="/events">View Events</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

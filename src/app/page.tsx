'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, BookOpen, FlaskConical, Library, 
  Medal, Users, Dumbbell, Quote, Cpu, Palette, 
  Briefcase, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { placeholderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const DEFAULT_STATS = [
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

const collegeId = 'study-connect-college';

export default function Home() {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => doc(firestore, 'colleges', collegeId), [firestore]);
  const { data: profile } = useDoc(profileRef);

  const heroImage = placeholderImages.find(p => p.id === 'home-hero');
  const aboutImage = placeholderImages.find(p => p.id === 'about-us-image');

  // Parse stats from cloud or use defaults
  const displayStats = profile?.statisticHighlights?.length 
    ? profile.statisticHighlights.map((s: string, i: number) => ({
        value: s.split(' ')[0],
        label: s.split(' ').slice(1).join(' '),
        icon: DEFAULT_STATS[i % DEFAULT_STATS.length].icon
      }))
    : DEFAULT_STATS;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
      <main className="flex-1">
        <section className="relative w-full h-[75vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
          {heroImage && (
            <motion.div 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 z-0"
            >
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            </motion.div>
          )}
          <div className="absolute inset-0 bg-slate-900/65 z-10" />
          
          <div className="relative container mx-auto text-center text-primary-foreground px-4 z-20 pb-20 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-8xl font-headline font-bold tracking-tight mb-6">
                {profile?.name || 'StudyConnect'}
              </h1>
              <p className="mt-4 max-w-3xl mx-auto text-xl md:text-2xl font-body opacity-90 leading-relaxed">
                {profile?.tagline || 'Connecting Minds, Building Futures. Discover a place where innovation and tradition meet to create the leaders of tomorrow.'}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button asChild size="lg" className="font-headline h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/20">
                  <Link href="/gallery">
                    Explore Campus <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-headline h-14 px-10 text-lg rounded-full bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm">
                  <Link href="/login">Portal Login</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="stats" className="py-16 md:py-24 bg-white relative z-30 -mt-16 md:-mt-24 rounded-t-[3rem] shadow-2xl">
          <div className="container mx-auto px-4">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {displayStats.map((stat: any) => (
                <motion.div key={stat.label} variants={fadeInUp} className="text-center group">
                  <div className="mx-auto h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                    <stat.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                  </div>
                  <p className="mt-4 text-4xl md:text-5xl font-bold font-headline text-slate-900 tracking-tighter">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground font-body font-bold uppercase tracking-widest text-[10px] mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="facilities" className="py-20 md:py-32 bg-slate-50/50">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-slate-900">
                World-Class Facilities
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto font-body">
                Our campus is designed to provide students with a conducive environment for learning, research, and personal growth.
              </p>
            </motion.div>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {facilities.map((facility) => (
                <motion.div key={facility.name} variants={fadeInUp}>
                  <Card className="flex flex-col text-center hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-[2rem] p-4 group h-full">
                    <CardHeader>
                      <div className="mx-auto bg-primary/5 text-primary rounded-3xl p-6 w-fit group-hover:scale-110 transition-transform duration-500">
                        <facility.icon className="h-10 w-10" strokeWidth={1.5} />
                      </div>
                      <CardTitle className="font-headline pt-6 text-2xl font-bold">{facility.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground font-body leading-relaxed">{facility.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="programs" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-slate-900 tracking-tight">
                Diverse Academic Programs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto font-body">
                From technical masteries to creative explorations, find your path at StudyConnect.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-10"
            >
              {programs.map((program) => {
                const image = placeholderImages.find(p => p.id === program.imageId);
                return (
                  <motion.div key={program.name} variants={fadeInUp}>
                    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none rounded-[2.5rem] bg-slate-50 h-full flex flex-col">
                      <div className="relative aspect-[4/3]">
                        {image && (
                          <Image
                            src={image.imageUrl}
                            alt={program.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            data-ai-hint={image.imageHint}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl mb-2 w-fit">
                            <program.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-headline font-bold text-white">{program.name}</h3>
                        </div>
                      </div>
                      <CardContent className="pt-6 flex-grow">
                        <p className="text-muted-foreground font-body leading-relaxed">{program.description}</p>
                      </CardContent>
                      <CardFooter className="pb-8">
                        <Button variant="link" className="p-0 font-headline font-bold text-primary group-hover:translate-x-2 transition-transform">
                          Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section id="about" className="py-20 md:py-32 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] -z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/5 bg-slate-800"
              >
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
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-primary/20 text-primary border-none uppercase tracking-widest mb-4">Our Heritage</Badge>
                <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8 leading-tight">
                  A Legacy of Academic Excellence
                </h2>
                <div className="space-y-6 text-lg text-white/70 font-body leading-relaxed">
                  <p>
                    Founded on the principles of innovation and community, StudyConnect has been a beacon of higher learning for over a century. We are dedicated to nurturing the next generation of global leaders.
                  </p>
                  <p>
                    {profile?.overview || 'Our vibrant campus life and world-class faculty create an environment where students thrive academically and professionally. We believe in "learning by doing," providing ample opportunities for hands-on research and world-class problem-solving.'}
                  </p>
                </div>
                <div className="mt-10">
                  <Button asChild size="lg" className="rounded-full h-14 px-8 font-bold">
                    <Link href="/achievements">Explore Milestones</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-slate-900 tracking-tight">
                Student Voices
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto font-body">
                Hear from the bright minds who call StudyConnect home.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial) => {
                const image = placeholderImages.find(p => p.id === testimonial.imageId);
                return (
                  <motion.div key={testimonial.name} variants={fadeInUp}>
                    <Card className="flex flex-col bg-slate-50 hover:bg-white hover:shadow-2xl transition-all duration-500 border-none rounded-[2.5rem] p-8 group h-full">
                      <CardContent className="p-0 flex-grow flex flex-col items-center text-center">
                        <div className="mb-8">
                          <Quote className="w-12 h-12 text-primary opacity-20 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <p className="text-slate-600 font-body text-lg italic leading-relaxed mb-8">"{testimonial.quote}"</p>
                      </CardContent>
                      <CardFooter className="flex-col items-center pt-0 pb-0 mt-auto">
                        {image && (
                            <Avatar className="mx-auto h-20 w-20 mb-4 border-4 border-white shadow-xl">
                                <AvatarImage src={image.imageUrl} alt={testimonial.name} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <p className="font-bold font-headline text-xl text-slate-900">{testimonial.name}</p>
                        <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">{testimonial.program}</p>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="py-24 md:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-[80px]"
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-7xl font-headline font-bold mb-8 text-white tracking-tight">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl md:text-2xl font-body mb-12 max-w-3xl mx-auto text-white/80 leading-relaxed">
                Join thousands of students building their future at StudyConnect. Admissions are open for the upcoming semester.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button asChild size="lg" variant="secondary" className="font-headline h-16 px-12 text-xl rounded-full shadow-2xl shadow-black/20">
                  <Link href="/login">Enter Portal</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="font-headline h-16 px-12 text-xl rounded-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary transition-all">
                  <Link href="/events">Upcoming Events</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}

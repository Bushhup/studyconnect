'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  GraduationCap, 
  Users, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  MapPin, 
  Clock, 
  Star,
  Quote,
  Sparkles,
  Zap,
  Globe,
  ShieldCheck,
  TrendingUp,
  Microscope,
  Cpu,
  HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { placeholderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

export default function Home() {
  const firestore = useFirestore();
  
  const profileRef = useMemoFirebase(() => doc(firestore, 'colleges', collegeId), [firestore]);
  const deptsQuery = useMemoFirebase(() => collection(firestore, 'colleges', collegeId, 'departments'), [firestore]);
  
  const { data: profile } = useDoc(profileRef);
  const { data: departments } = useCollection(deptsQuery);

  const heroImage = placeholderImages.find(p => p.id === 'home-hero');
  const aboutImage = placeholderImages.find(p => p.id === 'about-us-image');
  const testimonials = placeholderImages.filter(p => p.category === 'Testimonial');

  const stats = [
    { label: 'Academic Programs', value: '140+', icon: BookOpen, color: 'text-blue-500' },
    { label: 'Global Alumni', value: '12,000+', icon: Globe, color: 'text-emerald-500' },
    { label: 'Placement Rate', value: '96.4%', icon: Award, color: 'text-purple-500' },
    { label: 'Qualified Faculty', value: '450+', icon: GraduationCap, color: 'text-amber-500' },
  ];

  return (
    <div className="flex flex-col">
      {/* SECTION 1: FULL SCREEN SPLASH */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-900">
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
              className="object-cover opacity-80"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          </motion.div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
        
        <div className="relative container mx-auto text-center text-white px-4 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto pt-20 pb-48 md:pb-40"
          >
            <div className="flex justify-center mb-8">
               <Badge className="bg-primary/20 backdrop-blur-md text-white border-white/20 py-2 px-6 rounded-full text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                 <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-Driven Academic Excellence
               </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold tracking-tight mb-6 drop-shadow-2xl">
              {profile?.name || 'StudyConnect Enterprise Institute'}
            </h1>
            <p className="mt-4 text-xl md:text-3xl font-body opacity-90 leading-relaxed drop-shadow-lg font-medium">
              {profile?.tagline || 'Connecting Minds, Building Futures'}
            </p>
            
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button asChild size="lg" className="w-full sm:w-auto font-headline h-16 px-12 text-xl rounded-full shadow-2xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                <Link href="/gallery">
                  Explore Campus <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-headline h-16 px-12 text-xl rounded-full bg-white/10 hover:bg-white/20 border-white/40 text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-95">
                <Link href="/login">Portal Login</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Scroll to Explore</p>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* SECTION 2: INSTITUTIONAL STATS */}
      <section className="relative z-30 bg-background pt-24 pb-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-card shadow-sm border border-border/50 hover:shadow-xl transition-all group"
              >
                <div className={cn("p-4 rounded-2xl bg-muted/50 mb-4 transition-transform group-hover:rotate-6 group-hover:scale-110", stat.color)}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <h3 className="text-4xl font-headline font-bold text-foreground tracking-tighter">{stat.value}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES GRID */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
             <h2 className="text-4xl md:text-5xl font-headline font-bold">The Smart Institutional <span className="text-primary">Ecosystem</span></h2>
             <p className="text-lg text-muted-foreground font-body">Experience a unified command center designed for the modern academic journey.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
             {[
               { title: 'AI-Powered Advisor', desc: 'Institutional AI to assist with curriculum, schedules, and guidance.', icon: Zap },
               { title: 'Biometric Integration', desc: 'Secure identity management with advanced bio-data verification.', icon: ShieldCheck },
               { title: 'Real-time Analytics', desc: 'Data-rich visualizations for attendance and performance tracking.', icon: TrendingUp }
             ].map((feature, idx) => (
               <Card key={idx} className="border-none shadow-sm bg-card rounded-[2.5rem] p-10 hover:shadow-2xl transition-all duration-500 group">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-body">{feature.desc}</p>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: RESEARCH & INNOVATION (NEW) */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-none py-1 px-4 text-[10px] font-bold uppercase tracking-widest">Innovation Hub</Badge>
                <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">Pushing the Boundaries of <span className="text-primary">Knowledge</span></h2>
                <p className="text-lg text-white/60 leading-relaxed">Our research centers are equipped with world-class facilities to foster breakthrough innovations in AI, Biotechnology, and Sustainable Design.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Quantum Computing', icon: Cpu, desc: 'Advanced research in next-gen processing.' },
                  { label: 'Bio-Informatics', icon: HeartPulse, desc: 'Deciphering the code of life.' },
                  { label: 'Robotics Lab', icon: Zap, desc: 'Autonomous systems and machine learning.' },
                  { label: 'Social Impact', icon: Microscope, desc: 'Tech-driven solutions for global challenges.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <item.icon className="h-6 w-6 text-primary mb-3" />
                    <h4 className="font-bold text-sm mb-1">{item.label}</h4>
                    <p className="text-xs text-white/40 leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[3rem] overflow-hidden"
            >
              <Image src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1080" alt="Research" fill className="object-cover" />
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ABOUT US & LEGACY */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square lg:aspect-video rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 order-2 lg:order-1"
            >
              {aboutImage && (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={aboutImage.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-500" />)}
                </div>
                <p className="text-xl font-headline font-bold leading-tight">"The most vibrant learning community I have ever been part of."</p>
                <p className="text-xs uppercase tracking-widest font-bold mt-2 opacity-60">— Institutional Review 2024</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 order-1 lg:order-2"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="rounded-full px-6 py-1 font-bold text-primary border-primary/20 bg-primary/5 uppercase tracking-widest text-[10px]">
                  Since 1982
                </Badge>
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground leading-tight">
                  A Legacy of Academic <span className="text-primary">Brilliance</span>
                </h2>
                <p className="text-lg text-muted-foreground font-body leading-relaxed">
                  StudyConnect stands as a lighthouse of knowledge, integrating traditional academic values with cutting-edge technological advancements. Our mission is to empower the next generation of global leaders through rigorous inquiry and innovative practice.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  { title: 'Innovation First', desc: 'Focus on research-driven learning and real-world problem solving.' },
                  { title: 'Global Community', desc: 'A diverse ecosystem with partners across 30+ countries.' },
                  { title: 'Career Accelerators', desc: 'Intensive career development workshops and industry tie-ups.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-colors shadow-sm">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6: DEPARTMENTS GRID */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-headline font-bold">Academic Divisions</h2>
            <p className="text-muted-foreground font-body">Specialized hubs designed to cultivate expertise across various disciplines.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments?.slice(0, 4).map((dept, idx) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="group h-full border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-card rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 flex flex-col h-full">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="w-fit mb-4 bg-primary/5 text-primary border-none uppercase text-[8px] font-bold px-3">
                      {dept.programType || 'UG'} Management
                    </Badge>
                    <h3 className="text-xl font-headline font-bold mb-3 group-hover:text-primary transition-colors">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-grow line-clamp-3">
                      Master control and student success tracking for the {dept.name} division.
                    </p>
                    <Button asChild variant="link" className="p-0 h-auto mt-6 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-2 transition-transform">
                      <Link href="/login">Access Portal <ArrowRight className="ml-2 h-3 w-3" /></Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button asChild variant="outline" className="rounded-full px-10 h-14 font-bold border-primary/20 text-primary">
              <Link href="/gallery">Explore Our Facilities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-none shadow-sm bg-card rounded-[2rem] p-8 relative overflow-hidden group">
                  <Quote className="absolute right-8 top-8 h-12 w-12 text-muted/20 rotate-12 transition-transform group-hover:rotate-0" />
                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative h-14 w-14 rounded-2xl overflow-hidden ring-4 ring-muted/50 shadow-lg">
                        <Image src={t.imageUrl} alt="Portrait" fill className="object-cover" data-ai-hint={t.imageHint} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Verified Student</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Graduate Batch 2024</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed italic flex-grow">
                      "{t.description}"
                    </p>
                    <div className="mt-6 flex items-center gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CALL TO ACTION */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 rounded-[4rem] bg-slate-900 text-white text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-50%] left-[-10%] w-[100%] h-[100%] bg-primary blur-[160px] rounded-full" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">Ready to Begin Your <span className="text-primary">Journey?</span></h2>
              <p className="text-lg text-white/60 font-body">Join thousands of students and faculty members in the most advanced academic ecosystem in the region.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto h-16 px-12 rounded-full text-lg font-bold">
                  <Link href="/login">Enter Portal Login</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-16 px-12 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white text-lg font-bold">
                  <Link href="/events">View Public Events</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

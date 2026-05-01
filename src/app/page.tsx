'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { placeholderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const collegeId = 'study-connect-college';

export default function Home() {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => doc(firestore, 'colleges', collegeId), [firestore]);
  const { data: profile } = useDoc(profileRef);

  const heroImage = placeholderImages.find(p => p.id === 'home-hero');

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Full Screen Background Image */}
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
      
      {/* Immersive Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 z-10" />
      
      {/* Centered Splash Content */}
      <div className="relative container mx-auto text-center text-white px-4 z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
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

      {/* Subtle bottom gradient to ground the content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent z-15 pointer-events-none" />
    </div>
  );
}

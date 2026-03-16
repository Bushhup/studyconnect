'use client';

import { useState } from 'react';
import Image from 'next/image';
import { placeholderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);

  const categories = [
    ...new Set(placeholderImages.map((p) => p.category).filter(Boolean)),
  ] as string[];

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          Campus Gallery
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto font-body">
          A glimpse into life at StudyConnect. Explore our campus, facilities, and the vibrant community.
        </p>
      </div>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-4 mb-8">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="font-headline">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {placeholderImages
                .filter((p) => p.category === category)
                .map((image) => (
                  <Card
                    key={image.id}
                    className="overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        data-ai-hint={image.imageHint}
                      />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 p-4">
                            <p className="text-white font-body text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">{image.description}</p>
                        </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 border-0">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {selectedImage && (
            <div className='relative aspect-video'>
              <Image
                src={selectedImage.imageUrl.replace('/600/400', '/1280/720')}
                alt={selectedImage.description}
                fill
                className="object-contain rounded-lg"
                data-ai-hint={selectedImage.imageHint}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

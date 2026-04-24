import type { MetadataRoute } from 'next'

export const dynamic = 'force-static';

/**
 * Technical Sitemap Generator
 * Provides search engines with a clear map of public-facing routes.
 * Portals (Admin/Faculty/Student) are kept out of public indexing for privacy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://studyconnect-taupe.vercel.app'
  
  // Publicly indexable routes
  const publicRoutes = [
    '',
    '/achievements',
    '/gallery',
    '/events',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return publicRoutes
}

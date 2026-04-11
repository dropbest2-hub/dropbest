import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/profile', '/rewards'], // Block private and admin routes from Google
    },
    sitemap: 'https://dropbest.vercel.app/sitemap.xml',
  }
}

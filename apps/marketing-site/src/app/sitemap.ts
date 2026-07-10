import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = [
    { url: 'https://kalahari.co.za/', lastModified: new Date() },
    { url: 'https://kalahari.co.za/solutions', lastModified: new Date() },
    { url: 'https://kalahari.co.za/how-it-works', lastModified: new Date() },
    { url: 'https://kalahari.co.za/pricing', lastModified: new Date() },
    { url: 'https://kalahari.co.za/trust', lastModified: new Date() },
    { url: 'https://kalahari.co.za/legal', lastModified: new Date() },
  ];

  return staticUrls;
}

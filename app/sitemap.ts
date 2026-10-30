import type { MetadataRoute } from 'next';
import { caseStudies } from './data/caseStudies';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const caseStudyUrls = caseStudies
        .filter(cs => cs.clickable && !cs.hidden)
        .map(cs => ({
            url: `https://delanoy.com/work/${cs.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }));

    return [
        {
            url: 'https://delanoy.com',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        ...caseStudyUrls,
    ];
}

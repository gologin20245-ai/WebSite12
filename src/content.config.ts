import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const quizCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/quiz' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    lang: z.string().default('ru'),
    offerUrl: z.string(),
    trackerId: z.string().optional(),
    ogImage: z.string().optional(),
    noindex: z.boolean().default(true),
    steps: z.array(
      z.object({
        question: z.string(),
        type: z.enum(['single', 'multiple', 'range']).default('single'),
        answers: z
          .array(
            z.object({
              text: z.string(),
              icon: z.string().optional(),
            })
          )
          .optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        unit: z.string().optional(),
      })
    ),
    result: z.object({
      title: z.string(),
      text: z.string(),
      ctaText: z.string(),
      image: z.string().optional(),
    }),
  }),
});

const articlesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string().optional(),
    author: z.string().optional(),
    authorAvatar: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    offerUrl: z.string(),
    trackerId: z.string().optional(),
    ctaText: z.string().default('Узнать больше'),
    lang: z.string().default('ru'),
    noindex: z.boolean().default(true),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  }),
});

const comparisonsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/comparisons' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    lang: z.string().default('ru'),
    offerUrl: z.string(),
    trackerId: z.string().optional(),
    noindex: z.boolean().default(true),
    products: z.array(
      z.object({
        name: z.string(),
        image: z.string().optional(),
        rating: z.number().min(0).max(5),
        price: z.string().optional(),
        pros: z.array(z.string()),
        cons: z.array(z.string()),
        isRecommended: z.boolean().default(false),
        url: z.string().optional(),
        features: z.record(z.string(), z.string()).optional(),
      })
    ),
    criteria: z.array(z.string()).optional(),
  }),
});

const reviewsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    productName: z.string(),
    productImage: z.string().optional(),
    rating: z.number().min(0).max(5),
    price: z.string().optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    verdict: z.string().optional(),
    offerUrl: z.string(),
    trackerId: z.string().optional(),
    ctaText: z.string().default('Купить со скидкой'),
    lang: z.string().default('ru'),
    noindex: z.boolean().default(true),
    author: z.string().optional(),
    date: z.string().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  }),
});

const calculatorsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/calculators' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    lang: z.string().default('ru'),
    offerUrl: z.string(),
    trackerId: z.string().optional(),
    noindex: z.boolean().default(true),
    fields: z.array(
      z.object({
        name: z.string(),
        label: z.string(),
        type: z.enum(['number', 'select', 'range']),
        options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        step: z.number().optional(),
        defaultValue: z.union([z.string(), z.number()]).optional(),
        unit: z.string().optional(),
      })
    ),
    resultTemplate: z.string(),
    ctaText: z.string().default('Получить рекомендацию'),
  }),
});

const faqsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faqs' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    lang: z.string().default('ru'),
    offerUrl: z.string(),
    trackerId: z.string().optional(),
    ctaText: z.string().default('Попробовать'),
    noindex: z.boolean().default(true),
    items: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

const storiesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    heroName: z.string(),
    heroAge: z.number().optional(),
    heroLocation: z.string().optional(),
    heroAvatar: z.string().optional(),
    beforeImage: z.string().optional(),
    afterImage: z.string().optional(),
    disclaimer: z.string().default('Это собирательный образ. Результаты индивидуальны.'),
    offerUrl: z.string(),
    trackerId: z.string().optional(),
    ctaText: z.string().default('Попробовать'),
    lang: z.string().default('ru'),
    noindex: z.boolean().default(true),
    date: z.string().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = {
  quiz: quizCollection,
  articles: articlesCollection,
  comparisons: comparisonsCollection,
  reviews: reviewsCollection,
  calculators: calculatorsCollection,
  faqs: faqsCollection,
  stories: storiesCollection,
};

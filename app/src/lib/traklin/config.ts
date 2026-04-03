import corpus from '../../data/traklin_filters_corpus.json';
import type { CategoryConfig } from './types';

type CorpusCategory = {
  category_name: string;
  fk_content_id: number;
  source_url?: string;
  filters?: Array<{
    group_id: string | number;
    group_name: string;
    param: 'pm' | 'pfacg' | 'prange';
    options?: Array<{
      id: number | string;
      label: string;
      count?: number;
      param: 'pm' | 'pfacg';
    }>;
  }>;
};

const categoryMetadataById: Record<number, Pick<CategoryConfig, 'slug' | 'label' | 'iconKey' | 'priorityGroupNames'>> = {
  2998: { slug: 'traklin_home_garden', label: 'Home & Garden', iconKey: 'hammer', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  4: { slug: 'traklin_electronics', label: 'Electronics', iconKey: 'display', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  1631: { slug: 'traklin_hvac', label: 'HVAC', iconKey: 'fan', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  1624: { slug: 'traklin_cooking_baking', label: 'Cooking & Baking', iconKey: 'oven', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  5: { slug: 'traklin_kitchen', label: 'Kitchen', iconKey: 'microwave', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  1622: { slug: 'traklin_refrigerators_freezers', label: 'Refrigerators & Freezers', iconKey: 'refrigerator', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  1620: { slug: 'traklin_cleaning_laundry', label: 'Cleaning & Laundry', iconKey: 'washer', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  16: { slug: 'traklin_beauty', label: 'Beauty', iconKey: 'hairdryer', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  20351: { slug: 'traklin_leisure_sports', label: 'Leisure & Sports', iconKey: 'headphones', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
  15068: { slug: 'traklin_gaming_mobile', label: 'Gaming & Mobile', iconKey: 'gamecontroller', priorityGroupNames: ['מותגים', 'סינון לפי מחיר'] },
};

export const categories: CategoryConfig[] = (corpus.categories as CorpusCategory[])
  .reduce<CategoryConfig[]>((acc, category) => {
    const metadata = categoryMetadataById[category.fk_content_id];
    if (!metadata) {
      return acc;
    }

    acc.push({
      slug: metadata.slug,
      label: metadata.label,
      fkContentId: category.fk_content_id,
      iconKey: metadata.iconKey,
      sourceUrl: category.source_url || '',
      filters: (category.filters || []).map(fg => ({
        groupId: String(fg.group_id),
        groupName: fg.group_name,
        param: fg.param,
        options: (fg.options || []).map(opt => ({
          id: opt.id,
          label: opt.label,
          count: opt.count,
          param: opt.param
        }))
      })),
      priorityGroupNames: metadata.priorityGroupNames
    });

    return acc;
  }, []);

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return categories.find(c => c.slug === slug);
}

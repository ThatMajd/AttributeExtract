import type { BranchCatalogEntry, ProductBranchAvailability } from './types';

export const TRAKLIN_BRANCHES: BranchCatalogEntry[] = [
  { id: 138, name: 'אופקים', city: 'אופקים', showOnMap: true, lat: 31.3146, lng: 34.6203 },
  { id: 232, name: 'אילת - ביג', city: 'אילת', showOnMap: true, lat: 29.5581, lng: 34.9519 },
  { id: 231, name: 'אילת - מבנה', city: 'אילת', showOnMap: true, lat: 29.5518, lng: 34.9564 },
  { id: 41, name: 'אשדוד', city: 'אשדוד', showOnMap: true, lat: 31.8014, lng: 34.6435 },
  { id: 219, name: 'אשדוד - פלמ"ח', city: 'אשדוד', showOnMap: true, lat: 31.7937, lng: 34.6508 },
  { id: 114, name: 'אשדוד - ראלי אלקטריק', city: 'אשדוד', showOnMap: true, lat: 31.8072, lng: 34.6372 },
  { id: 127, name: 'אשקלון', city: 'אשקלון', showOnMap: true, lat: 31.6688, lng: 34.5715 },
  { id: 119, name: 'באר שבע', city: 'באר שבע', showOnMap: true, lat: 31.2520, lng: 34.7915 },
  { id: 47, name: 'בית שאן', city: 'בית שאן', showOnMap: true, lat: 32.4974, lng: 35.4960 },
  { id: 130, name: 'בני ברק - קניון איילון', city: 'בני ברק', showOnMap: true, lat: 32.1005, lng: 34.8245 },
  { id: 217, name: 'בני ברק - רבי עקיבא', city: 'בני ברק', showOnMap: true, lat: 32.0875, lng: 34.8334 },
  { id: 113, name: 'בת ים - קניון בת ים', city: 'בת ים', showOnMap: true, lat: 32.0177, lng: 34.7509 },
  { id: 135, name: 'גדרה - ביג גדרה', city: 'גדרה', showOnMap: true, lat: 31.8142, lng: 34.7818 },
  { id: 118, name: 'דימונה', city: 'דימונה', showOnMap: true, lat: 31.0675, lng: 35.0332 },
  { id: 158, name: 'דיר אל אסד', city: 'דיר אל אסד', showOnMap: true, lat: 32.9366, lng: 35.2694 },
  { id: 46, name: 'חדרה - מול החוף חדרה', city: 'חדרה', showOnMap: true, lat: 32.4366, lng: 34.9184 },
  { id: 123, name: 'חולון', city: 'חולון', showOnMap: true, lat: 32.0103, lng: 34.7792 },
  { id: 153, name: 'חורפיש', city: 'חורפיש', showOnMap: true, lat: 33.0150, lng: 35.3498 },
  { id: 11, name: 'חיפה - הדר', city: 'חיפה', showOnMap: true, lat: 32.8130, lng: 34.9956 },
  { id: 87, name: 'חיפה - הזמנות ואינטרנט', city: 'חיפה', showOnMap: true, lat: 32.8178, lng: 35.0104 },
  { id: 78, name: 'חיפה - ההסתדרות', city: 'חיפה', showOnMap: true, lat: 32.8213, lng: 35.0215 },
  { id: 150, name: 'חיפה - הציונות', city: 'חיפה', showOnMap: true, lat: 32.8071, lng: 34.9861 },
  { id: 48, name: 'חיפה - קניון חיפה', city: 'חיפה', showOnMap: true, lat: 32.7767, lng: 34.9993 },
  { id: 83, name: 'טבריה - ביג פוריה', city: 'טבריה', showOnMap: true, lat: 32.7795, lng: 35.5431 },
  { id: 35, name: 'טבריה', city: 'טבריה', showOnMap: true, lat: 32.7922, lng: 35.5312 },
  { id: 122, name: 'יהוד', city: 'יהוד', showOnMap: true, lat: 32.0286, lng: 34.8921 },
  { id: 215, name: 'ירושלים - ירמיהו', city: 'ירושלים', showOnMap: true, lat: 31.7982, lng: 35.2137 },
  { id: 224, name: 'ירושלים - קניון הדר', city: 'ירושלים', showOnMap: true, lat: 31.7858, lng: 35.2106 },
  { id: 152, name: 'כפר כנא', city: 'כפר כנא', showOnMap: true, lat: 32.7463, lng: 35.3414 },
  { id: 126, name: 'כפר סבא', city: 'כפר סבא', showOnMap: true, lat: 32.1750, lng: 34.9073 },
  { id: 85, name: 'כרמיאל - חוצות כרמיאל', city: 'כרמיאל', showOnMap: true, lat: 32.9190, lng: 35.3047 },
  { id: 140, name: 'לוד - שא"ל נתב"ג', city: 'לוד', showOnMap: true, lat: 31.9510, lng: 34.8880 },
  { id: 86, name: 'מגדל העמק', city: 'מגדל העמק', showOnMap: true, lat: 32.6759, lng: 35.2415 },
  { id: 213, name: 'מודיעין עילית', city: 'מודיעין עילית', showOnMap: true, lat: 31.9326, lng: 35.0410 },
  { id: 156, name: 'מעיליא', city: 'מעיליא', showOnMap: true, lat: 33.0271, lng: 35.2561 },
  { id: 15, name: "מפרץ חיפה - צ'ק- פוסט", city: 'חיפה', showOnMap: true, lat: 32.8206, lng: 35.0588 },
  { id: 50, name: 'נוף הגליל', city: 'נוף הגליל', showOnMap: true, lat: 32.7088, lng: 35.3244 },
  { id: 151, name: 'נצרת - אבן עמר', city: 'נצרת', showOnMap: true, lat: 32.6996, lng: 35.3035 },
  { id: 36, name: 'נתניה', city: 'נתניה', showOnMap: true, lat: 32.3216, lng: 34.8532 },
  { id: 67, name: 'סכנין', city: 'סכנין', showOnMap: true, lat: 32.8623, lng: 35.2973 },
  { id: 24, name: 'עכו', city: 'עכו', showOnMap: true, lat: 32.9281, lng: 35.0827 },
  { id: 23, name: 'עפולה', city: 'עפולה', showOnMap: true, lat: 32.6091, lng: 35.2892 },
  { id: 121, name: 'ערד - בניין "C" ערד', city: 'ערד', showOnMap: true, lat: 31.2586, lng: 35.2140 },
  { id: 28, name: 'קבוץ רגבה - רגבה', city: 'רגבה', showOnMap: true, lat: 32.9762, lng: 35.0986 },
  { id: 45, name: 'קרית אתא', city: 'קרית אתא', showOnMap: true, lat: 32.8096, lng: 35.1064 },
  { id: 84, name: 'קרית גת', city: 'קרית גת', showOnMap: true, lat: 31.6100, lng: 34.7642 },
  { id: 14, name: 'קרית מוצקין - מוצקין', city: 'קרית מוצקין', showOnMap: true, lat: 32.8373, lng: 35.0749 },
  { id: 134, name: 'קרית מלאכי - ביג קסטינה', city: 'קרית מלאכי', showOnMap: true, lat: 31.7308, lng: 34.7465 },
  { id: 26, name: 'קרית שמונה', city: 'קרית שמונה', showOnMap: true, lat: 33.2082, lng: 35.5690 },
  { id: 115, name: 'ראשון לציון - ראשל"צ', city: 'ראשון לציון', showOnMap: true, lat: 31.9730, lng: 34.7925 },
  { id: 117, name: 'רמלה - רמלוד', city: 'רמלה', showOnMap: true, lat: 31.9280, lng: 34.8729 },
  { id: 125, name: 'רעננה', city: 'רעננה', showOnMap: true, lat: 32.1848, lng: 34.8713 },
  { id: 136, name: 'שדרות', city: 'שדרות', showOnMap: true, lat: 31.5233, lng: 34.5950 },
  { id: 65, name: 'תרשיחא', city: 'תרשיחא', showOnMap: true, lat: 33.0168, lng: 35.2710 }
];

const branchMap = new Map(TRAKLIN_BRANCHES.map(branch => [branch.id, branch]));

export function getBranchById(branchId: number) {
  return branchMap.get(branchId);
}

export function getMappedBranches() {
  return TRAKLIN_BRANCHES.filter(branch => branch.showOnMap && branch.lat !== undefined && branch.lng !== undefined);
}

export function sortAvailabilityBranches(
  branches: ProductBranchAvailability[],
  preferredBranchId: number | null
) {
  return [...branches].sort((left, right) => {
    if (preferredBranchId !== null) {
      if (left.branchId === preferredBranchId) return -1;
      if (right.branchId === preferredBranchId) return 1;
    }

    return left.branchName.localeCompare(right.branchName, 'he');
  });
}

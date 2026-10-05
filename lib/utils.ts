import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { normalizeIso4217Code } from './iso4217';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build full image URL from stored path using NEXT_PUBLIC_SPACES_URL
 * @param imagePath Stored path (e.g. /ThoughtExpense/avatars/xxx.jpg) or full URL (returned as-is)
 * @returns Full URL or null
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  // Already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const base = process.env.NEXT_PUBLIC_SPACES_URL;
  if (!base) return null;
  const baseTrimmed = base.replace(/\/$/, '');
  const pathTrimmed = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseTrimmed}${pathTrimmed}`;
}

/** Legacy aliases from parsed expense text → ISO 4217 */
const currencyAliasMap: Record<string, string> = {
  TK: 'BDT',
  Rs: 'INR',
  '₹': 'INR',
  '৳': 'BDT',
};

export function currencyCodeForDisplay(currency: string): string {
  const upper = currency.trim().toUpperCase();
  const alias = currencyAliasMap[currency] ?? currencyAliasMap[upper];
  if (alias) return alias;
  return normalizeIso4217Code(upper) ?? upper;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const mappedCurrency = currencyCodeForDisplay(currency);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: mappedCurrency,
    }).format(amount);
  } catch {
    return `${mappedCurrency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateString: string, formatString: string = 'MMM dd, yyyy'): string {
  try {
    return format(parseISO(dateString), formatString);
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch {
    return dateString;
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  if (confidence >= 0.5) return 'text-orange-600';
  return 'text-red-600';
}

export function getConfidenceBadgeColor(confidence: number): string {
  if (confidence >= 0.9) return 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300';
  if (confidence >= 0.5) return 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300';
  return 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300';
}

// Generate consistent color for any category using hash
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getCategoryColor(category: string): string {
  // Predefined colors for common categories
  const predefinedColors: Record<string, string> = {
    Food: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
    Transport: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
    Rent: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
    Utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300',
    Shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300',
    Entertainment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
    Healthcare: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
    Education: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
    'Personal Care': 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
    Fees: 'bg-gray-100 text-gray-800 dark:bg-gray-500/15 dark:text-gray-300',
    Other: 'bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-300',
  };

  // Return predefined color if exists
  if (predefinedColors[category]) {
    return predefinedColors[category];
  }

  // Generate consistent color for dynamic categories
  const colorPalette = [
    'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
    'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
    'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
    'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300',
    'bg-lime-100 text-lime-800 dark:bg-lime-500/15 dark:text-lime-300',
    'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  ];

  const hash = hashString(category);
  return colorPalette[hash % colorPalette.length];
}

/** Semantic data viz palette per design spec */
const SEMANTIC_CATEGORY_COLORS: Record<string, string> = {
  // Housing/Utilities (Fixed): Blues
  Rent: '#3B82F6',
  Housing: '#3B82F6',
  Utilities: '#3B82F6',
  // Food/Lifestyle (Variable): Oranges/Yellows
  Food: '#F59E0B',
  Transport: '#F59E0B',
  Shopping: '#F59E0B',
  Entertainment: '#F59E0B',
  'Personal Care': '#F59E0B',
  // Health/Emergency: Red/Pink
  Healthcare: '#EF4444',
  Health: '#EF4444',
  // Income/Savings: Greens (edge case for income)
  Education: '#10B981',
  // Others: Cool Grey
  Fees: '#9CA3AF',
  Other: '#9CA3AF',
};

export function getCategoryChartColor(category: string): string {
  const lower = category.toLowerCase();
  // Match semantic categories by keyword
  if (lower.includes('rent') || lower.includes('housing') || lower.includes('utilities')) return '#3B82F6';
  if (lower.includes('food') || lower.includes('transport') || lower.includes('shopping') || lower.includes('entertainment') || lower.includes('personal')) return '#F59E0B';
  if (lower.includes('health') || lower.includes('doctor') || lower.includes('medical')) return '#EF4444';
  if (lower.includes('education') || lower.includes('savings')) return '#10B981';

  if (SEMANTIC_CATEGORY_COLORS[category]) {
    return SEMANTIC_CATEGORY_COLORS[category];
  }

  // Fallback: Teal, Violet for top 3, Grey for Others
  const fallbackPalette = ['#0EA5A4', '#8B5CF6', '#3B82F6', '#9CA3AF'];
  const hash = hashString(category);
  return fallbackPalette[hash % fallbackPalette.length];
}

export function getCategoryBgColor(category: string): string {
  // Predefined background colors (10% opacity style) for common categories
  const predefinedColors: Record<string, string> = {
    Food: '#eff6ff',
    Transport: '#faf5ff',
    Rent: '#fef2f2',
    Utilities: '#fefce8',
    Shopping: '#fdf2f8',
    Entertainment: '#eef2ff',
    Healthcare: '#f0fdf4',
    Education: '#f0fdfa',
    'Personal Care': '#fff7ed',
    Fees: '#f9fafb',
    Other: '#f8fafc',
  };

  // Return predefined color if exists
  if (predefinedColors[category]) {
    return predefinedColors[category];
  }

  // Generate consistent background color for dynamic categories
  const colorPalette = [
    '#eff6ff', // blue
    '#faf5ff', // purple
    '#fdf2f8', // pink
    '#eef2ff', // indigo
    '#f0fdf4', // green
    '#f0fdfa', // teal
    '#fff7ed', // orange
    '#ecfeff', // cyan
    '#f7fee7', // lime
    '#fffbeb', // amber
    '#fff1f2', // rose
    '#f5f3ff', // violet
  ];

  const hash = hashString(category);
  return colorPalette[hash % colorPalette.length];
}

// Local parsing for Quick Log live preview (works offline)
export interface ParsedExpensePreview {
  description: string;
  amount: number;
  rawInput: string;
}

export function parseExpenseInputLocally(input: string): ParsedExpensePreview[] {
  if (!input.trim()) return [];

  const items = input
    .split(/[\n,]+|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const results: ParsedExpensePreview[] = [];

  for (const item of items) {
    const endNumberMatch = item.match(/^(.+?)\s+(\d+(?:\.\d{1,2})?)\s*$/);
    const startNumberMatch = item.match(/^(\d+(?:\.\d{1,2})?)\s+(.+)$/);

    if (endNumberMatch) {
      results.push({
        description: endNumberMatch[1].trim(),
        amount: parseFloat(endNumberMatch[2]),
        rawInput: item,
      });
    } else if (startNumberMatch) {
      results.push({
        description: startNumberMatch[2].trim(),
        amount: parseFloat(startNumberMatch[1]),
        rawInput: item,
      });
    } else {
      const numbers = item.match(/\d+(?:\.\d{1,2})?/g);
      if (numbers && numbers.length > 0) {
        results.push({
          description: 'Unknown',
          amount: parseFloat(numbers[0]),
          rawInput: item,
        });
      }
    }
  }

  return results;
}

/** Clean expense description: remove "3." prefix and "- 971TK" suffix */
export function cleanExpenseDescription(description: string): string {
  return description
    .replace(/^\d+\.\s*/, '')
    .replace(/\s*[-–—]\s*[\d,.]+\s*(?:[A-Z]{2,4}|[A-Za-z]+)?\s*$/i, '')
    .trim() || description;
}

// Category icons moved to lib/categoryIcons.tsx (react-icons)
export { getCategoryIcon } from './categoryIcons';

export function getCategoryFromKeyword(description: string): string {
  const lower = description.toLowerCase();
  const keywords: Record<string, string[]> = {
    Food: ['coffee', 'lunch', 'dinner', 'breakfast', 'burger', 'pizza', 'restaurant', 'food', 'groceries', 'grocery', 'snack'],
    Transport: ['uber', 'taxi', 'bus', 'metro', 'rickshaw', 'petrol', 'fuel', 'parking'],
    Rent: ['rent', 'lease'],
    Utilities: ['electricity', 'water', 'internet', 'bill', 'utilities'],
    Shopping: ['shopping', 'mall', 'store', 'amazon'],
    Entertainment: ['movie', 'netflix', 'spotify', 'game'],
    Healthcare: ['doctor', 'medicine', 'pharmacy', 'hospital'],
    Education: ['course', 'book', 'tuition'],
    'Personal Care': ['salon', 'haircut', 'gym'],
    Fees: ['fee', 'subscription', 'membership'],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) return category;
  }
  return 'Other';
}

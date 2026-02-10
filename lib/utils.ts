import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map common currency symbols/codes to ISO 4217 codes
const currencyCodeMap: Record<string, string> = {
  'TK': 'BDT',   // Bangladesh Taka
  'Rs': 'INR',   // Indian Rupee
  'PKR': 'PKR',  // Pakistani Rupee
  '₹': 'INR',
  '৳': 'BDT',
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Map currency code if needed
  const mappedCurrency = currencyCodeMap[currency] || currency;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: mappedCurrency,
    }).format(amount);
  } catch (error) {
    // Fallback to USD if currency code is invalid
    console.warn(`Invalid currency code: ${currency}, falling back to USD`);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
  if (confidence >= 0.9) return 'bg-green-100 text-green-800';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
  if (confidence >= 0.5) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: 'bg-blue-100 text-blue-800',
    Transport: 'bg-purple-100 text-purple-800',
    Rent: 'bg-red-100 text-red-800',
    Utilities: 'bg-yellow-100 text-yellow-800',
    Shopping: 'bg-pink-100 text-pink-800',
    Entertainment: 'bg-indigo-100 text-indigo-800',
    Healthcare: 'bg-green-100 text-green-800',
    Education: 'bg-teal-100 text-teal-800',
    'Personal Care': 'bg-orange-100 text-orange-800',
    Fees: 'bg-gray-100 text-gray-800',
    Other: 'bg-slate-100 text-slate-800',
  };
  return colors[category] || colors.Other;
}

export function getCategoryChartColor(category: string): string {
  const colors: Record<string, string> = {
    Food: '#3b82f6',
    Transport: '#a855f7',
    Rent: '#ef4444',
    Utilities: '#eab308',
    Shopping: '#ec4899',
    Entertainment: '#6366f1',
    Healthcare: '#10b981',
    Education: '#14b8a6',
    'Personal Care': '#f97316',
    Fees: '#6b7280',
    Other: '#64748b',
  };
  return colors[category] || colors.Other;
}

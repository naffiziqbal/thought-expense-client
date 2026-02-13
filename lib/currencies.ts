export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'BDT', label: 'BDT - Bangladeshi Taka (৳)' },
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
  { value: 'PKR', label: 'PKR - Pakistani Rupee (Rs)' },
  { value: 'JPY', label: 'JPY - Japanese Yen (¥)' },
  { value: 'CAD', label: 'CAD - Canadian Dollar ($)' },
  { value: 'AUD', label: 'AUD - Australian Dollar ($)' },
] as const;

export function getDefaultCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  const lang = navigator.language?.toLowerCase() || '';
  if (lang.includes('en-gb') || lang.includes('gb')) return 'GBP';
  if (lang.includes('en-bd') || lang.includes('bn')) return 'BDT';
  if (lang.includes('en-in') || lang.includes('hi')) return 'INR';
  if (lang.includes('en-pk') || lang.includes('ur')) return 'PKR';
  if (lang.includes('ja')) return 'JPY';
  if (lang.includes('fr') || lang.includes('de') || lang.includes('es')) return 'EUR';
  return 'USD';
}

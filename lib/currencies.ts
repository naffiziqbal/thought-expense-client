import { getIso4217Currency, normalizeIso4217Code, type Iso4217Currency } from './iso4217';

export type CurrencyOption = Iso4217Currency;

export const CURRENCY_DISPLAY_HINT =
  'Dashboard, budgets, and exports use this currency. Expenses in other currencies convert when you add them.';

export function findCurrency(code: string, locale = 'en'): CurrencyOption | null {
  return getIso4217Currency(code, locale);
}

export function getDefaultCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  const lang = navigator.language?.toLowerCase() || '';
  const guess =
    lang.includes('en-gb') || lang.includes('gb')
      ? 'GBP'
      : lang.includes('en-bd') || lang.includes('bn')
        ? 'BDT'
        : lang.includes('en-in') || lang.includes('hi')
          ? 'INR'
          : lang.includes('en-pk') || lang.includes('ur')
            ? 'PKR'
            : lang.startsWith('ja')
              ? 'JPY'
              : lang.startsWith('fr') || lang.startsWith('de') || lang.startsWith('es')
                ? 'EUR'
                : 'USD';
  return normalizeIso4217Code(guess) ?? 'USD';
}

export {
  getIso4217Currency,
  listIso4217Currencies,
  listIso4217CurrenciesGrouped,
  normalizeIso4217Code,
  searchIso4217Currencies,
  POPULAR_ISO4217_CODES,
  ISO4217_CODES,
} from './iso4217';

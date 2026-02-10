'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch user's actual categories from their expenses
        const response = await api.getCategorySummary();
        if (response.success && response.data.byCategory) {
          const userCategories = Object.keys(response.data.byCategory);
          setCategories(userCategories);
        }
      } catch (error) {
        // If no expenses yet, return empty array
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading };
}

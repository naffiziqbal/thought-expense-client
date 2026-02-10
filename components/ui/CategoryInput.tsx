'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({
  value,
  onChange,
  suggestions = [],
  label,
  placeholder = 'Enter or select category',
  required,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = suggestions.filter((cat) =>
        cat.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectCategory = (category: string) => {
    onChange(category);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-gray-300 px-4 py-3 text-base transition-colors',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {filteredSuggestions.map((category, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectCategory(category)}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors',
                'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                value === category && 'bg-blue-100 font-medium'
              )}
            >
              {category}
            </button>
          ))}
          
          {value && !filteredSuggestions.includes(value) && (
            <div className="border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
              <span className="font-medium">Create new:</span> &quot;{value}&quot;
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {!error && (
        <p className="mt-1 text-xs text-gray-500">
          Type to create a new category or select from suggestions
        </p>
      )}
    </div>
  );
};

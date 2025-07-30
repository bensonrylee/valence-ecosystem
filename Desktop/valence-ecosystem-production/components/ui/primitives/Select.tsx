import React, { forwardRef, useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  floatingLabel?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      hint,
      disabled = false,
      required = false,
      searchable = false,
      clearable = false,
      className,
      floatingLabel = true,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const generatedId = useId();

    const selectedOption = options.find(opt => opt.value === selectedValue);
    const filteredOptions = searchable && searchQuery
      ? options.filter(opt => 
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const showFloatingLabel = floatingLabel && label;
    const hasValue = !!selectedValue;

    // Handle outside clicks
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
              handleSelect(filteredOptions[highlightedIndex].value);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            setSearchQuery('');
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, filteredOptions]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
        highlightedElement?.scrollIntoView({ block: 'nearest' });
      }
    }, [highlightedIndex]);

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValue('');
      onChange?.('');
      setSearchQuery('');
    };

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (!isOpen && searchable) {
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
    };

    return (
      <div ref={ref} className="relative">
        <div
          ref={containerRef}
          className="relative"
        >
          {/* Select Trigger */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full px-4 py-3 bg-white border rounded-lg',
              'text-left font-normal',
              'transition-all duration-300 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              
              // Border styles
              error
                ? 'border-red-500 focus:ring-red-500'
                : isOpen
                ? 'border-blue-600 focus:ring-blue-500'
                : 'border-gray-200 hover:border-gray-300',
              
              // Floating label padding
              showFloatingLabel && 'pt-6 pb-2',
              
              // States
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              
              // Custom className
              className
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? `${generatedId}-label` : undefined}
          >
            {/* Floating Label */}
            {showFloatingLabel && (
              <label
                id={`${generatedId}-label`}
                className={cn(
                  'absolute left-4 transition-all duration-300 ease-out pointer-events-none',
                  'origin-left select-none',
                  
                  // Positioning and size
                  hasValue || isOpen
                    ? 'top-2 text-xs font-medium'
                    : 'top-1/2 -translate-y-1/2 text-base font-normal',
                  
                  // Colors
                  error
                    ? 'text-red-600'
                    : isOpen
                    ? 'text-blue-600'
                    : hasValue
                    ? 'text-gray-600'
                    : 'text-gray-400',
                  
                  // Required indicator
                  required && "after:content-['*'] after:ml-0.5 after:text-red-500"
                )}
              >
                {label}
              </label>
            )}

            {/* Selected Value or Placeholder */}
            <span className={cn(
              'block truncate pr-8',
              selectedOption ? 'text-gray-900' : 'text-gray-400'
            )}>
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.icon}
                  {selectedOption.label}
                </span>
              ) : (
                placeholder
              )}
            </span>

            {/* Icons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {clearable && selectedValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Clear selection"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <svg
                className={cn(
                  'w-5 h-5 text-gray-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className={cn(
              'absolute z-50 w-full mt-1',
              'bg-white border border-gray-200 rounded-lg shadow-lg',
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200'
            )}>
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={cn(
                      'w-full px-3 py-2 text-sm',
                      'bg-gray-50 border border-gray-200 rounded-md',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    )}
                  />
                </div>
              )}

              {/* Options List */}
              <ul
                ref={listRef}
                role="listbox"
                className="max-h-60 overflow-auto overscroll-contain py-1"
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-4 py-2 text-sm text-gray-500 text-center">
                    No options found
                  </li>
                ) : (
                  filteredOptions.map((option, index) => (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={option.value === selectedValue}
                      className={cn(
                        'px-4 py-2.5 cursor-pointer transition-colors',
                        'flex items-center gap-2',
                        option.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : [
                              'text-gray-900',
                              index === highlightedIndex && 'bg-gray-100',
                              option.value === selectedValue && 'bg-blue-50 text-blue-600',
                              'hover:bg-gray-100'
                            ]
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {option.icon}
                      <span className="flex-1">{option.label}</span>
                      {option.value === selectedValue && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
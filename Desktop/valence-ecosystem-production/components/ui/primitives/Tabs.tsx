import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  tabsClassName?: string;
  panelClassName?: string;
  children?: (activeTab: string) => React.ReactNode;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      tabs,
      value,
      defaultValue,
      onChange,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      className,
      tabsClassName,
      panelClassName,
      children,
    },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState(
      value || defaultValue || tabs[0]?.id || ''
    );
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
    const tabsRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    // Update active tab when value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setActiveTab(value);
      }
    }, [value]);

    // Update indicator position for underline variant
    useEffect(() => {
      if (variant !== 'underline') return;

      const activeTabElement = tabRefs.current.get(activeTab);
      if (activeTabElement && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();

        setIndicatorStyle({
          left: tabRect.left - tabsRect.left,
          width: tabRect.width,
        });
      }
    }, [activeTab, variant, tabs]);

    const handleTabClick = (tabId: string) => {
      const tab = tabs.find(t => t.id === tabId);
      if (tab && !tab.disabled) {
        setActiveTab(tabId);
        onChange?.(tabId);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
      const enabledTabs = tabs.filter(tab => !tab.disabled);
      const enabledIndexes = tabs
        .map((tab, index) => (!tab.disabled ? index : -1))
        .filter(index => index !== -1);

      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = enabledIndexes.find(i => i > currentIndex);
          newIndex = nextIndex !== undefined ? nextIndex : enabledIndexes[0];
          break;
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = [...enabledIndexes].reverse().find(i => i < currentIndex);
          newIndex = prevIndex !== undefined ? prevIndex : enabledIndexes[enabledIndexes.length - 1];
          break;
        case 'Home':
          e.preventDefault();
          newIndex = enabledIndexes[0];
          break;
        case 'End':
          e.preventDefault();
          newIndex = enabledIndexes[enabledIndexes.length - 1];
          break;
        default:
          return;
      }

      const newTab = tabs[newIndex];
      if (newTab) {
        handleTabClick(newTab.id);
        tabRefs.current.get(newTab.id)?.focus();
      }
    };

    const variants = {
      default: {
        container: 'bg-gray-100 p-1 rounded-lg',
        tab: {
          base: 'rounded-md transition-all duration-200',
          inactive: 'text-gray-600 hover:text-gray-900',
          active: 'bg-white text-gray-900 shadow-sm',
        },
      },
      pills: {
        container: 'gap-2',
        tab: {
          base: 'rounded-full border transition-all duration-200',
          inactive: 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900',
          active: 'border-blue-600 bg-blue-600 text-white',
        },
      },
      underline: {
        container: 'border-b border-gray-200',
        tab: {
          base: 'border-b-2 border-transparent transition-all duration-200 pb-3',
          inactive: 'text-gray-600 hover:text-gray-900 hover:border-gray-300',
          active: 'text-blue-600 border-blue-600',
        },
      },
    };

    const sizes = {
      sm: {
        tab: 'px-3 py-1.5 text-sm',
        icon: 'w-4 h-4',
      },
      md: {
        tab: 'px-4 py-2 text-base',
        icon: 'w-5 h-5',
      },
      lg: {
        tab: 'px-5 py-2.5 text-lg',
        icon: 'w-6 h-6',
      },
    };

    const currentVariant = variants[variant];
    const currentSize = sizes[size];

    return (
      <div ref={ref} className={className}>
        {/* Tabs Container */}
        <div
          ref={tabsRef}
          role="tablist"
          className={cn(
            'relative flex',
            currentVariant.container,
            fullWidth && 'w-full',
            tabsClassName
          )}
        >
          {/* Underline Indicator */}
          {variant === 'underline' && (
            <div
              className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
              style={indicatorStyle}
            />
          )}

          {/* Tab Buttons */}
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  // Base styles
                  'font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'flex items-center justify-center gap-2',
                  
                  // Variant styles
                  currentVariant.tab.base,
                  isActive ? currentVariant.tab.active : currentVariant.tab.inactive,
                  
                  // Size styles
                  currentSize.tab,
                  
                  // States
                  tab.disabled && 'opacity-50 cursor-not-allowed',
                  fullWidth && 'flex-1',
                  
                  // Specific variant adjustments
                  variant === 'underline' && 'rounded-none focus:ring-offset-0'
                )}
              >
                {tab.icon && (
                  <span className={cn('flex-shrink-0', currentSize.icon)}>
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        {children && (
          <div
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={activeTab}
            className={cn(
              'mt-4',
              'animate-in fade-in-0 slide-in-from-bottom-1 duration-200',
              panelClassName
            )}
          >
            {children(activeTab)}
          </div>
        )}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

// Tab Panel Component for structured content
export interface TabPanelProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  activeValue,
  children,
  className,
  keepMounted = false,
}) => {
  const isActive = value === activeValue;

  if (!isActive && !keepMounted) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      hidden={!isActive}
      className={cn(
        isActive && 'animate-in fade-in-0 slide-in-from-bottom-1 duration-200',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Tabs;
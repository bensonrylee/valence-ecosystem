import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/theme-constants';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'glass',
  padding = 'md',
  hover = false,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-gray-800 border border-gray-700',
    glass: 'glass-panel',
    bordered: 'bg-transparent border border-white/10',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverStyles = hover ? 'hover:bg-white/10 hover:border-[#00FFAD]/20 hover:shadow-lg hover:shadow-[#00FFAD]/10 cursor-pointer' : '';
  
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3 className={cn('text-xl font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-gray-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('mt-6 pt-6 border-t border-gray-700', className)} {...props}>
      {children}
    </div>
  );
};
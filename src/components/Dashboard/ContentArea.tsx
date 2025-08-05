'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentAreaProps {
    children: ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
};

const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
};

export default function ContentArea({
    children,
    className,
    maxWidth = '7xl',
    padding = 'md'
}: ContentAreaProps) {
    return (
        <div className={cn(
            'w-full mx-auto',
            maxWidthClasses[maxWidth],
            paddingClasses[padding],
            className
        )}>
            {children}
        </div>
    );
}

// Responsive grid component for dashboard content
interface ResponsiveGridProps {
    children: ReactNode;
    className?: string;
    cols?: {
        default?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
};

export function ResponsiveGrid({
    children,
    className,
    cols = { default: 1, md: 2, lg: 3 },
    gap = 'md'
}: ResponsiveGridProps) {
    const gridCols = cn(
        'grid',
        cols.default && `grid-cols-${cols.default}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
        gapClasses[gap]
    );

    return (
        <div className={cn(gridCols, className)}>
            {children}
        </div>
    );
}

// Card component for dashboard sections
interface DashboardCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    description?: string;
    action?: ReactNode;
    padding?: 'sm' | 'md' | 'lg';
}

export function DashboardCard({
    children,
    className,
    title,
    description,
    action,
    padding = 'md'
}: DashboardCardProps) {
    const paddingClass = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    }[padding];

    return (
        <div className={cn(
            'bg-card text-card-foreground rounded-lg border shadow-sm',
            paddingClass,
            className
        )}>
            {(title || description || action) && (
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                        {title && (
                            <h3 className="text-lg font-semibold leading-none tracking-tight">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="flex-shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}
import React from 'react';
import { cn } from '@/lib/utils';
type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};
export function SectionHeader({ title, description, className, children }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4', className)}>
      <div className="flex-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="mt-2 text-muted-foreground text-base">{description}</p>
        )}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
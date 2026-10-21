import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onHomeClick }) => {
  return (
    <nav className="flex items-center text-sm font-medium text-slate-500 py-2.5 overflow-x-auto whitespace-nowrap scrollbar-none">
      <button
        onClick={onHomeClick}
        className="flex items-center gap-1.5 hover:text-syllabo-900 transition-colors text-slate-600 focus:outline-none"
        title="Go to Home"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400 shrink-0" />
            {isLast || !item.onClick ? (
              <span className="text-slate-900 font-semibold truncate max-w-[240px]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="hover:text-syllabo-900 hover:underline transition-colors text-slate-600 truncate max-w-[200px] focus:outline-none"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

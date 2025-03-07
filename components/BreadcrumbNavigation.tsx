import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  onClick: () => void;
}

interface BreadcrumbNavigationProps {
  breadcrumbs: BreadcrumbItem[];
}

export function BreadcrumbNavigation({ breadcrumbs }: BreadcrumbNavigationProps) {
  return (
    <div className="absolute top-16 left-4 text-white z-10 bg-black bg-opacity-30 p-2 rounded-md max-w-[200px]">
      {breadcrumbs.map((crumb, index) => (
        <div 
          key={index} 
          className={`flex items-center ${index < breadcrumbs.length - 1 ? 'mb-1 hover:text-blue-300 cursor-pointer' : 'font-bold'}`}
          onClick={crumb.onClick}
        >
          {index > 0 && <ChevronRight size={12} className="mr-1" />}
          <span className={`${index === 0 ? 'text-blue-300' : ''} ${index === breadcrumbs.length - 1 ? 'text-yellow-300' : ''}`}>
            {crumb.name}
          </span>
        </div>
      ))}
    </div>
  );
} 
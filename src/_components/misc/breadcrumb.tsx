'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevronRight, IconHome } from '@/components/icons/icons';
import { NavPath } from '@/app_interfaces';
import AppIcon from '@/components/icons/appIcon';

interface BreadcrumbProps {
  navPaths: NavPath[];
  callback: (clickedPath: string) => void;
}

export default function Breadcrumb({ navPaths, callback }: BreadcrumbProps) {
  const pathname = usePathname();

  const findPathDefinition = (path: string): NavPath | undefined => {
    const searchPaths = (
      paths: NavPath[],
      currentPath = '',
    ): NavPath | undefined => {
      for (const item of paths) {
        const fullPath = currentPath + (item.path || '');
        if (fullPath === path) return item;

        if (item.children) {
          const found = searchPaths(item.children, fullPath);
          if (found) return found;
        }
      }
      return undefined;
    };

    return searchPaths(navPaths);
  };

  const pathSegments = pathname
    .split('/')
    .filter((segment) => segment !== '')
    .map((_, index, segments) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const pathDefinition = findPathDefinition(path);

      return {
        name: pathDefinition?.name || formatSegmentName(segments[index]),
        path: path,
        isDefined: !!pathDefinition,
      };
    });

  if (pathname !== '/') {
    pathSegments.unshift({
      name: 'Home',
      path: '/',
      isDefined: true,
    });
  }
  return (
    <nav
      className={`text-small mb-6 w-full ${pathSegments.length > 0 ? 'border-default border-border-primary py-2 rounded-default' : ''}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-row flex-wrap">
        {pathSegments.map((segment, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <IconChevronRight className="h-4 w-4 text-on-disabled" />
            )}
            {index === pathSegments.length - 1 || !segment.isDefined ? (
              <span className="ml-1 text-on-disabled" aria-current="page">
                {segment.name === 'Home' ? (
                  <AppIcon icon={IconHome} width={20} />
                ) : (
                  segment.name
                )}
              </span>
            ) : (
              <Link
                href={segment.path}
                className="ml-2 text-blue-secondary hover:text-blue-primary"
                onClick={() => callback(segment.path)}
              >
                {segment.name === 'Home' ? (
                  <AppIcon icon={IconHome} width={20} />
                ) : (
                  segment.name
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function formatSegmentName(segment: string): string {
  let formatted = segment.replace(/-/g, ' ');

  formatted = formatted
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return formatted;
}

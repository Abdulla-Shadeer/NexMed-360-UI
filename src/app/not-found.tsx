import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <h1 className="font-serif text-display">404 - Page Not Found</h1>
      <p>
        This page does not exist. return to
        <Link
          href={'/'}
          className="text-blue-secondary hover:text-blue-primary ml-1"
        >
          Home
        </Link>
      </p>
    </div>
  );
}

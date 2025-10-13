import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YourToyotaPicks - Quality Used Toyota & Honda Vehicles',
  description:
    'Automated curation of high-quality used Toyota and Honda vehicles in your area',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}

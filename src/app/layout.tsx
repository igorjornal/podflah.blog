import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PodFlah.blog · Arquibancada', template: '%s · PodFlah.blog' },
  description: 'Futebol com alma, crônica com raiva e amor.',
  openGraph: { siteName: 'PodFlah.blog', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

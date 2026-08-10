import './global.css';
import { Providers } from './providers';
import Header from '@/components/Header';

export const metadata = {
  title: 'AI Trend Explorer',
  description: 'Discover trending AI tools, agents, and ML projects from GitHub and Hugging Face',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}

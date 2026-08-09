'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Trends', icon: '🔥' },
  { href: '/search', label: 'Search', icon: '🔍' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="container">
        <div className="header__inner">
          <Link href="/" className="header__brand">
            <span className="header__logo">🤖</span>
            <div>
              <h1 className="header__title">AI Trend Explorer</h1>
              <p className="header__subtitle">
                Discover trending AI tools, agents & ML projects
              </p>
            </div>
          </Link>

          <nav className="header__nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="header__nav-button"
                  >
                    <span className="header__nav-icon">{item.icon}</span>
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

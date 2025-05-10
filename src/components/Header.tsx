"use client";

import Link from 'next/link';
import { HomeplateLogo } from '@/components/icons/HomeplateLogo';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChefHat, LucideListChecks } from 'lucide-react';


export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Recipe Finder', icon: <ChefHat size={20} /> },
    { href: '/ingredients', label: 'My Ingredients', icon: <LucideListChecks size={20} /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors">
          <HomeplateLogo className="h-8 w-8" />
          <span>Homeplate</span>
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              onClick={() => router.push(item.href)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent-foreground hover:bg-accent/80",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground/70",
                "sm:px-4 px-2 py-2 flex items-center gap-2"
              )}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}

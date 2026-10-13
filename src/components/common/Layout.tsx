import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onOpenCart?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onOpenCart }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8F6] w-full max-w-full overflow-x-hidden justify-between">
      <Header onOpenCart={onOpenCart} />
      <main className="flex-1 w-full max-w-full min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};

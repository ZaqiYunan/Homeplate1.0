
import type { ReactNode } from "react";
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
          <footer className="py-6 text-center text-sm text-muted-foreground border-t">
              Built with Fresh Ideas & AI. &copy; {new Date().getFullYear()} Homeplate.
          </footer>
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

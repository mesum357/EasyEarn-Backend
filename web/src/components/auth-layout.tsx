
"use client";

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';

export function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/auth');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow">
                {children}
            </div>
            <Footer />
        </div>
    );
}

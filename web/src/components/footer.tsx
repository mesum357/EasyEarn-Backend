
import Link from 'next/link';
import { Twitter, Facebook, Instagram } from 'lucide-react';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      <div className="container px-4 py-8 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6" />
              <span className="text-lg font-bold font-headline">Calculator1.org</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Over 3,700 free calculators in one place.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 font-headline">Categories</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-foreground">Math</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Finance</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Health</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Science</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-semibold mb-4 font-headline">About Us</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-foreground">About</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Support</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            </nav>
          </div>
           <div>
             <h4 className="font-semibold mb-4 font-headline">Follow Us</h4>
             <div className="flex items-center gap-4">
               <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
               <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
               <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
             </div>
           </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Calculator1.org. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

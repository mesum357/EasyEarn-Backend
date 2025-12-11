import {
  Sigma,
  Landmark,
  Atom,
  FlaskConical,
  Cog,
  HeartPulse,
  ArrowRightLeft,
  BarChart3,
  CodeXml,
  Construction,
  Scale,
  Car,
  Leaf,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Category = {
    id: string;
    name: string;
    icon: LucideIcon;
    href: string;
    count: number;
};

export const CATEGORIES: Category[] = [
  { id: 'math', name: 'Math', icon: Sigma, href: '/calculators/math', count: 970 },
  { id: 'finance', name: 'Finance', icon: Landmark, href: '/calculators/finance', count: 592 },
  { id: 'physics', name: 'Physics', icon: Atom, href: '/calculators/physics', count: 627 },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, href: '/calculators/chemistry', count: 101 },
  { id: 'engineering', name: 'Engineering', icon: Cog, href: '/calculators/engineering', count: 350 },
  { id: 'health', name: 'Health & Fitness', icon: HeartPulse, href: '/calculators/health', count: 431 },
  { id: 'conversion', name: 'Conversion', icon: ArrowRightLeft, href: '/calculators/conversion', count: 311 },
  { id: 'construction', name: 'Construction', icon: Construction, href: '/calculators/construction', count: 153 },
  { id: 'everyday', name: 'Everyday Life', icon: Scale, href: '/calculators/everyday', count: 267 },
  { id: 'cs', name: 'Computer Science', icon: CodeXml, href: '/calculators/cs', count: 98 },
  { id: 'statistics', name: 'Statistics', icon: BarChart3, href: '/calculators/statistics', count: 120 },
  { id: 'automotive', name: 'Automotive', icon: Car, href: '/calculators/automotive', count: 88 },
  { id: 'biology', name: 'Biology', icon: Leaf, href: '/calculators/biology', count: 10 },
  { id: 'ecology', name: 'Ecology', icon: Leaf, href: '/calculators/ecology', count: 4 },
];

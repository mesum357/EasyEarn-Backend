import {
  Car,
  Shirt,
  Home,
  Briefcase,
  Gamepad2,
  Sparkles,
  Clock,
  BookOpen,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const EVERYDAY_CALCULATORS_DATA = {
    "title": "Everyday Life Calculators",
    "count": 9,
    "description": "Comprehensive collection of everyday life calculators covering transportation, clothing, home economics, office productivity, leisure, personal hygiene, time management, reading, and more. From 0-60 acceleration to battery charge time, our everyday life calculators help you with daily tasks and decisions.",
    "subcategories": [
        {
            "title": "Transportation calculators",
            "icon": Car,
            "calculators": [
                { "name": "0-60 Calculator", "href": "/calculators/everyday/0-60-calculator" },
            ]
        },
        {
            "title": "Clothing and sewing calculators",
            "icon": Shirt,
            "calculators": [
                { "name": "Bag Calculator", "href": "/calculators/everyday/bag-calculator" },
            ]
        },
        {
            "title": "Home economics calculators",
            "icon": Home,
            "calculators": [
                { "name": "Appliance Depreciation Calculator", "href": "/calculators/everyday/appliance-depreciation-calculator" },
            ]
        },
        {
            "title": "Office, school, and productivity calculators",
            "icon": Briefcase,
            "calculators": [
                { "name": "Acceptance Rate Calculator", "href": "/calculators/everyday/acceptance-rate-calculator" },
            ]
        },
        {
            "title": "Leisure and fun calculators",
            "icon": Gamepad2,
            "calculators": [
                { "name": "Audiobooks Calculator - Reclaim the Dead Time", "href": "/calculators/everyday/audiobooks-calculator" },
            ]
        },
        {
            "title": "Personal hygiene calculators",
            "icon": Sparkles,
            "calculators": [
                { "name": "Bath vs Shower Calculator", "href": "/calculators/everyday/bath-vs-shower-calculator" },
            ]
        },
        {
            "title": "Time and date calculators",
            "icon": Clock,
            "calculators": [
                { "name": "8-Hour Shift Calculator", "href": "/calculators/everyday/8-hour-shift-calculator" },
            ]
        },
        {
            "title": "Books and reading calculators",
            "icon": BookOpen,
            "calculators": [
                { "name": "Audiobook Speed Calculator", "href": "/calculators/everyday/audiobook-speed-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "Battery Charge Time Calculator", "href": "/calculators/everyday/battery-charge-time-calculator" },
            ]
        },
    ]
}


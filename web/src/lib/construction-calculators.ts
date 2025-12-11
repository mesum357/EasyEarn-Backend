import {
  ArrowRightLeft,
  Package,
  Droplet,
  Home,
  Car,
  Ruler,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CONSTRUCTION_CALCULATORS_DATA = {
    "title": "Construction Calculators",
    "count": 9,
    "description": "Comprehensive collection of construction calculators covering converters, materials, cement, concrete, home and garden, roofing, driveways, water tanks, and structural calculations. From board foot calculations to beam deflection, our construction calculators help you plan and execute construction projects with precision.",
    "subcategories": [
        {
            "title": "Construction converters",
            "icon": ArrowRightLeft,
            "calculators": [
                { "name": "Board Foot Calculator", "href": "/calculators/construction/board-foot-calculator" },
            ]
        },
        {
            "title": "Construction materials calculators",
            "icon": Package,
            "calculators": [
                { "name": "Aluminum Weight Calculator", "href": "/calculators/construction/aluminum-weight-calculator" },
            ]
        },
        {
            "title": "Cement and concrete calculators",
            "icon": Droplet,
            "calculators": [
                { "name": "Cement Calculator", "href": "/calculators/construction/cement-calculator" },
            ]
        },
        {
            "title": "Home and garden calculators",
            "icon": Home,
            "calculators": [
                { "name": "AC Tonnage Calculator", "href": "/calculators/construction/ac-tonnage-calculator" },
            ]
        },
        {
            "title": "Roofing calculators",
            "icon": Home,
            "calculators": [
                { "name": "Birdsmouth Cut Calculator", "href": "/calculators/construction/birdsmouth-cut-calculator" },
            ]
        },
        {
            "title": "Driveway calculators",
            "icon": Car,
            "calculators": [
                { "name": "Asphalt Calculator", "href": "/calculators/construction/asphalt-calculator" },
            ]
        },
        {
            "title": "Water tank and vessels calculators",
            "icon": Droplet,
            "calculators": [
                { "name": "Fire Flow Calculator", "href": "/calculators/construction/fire-flow-calculator" },
            ]
        },
        {
            "title": "Materials specifications calculators",
            "icon": Ruler,
            "calculators": [
                { "name": "Beam Deflection Calculator", "href": "/calculators/construction/beam-deflection-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "Angle Cut Calculator", "href": "/calculators/construction/angle-cut-calculator" },
            ]
        },
    ]
}


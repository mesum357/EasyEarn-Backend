import {
  Footprints,
  Zap,
  Leaf,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ECOLOGY_CALCULATORS_DATA = {
    "title": "Ecology Calculators",
    "count": 4,
    "description": "Comprehensive collection of ecology calculators covering eco footprint, renewable energy, sustainable living, and environmental capacity. From bag footprint to carrying capacity, our ecology calculators help you understand and reduce your environmental impact.",
    "subcategories": [
        {
            "title": "Eco footprint calculators",
            "icon": Footprints,
            "calculators": [
                { "name": "Bag Footprint Calculator", "href": "/calculators/ecology/bag-footprint-calculator" },
            ]
        },
        {
            "title": "Renewable energy calculators",
            "icon": Zap,
            "calculators": [
                { "name": "Hydroelectric Power Calculator", "href": "/calculators/ecology/hydroelectric-power-calculator" },
            ]
        },
        {
            "title": "Sustainable living calculators",
            "icon": Leaf,
            "calculators": [
                { "name": "Books vs e-Books Calculator", "href": "/calculators/ecology/books-vs-ebooks-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "Carrying Capacity Calculator", "href": "/calculators/ecology/carrying-capacity-calculator" },
            ]
        },
    ]
}


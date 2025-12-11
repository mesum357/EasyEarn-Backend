import {
  Atom,
  FlaskConical,
  Droplet,
  Zap,
  Thermometer,
  Battery,
  Beaker,
  Dna,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CHEMISTRY_CALCULATORS_DATA = {
    "title": "Chemistry Calculators",
    "count": 10,
    "description": "Comprehensive collection of chemistry calculators covering general chemistry, stoichiometry, mixtures, chemical reactions, thermodynamics, electrochemistry, physical chemistry, organic chemistry, and biochemistry. From atom calculations to Beer-Lambert law, our chemistry calculators help you solve chemical problems with precision.",
    "subcategories": [
        {
            "title": "General chemistry calculators",
            "icon": Atom,
            "calculators": [
                { "name": "Atom Calculator", "href": "/calculators/chemistry/atom-calculator" },
            ]
        },
        {
            "title": "Stoichiometry calculators",
            "icon": FlaskConical,
            "calculators": [
                { "name": "AFR Calculator (Air-Fuel Ratio)", "href": "/calculators/chemistry/afr-calculator" },
            ]
        },
        {
            "title": "Mixtures and solutions calculators",
            "icon": Droplet,
            "calculators": [
                { "name": "Activity Coefficient Calculator", "href": "/calculators/chemistry/activity-coefficient-calculator" },
            ]
        },
        {
            "title": "Chemical reactions calculators",
            "icon": Zap,
            "calculators": [
                { "name": "Activation Energy Calculator", "href": "/calculators/chemistry/activation-energy-calculator" },
            ]
        },
        {
            "title": "Chemical thermodynamics calculators",
            "icon": Thermometer,
            "calculators": [
                { "name": "Boiling Point Calculator", "href": "/calculators/chemistry/boiling-point-calculator" },
            ]
        },
        {
            "title": "Electrochemistry calculators",
            "icon": Battery,
            "calculators": [
                { "name": "Cell EMF Calculator – Electromotive Force of a Cell", "href": "/calculators/chemistry/cell-emf-calculator" },
            ]
        },
        {
            "title": "Physical chemistry calculators",
            "icon": Beaker,
            "calculators": [
                { "name": "Diffusion Coefficient Calculator", "href": "/calculators/chemistry/diffusion-coefficient-calculator" },
            ]
        },
        {
            "title": "Organic chemistry calculators",
            "icon": FlaskConical,
            "calculators": [
                { "name": "Chemical Oxygen Demand Calculator", "href": "/calculators/chemistry/chemical-oxygen-demand-calculator" },
            ]
        },
        {
            "title": "Biochemistry calculators",
            "icon": Dna,
            "calculators": [
                { "name": "Calibration Curve Calculator", "href": "/calculators/chemistry/calibration-curve-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "Beer-Lambert Law Calculator", "href": "/calculators/chemistry/beer-lambert-law-calculator" },
            ]
        },
    ]
}


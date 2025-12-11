import {
  FlaskConical,
  Dna,
  Heart,
  Dog,
  Cat,
  Bird,
  Package,
  Sprout,
  TreePine,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const BIOLOGY_CALCULATORS_DATA = {
    "title": "Biology Calculators",
    "count": 10,
    "description": "Comprehensive collection of biology calculators covering genetics, animal care, agriculture, forestry, and laboratory calculations. From DNA analysis to animal health, our biology calculators help you solve biological problems with precision.",
    "subcategories": [
        {
            "title": "Bio laboratory calculators",
            "icon": FlaskConical,
            "calculators": [
                { "name": "Annealing Temperature Calculator", "href": "/calculators/biology/annealing-temperature-calculator" },
            ]
        },
        {
            "title": "Genetics calculators",
            "icon": Dna,
            "calculators": [
                { "name": "Allele Frequency Calculator", "href": "/calculators/biology/allele-frequency-calculator" },
            ]
        },
        {
            "title": "Animal pregnancy calculators",
            "icon": Heart,
            "calculators": [
                { "name": "Cat Pregnancy Calculator", "href": "/calculators/biology/cat-pregnancy-calculator" },
            ]
        },
        {
            "title": "Dog calculators",
            "icon": Dog,
            "calculators": [
                { "name": "Benadryl Dosage Calculator for Dogs", "href": "/calculators/biology/benadryl-dosage-calculator-dogs" },
            ]
        },
        {
            "title": "Cat calculators",
            "icon": Cat,
            "calculators": [
                { "name": "Cat Age Calculator", "href": "/calculators/biology/cat-age-calculator" },
            ]
        },
        {
            "title": "Other animals calculators",
            "icon": Bird,
            "calculators": [
                { "name": "Bird Age Calculator", "href": "/calculators/biology/bird-age-calculator" },
            ]
        },
        {
            "title": "Livestock calculators",
            "icon": Package,
            "calculators": [
                { "name": "Animal Mortality Rate Calculator", "href": "/calculators/biology/animal-mortality-rate-calculator" },
            ]
        },
        {
            "title": "Gardening and crops calculators",
            "icon": Sprout,
            "calculators": [
                { "name": "Acres Per Hour Calculator", "href": "/calculators/biology/acres-per-hour-calculator" },
            ]
        },
        {
            "title": "Trees & Forestry Calculators",
            "icon": TreePine,
            "calculators": [
                { "name": "Basal Area Calculator", "href": "/calculators/biology/basal-area-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "MLVSS Calculator", "href": "/calculators/biology/mlvss-calculator" },
            ]
        },
    ]
}


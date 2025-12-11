import {
  Ruler,
  Package,
  Gauge,
  Globe,
  Hash,
  Binary,
  Cpu,
  Clock,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CONVERSION_CALCULATORS_DATA = {
    "title": "Conversion Calculators",
    "count": 9,
    "description": "Comprehensive collection of conversion calculators covering length, area, volume, weight, force, pressure, torque, coordinates, numbers, numeral systems, tech, electronics, time, and angles. From acreage to binary conversion, our conversion calculators help you convert between different units and systems with precision.",
    "subcategories": [
        {
            "title": "Length and area converters",
            "icon": Ruler,
            "calculators": [
                { "name": "Acreage Calculator", "href": "/calculators/conversion/acreage-calculator" },
            ]
        },
        {
            "title": "Volume and weight converters",
            "icon": Package,
            "calculators": [
                { "name": "CCF to Gallons Conversion", "href": "/calculators/conversion/ccf-to-gallons-conversion" },
            ]
        },
        {
            "title": "Force, pressure, and torque converters",
            "icon": Gauge,
            "calculators": [
                { "name": "Force Converter", "href": "/calculators/conversion/force-converter" },
            ]
        },
        {
            "title": "Earth measurements converters",
            "icon": Globe,
            "calculators": [
                { "name": "Coordinates Converter", "href": "/calculators/conversion/coordinates-converter" },
            ]
        },
        {
            "title": "Number converters",
            "icon": Hash,
            "calculators": [
                { "name": "Billion to Trillion Converter", "href": "/calculators/conversion/billion-to-trillion-converter" },
            ]
        },
        {
            "title": "Numeral systems converters",
            "icon": Binary,
            "calculators": [
                { "name": "Binary Converter", "href": "/calculators/conversion/binary-converter" },
            ]
        },
        {
            "title": "Tech and electronics converters",
            "icon": Cpu,
            "calculators": [
                { "name": "Byte Conversion Calculator", "href": "/calculators/conversion/byte-conversion-calculator" },
            ]
        },
        {
            "title": "Time converters",
            "icon": Clock,
            "calculators": [
                { "name": "Military Time Converter", "href": "/calculators/conversion/military-time-converter" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "Angle Conversion Calculator", "href": "/calculators/conversion/angle-conversion-calculator" },
            ]
        },
    ]
}


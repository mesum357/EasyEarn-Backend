"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CoordinatesConverter() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [format, setFormat] = useState("decimal");
  const [result, setResult] = useState<{
    decimal: string;
    dms: string;
  } | null>(null);

  const decimalToDMS = (decimal: number, isLat: boolean): string => {
    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutesFloat = (abs - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;
    const direction = isLat 
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');
    return `${degrees}° ${minutes}' ${seconds.toFixed(2)}" ${direction}`;
  };

  const calculate = () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const decimal = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      const dms = `${decimalToDMS(lat, true)}, ${decimalToDMS(lon, false)}`;
      setResult({
        decimal: decimal,
        dms: dms,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Coordinates Converter</CardTitle>
        <CardDescription>
          Convert between decimal degrees and degrees-minutes-seconds (DMS) format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="latitude">Latitude (decimal degrees)</Label>
            <Input
              id="latitude"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Enter latitude (-90 to 90)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude (decimal degrees)</Label>
            <Input
              id="longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Enter longitude (-180 to 180)"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Convert
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div>
                <span className="font-semibold">Decimal Degrees:</span>
                <p className="mt-1">{result.decimal}</p>
              </div>
              <div>
                <span className="font-semibold">Degrees-Minutes-Seconds:</span>
                <p className="mt-1">{result.dms}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


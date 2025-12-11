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

export function BirdsmouthCutCalculator() {
  const [rafterWidth, setRafterWidth] = useState("");
  const [seatCut, setSeatCut] = useState("");
  const [result, setResult] = useState<{
    plumbCut: number;
    seatCutAngle: number;
  } | null>(null);

  const calculate = () => {
    const width = parseFloat(rafterWidth);
    const seat = parseFloat(seatCut);
    
    if (width > 0 && seat > 0 && seat < width) {
      // Birdsmouth: plumb cut depth = rafter width - seat cut
      const plumbCut = width - seat;
      // Angle calculation: tan(angle) = plumb cut / seat cut
      const angle = Math.atan(plumbCut / seat) * (180 / Math.PI);
      setResult({
        plumbCut: plumbCut,
        seatCutAngle: angle,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Birdsmouth Cut Calculator</CardTitle>
        <CardDescription>
          Calculate birdsmouth cut dimensions for roof rafters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="rafterWidth">Rafter Width (inches)</Label>
            <Input
              id="rafterWidth"
              type="number"
              value={rafterWidth}
              onChange={(e) => setRafterWidth(e.target.value)}
              placeholder="Enter rafter width"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="seatCut">Seat Cut Depth (inches)</Label>
            <Input
              id="seatCut"
              type="number"
              value={seatCut}
              onChange={(e) => setSeatCut(e.target.value)}
              placeholder="Enter seat cut depth"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Plumb Cut Depth:</span>
                <span className="font-bold">{result.plumbCut.toFixed(2)} inches</span>
              </div>
              <div className="flex justify-between">
                <span>Seat Cut Angle:</span>
                <span className="font-bold">{result.seatCutAngle.toFixed(2)}°</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


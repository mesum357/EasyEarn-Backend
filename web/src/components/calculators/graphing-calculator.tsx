"use client";

import { useState, useEffect } from "react";
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

export function GraphingCalculator() {
  const [functionInput, setFunctionInput] = useState("x");
  const [xMin, setXMin] = useState("-10");
  const [xMax, setXMax] = useState("10");
  const [yMin, setYMin] = useState("-10");
  const [yMax, setYMax] = useState("10");

  useEffect(() => {
    console.log('[GraphingCalculator] Component rendered');
  }, []);

  const handleGraph = () => {
    // This would integrate with a graphing library in a real implementation
    alert(`Graphing function: ${functionInput} from x=${xMin} to ${xMax}`);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Graphing Calculator</CardTitle>
        <CardDescription>
          Graph mathematical functions and visualize data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="function">Function (e.g., x^2, sin(x), x+1)</Label>
            <Input
              id="function"
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              placeholder="Enter function"
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="xMin">X Min</Label>
              <Input
                id="xMin"
                type="number"
                value={xMin}
                onChange={(e) => setXMin(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="xMax">X Max</Label>
              <Input
                id="xMax"
                type="number"
                value={xMax}
                onChange={(e) => setXMax(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="yMin">Y Min</Label>
              <Input
                id="yMin"
                type="number"
                value={yMin}
                onChange={(e) => setYMin(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="yMax">Y Max</Label>
              <Input
                id="yMax"
                type="number"
                value={yMax}
                onChange={(e) => setYMax(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
            <p className="text-muted-foreground">Graph visualization area</p>
            <p className="text-sm text-muted-foreground mt-2">
              Function: {functionInput}
            </p>
          </div>
          <Button onClick={handleGraph} className="w-full">
            Graph Function
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


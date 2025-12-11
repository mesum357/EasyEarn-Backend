"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

export function AveragePercentageCalculator() {
  const [values, setValues] = useState<string[]>([""]);
  const [average, setAverage] = useState<number | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    setAverage(null);
  };

  const addInput = () => {
    setValues([...values, ""]);
  };

  const removeInput = (index: number) => {
    if (values.length > 1) {
      const newValues = values.filter((_, i) => i !== index);
      setValues(newValues);
    }
  };

  const calculateAverage = () => {
    const numericValues = values
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    if (numericValues.length > 0) {
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const avg = sum / numericValues.length;
      setAverage(avg);
    } else {
      setAverage(null);
    }
  };
  
  const clearAll = () => {
    setValues([""]);
    setAverage(null);
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Average Percentage Calculator</CardTitle>
        <CardDescription>
          Enter a list of percentage values to calculate the average.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Percentage Values</Label>
          <div className="space-y-2">
            {values.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={`Value ${index + 1} (%)`}
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="flex-grow"
                />
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInput(index)}
                    disabled={values.length <= 1}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
              </div>
            ))}
          </div>
           <Button variant="outline" size="sm" onClick={addInput}>
            <Plus className="h-4 w-4 mr-2" />
            Add another value
          </Button>
        </div>

        {average !== null && (
           <div className="mt-6 bg-muted p-4 rounded-lg">
             <h3 className="text-lg font-semibold text-center">Result</h3>
             <p className="text-3xl font-bold text-center mt-2 text-primary">
               {average.toFixed(2)}%
             </p>
             <p className="text-sm text-muted-foreground text-center mt-1">Average Percentage</p>
           </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={clearAll}>Clear</Button>
        <Button onClick={calculateAverage}>Calculate Average</Button>
      </CardFooter>
    </Card>
  );
}

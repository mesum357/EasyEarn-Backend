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

// Carbon footprint values (kg CO2)
const BOOK_FOOTPRINT = 4.0; // kg CO2 per physical book
const EBOOK_FOOTPRINT = 0.168; // kg CO2 per e-book (including device manufacturing amortized)
const EREADER_FOOTPRINT = 168; // kg CO2 per e-reader device

export function BooksVsEbooksCalculator() {
  const [numBooks, setNumBooks] = useState("");
  const [result, setResult] = useState<{
    physicalBooks: number;
    ebooks: number;
    difference: number;
    breakEven: number;
  } | null>(null);

  const calculate = () => {
    const books = parseFloat(numBooks);
    
    if (books > 0) {
      const physicalFootprint = books * BOOK_FOOTPRINT;
      const ebookFootprint = (books * EBOOK_FOOTPRINT) + EREADER_FOOTPRINT;
      const difference = physicalFootprint - ebookFootprint;
      // Break-even point: when ebook footprint equals physical books footprint
      // (n × EBOOK_FOOTPRINT) + EREADER_FOOTPRINT = n × BOOK_FOOTPRINT
      // n × (BOOK_FOOTPRINT - EBOOK_FOOTPRINT) = EREADER_FOOTPRINT
      const breakEven = EREADER_FOOTPRINT / (BOOK_FOOTPRINT - EBOOK_FOOTPRINT);
      
      setResult({
        physicalBooks: physicalFootprint,
        ebooks: ebookFootprint,
        difference: difference,
        breakEven: breakEven,
      });
    } else {
      setResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Books vs e-Books Calculator</CardTitle>
        <CardDescription>
          Compare the environmental impact of physical books versus e-books.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="numBooks">Number of Books</Label>
            <Input
              id="numBooks"
              type="number"
              value={numBooks}
              onChange={(e) => setNumBooks(e.target.value)}
              placeholder="Enter number of books"
              className="mt-2"
            />
          </div>
          <Button onClick={calculate} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Physical Books Footprint:</span>
                <span className="font-bold">{result.physicalBooks.toFixed(2)} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span>E-Books Footprint:</span>
                <span className="font-bold">{result.ebooks.toFixed(2)} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span>Difference:</span>
                <span className={`font-bold ${result.difference > 0 ? "text-green-600" : "text-red-600"}`}>
                  {result.difference > 0 ? "-" : "+"}{Math.abs(result.difference).toFixed(2)} kg CO₂
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Break-even point: {result.breakEven.toFixed(0)} books (e-books become more eco-friendly after this)
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


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

export function AlleleFrequencyCalculator() {
  const [homozygousDominant, setHomozygousDominant] = useState("");
  const [heterozygous, setHeterozygous] = useState("");
  const [homozygousRecessive, setHomozygousRecessive] = useState("");
  const [result, setResult] = useState<{ p: number; q: number } | null>(null);

  const calculateFrequency = () => {
    const AA = parseFloat(homozygousDominant);
    const Aa = parseFloat(heterozygous);
    const aa = parseFloat(homozygousRecessive);
    const total = AA + Aa + aa;

    if (total > 0 && !isNaN(AA) && !isNaN(Aa) && !isNaN(aa)) {
      // p = frequency of dominant allele A
      // q = frequency of recessive allele a
      const p = (2 * AA + Aa) / (2 * total);
      const q = (2 * aa + Aa) / (2 * total);
      setResult({ p, q });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Allele Frequency Calculator</CardTitle>
        <CardDescription>
          Calculate allele frequencies from genotype counts using Hardy-Weinberg principles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="aa">Homozygous Dominant (AA) Count</Label>
            <Input
              id="aa"
              type="number"
              value={homozygousDominant}
              onChange={(e) => setHomozygousDominant(e.target.value)}
              placeholder="25"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="aa2">Heterozygous (Aa) Count</Label>
            <Input
              id="aa2"
              type="number"
              value={heterozygous}
              onChange={(e) => setHeterozygous(e.target.value)}
              placeholder="50"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="aa3">Homozygous Recessive (aa) Count</Label>
            <Input
              id="aa3"
              type="number"
              value={homozygousRecessive}
              onChange={(e) => setHomozygousRecessive(e.target.value)}
              placeholder="25"
              className="mt-2"
            />
          </div>
          <Button onClick={calculateFrequency} className="w-full">
            Calculate
          </Button>
          {result && (
            <div className="mt-6 bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Frequency of A (p):</span>
                <span className="font-bold">{(result.p * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Frequency of a (q):</span>
                <span className="font-bold">{(result.q * 100).toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




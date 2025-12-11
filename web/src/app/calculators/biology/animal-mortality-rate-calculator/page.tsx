"use client";

import { AnimalMortalityRateCalculator } from "@/components/calculators/animal-mortality-rate-calculator";
import { CalculatorInfo } from "@/components/calculator-info";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AnimalMortalityRateCalculatorPage() {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast({
        title: "Added to favorites!",
        description: "You can find it in your profile.",
      });
    } else {
      toast({
        title: "Removed from favorites.",
      });
    }
  };

  return (
    <div className="container py-12">
      <div className="relative flex items-center justify-between mb-8 bg-card p-4 rounded-lg shadow-sm">
        <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Animal Mortality Rate Calculator</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleLike} className="absolute right-4 top-1/2 -translate-y-1/2">
              <Heart className={cn("h-6 w-6", isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
              <span className="sr-only">Favorite</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign up to save your favorites!</AlertDialogTitle>
              <AlertDialogDescription>
                To like and save this calculator to your profile, you need to be logged in. Create an account to get started.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild><Link href="/auth">Sign Up</Link></AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex justify-center mb-8">
        <AnimalMortalityRateCalculator />
      </div>
      <CalculatorInfo />
    </div>
  );
}





"use client";

import {
  Users,
  Star,
  Vote,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  DollarSign,
  Smartphone,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

const relatedCalculators = [
    {
        name: "Percentage Calculator",
        description: "Calculate the percentage of a number.",
        href: "#",
    },
    {
        name: "Percentage Change Calculator",
        description: "Find the percentage change between two values.",
        href: "#",
    },
    {
        name: "Percentage Increase Calculator",
        description: "Calculate the result of a percentage increase.",
        href: "#",
    },
    {
        name: "Fraction to Percent Calculator",
        description: "Convert fractions to percentages easily.",
        href: "#",
    },
];

export function CalculatorInfo() {
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(0);
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
  }


  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant={isLiked ? "default" : "outline"} onClick={handleLike}>
                        <Heart className="w-4 h-4 mr-2" />
                        {isLiked ? "Liked" : "Like"}
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
            <Button asChild variant="outline">
                <Link href="/get-app">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Get App
                </Link>
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button asChild variant="outline">
                <Link href="/donate">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Donate
                </Link>
            </Button>
          </div>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="how-to-use">How to use</TabsTrigger>
              <TabsTrigger value="rate">Rate</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="pt-4 text-sm text-muted-foreground prose dark:prose-invert max-w-none">
                <p>The Average Percentage Calculator is a tool designed to find the average of a set of percentage values. It's particularly useful in scenarios where you need to aggregate multiple percentages into a single, representative average, such as calculating average grades, survey results, or financial returns.</p>
                <p>The unique proposition of this calculator is its simplicity and clarity. It allows users to dynamically add or remove input fields, making it flexible for various data set sizes. The result is displayed clearly, providing an immediate and understandable output without complex configurations.</p>
            </TabsContent>
            <TabsContent value="how-to-use" className="pt-4 text-sm text-muted-foreground prose dark:prose-invert max-w-none">
                <ol className="list-decimal pl-5">
                    <li><b>Enter Percentage Values:</b> Start by entering your percentage values into the input fields. The initial field is ready for your first value.</li>
                    <li><b>Add More Fields:</b> If you have more than one percentage to average, click the "Add another value" button to create additional input fields.</li>
                    <li><b>Remove Fields:</b> To remove an input field, click the 'X' button next to it. You can remove any field except the last one.</li>
                    <li><b>Calculate:</b> Once all your percentage values are entered, click the "Calculate Average" button.</li>
                    <li><b>View Result:</b> The calculated average will be displayed clearly in the result section below the inputs.</li>
                    <li><b>Start Over:</b> To perform a new calculation, click the "Clear" button to reset all input fields and the result.</li>
                </ol>
            </TabsContent>
            <TabsContent value="rate" className="pt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">How would you rate this calculator?</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <Textarea placeholder="Leave a comment... (optional)" />
                <Button>Submit Feedback</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Calculators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedCalculators.map(calc => (
              <Card key={calc.name}>
                  <CardHeader>
                      <CardTitle className="text-lg">{calc.name}</CardTitle>
                      <CardDescription>{calc.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                      <Button asChild variant="secondary" className="w-full">
                          <Link href={calc.href}>
                              Launch
                              <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                      </Button>
                  </CardFooter>
              </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

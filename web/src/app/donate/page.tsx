
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart, DollarSign, Gift, Coffee, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DonatePage() {
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="relative mb-8 text-center">
                <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Donate</h1>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-headline">Support Calculator1.org</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground pt-2">
                        Your contributions help us keep this platform free and constantly improving.
                        Every bit helps!
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 md:px-10">
                    <RadioGroup defaultValue="10" className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                        <Label htmlFor="d5" className="relative flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="5" id="d5" className="sr-only" />
                            <DollarSign className="h-8 w-8 mb-2" />
                            <span className="text-2xl font-bold">$5</span>
                            <span className="text-sm text-muted-foreground">Buy us a coffee</span>
                        </Label>
                         <Label htmlFor="d10" className="relative flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="10" id="d10" className="sr-only" />
                            <Gift className="h-8 w-8 mb-2" />
                            <span className="text-2xl font-bold">$10</span>
                            <span className="text-sm text-muted-foreground">Help us grow</span>
                        </Label>
                         <Label htmlFor="d15" className="relative flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="15" id="d15" className="sr-only" />
                            <Coffee className="h-8 w-8 mb-2" />
                             <span className="text-2xl font-bold">$15</span>
                             <span className="text-sm text-muted-foreground">A generous tip</span>
                        </Label>
                    </RadioGroup>
                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full text-lg h-12">
                        <Heart className="mr-2 h-5 w-5"/>
                        Donate Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

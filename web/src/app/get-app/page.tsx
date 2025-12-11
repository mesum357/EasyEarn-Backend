
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 384 512" fill="currentColor" height="1em" width="1em" {...props}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C39.2 141.1 0 183.2 0 241.2c0 70.7 59.4 124.3 123.7 124.3 25.2 0 49-17.5 64.9-17.5 16.5 0 40.7 17.5 68.1 17.5 24.3 0 57.6-10.9 78.4-31.5-22.1-17.5-40.7-49-40.7-82.3zM250.2 92.5C275.9 67.8 293.5 39.2 293.5 0 231.8 1.1 176.2 32.7 150.8 58.3c-27.1 27.1-51.4 69.4-51.4 117.3 64.9-1.1 112.5-49.4 112.5-83.1z" />
    </svg>
);
  
const AndroidIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" {...props}>
      <path d="M17.32 5H6.68a.33.33 0 00-.32.32.33.33 0 00.32.32h10.64a.33.33 0 00.32-.32.33.33 0 00-.32-.32zm-2.45-1.92L14.12 2a.32.32 0 00-.45 0l-.75 1.08a9.46 9.46 0 00-4.14 0L7.02 2a.32.32 0 00-.45 0l-.75 1.08A7.77 7.77 0 003 8.76v8.48a3.36 3.36 0 003.34 3.34h11.32A3.36 3.36 0 0021 17.24V8.76a7.77 7.77 0 00-2.87-5.68zM7.85 17.3a.85.85 0 11.85-.85.85.85 0 01-.85.85zm8.3 0a.85.85 0 11.85-.85.85.85 0 01-.85.85zM18 13H6a.32.32 0 01-.32-.32c0-.18.14-.32.32-.32h12a.32.32 0 01.32.32c0 .18-.14.32-.32.32z" />
    </svg>
);

const features = [
    "Access all 3,700+ calculators offline",
    "Save your favorite calculators for quick access",
    "Sync your calculation history across devices",
    "Enjoy an ad-free experience",
    "Get new features and calculators first",
];

export default function GetAppPage() {
    const router = useRouter();

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="relative mb-8">
                    <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline text-center">Get the Mobile App</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl font-headline">Calculator1.org on the Go</CardTitle>
                                <CardDescription>
                                    Get the full power of Calculator1.org in your pocket. Download the app for the best mobile experience.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 my-6">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button size="lg" className="h-12 text-lg w-full">
                                        <AppleIcon className="w-6 h-6 mr-2" />
                                        App Store
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-12 text-lg w-full">
                                        <AndroidIcon className="w-6 h-6 mr-2" />
                                        Google Play
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="order-1 md:order-2 flex justify-center">
                        <Image
                            src="https://picsum.photos/seed/app/400/600"
                            alt="Calculator1.org App Screenshot"
                            width={300}
                            height={525}
                            className="rounded-2xl shadow-2xl"
                            data-ai-hint="mobile app screenshot"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

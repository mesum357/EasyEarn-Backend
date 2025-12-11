
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function AuthPage() {
    const router = useRouter();

    // The login/signup logic will be handled by a backend or a service like Firebase Auth.
    // For now, we just redirect to the profile page on button click.
    const handleAuthAction = () => {
        router.push('/profile');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
             <div className="w-full max-w-md mx-auto p-4">
                 <div className="flex justify-center mb-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-8 w-8" />
                        <span className="text-2xl font-bold font-headline text-foreground">
                            Calculator1.org
                        </span>
                    </Link>
                </div>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Welcome Back!</CardTitle>
                                <CardDescription>Enter your credentials to access your account.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-login">Email</Label>
                                    <Input id="email-login" type="email" placeholder="m@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-login">Password</Label>
                                    <Input id="password-login" type="password" required />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button className="w-full" onClick={handleAuthAction}>Login</Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Don&apos;t have an account?{' '}
                                    <button onClick={() => {
                                        const trigger = document.querySelector('button[data-state="inactive"][role="tab"][value="signup"]') as HTMLButtonElement | null;
                                        trigger?.click();
                                    }} className="underline">Sign up</button>
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="signup">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create an Account</CardTitle>
                                <CardDescription>Join us to save your favorite calculators and more.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name-signup">Name</Label>
                                    <Input id="name-signup" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input id="email-signup" type="email" placeholder="m@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-signup">Password</Label>
                                    <Input id="password-signup" type="password" required />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button className="w-full" onClick={handleAuthAction}>Sign Up</Button>
                                 <p className="text-xs text-center text-muted-foreground">
                                    Already have an account?{' '}
                                    <button onClick={() => {
                                        const trigger = document.querySelector('button[data-state="inactive"][role="tab"][value="login"]') as HTMLButtonElement | null;
                                        trigger?.click();
                                    }} className="underline">Login</button>
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

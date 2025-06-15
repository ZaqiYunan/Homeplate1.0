
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Chrome } from 'lucide-react';
import { HomeplateLogo } from '@/components/icons/HomeplateLogo';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful', description: "Welcome back!" });
      router.push('/');
    } catch (error: any) {
      console.error("Email login error:", error);
      let description = error.message || 'Please check your credentials and try again.';
      if (error.code === 'auth/configuration-not-found') {
        description = 'Firebase auth configuration not found. Please ensure Email/Password sign-in is enabled in your Firebase project console (Authentication > Sign-in method).';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/api-key-not-valid') {
        description = 'Invalid Firebase API Key. Please check your .env.local file and Firebase project settings.';
      }
      toast({
        title: 'Login Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Login Successful', description: 'Welcome!' });
      router.push('/');
    } catch (error: any) {
      console.error("Google login error:", error);
       let description = error.message || 'Could not sign in with Google. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        description = 'Google Sign-In was cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = 'An account already exists with this email address using a different sign-in method.';
      } else if (error.code === 'auth/api-key-not-valid') {
        description = 'Invalid Firebase API Key. Please check your .env.local file and Firebase project settings.';
      } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
         description = 'Google Sign-In is not enabled for this project. Please enable it in your Firebase project console (Authentication > Sign-in method > Google).';
      }
      toast({
        title: 'Google Login Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
            <HomeplateLogo className="h-16 w-16 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
        <CardDescription>Log in to access your Homeplate account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-card"
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-card"
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={isLoading || isGoogleLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
            Log In with Email
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full text-lg py-3" 
          onClick={handleGoogleLogin} 
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Chrome className="mr-2 h-5 w-5 text-[#DB4437]" />}
          Sign in with Google
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

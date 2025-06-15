
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Chrome } from 'lucide-react';
import { HomeplateLogo } from '@/components/icons/HomeplateLogo';
import { Separator } from '@/components/ui/separator';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: 'Signup Successful', description: 'Welcome to Homeplate!' });
      router.push('/');
    } catch (error: any) {
      console.error("Email signup error:", error);
      let description = error.message || 'Please try again.';
      if (error.code === 'auth/configuration-not-found') {
        description = 'Firebase auth configuration not found. Please ensure Email/Password sign-in is enabled in your Firebase project console (Authentication > Sign-in method).';
      } else if (error.code === 'auth/api-key-not-valid') {
        description = 'Invalid Firebase API Key. Please check your .env.local file and Firebase project settings.';
      } else if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. Try logging in or using a different email.';
      }
      toast({
        title: 'Signup Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Signup Successful', description: 'Welcome!' });
      router.push('/');
    } catch (error: any) {
      console.error("Google signup error:", error);
      let description = error.message || 'Could not sign up with Google. Please try again.';
       if (error.code === 'auth/popup-closed-by-user') {
        description = 'Google Sign-Up was cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = 'An account already exists with this email address using a different sign-in method. Try logging in.';
      } else if (error.code === 'auth/api-key-not-valid') {
        description = 'Invalid Firebase API Key. Please check your .env.local file and Firebase project settings.';
      } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
         description = 'Google Sign-In is not enabled for this project. Please enable it in your Firebase project console (Authentication > Sign-in method > Google).';
      }
      toast({
        title: 'Google Signup Failed',
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
        <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
        <CardDescription>Join Homeplate to save ingredients and get recipe ideas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailSignup} className="space-y-6">
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
            <Label htmlFor="password">Password (min. 6 characters)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-card"
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-card"
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={isLoading || isGoogleLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
            Sign Up with Email
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
          onClick={handleGoogleSignup}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Chrome className="mr-2 h-5 w-5 text-[#DB4437]" />}
          Sign up with Google
        </Button>

      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

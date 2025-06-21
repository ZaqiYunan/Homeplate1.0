
"use client";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DeprecatedIngredientsPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Page Moved</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>This page has been updated!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert className="bg-primary/10 border-primary/30">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Functionality Moved</AlertTitle>
                <AlertDescription>
                    The ingredient management feature has been upgraded. Please use the new Storage page to manage your items with more detail, including expiration dates.
                </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/storage')} className="w-full">
              Go to New Storage Page <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

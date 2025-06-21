
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Loader2, BarChart, ChefHat, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import type { StoredIngredientItem, StorageLocation, IngredientCategory } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const categoryColors: Record<IngredientCategory, string> = {
  vegetable: "bg-green-200 text-green-800",
  fruit: "bg-pink-200 text-pink-800",
  protein: "bg-red-200 text-red-800",
  dairy: "bg-blue-200 text-blue-800",
  grain: "bg-yellow-200 text-yellow-800",
  spice: "bg-purple-200 text-purple-800",
  other: "bg-gray-200 text-gray-800",
};

const locationColors: Record<StorageLocation, string> = {
  pantry: "bg-orange-200 text-orange-800",
  refrigerator: "bg-cyan-200 text-cyan-800",
  freezer: "bg-sky-200 text-sky-800",
  unknown: "bg-gray-200 text-gray-800",
}

const getExpiryBadgeVariant = (expiryDate?: string): { variant: "default" | "secondary" | "destructive" | "outline", text: string } => {
  if (!expiryDate) return { variant: "secondary", text: "N/A" };
  const daysLeft = differenceInDays(parseISO(expiryDate), new Date());
  if (daysLeft < 0) return { variant: "destructive", text: "Expired" };
  if (daysLeft <= 3) return { variant: "destructive", text: `Expires in ${daysLeft}d` };
  if (daysLeft <= 7) return { variant: "outline", text: `Expires in ${daysLeft}d` };
  return { variant: "default", text: format(parseISO(expiryDate), "MMM dd, yyyy") };
};

export default function StoragePage() {
  const { storedIngredients, removeStoredIngredient, isContextLoading, isMounted } = useAppContext();
  const router = useRouter();

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await removeStoredIngredient(id);
    }
  };

  const expiringSoonCount = storedIngredients.filter(item => {
    if (!item.expiryDate) return false;
    const daysLeft = differenceInDays(parseISO(item.expiryDate), new Date());
    return daysLeft <= 3;
  }).length;
  
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">My Food Storage</h1>
          <p className="text-muted-foreground mt-1">An overview of all your food items, their locations, and expiry dates.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-1/2 sm:w-auto">
            <BarChart className="mr-2 h-4 w-4"/> Dashboard
          </Button>
          <Button onClick={() => router.push('/storage/add')} className="w-1/2 sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {expiringSoonCount > 0 && (
        <Alert variant="destructive" className="shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Expiration Warning!</AlertTitle>
          <AlertDescription>
            You have <strong>{expiringSoonCount}</strong> item(s) that are either expired or expiring within the next 3 days. Please check your inventory below.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          {isContextLoading && storedIngredients.length === 0 ? (
             <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-primary">Loading your storage...</p>
            </div>
          ) : storedIngredients.length === 0 ? (
            <div className="text-center py-10">
                <ChefHat size={48} className="mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Your storage is empty!</h3>
                <p className="mt-1 text-sm text-muted-foreground">Click "Add Item" to start managing your food inventory.</p>
                <Button onClick={() => router.push('/storage/add')} className="mt-6">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Your First Item
                </Button>
            </div>
          ) : (
            <TooltipProvider>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storedIngredients.map((item) => {
                       const expiry = getExpiryBadgeVariant(item.expiryDate);
                       return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={categoryColors[item.category]}>{item.category}</Badge>
                          </TableCell>
                           <TableCell>
                             <Badge variant="outline" className={locationColors[item.location]}>{item.location}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                          <TableCell>{format(parseISO(item.purchaseDate), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Badge variant={expiry.variant}>{expiry.text}</Badge>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>AI Predicted Expiry: {item.expiryDate ? format(parseISO(item.expiryDate), "MMMM do, yyyy") : 'Not set'}</p>
                               </TooltipContent>
                             </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                             <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete {item.name}</p>
                                </TooltipContent>
                              </Tooltip>
                          </TableCell>
                        </TableRow>
                       )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

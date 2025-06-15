
"use client";

import type { Recipe } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Eye, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecipeDisplay } from './RecipeDisplay';
import Image from 'next/image';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { recipeRatings, rateRecipe, isMounted } = useAppContext();
  const currentRating = recipeRatings[recipe.name] || 0;

  const handleRating = (rating: number) => {
    rateRecipe(recipe.name, rating);
  };

  const handleNutritionalInfo = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(recipe.name + " nutritional information")}`, "_blank");
  };

  if (!isMounted) {
    return (
      <Card className="flex flex-col h-full shadow-lg animate-pulse">
        <div className="h-48 bg-muted rounded-t-lg"></div>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
          <div className="h-8 bg-muted rounded w-24"></div>
          <div className="h-8 bg-muted rounded w-32"></div>
        </CardFooter>
      </Card>
    );
  }
  
  // Use a simple hashing function for pseudo-random image based on recipe name
  const getPlaceholderImageId = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 1000); // Keep it within a reasonable range for picsum.photos
  };

  const recipeNameHint = recipe.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden bg-card">
      <div className="relative w-full h-48">
        <Image 
          src={`https://picsum.photos/seed/${getPlaceholderImageId(recipe.name)}/400/300`}
          alt={`Image of ${recipe.name}`}
          layout="fill"
          objectFit="cover"
          data-ai-hint={recipeNameHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors">{recipe.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {recipe.ingredients.slice(0, 3).join(', ')}{recipe.ingredients.length > 3 ? '...' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 line-clamp-3">
          {recipe.instructions}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
        <StarRating initialRating={currentRating} onRate={handleRating} size={20} />
        <div className="flex gap-2">
          <Button onClick={handleNutritionalInfo} variant="ghost" size="sm" className="text-xs">
            <Info size={14} className="mr-1" /> Nutritional Info
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
                <Eye size={14} className="mr-1" /> View Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] p-0">
              <RecipeDisplay recipe={recipe} />
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}



"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { IngredientForm } from '@/components/IngredientForm';
import { IngredientPreview } from '@/components/IngredientPreview';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { recommendRecipes } from '@/ai/flows/recommend-recipes';
import { Loader2, AlertTriangle, Info, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const {
    storedIngredients,
    preferredIngredients,
    recommendedRecipes,
    setRecommendedRecipes,
    isContextLoading, // Updated from isLoadingRecipes
    setIsContextLoading, // Updated from setIsLoadingRecipes
    isMounted,
    clearRecommendedRecipes,
  } = useAppContext();
  const [temporaryIngredients, setTemporaryIngredients] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddTemporaryIngredient = (ingredient: string) => {
    const lowerCaseIngredient = ingredient.toLowerCase().trim();
    if (lowerCaseIngredient && !temporaryIngredients.map(i=>i.toLowerCase()).includes(lowerCaseIngredient) && !storedIngredients.map(i=>i.toLowerCase()).includes(lowerCaseIngredient)) {
      setTemporaryIngredients(prev => [...prev, ingredient.trim()]);
    } else {
      toast({
        title: "Duplicate Ingredient",
        description: `${ingredient} is already in your list.`,
        variant: "default",
      });
    }
  };

  const handleRemoveTemporaryIngredient = (ingredient: string) => {
    setTemporaryIngredients(prev => prev.filter(i => i.toLowerCase() !== ingredient.toLowerCase()));
  };
  
  const handleClearTemporaryIngredients = () => {
    setTemporaryIngredients([]);
  }

  const handleFindRecipes = async () => {
    setError(null);
    clearRecommendedRecipes();
    const allIngredients = [...new Set([...storedIngredients, ...temporaryIngredients].map(i => i.trim()).filter(Boolean))];

    if (allIngredients.length === 0) {
      setError("Please add some ingredients to find recipes.");
      toast({
        title: "Missing Ingredients",
        description: "Add ingredients before searching for recipes.",
        variant: "destructive",
      });
      return;
    }

    setIsContextLoading(true); // Updated from setIsLoadingRecipes
    try {
      const result = await recommendRecipes({
        ingredients: allIngredients,
        preferredIngredients: preferredIngredients.length > 0 ? preferredIngredients : undefined,
        numRecipes: 6, 
      });
      setRecommendedRecipes(result.recipes);
      if (result.recipes.length === 0) {
        toast({
            title: "No Recipes Found",
            description: "Try adding more or different ingredients.",
        });
      } else {
         toast({
            title: "Recipes Found!",
            description: `Found ${result.recipes.length} recipes for you.`,
        });
      }
    } catch (e) {
      console.error("Error fetching recipes:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to fetch recipes: ${errorMessage}`);
      toast({
        title: "Recipe Search Failed",
        description: `Could not fetch recipes. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsContextLoading(false); // Updated from setIsLoadingRecipes
    }
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const combinedIngredients = [...new Set([...storedIngredients, ...temporaryIngredients])];

  return (
    <div className="space-y-8">
      <Card className="shadow-xl bg-gradient-to-br from-primary/10 via-background to-background">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary flex items-center">
            <Zap size={36} className="mr-3 text-accent"/>
            AI Recipe Finder
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80">
            Tell us what ingredients you have, and our AI will whip up some delicious recipe ideas!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <IngredientPreview
            title="Your Current Ingredients"
            description="These are ingredients from your pantry (synced with your account) and any you've added for this search."
            ingredients={combinedIngredients}
            onRemoveTemporaryIngredient={handleRemoveTemporaryIngredient}
            maxHeight="150px"
            showClearAll={temporaryIngredients.length > 0}
            onClearAll={handleClearTemporaryIngredients}
          />

          <IngredientForm
            onAddIngredient={handleAddTemporaryIngredient}
            placeholder="Add temporary ingredient (e.g., fresh basil)"
            buttonText="Add for this Search"
          />

          {preferredIngredients.length > 0 && (
            <div className="p-4 border rounded-lg bg-secondary/50">
              <h3 className="text-sm font-medium text-secondary-foreground mb-1">Prioritizing (from your account's favorites):</h3>
              <div className="flex flex-wrap gap-1">
                {preferredIngredients.map(pi => (
                  <span key={pi} className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">{pi}</span>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleFindRecipes} 
            disabled={isContextLoading} // Updated from isLoadingRecipes
            size="lg" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base py-3 shadow-md hover:shadow-lg transition-shadow"
          >
            {isContextLoading ? ( // Updated from isLoadingRecipes
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Zap className="mr-2 h-5 w-5" />
            )}
            {isContextLoading ? "Finding Recipes..." : "Generate Recipe Ideas"} 
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendedRecipes.length === 0 && !isContextLoading && !error && combinedIngredients.length > 0 && ( // Updated from isLoadingRecipes
         <Alert className="shadow-md bg-card">
            <Info className="h-4 w-4" />
            <AlertTitle>Ready to Search?</AlertTitle>
            <AlertDescription>
              Click "Generate Recipe Ideas" to discover what you can make with your ingredients.
            </AlertDescription>
          </Alert>
      )}
      
      {recommendedRecipes.length > 0 && (
        <section aria-labelledby="recipe-results-title" className="space-y-6">
          <Separator />
          <div className="flex justify-between items-center">
            <h2 id="recipe-results-title" className="text-2xl font-bold text-primary">Recipe Suggestions</h2>
            <Button variant="outline" onClick={clearRecommendedRecipes}>Clear Results</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedRecipes.map((recipe, index) => (
              <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

    
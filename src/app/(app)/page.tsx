
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { recommendRecipes } from '@/ai/flows/recommend-recipes';
import { Loader2, AlertTriangle, Info, Zap, ChefHat } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const {
    storedIngredients,
    preferredIngredients,
    recommendedRecipes,
    setRecommendedRecipes,
    isContextLoading,
    setIsContextLoading,
    isMounted,
    clearRecommendedRecipes,
  } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFindRecipes = async () => {
    setError(null);
    clearRecommendedRecipes();
    
    const storedIngredientNames = storedIngredients.map(item => item.name.trim());
    
    if (storedIngredientNames.length === 0) {
      setError("Please add some ingredients to your storage to find recipes.");
      toast({
        title: "Missing Ingredients",
        description: "Add ingredients via the Storage page before searching for recipes.",
        variant: "destructive",
      });
      return;
    }

    setIsContextLoading(true);
    try {
      const result = await recommendRecipes({
        ingredients: storedIngredientNames,
        preferredIngredients: preferredIngredients.length > 0 ? preferredIngredients : undefined,
        numRecipes: 6, 
      });
      setRecommendedRecipes(result.recipes);
      if (result.recipes.length === 0) {
        toast({
            title: "No Recipes Found",
            description: "Try adding more or different ingredients to your storage.",
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
      setIsContextLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const storedIngredientNames = storedIngredients.map(item => item.name);

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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Using Ingredients From Your Storage</CardTitle>
              <CardDescription>
                {storedIngredientNames.length > 0 
                  ? "We'll find recipes based on the items you've saved." 
                  : "Your storage is empty. Add items to find recipes."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storedIngredientNames.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 rounded-md bg-muted/50">
                  {storedIngredientNames.map(name => (
                    <span key={name} className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full shadow-sm">{name}</span>
                  ))}
                </div>
              ): (
                <div className="text-center py-4">
                  <ChefHat size={32} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No ingredients yet.</p>
                  <Button variant="secondary" size="sm" className="mt-2" onClick={() => router.push('/storage/add')}>Add an Item</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {preferredIngredients.length > 0 && (
            <div className="p-4 border rounded-lg bg-secondary/50">
              <h3 className="text-sm font-medium text-secondary-foreground mb-1">Prioritizing favorites from your account:</h3>
              <div className="flex flex-wrap gap-1">
                {preferredIngredients.map(pi => (
                  <span key={pi} className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">{pi}</span>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleFindRecipes} 
            disabled={isContextLoading || storedIngredientNames.length === 0}
            size="lg" 
            className="w-full text-base py-3 shadow-md hover:shadow-lg transition-shadow"
          >
            {isContextLoading ? (
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

      {recommendedRecipes.length === 0 && !isContextLoading && !error && storedIngredientNames.length > 0 && (
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

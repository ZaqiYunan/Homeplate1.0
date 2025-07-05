
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { recommendRecipes, RecommendRecipesInput } from '@/ai/flows/recommend-recipes';
import { Loader2, AlertTriangle, Info, Zap, ChefHat, Search, Warehouse } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';


function HomePageContent() {
  const {
    storedIngredients,
    recommendedRecipes,
    setRecommendedRecipes,
    isContextLoading,
    setIsContextLoading,
    isMounted,
    clearRecommendedRecipes,
  } = useAppContext();
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = searchParams.get('mode') as 'storage' | 'query' || 'storage';
  const initialQuery = searchParams.get('query') || '';

  const [mode, setMode] = useState<'storage' | 'query'>(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const [selectedStorageIngredients, setSelectedStorageIngredients] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  const handleFindRecipes = useCallback(async (options: { searchMode: 'storage' | 'query'; query?: string; ingredients: string[] }) => {
    setError(null);
    clearRecommendedRecipes();

    const { searchMode, query, ingredients } = options;
    const allStoredIngredients = storedIngredients.map(i => i.name.trim());
    let input: RecommendRecipesInput;

    if (searchMode === 'storage') {
      if (ingredients.length === 0) {
        const msg = "Please select ingredients from your storage to find recipes.";
        setError(msg);
        toast({ title: "No Ingredients Selected", description: msg, variant: "destructive" });
        return;
      }
      input = { ingredients: ingredients, strictMode: true, numRecipes: 6 };
    } else { // mode === 'query'
      if (!query || !query.trim()) {
        const msg = "Please enter what you want to cook.";
        setError(msg);
        toast({ title: "Empty Search", description: msg, variant: "destructive" });
        return;
      }
      input = { ingredients: allStoredIngredients, query: query, strictMode: false, numRecipes: 6 };
    }

    setIsContextLoading(true);
    try {
      const result = await recommendRecipes(input);
      setRecommendedRecipes(result.recipes);
      if (result.recipes.length === 0) {
        toast({
            title: "No Recipes Found",
            description: "Try selecting different ingredients or changing your search query.",
        });
      } else {
         toast({
            title: "Recipes Found!",
            description: `Found ${result.recipes.length} delicious ideas for you.`,
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
  }, [clearRecommendedRecipes, setRecommendedRecipes, setIsContextLoading, storedIngredients, toast]);

  useEffect(() => {
    // Automatically search if navigated with query params, but only once.
    if (initialQuery && isMounted && !hasAutoSearched) {
      const allStoredIngredients = storedIngredients.map(i => i.name);
      handleFindRecipes({ searchMode: initialMode, query: initialQuery, ingredients: allStoredIngredients });
      setHasAutoSearched(true);
    }
  }, [initialQuery, initialMode, isMounted, hasAutoSearched, handleFindRecipes, storedIngredients]);


  const handleModeChange = (newMode: 'storage' | 'query') => {
    setMode(newMode);
    clearRecommendedRecipes();
    setError(null);
    if (newMode !== 'query') {
        setQuery('');
    }
    setSelectedStorageIngredients([]);
    // Also clear the URL query params
    router.replace('/');
  };
  
  const handleIngredientSelection = (ingredientName: string, isSelected: boolean) => {
    setSelectedStorageIngredients(prev => {
      if (isSelected) {
        return [...prev, ingredientName];
      } else {
        return prev.filter(name => name !== ingredientName);
      }
    });
  };

  const handleManualSearch = () => {
    const searchIngredients = mode === 'storage' ? selectedStorageIngredients : storedIngredients.map(i => i.name);
    handleFindRecipes({ searchMode: mode, query, ingredients: searchIngredients });
    // Update URL to be bookmarkable/shareable
    const newUrl = `/?mode=${mode}${query ? `&query=${encodeURIComponent(query)}` : ''}`;
    router.push(newUrl, { scroll: false });
  };


  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const storedIngredientNames = storedIngredients.map(item => item.name);
  const isSearchDisabled = isContextLoading || (mode === 'storage' && selectedStorageIngredients.length === 0) || (mode === 'query' && !query.trim());

  return (
    <div className="space-y-8">
      <Card className="shadow-xl bg-gradient-to-br from-primary/10 via-background to-background">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary flex items-center">
            <Zap size={36} className="mr-3 text-accent"/>
            AI Recipe Finder
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80">
            Discover your next meal. Use your available ingredients or search for something new!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={mode} onValueChange={(value) => handleModeChange(value as 'storage' | 'query')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="storage" className="gap-2"><Warehouse /> Use My Storage</TabsTrigger>
              <TabsTrigger value="query" className="gap-2"><Search /> Find a Recipe</TabsTrigger>
            </TabsList>
            <TabsContent value="storage" className="mt-4 p-4 bg-card rounded-md border">
              <CardTitle className="text-lg">What can I make now?</CardTitle>
              <CardDescription className="mb-4">Select ingredients you have in storage to find recipes.</CardDescription>
              {storedIngredients.length > 0 ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <Button size="sm" variant="outline" onClick={() => setSelectedStorageIngredients(storedIngredientNames)}>Select All</Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedStorageIngredients([])}>Clear Selection</Button>
                  </div>
                  <ScrollArea className="h-40 w-full rounded-md border p-4">
                      <div className="space-y-2">
                          {storedIngredients.map(item => (
                              <div key={item.id} className="flex items-center space-x-2">
                                  <Checkbox
                                      id={`ing-${item.id}`}
                                      checked={selectedStorageIngredients.includes(item.name)}
                                      onCheckedChange={(checked) => handleIngredientSelection(item.name, !!checked)}
                                  />
                                  <Label
                                      htmlFor={`ing-${item.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                      {item.name}
                                  </Label>
                              </div>
                          ))}
                      </div>
                  </ScrollArea>
                </>
              ): (
                <div className="text-center py-4">
                  <ChefHat size={32} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Your storage is empty.</p>
                  <Button variant="secondary" size="sm" className="mt-2" onClick={() => router.push('/storage/add')}>Add an Item</Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="query" className="mt-4 p-4 bg-card rounded-md border">
               <CardTitle className="text-lg">What do you want to cook?</CardTitle>
              <CardDescription className="mb-4">Search for a dish, and we'll create recipes, using your stored items where possible.</CardDescription>
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'Quick chicken dinner' or 'vegetarian pasta'"
                className="text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSearch();
                  }
                }}
              />
            </TabsContent>
          </Tabs>
          
          <Button 
            onClick={handleManualSearch} 
            disabled={isSearchDisabled}
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

      {recommendedRecipes.length === 0 && !isContextLoading && !error && (
         <Alert className="shadow-md bg-card">
            <Info className="h-4 w-4" />
            <AlertTitle>Ready to Search?</AlertTitle>
            <AlertDescription>
              Configure your search above and click "Generate Recipe Ideas" to discover what you can make.
            </AlertDescription>
          </Alert>
      )}
      
      {recommendedRecipes.length > 0 && (
        <section aria-labelledby="recipe-results-title" className="space-y-6">
          <Separator />
          <div className="flex justify-between items-center">
            <h2 id="recipe-results-title" className="text-2xl font-bold text-primary">Recipe Suggestions</h2>
            <Button variant="outline" onClick={() => { clearRecommendedRecipes(); router.replace('/'); }}>Clear Results</Button>
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

export default function HomePage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    }>
        <HomePageContent />
    </Suspense>
  )
}

    
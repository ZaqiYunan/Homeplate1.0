"use client";

import { useAppContext } from '@/contexts/AppContext';
import { IngredientForm } from '@/components/IngredientForm';
import { IngredientList } from '@/components/IngredientList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function IngredientsPage() {
  const {
    storedIngredients,
    addStoredIngredient,
    removeStoredIngredient,
    preferredIngredients,
    togglePreferredIngredient,
    clearPreferredIngredients,
    isMounted,
    isLoadingRecipes, // Using this as a generic loading indicator for AI calls
    setIsLoadingRecipes // Using this as a generic loading indicator for AI calls
  } = useAppContext();

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Your Ingredients</h1>
      
      <section aria-labelledby="pantry-ingredients-title">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle id="pantry-ingredients-title" className="text-2xl font-semibold text-primary">My Pantry</CardTitle>
            <CardDescription>Add ingredients you have on hand. These will be used for recipe recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IngredientForm 
              onAddIngredient={addStoredIngredient} 
              placeholder="e.g., Chicken breast, Onion, Olive oil"
              buttonText="Add to Pantry"
            />
            <IngredientList
              title="Available Ingredients"
              ingredients={storedIngredients}
              onRemoveIngredient={removeStoredIngredient}
              emptyStateMessage="Your pantry is empty. Add some ingredients!"
              chipVariant="secondary"
            />
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      <section aria-labelledby="preferred-ingredients-title">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle id="preferred-ingredients-title" className="text-2xl font-semibold text-primary">Favorite Ingredients</CardTitle>
            <CardDescription>
              Select ingredients you'd like the AI to prioritize in recommendations.
              You can select from your pantry or add new favorites.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storedIngredients.length > 0 && (
              <>
                <h3 className="text-md font-medium text-foreground">Select from Pantry:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {storedIngredients.map(ingredient => (
                    <Button
                      key={ingredient}
                      variant={preferredIngredients.includes(ingredient) ? "default" : "outline"}
                      onClick={() => togglePreferredIngredient(ingredient)}
                      className={`rounded-full text-sm px-3 py-1 h-auto transition-all duration-200 ease-in-out transform hover:scale-105 ${preferredIngredients.includes(ingredient) ? 'bg-primary text-primary-foreground' : 'border-primary text-primary hover:bg-primary/10'}`}
                    >
                      {preferredIngredients.includes(ingredient) && <CheckCircle size={16} className="mr-2" />}
                      {ingredient}
                    </Button>
                  ))}
                </div>
              </>
            )}
            <IngredientList
              title="Current Favorites"
              ingredients={preferredIngredients}
              onRemoveIngredient={(ingredient) => togglePreferredIngredient(ingredient)} // Effectively removes if clicked
              emptyStateMessage="No favorite ingredients selected yet."
              chipVariant="preferred"
            />
             {preferredIngredients.length > 0 && (
              <Button variant="outline" onClick={clearPreferredIngredients} className="mt-2">
                Clear All Favorites
              </Button>
            )}
             <Alert className="mt-4 bg-accent/10 border-accent/30">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent">AI Powered!</AlertTitle>
              <AlertDescription className="text-accent/80">
                Updating your favorite ingredients helps our AI tailor recipe suggestions more effectively to your tastes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {isLoadingRecipes && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-2 text-primary">Updating AI preferences...</p>
        </div>
      )}
    </div>
  );
}

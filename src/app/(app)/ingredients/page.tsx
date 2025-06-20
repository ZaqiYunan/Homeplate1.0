
"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { IngredientForm } from '@/components/IngredientForm';
import { IngredientList } from '@/components/IngredientList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Loader2, Refrigerator, Archive, Snowflake, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { StorageLocation, StoredIngredientItem } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locationIcons: Record<StorageLocation, React.ElementType> = {
  pantry: Archive,
  refrigerator: Refrigerator,
  freezer: Snowflake,
  unknown: HelpCircle,
};

export default function IngredientsPage() {
  const {
    storedIngredients,
    addStoredIngredient,
    removeStoredIngredient,
    updateIngredientLocation,
    preferredIngredients,
    togglePreferredIngredient,
    clearPreferredIngredients,
    isMounted,
    isContextLoading,
    setIsContextLoading
  } = useAppContext();

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddPantryIngredient = async (name: string, location: StorageLocation) => {
    await addStoredIngredient(name, location);
  };

  const handleRemovePantryIngredient = async (name: string) => {
    await removeStoredIngredient(name);
  };

  const handleToggleFavorite = async (ingredientName: string) => {
    await togglePreferredIngredient(ingredientName);
  };
  
  const handleClearFavorites = async () => {
    await clearPreferredIngredients();
  };

  const handleMoveIngredient = async (ingredientName: string, newLocation: StorageLocation) => {
    await updateIngredientLocation(ingredientName, newLocation);
  };

  const renderIngredientListForLocation = (location: StorageLocation, title: string) => {
    const itemsInLocation = storedIngredients.filter(item => item.location === location);
    const LocationIcon = locationIcons[location];

    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <LocationIcon className="mr-2 h-5 w-5" />
            {title} ({itemsInLocation.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {itemsInLocation.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {itemsInLocation.map(item => (
                <div key={item.name} className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="p-0 h-auto mr-1 text-muted-foreground hover:text-primary">
                         <HelpCircle size={16} /> {/* Or a different icon like ChevronsUpDown */}
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleMoveIngredient(item.name, 'pantry')} disabled={item.location === 'pantry'}>Move to Pantry</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMoveIngredient(item.name, 'refrigerator')} disabled={item.location === 'refrigerator'}>Move to Refrigerator</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMoveIngredient(item.name, 'freezer')} disabled={item.location === 'freezer'}>Move to Freezer</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleMoveIngredient(item.name, 'unknown')} disabled={item.location === 'unknown'}>Move to Unknown</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <IngredientList
                    title="" 
                    ingredients={[item.name]} 
                    onRemoveIngredient={() => handleRemovePantryIngredient(item.name)}
                    chipVariant="secondary"
                    className="shadow-none border-none p-0 m-0" 
                    hideHeader={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No items in {location}.</p>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const allPantryIngredientNames = storedIngredients.map(item => item.name);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Your Ingredients</h1>
      
      <section aria-labelledby="add-ingredient-title">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle id="add-ingredient-title" className="text-2xl font-semibold text-primary">Add to Pantry</CardTitle>
            <CardDescription>Add ingredients you have on hand, specifying their storage location. Saved to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IngredientForm 
              onAddIngredient={handleAddPantryIngredient} 
              placeholder="e.g., Chicken breast, Onion, Olive oil"
              buttonText="Add to Pantry"
            />
          </CardContent>
        </Card>
      </section>
      
      <Separator className="my-8" />

      <section aria-labelledby="pantry-locations-title">
        <h2 id="pantry-locations-title" className="text-2xl font-semibold text-primary mb-4">Your Pantry Storage</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderIngredientListForLocation('pantry', 'In the Pantry')}
          {renderIngredientListForLocation('refrigerator', 'In the Refrigerator')}
          {renderIngredientListForLocation('freezer', 'In the Freezer')}
          {renderIngredientListForLocation('unknown', 'Unknown Location')}
        </div>
      </section>

      <Separator className="my-8" />

      <section aria-labelledby="preferred-ingredients-title">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle id="preferred-ingredients-title" className="text-2xl font-semibold text-primary">Favorite Ingredients</CardTitle>
            <CardDescription>
              Select ingredients from your pantry you'd like the AI to prioritize. Saved to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allPantryIngredientNames.length > 0 && (
              <>
                <h3 className="text-md font-medium text-foreground">Select from Pantry:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {allPantryIngredientNames.map(ingredientName => (
                    <Button
                      key={ingredientName}
                      variant={preferredIngredients.includes(ingredientName) ? "default" : "outline"}
                      onClick={() => handleToggleFavorite(ingredientName)}
                      disabled={isContextLoading}
                      className={`rounded-full text-sm px-3 py-1 h-auto transition-all duration-200 ease-in-out transform hover:scale-105 ${preferredIngredients.includes(ingredientName) ? 'bg-primary text-primary-foreground' : 'border-primary text-primary hover:bg-primary/10'}`}
                    >
                      {preferredIngredients.includes(ingredientName) && <CheckCircle size={16} className="mr-2" />}
                      {ingredientName}
                    </Button>
                  ))}
                </div>
              </>
            )}
            <IngredientList
              title="Current Favorites"
              ingredients={preferredIngredients}
              onRemoveIngredient={(ingredientName) => handleToggleFavorite(ingredientName)} 
              emptyStateMessage="No favorite ingredients selected yet."
              chipVariant="preferred"
            />
             {preferredIngredients.length > 0 && (
              <Button variant="outline" onClick={handleClearFavorites} className="mt-2" disabled={isContextLoading}>
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

      {isContextLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-2 text-primary">Updating ingredients...</p>
        </div>
      )}
    </div>
  );
}

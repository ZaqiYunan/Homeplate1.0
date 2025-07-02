
"use client";

import React, { useState } from 'react';
import type { Recipe, NutritionalInfo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, List, BookCheck, Loader2, Sparkles, AlertTriangle, Flame, Zap, Droplets, Pizza } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/contexts/AppContext';
import { getNutritionalInfo } from '@/ai/flows/get-nutritional-info-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RecipeDisplayProps {
  recipe: Recipe;
}

const NutritionDetail = ({ label, value, unit, icon: Icon }: { label: string, value: number, unit: string, icon: React.ElementType }) => (
    <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
        <div className="flex items-center gap-2 font-medium">
            <Icon className="h-4 w-4 text-primary" />
            <span>{label}</span>
        </div>
        <span>{Math.round(value)} {unit}</span>
    </div>
);

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const { logMeal, isContextLoading, setIsContextLoading } = useAppContext();
  const { toast } = useToast();
  const [nutritionalInfo, setNutritionalInfo] = useState<NutritionalInfo | null>(null);

  const handleFetchNutrition = async () => {
    setIsContextLoading(true);
    try {
        const info = await getNutritionalInfo({ name: recipe.name, ingredients: recipe.ingredients });
        setNutritionalInfo(info);
        toast({ title: "Nutrition Analyzed", description: "Estimated nutritional information is now available." });
    } catch (e) {
        console.error("Error fetching nutritional info:", e);
        toast({ title: "Error", description: "Could not fetch nutritional information.", variant: "destructive" });
    } finally {
        setIsContextLoading(false);
    }
  };

  const handleLogMeal = async () => {
    if (!nutritionalInfo) {
      toast({ title: "Error", description: "Please analyze nutrition before logging.", variant: "destructive" });
      return;
    }
    await logMeal(recipe, nutritionalInfo);
  };
  
  const openRecipeUrl = () => {
    if (recipe.url) {
      window.open(recipe.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-3xl font-bold text-primary">{recipe.name}</CardTitle>
        {recipe.url && (
          <button onClick={openRecipeUrl} className="text-sm text-accent hover:underline flex items-center gap-1">
            View Original Recipe <ExternalLink size={14} />
          </button>
        )}
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="pt-6 space-y-6">
          {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Ingredients</AlertTitle>
                <AlertDescription>You'll need to get these: <strong>{recipe.missingIngredients.join(', ')}</strong></AlertDescription>
            </Alert>
          )}

          <div>
            <h3 className="text-xl font-semibold text-secondary-foreground mb-2 flex items-center gap-2"><List size={20}/>Ingredients</h3>
            <ul className="list-disc list-inside pl-4 space-y-1 text-foreground/90">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-secondary-foreground mb-2">Instructions</h3>
            <div 
              className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: recipe.instructions.replace(/\n/g, '<br />') }} 
            />
          </div>

          {nutritionalInfo && (
            <div>
              <h3 className="text-xl font-semibold text-secondary-foreground mb-2">Estimated Nutrition</h3>
              <div className="grid grid-cols-2 gap-3">
                  <NutritionDetail label="Calories" value={nutritionalInfo.calories} unit="kcal" icon={Flame} />
                  <NutritionDetail label="Protein" value={nutritionalInfo.protein} unit="g" icon={Zap} />
                  <NutritionDetail label="Carbs" value={nutritionalInfo.carbs} unit="g" icon={Pizza} />
                  <NutritionDetail label="Fat" value={nutritionalInfo.fat} unit="g" icon={Droplets} />
              </div>
            </div>
          )}

        </CardContent>
      </ScrollArea>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-2 bg-muted/50">
        {!nutritionalInfo ? (
            <Button onClick={handleFetchNutrition} disabled={isContextLoading} className="w-full">
                {isContextLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Nutrition
            </Button>
        ) : (
            <Button onClick={handleLogMeal} disabled={isContextLoading} className="w-full">
                {isContextLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookCheck className="mr-2 h-4 w-4" />}
                Log This Meal
            </Button>
        )}
      </CardFooter>
    </div>
  );
}

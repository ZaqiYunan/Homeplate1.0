"use client";

import type { Recipe } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, List } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecipeDisplayProps {
  recipe: Recipe;
}

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const handleNutritionalInfo = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(recipe.name + " nutritional information")}`, "_blank");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4 shadow-xl bg-card">
      <CardHeader className="border-b">
        <CardTitle className="text-3xl font-bold text-primary">{recipe.name}</CardTitle>
        {recipe.url && (
          <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1">
            View Original Recipe <ExternalLink size={14} />
          </a>
        )}
      </CardHeader>
      <ScrollArea className="max-h-[calc(100vh-20rem)]"> {/* Adjust max height as needed */}
        <CardContent className="pt-6 space-y-6">
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
        </CardContent>
      </ScrollArea>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t">
         <Button onClick={handleNutritionalInfo} variant="outline" className="w-full sm:w-auto mb-2 sm:mb-0">
            <ExternalLink className="mr-2 h-4 w-4" />
            Nutritional Info
          </Button>
        {recipe.url && <Badge variant="secondary">Source: Web</Badge>}
      </CardFooter>
    </Card>
  );
}

"use client";

import { IngredientChip } from '@/components/IngredientChip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IngredientPreviewProps {
  ingredients: string[];
  onRemoveTemporaryIngredient?: (ingredient: string) => void; // For temporary ingredients on recipe page
  title?: string;
  description?: string;
  maxHeight?: string;
  showClearAll?: boolean;
  onClearAll?: () => void;
}

export function IngredientPreview({ 
  ingredients, 
  onRemoveTemporaryIngredient,
  title = "Ingredients for Recommendation",
  description = "These ingredients will be used to find recipes.",
  maxHeight = "200px",
  showClearAll = false,
  onClearAll
}: IngredientPreviewProps) {
  
  const handleRemove = (ingredient: string) => {
    if (onRemoveTemporaryIngredient) {
      onRemoveTemporaryIngredient(ingredient);
    }
    // If it's not a temporary ingredient, it cannot be removed from here.
    // Global stored ingredients are removed from the My Ingredients page.
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-primary">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showClearAll && ingredients.length > 0 && onClearAll && (
            <Button variant="outline" size="sm" onClick={onClearAll}>Clear All</Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {ingredients.length > 0 ? (
          <ScrollArea className="pr-3" style={{ maxHeight: maxHeight }}>
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ingredient => (
                <IngredientChip
                  key={ingredient}
                  ingredient={ingredient}
                  onRemove={handleRemove}
                  variant={onRemoveTemporaryIngredient ? "destructive" : "secondary"} // Indicate removable for temp ones
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground italic">No ingredients selected.</p>
        )}
      </CardContent>
    </Card>
  );
}

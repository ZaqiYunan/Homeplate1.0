
"use client";

import { IngredientChip } from '@/components/IngredientChip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { StoredIngredientItem } from '@/lib/types';

interface IngredientPreviewProps {
  ingredients: string[]; // Combined list of names for display
  temporaryIngredients: string[]; // Names of temporary ingredients
  storedIngredients: string[]; // Names of stored ingredients
  onRemoveTemporaryIngredient?: (ingredientName: string) => void;
  title?: string;
  description?: string;
  maxHeight?: string;
  showClearAll?: boolean;
  onClearAll?: () => void;
}

export function IngredientPreview({ 
  ingredients, 
  temporaryIngredients,
  storedIngredients,
  onRemoveTemporaryIngredient,
  title = "Ingredients for Recommendation",
  description = "These ingredients will be used to find recipes.",
  maxHeight = "200px",
  showClearAll = false,
  onClearAll
}: IngredientPreviewProps) {
  
  const handleRemove = (ingredientName: string) => {
    // Only allow removing temporary ingredients from this component
    if (onRemoveTemporaryIngredient && temporaryIngredients.map(i => i.toLowerCase()).includes(ingredientName.toLowerCase())) {
      onRemoveTemporaryIngredient(ingredientName);
    }
    // Stored ingredients are managed on the /ingredients page
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-primary">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showClearAll && temporaryIngredients.length > 0 && onClearAll && (
            <Button variant="outline" size="sm" onClick={onClearAll}>Clear Temp</Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {ingredients.length > 0 ? (
          <ScrollArea className="pr-3" style={{ maxHeight: maxHeight }}>
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ingredientName => {
                const isTemporary = temporaryIngredients.map(i => i.toLowerCase()).includes(ingredientName.toLowerCase());
                const isStored = storedIngredients.map(i => i.toLowerCase()).includes(ingredientName.toLowerCase()) && !isTemporary;

                let chipVariant: "destructive" | "secondary" | "default" = "secondary";
                let tooltipText = "";

                if (isTemporary) {
                  chipVariant = "destructive"; // Removable
                  tooltipText = "Temporary for this search";
                } else if (isStored) {
                  chipVariant = "default"; // From pantry, not removable here
                  tooltipText = "From your pantry (manage on My Ingredients page)";
                }
                
                return (
                  <IngredientChip
                    key={ingredientName}
                    ingredient={ingredientName}
                    onRemove={handleRemove}
                    // Disable remove button for stored items in this preview
                    // The `onRemove` in Chip will only be called if the X is clicked.
                    // `IngredientChip` doesn't have a direct disable prop for the X button.
                    // We control this by only calling `onRemoveTemporaryIngredient` if it's temporary.
                    variant={chipVariant}
                    // Add a title for tooltip if needed, or modify IngredientChip
                  />
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground italic">No ingredients selected.</p>
        )}
      </CardContent>
    </Card>
  );
}

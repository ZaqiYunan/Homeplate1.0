
"use client";

import { IngredientChip } from '@/components/IngredientChip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IngredientListProps {
  title: string;
  ingredients: string[]; // Expects an array of ingredient names
  onRemoveIngredient: (ingredient: string) => void;
  emptyStateMessage?: string;
  chipVariant?: "default" | "secondary" | "destructive" | "outline" | "preferred";
  className?: string;
  hideHeader?: boolean;
}

export function IngredientList({ 
  title, 
  ingredients, 
  onRemoveIngredient, 
  emptyStateMessage = "No ingredients yet.",
  chipVariant = "secondary",
  className,
  hideHeader = false,
}: IngredientListProps) {
  if (hideHeader && ingredients.length === 0) { // If header is hidden and no items, render nothing
    return null;
  }

  return (
    <Card className={`shadow-lg ${className} ${hideHeader ? 'border-none shadow-none' : ''}`}>
      {!hideHeader && (
        <CardHeader className={`${hideHeader ? 'p-0' : ''}`}>
          <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`${hideHeader ? 'p-0' : ''}`}>
        {ingredients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ingredientName => (
              <IngredientChip 
                key={ingredientName} 
                ingredient={ingredientName} 
                onRemove={onRemoveIngredient}
                variant={chipVariant}
              />
            ))}
          </div>
        ) : (
          !hideHeader && <p className="text-muted-foreground italic">{emptyStateMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

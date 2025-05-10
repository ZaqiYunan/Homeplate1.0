"use client";

import { IngredientChip } from '@/components/IngredientChip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IngredientListProps {
  title: string;
  ingredients: string[];
  onRemoveIngredient: (ingredient: string) => void;
  emptyStateMessage?: string;
  chipVariant?: "default" | "secondary" | "destructive" | "outline" | "preferred";
  className?: string;
}

export function IngredientList({ 
  title, 
  ingredients, 
  onRemoveIngredient, 
  emptyStateMessage = "No ingredients yet.",
  chipVariant = "secondary",
  className
}: IngredientListProps) {
  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {ingredients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ingredient => (
              <IngredientChip 
                key={ingredient} 
                ingredient={ingredient} 
                onRemove={onRemoveIngredient}
                variant={chipVariant}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">{emptyStateMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

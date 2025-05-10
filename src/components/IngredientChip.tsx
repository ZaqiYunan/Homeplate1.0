"use client";

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IngredientChipProps {
  ingredient: string;
  onRemove: (ingredient: string) => void;
  variant?: "default" | "secondary" | "destructive" | "outline" | "preferred";
}

export function IngredientChip({ ingredient, onRemove, variant = "default" }: IngredientChipProps) {
  const badgeVariant = variant === "preferred" ? "default" : variant;
  const badgeClasses = variant === "preferred" ? "bg-primary text-primary-foreground border-primary" : "";
  
  return (
    <Badge variant={badgeVariant} className={`py-1 px-3 text-sm flex items-center gap-1 ${badgeClasses} shadow-sm rounded-full`}>
      <span>{ingredient}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 p-0.5 rounded-full hover:bg-destructive/50 hover:text-destructive-foreground"
        onClick={() => onRemove(ingredient)}
        aria-label={`Remove ${ingredient}`}
      >
        <X size={14} />
      </Button>
    </Badge>
  );
}

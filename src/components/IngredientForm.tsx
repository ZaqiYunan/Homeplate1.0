"use client";

import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface IngredientFormProps {
  onAddIngredient: (ingredient: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export function IngredientForm({ 
  onAddIngredient, 
  placeholder = "Enter ingredient...", 
  buttonText = "Add Ingredient",
  className 
}: IngredientFormProps) {
  const [ingredientName, setIngredientName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ingredientName.trim()) {
      onAddIngredient(ingredientName.trim());
      setIngredientName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 items-center ${className}`}>
      <Input
        type="text"
        value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)}
        placeholder={placeholder}
        className="flex-grow bg-card"
        aria-label="Ingredient name"
      />
      <Button type="submit" variant="default" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
        <PlusCircle className="mr-2 h-5 w-5" />
        {buttonText}
      </Button>
    </form>
  );
}

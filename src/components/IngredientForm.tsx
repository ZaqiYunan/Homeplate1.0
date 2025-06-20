
"use client";

import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StorageLocation } from '@/lib/types';

interface IngredientFormProps {
  onAddIngredient: (name: string, location: StorageLocation) => void;
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
  const [location, setLocation] = useState<StorageLocation>('pantry');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ingredientName.trim()) {
      onAddIngredient(ingredientName.trim(), location);
      setIngredientName('');
      setLocation('pantry'); // Reset location to default
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 items-center ${className}`}>
      <Input
        type="text"
        value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)}
        placeholder={placeholder}
        className="flex-grow bg-card"
        aria-label="Ingredient name"
      />
      <Select value={location} onValueChange={(value) => setLocation(value as StorageLocation)}>
        <SelectTrigger className="w-full sm:w-[180px] bg-card">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pantry">Pantry</SelectItem>
          <SelectItem value="refrigerator">Refrigerator</SelectItem>
          <SelectItem value="freezer">Freezer</SelectItem>
          <SelectItem value="unknown">Unknown</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="default" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
        <PlusCircle className="mr-2 h-5 w-5" />
        {buttonText}
      </Button>
    </form>
  );
}

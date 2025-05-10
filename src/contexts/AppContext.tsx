"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/lib/types';
import { preSelectIngredients } from '@/ai/flows/pre-select-ingredients-flow';
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  storedIngredients: string[];
  addStoredIngredient: (ingredient: string) => void;
  removeStoredIngredient: (ingredient: string) => void;
  preferredIngredients: string[];
  addPreferredIngredient: (ingredient: string) => void;
  removePreferredIngredient: (ingredient: string) => void;
  togglePreferredIngredient: (ingredient: string) => void;
  clearPreferredIngredients: () => void;
  recommendedRecipes: Recipe[];
  setRecommendedRecipes: (recipes: Recipe[]) => void;
  clearRecommendedRecipes: () => void;
  recipeRatings: Record<string, number>;
  rateRecipe: (recipeName: string, rating: number) => void;
  isLoadingRecipes: boolean;
  setIsLoadingRecipes: (loading: boolean) => void;
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  STORED_INGREDIENTS: 'homeplate_storedIngredients',
  PREFERRED_INGREDIENTS: 'homeplate_preferredIngredients',
  RECIPE_RATINGS: 'homeplate_recipeRatings',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storedIngredients, setStoredIngredients] = useState<string[]>([]);
  const [preferredIngredients, setPreferredIngredients] = useState<string[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [recipeRatings, setRecipeRatings] = useState<Record<string, number>>({});
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.STORED_INGREDIENTS);
      if (stored) setStoredIngredients(JSON.parse(stored));

      const preferred = localStorage.getItem(LOCAL_STORAGE_KEYS.PREFERRED_INGREDIENTS);
      if (preferred) setPreferredIngredients(JSON.parse(preferred));
      
      const ratings = localStorage.getItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS);
      if (ratings) setRecipeRatings(JSON.parse(ratings));
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      toast({ title: "Error", description: "Could not load saved data.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.STORED_INGREDIENTS, JSON.stringify(storedIngredients));
    }
  }, [storedIngredients, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PREFERRED_INGREDIENTS, JSON.stringify(preferredIngredients));
    }
  }, [preferredIngredients, isMounted]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS, JSON.stringify(recipeRatings));
    }
  }, [recipeRatings, isMounted]);

  const addStoredIngredient = useCallback((ingredient: string) => {
    const lowerCaseIngredient = ingredient.toLowerCase().trim();
    if (lowerCaseIngredient && !storedIngredients.map(i => i.toLowerCase()).includes(lowerCaseIngredient)) {
      setStoredIngredients(prev => [...prev, ingredient.trim()]);
    }
  }, [storedIngredients]);

  const removeStoredIngredient = useCallback((ingredient: string) => {
    setStoredIngredients(prev => prev.filter(i => i.toLowerCase() !== ingredient.toLowerCase()));
  }, []);

  const addPreferredIngredient = useCallback(async (ingredient: string) => {
    const lowerCaseIngredient = ingredient.toLowerCase().trim();
    if (lowerCaseIngredient && !preferredIngredients.map(i => i.toLowerCase()).includes(lowerCaseIngredient)) {
      const newPreferred = [...preferredIngredients, ingredient.trim()];
      setPreferredIngredients(newPreferred);
      try {
        await preSelectIngredients({ ingredients: newPreferred });
        toast({ title: "Preferences Updated", description: `${ingredient} added to preferred ingredients.` });
      } catch (error) {
        console.error("AI preSelectIngredients error:", error);
        toast({ title: "AI Error", description: "Could not update AI with preferred ingredients.", variant: "destructive" });
      }
    }
  }, [preferredIngredients, toast]);
  
  const removePreferredIngredient = useCallback(async (ingredient: string) => {
    const newPreferred = preferredIngredients.filter(i => i.toLowerCase() !== ingredient.toLowerCase());
    setPreferredIngredients(newPreferred);
    try {
      if (newPreferred.length > 0) {
        await preSelectIngredients({ ingredients: newPreferred });
      }
      toast({ title: "Preferences Updated", description: `${ingredient} removed from preferred ingredients.` });
    } catch (error) {
      console.error("AI preSelectIngredients error:", error);
       toast({ title: "AI Error", description: "Could not update AI with preferred ingredients.", variant: "destructive" });
    }
  }, [preferredIngredients, toast]);

  const togglePreferredIngredient = useCallback(async (ingredient: string) => {
    const lowerCaseIngredient = ingredient.toLowerCase().trim();
    let newPreferred: string[];
    if (preferredIngredients.map(i => i.toLowerCase()).includes(lowerCaseIngredient)) {
      newPreferred = preferredIngredients.filter(i => i.toLowerCase() !== lowerCaseIngredient);
      toast({ title: "Preferences Updated", description: `${ingredient} removed from preferred ingredients.` });
    } else {
      newPreferred = [...preferredIngredients, ingredient.trim()];
      toast({ title: "Preferences Updated", description: `${ingredient} added to preferred ingredients.` });
    }
    setPreferredIngredients(newPreferred);
    try {
      if (newPreferred.length > 0) {
        await preSelectIngredients({ ingredients: newPreferred });
      }
    } catch (error) {
        console.error("AI preSelectIngredients error:", error);
        toast({ title: "AI Error", description: "Could not update AI with preferred ingredients.", variant: "destructive" });
    }
  }, [preferredIngredients, toast]);

  const clearPreferredIngredients = useCallback(async () => {
    setPreferredIngredients([]);
    toast({ title: "Preferences Cleared", description: "All preferred ingredients removed."});
    // Optionally call preSelectIngredients with an empty array if the AI supports it or expects it
  }, [toast]);

  const clearRecommendedRecipes = useCallback(() => {
    setRecommendedRecipes([]);
  }, []);

  const rateRecipe = useCallback((recipeName: string, rating: number) => {
    setRecipeRatings(prev => ({ ...prev, [recipeName]: rating }));
  }, []);

  return (
    <AppContext.Provider value={{
      storedIngredients, addStoredIngredient, removeStoredIngredient,
      preferredIngredients, addPreferredIngredient, removePreferredIngredient, togglePreferredIngredient, clearPreferredIngredients,
      recommendedRecipes, setRecommendedRecipes, clearRecommendedRecipes,
      recipeRatings, rateRecipe,
      isLoadingRecipes, setIsLoadingRecipes,
      isMounted
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

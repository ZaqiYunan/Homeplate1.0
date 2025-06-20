
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Recipe, StoredIngredientItem, StorageLocation } from '@/lib/types';
import { preSelectIngredients } from '@/ai/flows/pre-select-ingredients-flow';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

interface AppContextType {
  storedIngredients: StoredIngredientItem[];
  addStoredIngredient: (name: string, location: StorageLocation) => Promise<void>;
  removeStoredIngredient: (name: string) => Promise<void>;
  updateIngredientLocation: (name: string, newLocation: StorageLocation) => Promise<void>;
  preferredIngredients: string[];
  togglePreferredIngredient: (ingredient: string) => Promise<void>;
  clearPreferredIngredients: () => Promise<void>;
  recommendedRecipes: Recipe[];
  setRecommendedRecipes: (recipes: Recipe[]) => void;
  clearRecommendedRecipes: () => void;
  recipeRatings: Record<string, number>;
  rateRecipe: (recipeName: string, rating: number) => void;
  isContextLoading: boolean;
  setIsContextLoading: (loading: boolean) => void;
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  RECIPE_RATINGS: 'homeplate_recipeRatings',
};

const getUserIngredientsDataRef = (userId: string) => {
  return doc(db, 'users', userId, 'ingredients', 'data');
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [storedIngredients, setStoredIngredients] = useState<StoredIngredientItem[]>([]);
  const [preferredIngredients, setPreferredIngredients] = useState<string[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [recipeRatings, setRecipeRatings] = useState<Record<string, number>>({});
  const [isContextLoading, setIsContextLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const ratings = localStorage.getItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS);
      if (ratings) setRecipeRatings(JSON.parse(ratings));
    } catch (error) {
      console.error("Failed to load ratings from localStorage", error);
      toast({ title: "Error", description: "Could not load saved recipe ratings.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (isMounted && user) {
      const fetchUserIngredients = async () => {
        setIsContextLoading(true);
        const ingredientsDataRef = getUserIngredientsDataRef(user.uid);
        try {
          const docSnap = await getDoc(ingredientsDataRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Basic migration: if pantryIngredients are strings, convert to StoredIngredientItem[]
            let pantryItems: StoredIngredientItem[] = [];
            if (Array.isArray(data.pantryIngredients)) {
              if (data.pantryIngredients.length > 0 && typeof data.pantryIngredients[0] === 'string') {
                pantryItems = data.pantryIngredients.map((name: string) => ({ name, location: 'pantry' as StorageLocation }));
                // Optionally, update Firestore with the new structure here if desired
                // await setDoc(ingredientsDataRef, { pantryIngredients: pantryItems }, { merge: true });
                 toast({ title: "Storage Updated", description: "Your ingredients have been defaulted to 'pantry'. You can update their locations." });
              } else {
                pantryItems = data.pantryIngredients;
              }
            }
            setStoredIngredients(pantryItems);
            setPreferredIngredients(data.favoriteIngredients || []);
          } else {
            setStoredIngredients([]);
            setPreferredIngredients([]);
            await setDoc(ingredientsDataRef, { pantryIngredients: [], favoriteIngredients: [] });
          }
        } catch (error) {
          console.error("Error fetching user ingredients:", error);
          toast({ title: "Error", description: "Could not load your ingredients from the cloud.", variant: "destructive" });
        } finally {
          setIsContextLoading(false);
        }
      };
      fetchUserIngredients();
    } else if (isMounted && !user) {
      setStoredIngredients([]);
      setPreferredIngredients([]);
    }
  }, [isMounted, user, toast]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS, JSON.stringify(recipeRatings));
    }
  }, [recipeRatings, isMounted]);

  const addStoredIngredient = useCallback(async (name: string, location: StorageLocation) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to save ingredients.", variant: "destructive" });
      return;
    }
    const lowerCaseName = name.toLowerCase().trim();
    if (lowerCaseName && !storedIngredients.some(i => i.name.toLowerCase() === lowerCaseName)) {
      const newItem: StoredIngredientItem = { name: name.trim(), location };
      const newPantryIngredients = [...storedIngredients, newItem];
      setIsContextLoading(true);
      try {
        const ingredientsDataRef = getUserIngredientsDataRef(user.uid);
        await setDoc(ingredientsDataRef, { pantryIngredients: newPantryIngredients }, { merge: true });
        setStoredIngredients(newPantryIngredients);
        toast({ title: "Storage Updated", description: `${name} added to your ${location}.` });
      } catch (error) {
        console.error("Error adding stored ingredient to Firestore:", error);
        toast({ title: "Error", description: "Could not save ingredient to the cloud.", variant: "destructive" });
      } finally {
        setIsContextLoading(false);
      }
    } else if (storedIngredients.some(i => i.name.toLowerCase() === lowerCaseName)) {
        toast({ title: "Duplicate Ingredient", description: `${name} is already in your storage.`});
    }
  }, [user, storedIngredients, toast]);

  const removeStoredIngredient = useCallback(async (name: string) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to update ingredients.", variant: "destructive" });
      return;
    }
    const newPantryIngredients = storedIngredients.filter(i => i.name.toLowerCase() !== name.toLowerCase());
    setIsContextLoading(true);
    try {
      const ingredientsDataRef = getUserIngredientsDataRef(user.uid);
      await setDoc(ingredientsDataRef, { pantryIngredients: newPantryIngredients }, { merge: true });
      setStoredIngredients(newPantryIngredients);
      // Also remove from preferred if it was there
      const newPreferred = preferredIngredients.filter(p => p.toLowerCase() !== name.toLowerCase());
      if (newPreferred.length !== preferredIngredients.length) {
        await setDoc(ingredientsDataRef, { favoriteIngredients: newPreferred }, { merge: true });
        setPreferredIngredients(newPreferred);
      }
      toast({ title: "Storage Updated", description: `${name} removed.` });
    } catch (error) {
      console.error("Error removing stored ingredient from Firestore:", error);
      toast({ title: "Error", description: "Could not update storage in the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, storedIngredients, preferredIngredients, toast]);

  const updateIngredientLocation = useCallback(async (name: string, newLocation: StorageLocation) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to update ingredient locations.", variant: "destructive" });
      return;
    }
    const ingredientIndex = storedIngredients.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (ingredientIndex === -1) {
      toast({ title: "Not Found", description: "Ingredient not found in your storage.", variant: "destructive" });
      return;
    }

    const updatedIngredients = [...storedIngredients];
    updatedIngredients[ingredientIndex] = { ...updatedIngredients[ingredientIndex], location: newLocation };
    
    setIsContextLoading(true);
    try {
      const ingredientsDataRef = getUserIngredientsDataRef(user.uid);
      await updateDoc(ingredientsDataRef, { pantryIngredients: updatedIngredients });
      setStoredIngredients(updatedIngredients);
      toast({ title: "Location Updated", description: `${name} moved to ${newLocation}.` });
    } catch (error) {
      console.error("Error updating ingredient location in Firestore:", error);
      toast({ title: "Error", description: "Could not update ingredient location in the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, storedIngredients, toast]);

  const togglePreferredIngredient = useCallback(async (ingredientName: string) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to update favorite ingredients.", variant: "destructive" });
      return;
    }
    const lowerCaseIngredient = ingredientName.toLowerCase().trim();
    let newFavoriteIngredients: string[];
    const isCurrentlyPreferred = preferredIngredients.map(i => i.toLowerCase()).includes(lowerCaseIngredient);

    if (isCurrentlyPreferred) {
      newFavoriteIngredients = preferredIngredients.filter(i => i.toLowerCase() !== lowerCaseIngredient);
    } else {
      newFavoriteIngredients = [...preferredIngredients, ingredientName.trim()];
    }
    
    setIsContextLoading(true);
    try {
      const ingredientsDataRef = getUserIngredientsDataRef(user.uid);
      await setDoc(ingredientsDataRef, { favoriteIngredients: newFavoriteIngredients }, { merge: true });
      setPreferredIngredients(newFavoriteIngredients);
      
      if (newFavoriteIngredients.length > 0) {
        await preSelectIngredients({ ingredients: newFavoriteIngredients });
      }
      toast({ title: "Favorite Ingredients Updated", description: `AI preferences updated based on your favorites.` });

    } catch (error) {
      console.error("Error toggling preferred ingredient or updating AI:", error);
      toast({ title: "Error", description: "Could not update favorite ingredients or AI preferences.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, preferredIngredients, toast]);

  const clearPreferredIngredients = useCallback(async () => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to clear favorite ingredients.", variant: "destructive" });
      return;
    }
    setIsContextLoading(true);
    try {
      const ingredientsDataRef = getUserIngredientsDataRef(user.uid);
      await setDoc(ingredientsDataRef, { favoriteIngredients: [] }, { merge: true });
      setPreferredIngredients([]);
      toast({ title: "Favorites Cleared", description: "All favorite ingredients removed. AI preferences reset."});
    } catch (error) {
      console.error("Error clearing preferred ingredients:", error);
      toast({ title: "Error", description: "Could not clear favorite ingredients in the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, toast]);

  const clearRecommendedRecipes = useCallback(() => {
    setRecommendedRecipes([]);
  }, []);

  const rateRecipe = useCallback((recipeName: string, rating: number) => {
    setRecipeRatings(prev => ({ ...prev, [recipeName]: rating }));
  }, []);

  return (
    <AppContext.Provider value={{
      storedIngredients, addStoredIngredient, removeStoredIngredient, updateIngredientLocation,
      preferredIngredients, togglePreferredIngredient, clearPreferredIngredients,
      recommendedRecipes, setRecommendedRecipes, clearRecommendedRecipes,
      recipeRatings, rateRecipe,
      isContextLoading, setIsContextLoading,
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

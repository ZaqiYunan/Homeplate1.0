
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/lib/types';
import { preSelectIngredients } from '@/ai/flows/pre-select-ingredients-flow';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Ensure app is exported from firebase.ts

const db = getFirestore(app);

interface AppContextType {
  storedIngredients: string[];
  addStoredIngredient: (ingredient: string) => Promise<void>;
  removeStoredIngredient: (ingredient: string) => Promise<void>;
  preferredIngredients: string[];
  togglePreferredIngredient: (ingredient: string) => Promise<void>;
  clearPreferredIngredients: () => Promise<void>;
  recommendedRecipes: Recipe[];
  setRecommendedRecipes: (recipes: Recipe[]) => void;
  clearRecommendedRecipes: () => void;
  recipeRatings: Record<string, number>;
  rateRecipe: (recipeName: string, rating: number) => void;
  isContextLoading: boolean; // Renamed from isLoadingRecipes
  setIsContextLoading: (loading: boolean) => void; // Renamed from setIsLoadingRecipes
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  RECIPE_RATINGS: 'homeplate_recipeRatings',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [storedIngredients, setStoredIngredients] = useState<string[]>([]);
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
        const userIngredientsRef = doc(db, 'userIngredients', user.uid);
        try {
          const docSnap = await getDoc(userIngredientsRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setStoredIngredients(data.pantryIngredients || []);
            setPreferredIngredients(data.favoriteIngredients || []);
          } else {
            setStoredIngredients([]);
            setPreferredIngredients([]);
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
      // User logged out, clear ingredients state
      setStoredIngredients([]);
      setPreferredIngredients([]);
      // Recipe ratings are kept in localStorage, so they persist across sessions unless manually cleared.
    }
  }, [isMounted, user, toast]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS, JSON.stringify(recipeRatings));
    }
  }, [recipeRatings, isMounted]);

  const addStoredIngredient = useCallback(async (ingredient: string) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to save ingredients.", variant: "destructive" });
      return;
    }
    const lowerCaseIngredient = ingredient.toLowerCase().trim();
    if (lowerCaseIngredient && !storedIngredients.map(i => i.toLowerCase()).includes(lowerCaseIngredient)) {
      const newPantryIngredients = [...storedIngredients, ingredient.trim()];
      setIsContextLoading(true);
      try {
        const userIngredientsRef = doc(db, 'userIngredients', user.uid);
        await setDoc(userIngredientsRef, { pantryIngredients: newPantryIngredients }, { merge: true });
        setStoredIngredients(newPantryIngredients);
        toast({ title: "Pantry Updated", description: `${ingredient} added to your pantry.` });
      } catch (error) {
        console.error("Error adding stored ingredient to Firestore:", error);
        toast({ title: "Error", description: "Could not save ingredient to the cloud.", variant: "destructive" });
      } finally {
        setIsContextLoading(false);
      }
    } else if (storedIngredients.map(i => i.toLowerCase()).includes(lowerCaseIngredient)) {
        toast({ title: "Duplicate Ingredient", description: `${ingredient} is already in your pantry.`});
    }
  }, [user, storedIngredients, toast, setIsContextLoading]);

  const removeStoredIngredient = useCallback(async (ingredient: string) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to update ingredients.", variant: "destructive" });
      return;
    }
    const newPantryIngredients = storedIngredients.filter(i => i.toLowerCase() !== ingredient.toLowerCase());
    setIsContextLoading(true);
    try {
      const userIngredientsRef = doc(db, 'userIngredients', user.uid);
      await setDoc(userIngredientsRef, { pantryIngredients: newPantryIngredients }, { merge: true });
      setStoredIngredients(newPantryIngredients);
      toast({ title: "Pantry Updated", description: `${ingredient} removed from your pantry.` });
    } catch (error) {
      console.error("Error removing stored ingredient from Firestore:", error);
      toast({ title: "Error", description: "Could not update pantry in the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, storedIngredients, toast, setIsContextLoading]);

  const togglePreferredIngredient = useCallback(async (ingredient: string) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to update favorite ingredients.", variant: "destructive" });
      return;
    }
    const lowerCaseIngredient = ingredient.toLowerCase().trim();
    let newFavoriteIngredients: string[];
    const isCurrentlyPreferred = preferredIngredients.map(i => i.toLowerCase()).includes(lowerCaseIngredient);

    if (isCurrentlyPreferred) {
      newFavoriteIngredients = preferredIngredients.filter(i => i.toLowerCase() !== lowerCaseIngredient);
    } else {
      newFavoriteIngredients = [...preferredIngredients, ingredient.trim()];
    }
    
    setIsContextLoading(true);
    try {
      const userIngredientsRef = doc(db, 'userIngredients', user.uid);
      await setDoc(userIngredientsRef, { favoriteIngredients: newFavoriteIngredients }, { merge: true });
      setPreferredIngredients(newFavoriteIngredients);
      
      // Call AI to update preferences
      if (newFavoriteIngredients.length > 0) {
        await preSelectIngredients({ ingredients: newFavoriteIngredients });
      }
      // The AI flow itself doesn't return a message for toast, so we provide one here.
      toast({ title: "Favorite Ingredients Updated", description: `AI preferences updated based on your favorites.` });

    } catch (error) {
      console.error("Error toggling preferred ingredient or updating AI:", error);
      toast({ title: "Error", description: "Could not update favorite ingredients or AI preferences.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, preferredIngredients, toast, setIsContextLoading]);

  const clearPreferredIngredients = useCallback(async () => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to clear favorite ingredients.", variant: "destructive" });
      return;
    }
    setIsContextLoading(true);
    try {
      const userIngredientsRef = doc(db, 'userIngredients', user.uid);
      await setDoc(userIngredientsRef, { favoriteIngredients: [] }, { merge: true });
      setPreferredIngredients([]);
      toast({ title: "Favorites Cleared", description: "All favorite ingredients removed. AI preferences reset."});
      // Call preSelectIngredients with empty array if AI needs to be notified of no preferences.
      // await preSelectIngredients({ ingredients: [] }); // Uncomment if AI should be notified of clearing
    } catch (error) {
      console.error("Error clearing preferred ingredients:", error);
      toast({ title: "Error", description: "Could not clear favorite ingredients in the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, toast, setIsContextLoading]);

  const clearRecommendedRecipes = useCallback(() => {
    setRecommendedRecipes([]);
  }, []);

  const rateRecipe = useCallback((recipeName: string, rating: number) => {
    setRecipeRatings(prev => ({ ...prev, [recipeName]: rating }));
  }, []);

  return (
    <AppContext.Provider value={{
      storedIngredients, addStoredIngredient, removeStoredIngredient,
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

    
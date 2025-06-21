
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Recipe, StoredIngredientItem, IngredientCategory, StorageLocation } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { predictExpiry } from "@/ai/flows/predict-expiry-flow";
import { format } from "date-fns";

const db = getFirestore(app);

interface AppContextType {
  storedIngredients: StoredIngredientItem[];
  addStoredIngredient: (item: Omit<StoredIngredientItem, 'id' | 'expiryDate'>) => Promise<boolean>;
  removeStoredIngredient: (id: string) => Promise<void>;
  
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

const getUserStorageCollection = (userId: string) => {
  return collection(db, 'users', userId, 'storage');
};

const getUserFavoritesRef = (userId: string) => {
  return doc(db, 'users', userId, 'preferences', 'favorites');
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

  const fetchUserIngredients = useCallback(async (userId: string) => {
    setIsContextLoading(true);
    const storageCollection = getUserStorageCollection(userId);
    const favoritesRef = getUserFavoritesRef(userId);
    try {
      const [storageSnapshot, favoritesSnap] = await Promise.all([
        getDocs(storageCollection),
        getDoc(favoritesRef)
      ]);
      
      const ingredients = storageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StoredIngredientItem));
      setStoredIngredients(ingredients);

      if (favoritesSnap.exists()) {
        setPreferredIngredients(favoritesSnap.data().ingredients || []);
      } else {
        setPreferredIngredients([]);
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({ title: "Error", description: "Could not load your ingredients from the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isMounted && user) {
      fetchUserIngredients(user.uid);
    } else if (isMounted && !user) {
      setStoredIngredients([]);
      setPreferredIngredients([]);
    }
  }, [isMounted, user, fetchUserIngredients]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS, JSON.stringify(recipeRatings));
    }
  }, [recipeRatings, isMounted]);

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
    const favoritesRef = getUserFavoritesRef(user.uid);
    try {
      await setDoc(favoritesRef, { ingredients: newFavoriteIngredients });
      setPreferredIngredients(newFavoriteIngredients);
      toast({ title: "Favorite Ingredients Updated", description: `AI preferences updated based on your favorites.` });

    } catch (error) {
      console.error("Error toggling preferred ingredient:", error);
      toast({ title: "Error", description: "Could not update favorite ingredients.", variant: "destructive" });
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
    const favoritesRef = getUserFavoritesRef(user.uid);
    try {
      await setDoc(favoritesRef, { ingredients: [] });
      setPreferredIngredients([]);
      toast({ title: "Favorites Cleared", description: "All favorite ingredients removed. AI preferences reset."});
    } catch (error) {
      console.error("Error clearing preferred ingredients:", error);
      toast({ title: "Error", description: "Could not clear favorite ingredients in the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, toast]);

  const addStoredIngredient = useCallback(async (item: Omit<StoredIngredientItem, 'id' | 'expiryDate'>): Promise<boolean> => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to save ingredients.", variant: "destructive" });
      return false;
    }
    setIsContextLoading(true);
    try {
      // Step 1: Call AI to predict expiry date
      const expiryPrediction = await predictExpiry({
        name: item.name,
        category: item.category,
        location: item.location,
        purchaseDate: format(new Date(item.purchaseDate), 'yyyy-MM-dd'),
      });

      // Step 2: Add the new item to Firestore
      const storageCollection = getUserStorageCollection(user.uid);
      const docRef = await addDoc(storageCollection, {
        ...item,
        expiryDate: expiryPrediction.expiryDate,
      });

      // Step 3: Update local state
      const newItem: StoredIngredientItem = {
        id: docRef.id,
        ...item,
        expiryDate: expiryPrediction.expiryDate,
      };
      setStoredIngredients(prev => [...prev, newItem]);
      toast({ title: "Item Added", description: `${item.name} has been added to your storage.` });
      return true;

    } catch (error) {
      console.error("Error adding stored ingredient:", error);
      toast({ title: "Error", description: `Could not save item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
      return false;
    } finally {
      setIsContextLoading(false);
    }
  }, [user, toast]);

  const removeStoredIngredient = useCallback(async (id: string) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to update ingredients.", variant: "destructive" });
      return;
    }
    const itemToRemove = storedIngredients.find(i => i.id === id);
    if (!itemToRemove) return;

    setIsContextLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'storage', id));
      setStoredIngredients(prev => prev.filter(i => i.id !== id));
      
      // Also remove from preferred if it was there
      if (preferredIngredients.map(i => i.toLowerCase()).includes(itemToRemove.name.toLowerCase())) {
        await togglePreferredIngredient(itemToRemove.name);
      }
      
      toast({ title: "Item Removed", description: `${itemToRemove.name} removed from your storage.` });
    } catch (error) {
      console.error("Error removing stored ingredient from Firestore:", error);
      toast({ title: "Error", description: "Could not remove item from the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, storedIngredients, preferredIngredients, toast, togglePreferredIngredient]);

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

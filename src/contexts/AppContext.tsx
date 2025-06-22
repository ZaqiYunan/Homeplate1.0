
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Recipe, StoredIngredientItem, MealLog, UserProfile, NutritionalGoals, NutritionalInfo } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { predictExpiry } from "@/ai/flows/predict-expiry-flow";
import { getNutritionalInfo } from "@/ai/flows/get-nutritional-info-flow";
import { getPersonalizedGoals } from "@/ai/flows/get-personalized-goals-flow";
import { format, isToday, parseISO } from "date-fns";

const db = getFirestore(app);

const DEFAULT_GOALS: NutritionalGoals = {
    calories: 2000,
    protein: 100,
    carbs: 250,
    fat: 80,
};

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

  userProfile: UserProfile;
  nutritionalGoals: NutritionalGoals;
  dailyIntake: NutritionalInfo;
  recentMeals: MealLog[];
  logMeal: (recipe: Recipe) => Promise<void>;
  updateUserProfileAndGoals: (profile: UserProfile) => Promise<void>;
  
  isContextLoading: boolean;
  setIsContextLoading: (loading: boolean) => void;
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  RECIPE_RATINGS: 'homeplate_recipeRatings',
};

const getUserStorageCollection = (userId: string) => collection(db, 'users', userId, 'storage');
const getUserFavoritesRef = (userId: string) => doc(db, 'users', userId, 'preferences', 'favorites');
const getUserProfileRef = (userId: string) => doc(db, 'users', userId, 'preferences', 'profile');
const getUserGoalsRef = (userId: string) => doc(db, 'users', userId, 'preferences', 'goals');
const getUserMealHistoryCollection = (userId: string) => collection(db, 'users', userId, 'mealHistory');


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isContextLoading, setIsContextLoading] = useState<boolean>(true);

  // Core Data
  const [storedIngredients, setStoredIngredients] = useState<StoredIngredientItem[]>([]);
  const [preferredIngredients, setPreferredIngredients] = useState<string[]>([]);
  
  // Recipe Finder Data
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [recipeRatings, setRecipeRatings] = useState<Record<string, number>>({});
  
  // Nutrition Data
  const [userProfile, setUserProfile] = useState<UserProfile>({ height: 0, weight: 0 });
  const [nutritionalGoals, setNutritionalGoals] = useState<NutritionalGoals>(DEFAULT_GOALS);
  const [dailyIntake, setDailyIntake] = useState<NutritionalInfo>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [recentMeals, setRecentMeals] = useState<MealLog[]>([]);
  
  useEffect(() => {
    setIsMounted(true);
    try {
      const ratings = localStorage.getItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS);
      if (ratings) setRecipeRatings(JSON.parse(ratings));
    } catch (error) {
      console.error("Failed to load ratings from localStorage", error);
    }
  }, []);
  
  const calculateDailyIntake = (meals: MealLog[]) => {
    const todayIntake = meals
      .filter(meal => isToday(parseISO(meal.loggedAt)))
      .reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    setDailyIntake(todayIntake);
  };

  const fetchUserData = useCallback(async (userId: string) => {
    setIsContextLoading(true);
    try {
      const storageCollection = getUserStorageCollection(userId);
      const favoritesRef = getUserFavoritesRef(userId);
      const profileRef = getUserProfileRef(userId);
      const goalsRef = getUserGoalsRef(userId);
      const mealHistoryQuery = query(getUserMealHistoryCollection(userId), orderBy('loggedAt', 'desc'));

      const [storageSnap, favoritesSnap, profileSnap, goalsSnap, mealsSnap] = await Promise.all([
        getDocs(storageCollection),
        getDoc(favoritesRef),
        getDoc(profileRef),
        getDoc(goalsRef),
        getDocs(mealHistoryQuery),
      ]);
      
      setStoredIngredients(storageSnap.docs.map(d => ({ id: d.id, ...d.data() } as StoredIngredientItem)));
      setPreferredIngredients(favoritesSnap.exists() ? favoritesSnap.data().ingredients || [] : []);
      setUserProfile(profileSnap.exists() ? profileSnap.data() as UserProfile : { height: 0, weight: 0 });
      setNutritionalGoals(goalsSnap.exists() ? goalsSnap.data() as NutritionalGoals : DEFAULT_GOALS);
      
      const meals = mealsSnap.docs.map(d => ({ id: d.id, ...d.data() } as MealLog));
      setRecentMeals(meals);
      calculateDailyIntake(meals);

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({ title: "Error", description: "Could not load your data from the cloud.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isMounted && user) {
      fetchUserData(user.uid);
    } else if (isMounted && !user) {
      // Clear all user-specific data on logout
      setStoredIngredients([]);
      setPreferredIngredients([]);
      setRecommendedRecipes([]);
      setUserProfile({ height: 0, weight: 0 });
      setNutritionalGoals(DEFAULT_GOALS);
      setDailyIntake({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      setRecentMeals([]);
      setIsContextLoading(false);
    }
  }, [isMounted, user, fetchUserData]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECIPE_RATINGS, JSON.stringify(recipeRatings));
    }
  }, [recipeRatings, isMounted]);

  const addStoredIngredient = useCallback(async (item: Omit<StoredIngredientItem, 'id' | 'expiryDate'>): Promise<boolean> => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to save ingredients.", variant: "destructive" });
      return false;
    }
    setIsContextLoading(true);
    try {
      const expiryPrediction = await predictExpiry({
        name: item.name,
        category: item.category,
        location: item.location,
        purchaseDate: format(new Date(item.purchaseDate), 'yyyy-MM-dd'),
      });
      const docRef = await addDoc(getUserStorageCollection(user.uid), { ...item, expiryDate: expiryPrediction.expiryDate });
      const newItem: StoredIngredientItem = { id: docRef.id, ...item, expiryDate: expiryPrediction.expiryDate };
      setStoredIngredients(prev => [...prev, newItem]);
      toast({ title: "Item Added", description: `${item.name} has been added.` });
      return true;
    } catch (error) {
      console.error("Error adding stored ingredient:", error);
      toast({ title: "Error", description: `Could not save item.`, variant: "destructive" });
      return false;
    } finally {
      setIsContextLoading(false);
    }
  }, [user, toast]);

  const removeStoredIngredient = useCallback(async (id: string) => {
    if (!user) return;
    const itemToRemove = storedIngredients.find(i => i.id === id);
    if (!itemToRemove) return;
    setIsContextLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'storage', id));
      setStoredIngredients(prev => prev.filter(i => i.id !== id));
      toast({ title: "Item Removed", description: `${itemToRemove.name} removed.` });
    } catch (error) {
      console.error("Error removing stored ingredient:", error);
      toast({ title: "Error", description: "Could not remove item.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, storedIngredients, toast]);

  const logMeal = useCallback(async (recipe: Recipe) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to log a meal.", variant: "destructive" });
      return;
    }
    setIsContextLoading(true);
    try {
      const nutritionalInfo = await getNutritionalInfo({ name: recipe.name, ingredients: recipe.ingredients });
      const mealLog: Omit<MealLog, 'id'> = {
        ...recipe,
        ...nutritionalInfo,
        loggedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(getUserMealHistoryCollection(user.uid), mealLog);
      
      const newMeal = { ...mealLog, id: docRef.id };
      const updatedMeals = [newMeal, ...recentMeals];
      setRecentMeals(updatedMeals);
      calculateDailyIntake(updatedMeals);

      toast({ title: "Meal Logged!", description: `${recipe.name} added to your daily intake.` });
    } catch (error) {
      console.error("Error logging meal:", error);
      toast({ title: "Error", description: "Could not log meal.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, toast, recentMeals]);

  const updateUserProfileAndGoals = useCallback(async (profile: UserProfile) => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to update your profile.", variant: "destructive" });
      return;
    }
    setIsContextLoading(true);
    try {
      const goals = await getPersonalizedGoals(profile);
      const profileRef = getUserProfileRef(user.uid);
      const goalsRef = getUserGoalsRef(user.uid);
      
      await Promise.all([
        setDoc(profileRef, profile),
        setDoc(goalsRef, goals)
      ]);

      setUserProfile(profile);
      setNutritionalGoals(goals);
      toast({ title: "Profile Updated!", description: "Your nutritional goals have been personalized." });
    } catch (error) {
      console.error("Error updating profile and goals:", error);
      toast({ title: "Error", description: "Could not update your profile.", variant: "destructive" });
    } finally {
      setIsContextLoading(false);
    }
  }, [user, toast]);

  const togglePreferredIngredient = async (ingredientName: string) => { /* ... implementation from before ... */ };
  const clearPreferredIngredients = async () => { /* ... implementation from before ... */ };
  const clearRecommendedRecipes = useCallback(() => setRecommendedRecipes([]), []);
  const rateRecipe = useCallback((recipeName: string, rating: number) => setRecipeRatings(prev => ({ ...prev, [recipeName]: rating })), []);

  return (
    <AppContext.Provider value={{
      storedIngredients, addStoredIngredient, removeStoredIngredient,
      preferredIngredients, togglePreferredIngredient, clearPreferredIngredients,
      recommendedRecipes, setRecommendedRecipes, clearRecommendedRecipes,
      recipeRatings, rateRecipe,
      userProfile, nutritionalGoals, dailyIntake, recentMeals, logMeal, updateUserProfileAndGoals,
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

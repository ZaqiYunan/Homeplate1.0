
// Corresponds to the RecipeSchema in recommend-recipes.ts
export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
  url?: string;
  missingIngredients?: string[];
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealLog extends Recipe, NutritionalInfo {
  id: string; // Firestore document ID
  loggedAt: string; // ISO String
}

export interface UserProfile {
  height: number; // in cm
  weight: number; // in kg
  age?: number;
  gender?: 'male' | 'female' | 'other';
  role?: 'user' | 'admin';
}

export interface NutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type StorageLocation = 'pantry' | 'refrigerator' | 'freezer';
export type IngredientCategory = 'vegetable' | 'fruit' | 'protein' | 'dairy' | 'grain' | 'spice' | 'other';


// The new, detailed structure for a stored food item.
export interface StoredIngredientItem {
  id: string; // Firestore document ID
  name: string;
  category: IngredientCategory;
  location: StorageLocation;
  quantity: number;
  unit: string; // e.g., 'pcs', 'grams', 'ml'
  purchaseDate: string; // ISO String YYYY-MM-DD
  expiryDate?: string; // ISO String YYYY-MM-DD, from AI
}

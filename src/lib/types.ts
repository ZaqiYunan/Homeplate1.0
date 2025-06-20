
// Corresponds to the RecipeSchema in recommend-recipes.ts
export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
  url?: string;
}

export type StorageLocation = 'refrigerator' | 'pantry' | 'freezer' | 'unknown';

export interface StoredIngredientItem {
  name: string;
  location: StorageLocation;
}

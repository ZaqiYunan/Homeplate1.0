
// Corresponds to the RecipeSchema in recommend-recipes.ts
export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
  url?: string;
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

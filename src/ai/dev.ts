
import { config } from 'dotenv';
config();

import '@/ai/flows/pre-select-ingredients-flow.ts';
import '@/ai/flows/recommend-recipes.ts';
import '@/ai/flows/predict-expiry-flow.ts';
import '@/ai/flows/get-nutritional-info-flow.ts';
import '@/ai/flows/get-personalized-goals-flow.ts';


'use server';
/**
 * @fileOverview An AI flow to predict the expiration date of a food item.
 *
 * - predictExpiry - A function that estimates the expiry date.
 * - PredictExpiryInput - The input type for the predictExpiry function.
 * - PredictExpiryOutput - The return type for the predictExpiry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictExpiryInputSchema = z.object({
  name: z.string().describe('The name of the food ingredient.'),
  category: z.string().describe('The category of the food (e.g., vegetable, protein, dairy).'),
  purchaseDate: z.string().describe('The date the item was purchased or produced, in YYYY-MM-DD format.'),
  location: z.string().describe('Where the item is stored (e.g., refrigerator, pantry, freezer).'),
});
export type PredictExpiryInput = z.infer<typeof PredictExpiryInputSchema>;

const PredictExpiryOutputSchema = z.object({
  expiryDate: z.string().describe('The estimated expiration date in YYYY-MM-DD format. Base your estimate on general food safety knowledge.'),
});
export type PredictExpiryOutput = z.infer<typeof PredictExpiryOutputSchema>;

export async function predictExpiry(input: PredictExpiryInput): Promise<PredictExpiryOutput> {
  return predictExpiryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictExpiryPrompt',
  input: {schema: PredictExpiryInputSchema},
  output: {schema: PredictExpiryOutputSchema},
  prompt: `You are a food safety expert. Based on the following food item details, estimate its expiration date.

  - Food Item: {{{name}}}
  - Category: {{{category}}}
  - Purchase/Production Date: {{{purchaseDate}}}
  - Storage Condition: {{{location}}}

  Consider standard shelf life for this type of item under the specified storage conditions. Provide the estimated expiration date in YYYY-MM-DD format.`,
});

const predictExpiryFlow = ai.defineFlow(
  {
    name: 'predictExpiryFlow',
    inputSchema: PredictExpiryInputSchema,
    outputSchema: PredictExpiryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Database Structure

This application uses **Firestore**, a NoSQL document database. The data is organized in the following hierarchy:

*   **`users`** (Collection)
    *   `{userId}` (Document) - The document ID is the UID from Firebase Authentication.
        *   **`storage`** (Sub-collection)
            *   `{ingredientId}` (Document) - A unique ID for each stored item.
                *   `name`: `string` (e.g., "Chicken Breast")
                *   `category`: `string` (e.g., "protein")
                *   `location`: `string` (e.g., "refrigerator")
                *   `quantity`: `number` (e.g., 2)
                *   `unit`: `string` (e.g., "pcs")
                *   `purchaseDate`: `string` (Format: "YYYY-MM-DD")
                *   `expiryDate`: `string` (Format: "YYYY-MM-DD", predicted by AI)
        *   **`preferences`** (Sub-collection)
            *   `favorites` (Document) - A single document to hold user preferences.
                *   `ingredients`: `string[]` (An array of favorite ingredient names, e.g., ["Garlic", "Onion"])

This structure ensures that all data for a specific user is stored under their unique user ID, providing security and easy data retrieval through Firestore's rules.

# Home Assignment for Technological Focus Role

Dear Candidate,

We appreciate the time and effort you have invested in completing this assignment for the Department of Information and Communication Systems at the Ministry of Defense.

To assess your suitability for the role, please submit the assignment according to the following guidelines:

- **Technology Requirements**: The solution should be based on **Node.js, TypeScript, and ElasticSearch**.
- **Submission Document**: Attach a concise document with:
  - Installation and execution instructions.
  - Relevant GIT links.
- **Submission Method**: The document should be physically mailed back to the Ministry of Defense.

---

## **Assignment Description**

### **Part 1: Loading Data into ElasticSearch**

1. Write code to load a provided CSV file containing street names in Be'er Sheva into ElasticSearch.
2. Create and attach a mapping file for the project.

---

### **Part 2: Search Website Using React**

1. **Create a Search Page**:
   - **Search Field**: An input for entering the search query.
   - **Radio Buttons** for selecting search options:
     - **Free Search** (default): Searches by the primary name field.
     - **Accurate Search**: Finds records containing at least one exact match of a word in any field.
     - **Phrase Search**: Finds records where the full phrase matches exactly in any field.
   - **Search Button**: Executes the search action.
   - **Results Display Area**:
     - Display only **6 fields per result** (you may choose which fields to display).
     - **Delete Button** for each result:
       - Clicking this button should **physically delete the record** from ElasticSearch, ensuring it doesn't appear in future search results.

---

**Best of luck!**

## Client structure
```
client/
├── src/
│   ├── api/
│   │   ├── types.ts           # Shared types with backend
│   │   └── queries.ts         # React Query hooks
│   ├── components/
│   │   ├── SearchBar/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── SearchResults/
│   │   │   ├── index.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── styles.ts
│   │   └── SearchTypeSelector/
│   │       └── index.tsx
│   ├── hooks/
│   │   └── useDebounce.ts     # For search input debouncing
│   ├── pages/
│   │   └── Search/
│   │       ├── index.tsx
│   │       └── styles.ts
│   ├── App.tsx
│   └── main.tsx
```
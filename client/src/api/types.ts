export enum SearchType {
  FREE = 'free',
  ACCURATE = 'accurate',
  PHRASE = 'phrase'
}

export interface SearchParams {
  query: string;
  type?: SearchType;
  indexName?: string;
}

export interface SearchResult {
  id: string;
  [key: string]: any; // For dynamic fields from CSV
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  error: string | null;
}

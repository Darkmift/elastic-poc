import { client } from '../../config/elasticsearch';

export enum SearchType {
  FREE = 'free',
  ACCURATE = 'accurate',
  PHRASE = 'phrase'
}

export interface SearchParams {
  query: string;
  type: SearchType;
  indexName?: string; // Make indexName optional
}

export class SearchService {
  async search({ query, type, indexName = '*' }: SearchParams) { // Default to all indexes
    try {
      let searchQuery;

      switch (type) {
        case SearchType.ACCURATE:
          // Match exact words in any field
          searchQuery = {
            query_string: {
              query: query.split(' ').map(term => `"${term}"`).join(' OR '),
              analyze_wildcard: true
            }
          };
          break;

        case SearchType.PHRASE:
          // Match exact phrase in any field
          searchQuery = {
            multi_match: {
              query,
              type: "phrase" as const,
              fields: ["*"]
            }
          };
          break;

        case SearchType.FREE:
        default:
          // Search across all fields instead of just 'name'
          searchQuery = {
            multi_match: {
              query,
              fields: ["*"],
              type: "best_fields" as const,
              operator: "or" as const
            }
          };
      }

      const result = await client.search({
        index: indexName,
        query: searchQuery,
        size: 100,
        _source: true,
        // Add index name to results
        fields: ['_index'],
      });

      // Extract only first 6 fields from each hit
      const processedHits = result.hits.hits.map(hit => {
        const source = hit._source as Record<string, any>;
        const fields = Object.entries(source).slice(0, 6);
        return {
          id: hit._id,
          index: hit._index, // Include which index the result came from
          ...Object.fromEntries(fields)
        };
      });

      return {
        results: processedHits,
        total: result.hits.total,
        error: null
      };
    } catch (error: any) {
      return {
        results: [],
        total: 0,
        error: `Search failed: ${error.message}`
      };
    }
  }

  async listIndexes() {
    try {
      const response = await client.cat.indices({ format: 'json' });
      const indexes = response
        .filter((index): index is { index: string; 'docs.count': string; 'store.size': string } => 
          typeof index.index === 'string'
        )
        .map(index => ({
          name: index.index,
          docsCount: parseInt(index['docs.count'] || '0', 10),
          size: index['store.size'] || '0b'
        }));

      return {
        results: indexes,
        error: null
      };
    } catch (error: any) {
      return {
        results: [],
        error: `Failed to list indexes: ${error.message}`
      };
    }
  }

  async deleteRecord(indexName: string, recordId: string) {
    try {
      await client.delete({
        index: indexName,
        id: recordId
      });

      return { success: true, error: null };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to delete record: ${error.message}`
      };
    }
  }
}

export const searchService = new SearchService(); 
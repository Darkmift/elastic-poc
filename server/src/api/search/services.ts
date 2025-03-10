import { client } from '../../config/elasticsearch';
import { QueryDslOperator } from '@elastic/elasticsearch/lib/api/types';

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
          searchQuery = {
            query_string: {
              query: query.split(' ').map(term => `"${term}"`).join(' OR '),
              analyze_wildcard: true,
              default_operator: "AND" as QueryDslOperator
            }
          };
          break;

        case SearchType.PHRASE:
          searchQuery = {
            multi_match: {
              query,
              type: "phrase" as const,
              fields: ["*"],
              operator: "and" as QueryDslOperator
            }
          };
          break;

        case SearchType.FREE:
        default:
          searchQuery = {
            bool: {
              should: [
                {
                  multi_match: {
                    query,
                    fields: ["*"],
                    type: "best_fields" as const,
                    operator: "or" as QueryDslOperator,
                    fuzziness: "AUTO"
                  }
                },
                {
                  multi_match: {
                    query,
                    fields: ["*"],
                    type: "phrase_prefix" as const,
                    operator: "or" as QueryDslOperator
                  }
                }
              ]
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
        const fields = Object.entries(source);
        return {
          id: hit._id,
          index: hit._index, // Include which index the result came from
          ...Object.fromEntries(fields)
        };
      });

      return {
        results: processedHits,
        total: typeof result.hits.total === 'number' ? result.hits.total : (result.hits.total?.value ?? 0),
        error: null
      };
    } catch (error: any) {
      console.error('Search error:', error);
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
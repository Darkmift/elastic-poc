import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { SearchParams, SearchResponse } from './types';
import { config } from '../../config';

const api = axios.create({
  baseURL: config.apiUrl,
});

// Define query keys as constants to ensure consistency
export const queryKeys = {
  search: (params?: SearchParams) => ['search', params] as const,
  indexes: ['indexes'] as const,
};

// type SearchQueryKey = ReturnType<typeof queryKeys.search>;

export const useSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: async () => {
      // Ensure we're sending a clean query object
      const searchParams = {
        query: params.query?.trim(),
        type: params.type,
        indexName: params.indexName
      };

      const { data } = await api.get<SearchResponse>('/search/search', {
        params: searchParams
      });
      return data;
    },
    enabled: !!params.query?.trim(), // Only search when there's a non-empty query
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useIndexes = () => {
  return useQuery({
    queryKey: queryKeys.indexes,
    queryFn: async () => {
      const { data } = await api.get('/search/list-indexes');
      return data;
    }
  });
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ indexName, recordId }: { indexName: string; recordId: string }) => {
      const { data } = await api.delete(`/search/${indexName}/records/${recordId}`);
      return data;
    },
    onSuccess: async (_, { recordId }) => {
      // Get all active search queries
      const queries = queryClient.getQueriesData({ queryKey: ['search'] });
      
      // console.log('Active queries before deletion:', queries);
      
      // Remove the deleted item from all search results in cache
      queries.forEach(([queryKey, oldData]: [any, any]) => {
        if (oldData?.results) {
          // console.log('Before filtering query:', queryKey, 'results:', oldData.results);
          
          const newData = {
            ...oldData,
            results: oldData.results.filter((item: any) => item.id !== recordId)
          };
          
          // console.log('After filtering query:', queryKey, 'results:', newData.results);
          // console.log('Removed item with ID:', recordId);
          
          queryClient.setQueryData(queryKey, newData);
        }
      });

      // Log final cache state
      // const updatedQueries = queryClient.getQueriesData({ queryKey: ['search'] });
      // console.log('Active queries after deletion:', updatedQueries);
    }
  });
};

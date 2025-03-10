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
      const { data } = await api.get<SearchResponse>('/search/search', {
        params
      });
      return data;
    },
    enabled: !!params.query, // Only search when there's a query
    refetchOnMount: true, // Always refetch on mount
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
    onSuccess: async (_, variables) => {
      // Directly refetch the specific search query
      await queryClient.refetchQueries({
        queryKey: ['search', { query: '', index: variables.indexName }],
        exact: false,
      });

      // Refetch indexes
      await queryClient.refetchQueries({
        queryKey: ['indexes'],
      });
    }
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { SearchParams, SearchResponse } from './types';
import { config } from '../../config';

const api = axios.create({
  baseURL: config.apiUrl,
});

export const useSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      const { data } = await api.get<SearchResponse>('/search/search', { 
        params 
      });
      return data;
    },
    enabled: !!params.query, // Only search when there's a query
  });
};

export const useIndexes = () => {
  return useQuery({
    queryKey: ['indexes'],
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
    onSuccess: () => {
      // Invalidate search results
      queryClient.invalidateQueries({ queryKey: ['search'] });
    }
  });
};

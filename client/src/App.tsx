import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Modal from './components/Modal';
import { useSearch, useDeleteRecord } from './api/queries';
import { SearchType } from './api/types';

const queryClient = new QueryClient();

function SearchApp() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>(SearchType.FREE);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; recordId: string; indexName: string }>({
    isOpen: false,
    recordId: '',
    indexName: ''
  });
  
  const { data, isLoading, error } = useSearch({
    query,
    type: searchType,
  });

  const deleteRecord = useDeleteRecord();

  const handleDelete = (recordId: string, indexName: string) => {
    setDeleteModal({ isOpen: true, recordId, indexName });
  };

  const confirmDelete = async () => {
    try {
      await deleteRecord.mutateAsync({
        indexName: deleteModal.indexName,
        recordId: deleteModal.recordId
      });
      setDeleteModal({ isOpen: false, recordId: '', indexName: '' });
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Search Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש רחובות..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                dir="rtl"
              />
            </div>
            {/* Search Type Selector */}
            <div className="flex items-center space-x-4" dir="rtl">
              {Object.values(SearchType).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={type}
                    name="searchType"
                    checked={searchType === type}
                    onChange={() => setSearchType(type)}
                    className="text-blue-600"
                  />
                  <label htmlFor={type} className="text-sm text-gray-700 mr-2">
                    {type === 'free' ? 'חופשי' : type === 'accurate' ? 'מדויק' : 'ביטוי'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 rounded-md p-4">
              <p className="text-red-600 text-center">שגיאה בחיפוש</p>
            </div>
          ) : !query ? (
            <div className="border border-gray-200 rounded-md p-4">
              <p className="text-gray-500 text-center">הזן מונח לחיפוש</p>
            </div>
          ) : data?.results.length === 0 ? (
            <div className="border border-gray-200 rounded-md p-4">
              <p className="text-gray-500 text-center">לא נמצאו תוצאות</p>
            </div>
          ) : (
            <div className="grid gap-4 p-4 rounded-lg">
              {data?.results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <button
                      onClick={() => handleDelete(result.id, result.index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      מחק
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200" dir="rtl">
                    {Object.entries(result)
                      .filter(([key]) => key !== 'id' && key !== 'index')
                      .map(([key, value], index, arr) => (
                        <div key={key} className={`grid grid-cols-[120px_1fr] py-2 ${index === 0 ? 'pt-0' : ''} ${index === arr.length - 1 ? 'pb-0' : ''}`}>
                          <div className="text-gray-600 font-medium">{key}:</div>
                          <div className="text-gray-900">{value || '-'}</div>
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, recordId: '', indexName: '' })}
        onConfirm={confirmDelete}
        title="אישור מחיקה"
        message="האם אתה בטוח שברצונך למחוק רשומה זו?"
      />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchApp />
    </QueryClientProvider>
  );
}

export default App;

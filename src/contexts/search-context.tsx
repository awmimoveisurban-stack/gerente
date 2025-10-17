import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  performGlobalSearch: () => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();
  const { isManager: isGerente } = useUnifiedRoles();

  const performGlobalSearch = useCallback(() => {
    if (!searchTerm.trim() || !user) return;

    // Determine which page to navigate to based on user role
    const targetPage = isGerente ? '/todos-leads' : '/leads';
    
    // Navigate to the appropriate leads page with search term
    navigate(targetPage, { 
      state: { searchTerm: searchTerm.trim() } 
    });
  }, [searchTerm, navigate, user, isGerente]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return (
    <SearchContext.Provider value={{
      searchTerm,
      setSearchTerm,
      performGlobalSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}











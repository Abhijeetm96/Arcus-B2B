import React, { useState, useEffect, useRef } from 'react';
import { Search, History, Terminal, X, ArrowRight } from 'lucide-react';

interface GlobalSearchProps {
  onSearch: (query: string, tokens: Record<string, string>) => void;
  placeholder?: string;
  commands?: Array<{ token: string; label: string; action: () => void }>;
  availableFields?: string[]; // e.g. ['status', 'hsn_code', 'gstin']
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onSearch,
  placeholder = 'Search transactions or enter "/" commands...',
  commands = [],
  availableFields = [],
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('arcus_search_history');
      return stored ? JSON.parse(stored).slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    try {
      const stored = localStorage.getItem('arcus_search_history');
      const history = stored ? JSON.parse(stored) : [];
      const updated = [searchQuery, ...history.filter((h: string) => h !== searchQuery)].slice(0, 10);
      localStorage.setItem('arcus_search_history', JSON.stringify(updated));
      setRecentSearches(updated.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse queries like "pipe status:Pending value>1000" into tokens
  const parseQuery = (text: string) => {
    const tokens: Record<string, string> = {};
    let cleanText = text;

    availableFields.forEach((field) => {
      const regex = new RegExp(`\\b${field}:(\\S+)`, 'i');
      const match = cleanText.match(regex);
      if (match) {
        tokens[field] = match[1];
        cleanText = cleanText.replace(regex, '').trim();
      }
    });

    return { cleanText, tokens };
  };

  const handleExecuteSearch = (searchQuery: string) => {
    // If it's a command, execute the mapped action
    if (searchQuery.startsWith('/')) {
      const cmd = commands.find((c) => c.token === searchQuery);
      if (cmd) {
        cmd.action();
        setShowDropdown(false);
        setQuery('');
        return;
      }
    }

    saveToHistory(searchQuery);
    const { cleanText, tokens } = parseQuery(searchQuery);
    onSearch(cleanText, tokens);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecuteSearch(query);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Filter commands and fields based on input
  const filteredCommands = query.startsWith('/')
    ? commands.filter((c) => c.token.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredFields = availableFields.filter((f) =>
    query.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(query.split(' ').pop()?.toLowerCase() || '')
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-lg z-20">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-slate-800 rounded-lg border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all placeholder:text-slate-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch('', {});
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && (recentSearches.length > 0 || filteredCommands.length > 0 || query.startsWith('/')) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {/* Commands Section */}
          {filteredCommands.length > 0 && (
            <div className="border-b border-slate-100 py-1.5">
              <div className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Terminal size={10} /> Commands
              </div>
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.token}
                  onClick={() => handleExecuteSearch(cmd.token)}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 text-left text-xs font-medium text-slate-700"
                >
                  <span>{cmd.token}</span>
                  <span className="text-2xs text-slate-400">{cmd.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Fields Helpers */}
          {!query.startsWith('/') && query.split(' ').pop()?.includes(':') === false && filteredFields.length > 0 && (
            <div className="border-b border-slate-100 py-1.5 bg-slate-50/50">
              <div className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                Filter Helpers
              </div>
              <div className="flex gap-1.5 flex-wrap px-3 py-1">
                {filteredFields.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      const words = query.split(' ');
                      words.pop();
                      const prefix = words.join(' ');
                      setQuery(`${prefix ? prefix + ' ' : ''}${f}:`);
                      inputRef.current?.focus();
                    }}
                    className="text-2xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-all font-medium"
                  >
                    {f}:
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!query.startsWith('/') && recentSearches.length > 0 && (
            <div className="py-1.5">
              <div className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <History size={10} /> Recent Searches
              </div>
              {recentSearches.map((h, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 cursor-pointer group"
                  onClick={() => {
                    setQuery(h);
                    handleExecuteSearch(h);
                  }}
                >
                  <span className="text-xs text-slate-600">{h}</span>
                  <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

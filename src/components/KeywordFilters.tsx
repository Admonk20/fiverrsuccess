import { useState } from 'react';
import { Filter, ArrowUpDown, X } from 'lucide-react';
import type { KeywordData } from '../types';

interface KeywordFiltersProps {
    keywords: KeywordData[];
    onFilterChange: (filtered: KeywordData[]) => void;
}

type SortField = 'relevance' | 'trendingScore' | 'difficulty' | 'ordersInQueue';
type CompetitionFilter = 'all' | 'low' | 'medium' | 'high';

export function KeywordFilters({ keywords, onFilterChange }: KeywordFiltersProps) {
    const [competition, setCompetition] = useState<CompetitionFilter>('all');
    const [sortBy, setSortBy] = useState<SortField>('relevance');
    const [sortAsc, setSortAsc] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = (comp: CompetitionFilter, sort: SortField, asc: boolean) => {
        let filtered = [...keywords];

        // Filter by competition
        if (comp !== 'all') {
            filtered = filtered.filter(k => k.competition === comp);
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal = 0, bVal = 0;
            switch (sort) {
                case 'relevance':
                    aVal = a.relevance || 0;
                    bVal = b.relevance || 0;
                    break;
                case 'trendingScore':
                    aVal = a.trendingScore || 0;
                    bVal = b.trendingScore || 0;
                    break;
                case 'difficulty':
                    aVal = a.difficulty || 0;
                    bVal = b.difficulty || 0;
                    break;
                case 'ordersInQueue':
                    aVal = a.ordersInQueue || 0;
                    bVal = b.ordersInQueue || 0;
                    break;
            }
            return asc ? aVal - bVal : bVal - aVal;
        });

        onFilterChange(filtered);
    };

    const handleCompetitionChange = (comp: CompetitionFilter) => {
        setCompetition(comp);
        applyFilters(comp, sortBy, sortAsc);
    };

    const handleSortChange = (sort: SortField) => {
        setSortBy(sort);
        applyFilters(competition, sort, sortAsc);
    };

    const toggleSortOrder = () => {
        const newAsc = !sortAsc;
        setSortAsc(newAsc);
        applyFilters(competition, sortBy, newAsc);
    };

    const resetFilters = () => {
        setCompetition('all');
        setSortBy('relevance');
        setSortAsc(false);
        onFilterChange(keywords);
    };

    const hasActiveFilters = competition !== 'all' || sortBy !== 'relevance' || sortAsc;

    return (
        <div className="keyword-filters">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle ${hasActiveFilters ? 'active' : ''}`}
            >
                <Filter size={16} />
                Filters
                {hasActiveFilters && <span className="filter-badge">•</span>}
            </button>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Competition</label>
                        <div className="filter-buttons">
                            {(['all', 'low', 'medium', 'high'] as CompetitionFilter[]).map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleCompetitionChange(c)}
                                    className={`filter-btn ${competition === c ? 'active' : ''}`}
                                >
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Sort By</label>
                        <div className="sort-controls">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value as SortField)}
                                className="sort-select"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="trendingScore">Trending</option>
                                <option value="difficulty">Difficulty</option>
                                <option value="ordersInQueue">Orders in Queue</option>
                            </select>
                            <button
                                onClick={toggleSortOrder}
                                className="sort-order-btn"
                                title={sortAsc ? 'Ascending' : 'Descending'}
                            >
                                <ArrowUpDown size={16} />
                                {sortAsc ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button onClick={resetFilters} className="reset-filters">
                            <X size={14} />
                            Reset Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

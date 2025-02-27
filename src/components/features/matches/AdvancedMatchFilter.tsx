// src/components/features/matches/AdvancedMatchFilter.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { QUEUE_TYPES} from "@/lib/constants/gameConstants";

// Define the filter options interface
export interface MatchFilterOptions {
  queueTypes: number[];
  champions: string[];
  result: "all" | "win" | "loss";
  timeRange: "all" | "recent" | "older";
  role: string | null;
}

// Define the match summary data structure
interface MatchSummary {
  queueId: number;
  championName: string;
  win: boolean;
  gameCreation: number;
  teamPosition: string;
}

interface AdvancedMatchFilterProps {
  allMatches: MatchSummary[];
  onFilterChange: (filters: MatchFilterOptions) => void;
}

const AdvancedMatchFilter: React.FC<AdvancedMatchFilterProps> = ({
  allMatches,
  onFilterChange,
}) => {
  // Initialize filter state
  const [filters, setFilters] = useState<MatchFilterOptions>({
    queueTypes: [],
    champions: [],
    result: "all",
    timeRange: "all",
    role: null,
  });

  // Extract unique values from all matches for the filter options
  const filterOptions = useMemo(() => {
    // Map of queue IDs to their names, filtering out undefined entries
    const queueMap = allMatches.reduce((acc, match) => {
      if (QUEUE_TYPES[match.queueId]) {
        acc[match.queueId] = QUEUE_TYPES[match.queueId];
      }
      return acc;
    }, {} as Record<number, string>);

    // Get unique champions
    const champions = Array.from(
      new Set(allMatches.map((match) => match.championName))
    ).sort();

    // Get unique positions (roles) excluding empty values
    const roles = Array.from(
      new Set(
        allMatches
          .map((match) => match.teamPosition)
          .filter((role) => role && role.trim() !== "")
      )
    ).sort();

    return {
      queues: Object.entries(queueMap).map(([id, name]) => ({
        id: parseInt(id),
        name,
      })),
      champions,
      roles,
    };
  }, [allMatches]);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle toggle of queue type filter
  const toggleQueueType = (queueId: number) => {
    setFilters((prev) => {
      if (prev.queueTypes.includes(queueId)) {
        return {
          ...prev,
          queueTypes: prev.queueTypes.filter((id) => id !== queueId),
        };
      } else {
        return { ...prev, queueTypes: [...prev.queueTypes, queueId] };
      }
    });
  };

  // Handle toggle of champion filter
  const toggleChampion = (championName: string) => {
    setFilters((prev) => {
      if (prev.champions.includes(championName)) {
        return {
          ...prev,
          champions: prev.champions.filter((name) => name !== championName),
        };
      } else {
        return { ...prev, champions: [...prev.champions, championName] };
      }
    });
  };

  // Handle change of match result filter
  const handleResultChange = (result: "all" | "win" | "loss") => {
    setFilters((prev) => ({ ...prev, result }));
  };

  // Handle change of time range filter
  const handleTimeRangeChange = (timeRange: "all" | "recent" | "older") => {
    setFilters((prev) => ({ ...prev, timeRange }));
  };

  // Handle change of role filter
  const handleRoleChange = (role: string | null) => {
    setFilters((prev) => ({ ...prev, role }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      queueTypes: [],
      champions: [],
      result: "all",
      timeRange: "all",
      role: null,
    });
  };

  // Calculate how many matches are shown after filtering
  const filteredCount = useMemo(() => {
    return allMatches.filter((match) => {
      // Queue type filter
      if (filters.queueTypes.length > 0 && !filters.queueTypes.includes(match.queueId)) {
        return false;
      }
      
      // Champion filter
      if (filters.champions.length > 0 && !filters.champions.includes(match.championName)) {
        return false;
      }
      
      // Result filter
      if (filters.result === "win" && !match.win) return false;
      if (filters.result === "loss" && match.win) return false;
      
      // Time range filter (14 days = recent)
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      if (filters.timeRange === "recent" && match.gameCreation < twoWeeksAgo) return false;
      if (filters.timeRange === "older" && match.gameCreation >= twoWeeksAgo) return false;
      
      // Role filter
      if (filters.role && match.teamPosition !== filters.role) return false;
      
      return true;
    }).length;
  }, [allMatches, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.queueTypes.length > 0 ||
      filters.champions.length > 0 ||
      filters.result !== "all" ||
      filters.timeRange !== "all" ||
      filters.role !== null
    );
  }, [filters]);

  return (
    <div className="bg-slate-800/70 p-4 rounded-xl mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-300">Filtres avancés</h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Queue Type Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Type de partie</h4>
          <div className="flex flex-wrap gap-2">
            {filterOptions.queues.map((queue) => (
              <button
                key={queue.id}
                onClick={() => toggleQueueType(queue.id)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  filters.queueTypes.includes(queue.id)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                aria-pressed={filters.queueTypes.includes(queue.id)}
              >
                {queue.name}
              </button>
            ))}
          </div>
        </div>

        {/* Champions Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Champions</h4>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {filterOptions.champions.map((champion) => (
              <button
                key={champion}
                onClick={() => toggleChampion(champion)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  filters.champions.includes(champion)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                aria-pressed={filters.champions.includes(champion)}
              >
                {champion}
              </button>
            ))}
          </div>
        </div>

        {/* Result and Time Range Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Résultat</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleResultChange("all")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filters.result === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={filters.result === "all"}
            >
              Tous
            </button>
            <button
              onClick={() => handleResultChange("win")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filters.result === "win"
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={filters.result === "win"}
            >
              Victoires
            </button>
            <button
              onClick={() => handleResultChange("loss")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filters.result === "loss"
                  ? "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={filters.result === "loss"}
            >
              Défaites
            </button>
          </div>

          <h4 className="text-sm font-medium text-slate-300 mt-3">Période</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleTimeRangeChange("all")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filters.timeRange === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={filters.timeRange === "all"}
            >
              Toutes
            </button>
            <button
              onClick={() => handleTimeRangeChange("recent")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filters.timeRange === "recent"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={filters.timeRange === "recent"}
            >
              Récentes (14j)
            </button>
            <button
              onClick={() => handleTimeRangeChange("older")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filters.timeRange === "older"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={filters.timeRange === "older"}
            >
              Plus anciennes
            </button>
          </div>
        </div>

        {/* Roles Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Rôle</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRoleChange(null)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filters.role === null
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              aria-pressed={filters.role === null}
            >
              Tous
            </button>
            {filterOptions.roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  filters.role === role
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                aria-pressed={filters.role === role}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter summary */}
      <div className="mt-4 text-sm text-slate-400">
        Affichage de {filteredCount} sur {allMatches.length} parties
        {hasActiveFilters && " (filtres actifs)"}
      </div>
    </div>
  );
};

export default AdvancedMatchFilter;
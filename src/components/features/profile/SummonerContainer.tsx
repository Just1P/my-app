// src/components/features/profile/EnhancedSummonerContainer.tsx
"use client";

import { useState,} from "react";
import { SummonerPresentation } from "./SummonerPresentation";
import { Summoner, Match, Participant, MatchSummary } from "@/types/riotTypes";
import { enhancedRiotService } from "@/lib/api/riotService";
import { SummonerProfileSkeleton } from "@/components/ui/loading-skeleton";
import AdvancedMatchFilter, { MatchFilterOptions } from "@/components/features/matches/AdvancedMatchFilter";
import { useCallback } from "react";
import { VirtualMatchList } from "../matches/VirtualMatchList";
import ChampionWinRateChart from "@/components/features/champions/ChampionWinRateChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SummonerContainerProps {
  onProfileLoaded?: () => void;
}

export function SummonerContainer({ onProfileLoaded }: SummonerContainerProps) {
  const [gameName, setGameName] = useState<string>("");
  const [tagLine, setTagLine] = useState<string>("");
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Advanced filtering state
  const [filters, setFilters] = useState<MatchFilterOptions>({
    queueTypes: [],
    champions: [],
    result: "all",
    timeRange: "all",
    role: null
  });
  
  // Apply filters to matches
  const filteredMatches = summoner?.matches.filter((match: Match) => {
    // Get player data
    const playerData = match.info.participants.find(
      (p: Participant) => p.puuid === summoner.puuid
    );
    
    if (!playerData) return false;
    
    // Queue type filter
    if (filters.queueTypes.length > 0 && !filters.queueTypes.includes(match.info.queueId)) {
      return false;
    }
    
    // Champion filter
    if (filters.champions.length > 0 && !filters.champions.includes(playerData.championName)) {
      return false;
    }
    
    // Result filter
    if (filters.result === "win" && !playerData.win) return false;
    if (filters.result === "loss" && playerData.win) return false;
    
    // Time range filter (14 days = recent)
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    if (filters.timeRange === "recent" && match.info.gameCreation < twoWeeksAgo) return false;
    if (filters.timeRange === "older" && match.info.gameCreation >= twoWeeksAgo) return false;
    
    // Role filter
    if (filters.role && playerData.teamPosition !== filters.role) return false;
    
    return true;
  }) || [];

  // Handle search with loading state and error handling
  const handleSearch = useCallback(async () => {
    setError("");
    setSummoner(null);
    setSelectedMatch(null);
    setLoading(true);

    if (!gameName || !tagLine) {
      setError("Veuillez entrer un Game Name et un Tag (#EUW, #NA, etc.)");
      setLoading(false);
      return;
    }

    try {
      // Use enhanced service with caching
      const normalizedTag = tagLine.startsWith('#') ? tagLine.substring(1) : tagLine;
      const data = await enhancedRiotService.getSummonerData(gameName, normalizedTag);
      
      if (!data) {
        throw new Error("Joueur introuvable");
      }

      setSummoner(data);
      
      // Notify parent component if needed
      if (onProfileLoaded) {
        onProfileLoaded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des données.");
      console.error(err);
    }

    setLoading(false);
  }, [gameName, tagLine, onProfileLoaded]);
  
  // Function to refresh data
  const handleRefresh = async () => {
    if (!summoner) return;
    
    setRefreshing(true);
    
    try {
      // Clear the cache for this summoner
      enhancedRiotService.clearSummonerCache(summoner.name, summoner.tag);
      
      // Fetch fresh data
      const freshData = await enhancedRiotService.getSummonerData(summoner.name, summoner.tag);
      
      if (freshData) {
        setSummoner(freshData);
      }
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des données:", err);
    }
    
    setRefreshing(false);
  };

  // Function to calculate CS per minute
  const calculateCsPerMin = (totalCs: number, gameDurationInSeconds: number) => {
    const gameDurationInMinutes = gameDurationInSeconds / 60;
    return (totalCs / gameDurationInMinutes).toFixed(1);
  };

  // Function to view match details
  const viewMatchDetails = (match: Match) => {
    setSelectedMatch(match);
    // Scroll to match details
    setTimeout(() => {
      const detailsElement = document.getElementById("match-details");
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Function to close match details
  const closeMatchDetails = () => {
    setSelectedMatch(null);
  };
  
  // Function to handle filter changes
  const handleFilterChange = (newFilters: MatchFilterOptions) => {
    setFilters(newFilters);
  };
  
  // Prepare data for the advanced filter if summoner is loaded
  const filterData: MatchSummary[] = summoner?.matches.map(match => {
    const player = match.info.participants.find(
      (p: Participant) => p.puuid === summoner.puuid
    );
    
    if (!player) return null;
    
    return {
      queueId: match.info.queueId,
      championName: player.championName,
      win: player.win,
      gameCreation: match.info.gameCreation,
      teamPosition: player.teamPosition
    };
  }).filter((item): item is MatchSummary => item !== null) || [];

  return (
    <>
      {loading ? (
        // Show loading skeleton when fetching data
        <SummonerProfileSkeleton />
      ) : summoner ? (
        // Show summoner profile when data is loaded
        <div className="space-y-6">
          {/* Refresh button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-blue-400 border-blue-900/50 hover:bg-blue-900/30"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Rafraîchissement...' : 'Rafraîchir les données'}
            </Button>
          </div>
          
          {/* Advanced filters */}
          <AdvancedMatchFilter 
  allMatches={filterData as MatchSummary[]} 
  onFilterChange={handleFilterChange} 
/>
          
          {/* Main presentation component */}
          <SummonerPresentation
            gameName={gameName}
            setGameName={setGameName}
            tagLine={tagLine}
            setTagLine={setTagLine}
            summoner={summoner}
            error={error}
            loading={loading}
            matchCount={20}
            setMatchCount={() => {}} // Not used with virtual list
            selectedQueue={"Tous"}
            setSelectedQueue={() => {}} // Not used with advanced filters
            selectedMatch={selectedMatch}
            filteredMatches={filteredMatches}
            handleSearch={handleSearch}
            calculateCsPerMin={calculateCsPerMin}
            viewMatchDetails={viewMatchDetails}
            closeMatchDetails={closeMatchDetails}
            
            // Additional props for enhanced features
            championWinRateChart={
              <ChampionWinRateChart 
                matches={summoner.matches} 
                puuid={summoner.puuid}
              />
            }
            virtualMatchList={
              <VirtualMatchList 
                matches={filteredMatches}
                puuid={summoner.puuid}
                calculateCsPerMin={calculateCsPerMin}
                onMatchClick={viewMatchDetails}
              />
            }
          />
        </div>
      ) : (
        // Show search form when no data is loaded
        <div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Game Name (ex: Faker)"
                className="flex-1 px-4 py-2 bg-slate-800/70 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <input
                type="text"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                placeholder="#Tag"
                className="w-28 px-4 py-2 bg-slate-800/70 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 transition-all duration-300 shadow-lg"
              onClick={handleSearch}
              aria-label="Rechercher un invocateur"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Recherche...
                </div>
              ) : (
                "Rechercher"
              )}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-900/50 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </>
  );
}
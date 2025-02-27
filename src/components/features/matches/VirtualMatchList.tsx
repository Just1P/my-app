// src/components/features/matches/VirtualMatchList.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Match, Participant } from "@/types/riotTypes";
import { QUEUE_TYPES } from "@/lib/constants/gameConstants";
import { calculateKDA } from "@/lib/utils/formatters";
import Image from "next/image";

interface VirtualMatchListProps {
  matches: Match[];
  puuid: string;
  calculateCsPerMin: (totalCs: number, gameDurationInSeconds: number) => string;
  onMatchClick: (match: Match) => void;
  initialVisibleCount?: number;
  incrementCount?: number;
}

export const VirtualMatchList: React.FC<VirtualMatchListProps> = ({
  matches,
  puuid,
  calculateCsPerMin,
  onMatchClick,
  initialVisibleCount = 5,
  incrementCount = 5,
}) => {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Callback to handle loading more matches when scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && visibleCount < matches.length) {
        // When the load more element is visible, increase visible count
        setVisibleCount((prev) => Math.min(prev + incrementCount, matches.length));
      }
    },
    [visibleCount, matches.length, incrementCount]
  );

  // Setup intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Reset visible count when matches change
  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [matches, initialVisibleCount]);

  const visibleMatches = matches.slice(0, visibleCount);
  const hasMoreToLoad = visibleCount < matches.length;

  if (matches.length === 0) {
    return (
      <div className="text-center p-6 bg-slate-800/50 rounded-xl">
        <p className="text-slate-400">
          Aucune partie trouvée avec les filtres sélectionnés.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleMatches.map((match: Match) => {
        const playerData = match.info.participants.find(
          (p: Participant) => p.puuid === puuid
        );

        if (!playerData) return null;

        // Calcul des CS par minute
        const csPerMin = calculateCsPerMin(
          playerData.totalMinionsKilled + (playerData.neutralMinionsKilled || 0),
          match.info.gameDuration
        );

        return (
          <div
            key={match.metadata.matchId}
            className={`relative p-4 rounded-xl backdrop-blur-sm shadow-lg border transition-all duration-300 hover:translate-y-1 hover:shadow-xl cursor-pointer ${
              playerData.win
                ? "bg-gradient-to-r from-teal-900/30 to-blue-900/30 border-teal-900"
                : "bg-gradient-to-r from-red-900/30 to-slate-900/30 border-red-900"
            }`}
            onClick={() => onMatchClick(match)}
          >
            <div className="absolute top-0 right-0 m-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  playerData.win
                    ? "bg-teal-500/20 text-teal-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {playerData.win ? "Victoire" : "Défaite"}
              </span>
            </div>

            <div className="flex items-center">
              <div className="relative overflow-hidden rounded-lg w-16 h-16 sm:w-20 sm:h-20 mr-4 flex-shrink-0">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData.championName}_0.jpg`}
                  alt={playerData.championName}
                  className="w-full h-full object-cover"
                  width={200}
                  height={200}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                  <p className="text-xs text-center font-medium text-white truncate">
                    {playerData.championName}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="mb-1 text-xs sm:text-sm text-blue-300 truncate">
                  {QUEUE_TYPES[match.info.queueId] || "Mode inconnu"} •{" "}
                  {Math.floor(match.info.gameDuration / 60)} min •{" "}
                  {new Date(match.info.gameCreation).toLocaleDateString()}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 bg-slate-800/70 px-2 py-1 rounded-md text-sm">
                    <span className="text-green-400 font-bold">
                      {playerData.kills}
                    </span>
                    <span className="text-slate-400">/</span>
                    <span className="text-red-400 font-bold">
                      {playerData.deaths}
                    </span>
                    <span className="text-slate-400">/</span>
                    <span className="text-blue-400 font-bold">
                      {playerData.assists}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-300">
                    KDA:{" "}
                    {calculateKDA(
                      playerData.kills,
                      playerData.deaths,
                      playerData.assists
                    )}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {playerData.totalDamageDealtToChampions > 0 && (
                    <div className="text-xs bg-slate-800/50 px-2 py-1 rounded text-slate-300">
                      Dégâts:{" "}
                      {playerData.totalDamageDealtToChampions.toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs bg-slate-800/50 px-2 py-1 rounded text-purple-300">
                    CS/min: {csPerMin}
                  </div>
                  {playerData.visionScore > 0 && (
                    <div className="text-xs bg-slate-800/50 px-2 py-1 rounded text-teal-300">
                      Vision: {playerData.visionScore}
                    </div>
                  )}
                  {playerData.teamPosition && (
                    <div className="text-xs bg-slate-800/50 px-2 py-1 rounded text-yellow-300">
                      {playerData.teamPosition}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Load more trigger element */}
      {hasMoreToLoad && (
        <div 
          ref={loadMoreRef} 
          className="w-full py-4 flex justify-center"
          role="button"
          aria-label="Charger plus de matchs"
        >
          <div className="animate-pulse flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-blue-300">Chargement...</span>
          </div>
        </div>
      )}
      
      {/* Match count info */}
      <div className="text-center text-xs text-slate-400 mt-2">
        Affichage de {visibleMatches.length} sur {matches.length} parties
      </div>
    </div>
  );
};
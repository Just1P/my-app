// src/components/features/champions/TopChampions.tsx
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Match, Participant } from "@/types/riotTypes";
import { RIOT_IMAGE_URLS } from "@/lib/constants/gameConstants";

interface TopChampionsProps {
  matches: Match[];
  puuid: string;
  limit?: number;
}

interface ChampionStats {
  championName: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  totalDamage: number;
  goldEarned: number;
  cs: number;
  visionScore: number;
}

/**
 * Composant qui affiche les champions les plus joués par le joueur
 * avec leurs statistiques et un filtre par type de partie
 */
const TopChampions: React.FC<TopChampionsProps> = ({
  matches,
  puuid,
  limit = 5,
}) => {
  // État local pour le filtre de type de partie
  const [gameType, setGameType] = useState<string>("Tous");

  // Filtrer les matchs selon le type de partie sélectionné
  const filteredMatches = useMemo(() => {
    return matches.filter((match: Match) => {
      if (gameType === "Tous") return true;
      if (
        gameType === "Ranked" &&
        (match.info.queueId === 420 || match.info.queueId === 440)
      )
        return true;
      if (
        gameType === "Normal" &&
        (match.info.queueId === 400 || match.info.queueId === 430)
      )
        return true;
      return false;
    });
  }, [matches, gameType]);

  // Calculer les statistiques par champion
  const championStats = useMemo(() => {
    const stats: Record<string, ChampionStats> = {};

    filteredMatches.forEach((match: Match) => {
      const player = match.info.participants.find(
        (p: Participant) => p.puuid === puuid
      );

      if (!player) return;

      const {
        championName,
        win,
        kills,
        deaths,
        assists,
        totalDamageDealtToChampions,
        goldEarned,
        totalMinionsKilled,
        neutralMinionsKilled = 0,
        visionScore,
      } = player;

      if (!stats[championName]) {
        stats[championName] = {
          championName,
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          totalDamage: 0,
          goldEarned: 0,
          cs: 0,
          visionScore: 0,
        };
      }

      stats[championName].games += 1;
      stats[championName].wins += win ? 1 : 0;
      stats[championName].kills += kills;
      stats[championName].deaths += deaths;
      stats[championName].assists += assists;
      stats[championName].totalDamage += totalDamageDealtToChampions;
      stats[championName].goldEarned += goldEarned;
      stats[championName].cs += totalMinionsKilled + neutralMinionsKilled;
      stats[championName].visionScore += visionScore;
    });

    return stats;
  }, [filteredMatches, puuid]);

  // Convertir en tableau et trier par nombre de parties jouées
  const championsArray = useMemo(() => {
    return Object.values(championStats)
      .sort((a, b) => b.games - a.games)
      .slice(0, limit);
  }, [championStats, limit]);

  // Message si aucun champion trouvé pour le filtre
  const noChampionsMessage = useMemo(() => {
    return filteredMatches.length === 0
      ? "Aucune partie trouvée pour ce mode de jeu"
      : "Aucun champion trouvé";
  }, [filteredMatches.length]);

  // Calcul du KDA pour un champion
  const calculateKDA = (champion: ChampionStats): string => {
    const kda =
      (champion.kills + champion.assists) / Math.max(1, champion.deaths);
    return kda.toFixed(2);
  };

  // Calcul du KDA formatable pour un champion
  const formatKDA = (champion: ChampionStats): string => {
    return `${(champion.kills / champion.games).toFixed(1)}/${(
      champion.deaths / champion.games
    ).toFixed(1)}/${(champion.assists / champion.games).toFixed(1)}`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">
          Champions les plus joués
        </h3>

        {/* Filtres de type de partie */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {["Tous", "Ranked", "Normal"].map((type) => (
            <button
              key={type}
              onClick={() => setGameType(type)}
              className={`px-3 py-1 text-xs rounded-lg transition-all duration-200 ${
                gameType === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              aria-pressed={gameType === type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {championsArray.length > 0 ? (
        <div className="space-y-3">
          {championsArray.map((champion) => (
            <div
              key={champion.championName}
              className="flex items-center p-2 bg-slate-900/60 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <div className="relative w-12 h-12 mr-3 overflow-hidden rounded-md">
                <Image
                  src={`${RIOT_IMAGE_URLS.CHAMPION}${champion.championName}.png`}
                  alt={champion.championName}
                  className="w-full h-full object-cover"
                  width={64}
                  height={64}
                  priority={false}
                />
                {/* Badge avec nombre de parties */}
                <div className="absolute -bottom-1 -right-1 bg-blue-900 text-blue-200 text-xs rounded-full w-6 h-6 flex items-center justify-center border border-blue-700">
                  {champion.games}
                </div>
              </div>

              <div className="flex-1">
                <div className="font-medium text-sm">
                  {champion.championName}
                </div>

                <div className="flex items-center text-xs space-x-2 mt-1">
                  <span
                    className={`text-${
                      champion.wins / champion.games >= 0.5 ? "green" : "red"
                    }-400`}
                  >
                    {Math.round((champion.wins / champion.games) * 100)}% win
                  </span>

                  <span className="text-slate-300" title="KDA">
                    {formatKDA(champion)} ({calculateKDA(champion)})
                  </span>
                </div>

                {/* Statistiques supplémentaires */}
                <div className="flex items-center text-xs space-x-2 mt-1 text-slate-400">
                  <span title="CS moyen par partie">
                    {Math.round(champion.cs / champion.games)} CS
                  </span>
                  <span title="Vision score moyen">
                    VS: {Math.round(champion.visionScore / champion.games)}
                  </span>
                </div>
              </div>

              {/* Barre de progression du winrate */}
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-400"
                  style={{
                    width: `${(champion.wins / champion.games) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 bg-slate-900/60 rounded-lg text-slate-400">
          {noChampionsMessage}
        </div>
      )}
    </div>
  );
};

export default TopChampions;

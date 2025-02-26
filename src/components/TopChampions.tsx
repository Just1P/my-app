import React, { useState } from "react";
import { Match, Participant } from "../types/riotTypes";

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
}

const TopChampions: React.FC<TopChampionsProps> = ({
  matches,
  puuid,
  limit = 5,
}) => {
  const [gameType, setGameType] = useState<string>("Tous");

  // Filtrer les matchs selon le type de partie sélectionné
  const filteredMatches = matches.filter((match: Match) => {
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

  // Calculer les statistiques par champion
  const championStats: Record<string, ChampionStats> = {};

  filteredMatches.forEach((match: Match) => {
    const player = match.info.participants.find(
      (p: Participant) => p.puuid === puuid
    );

    if (!player) return;

    const { championName, win, kills, deaths, assists } = player;

    if (!championStats[championName]) {
      championStats[championName] = {
        championName,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
    }

    championStats[championName].games += 1;
    championStats[championName].wins += win ? 1 : 0;
    championStats[championName].kills += kills;
    championStats[championName].deaths += deaths;
    championStats[championName].assists += assists;
  });

  // Convertir en tableau et trier par nombre de parties jouées
  const championsArray = Object.values(championStats).sort(
    (a, b) => b.games - a.games
  );

  // Prendre les N champions les plus joués
  const topChampions = championsArray.slice(0, limit);

  // Message si aucun champion trouvé pour le filtre
  const noChampionsMessage =
    filteredMatches.length === 0
      ? "Aucune partie trouvée pour ce mode de jeu"
      : "Aucun champion trouvé";

  return (
    <div>
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">
          Champions les plus joués
        </h3>

        {/* Filtres de type de partie */}
        <div className="flex gap-2 mb-3">
          {["Tous", "Ranked", "Normal"].map((type) => (
            <button
              key={type}
              onClick={() => setGameType(type)}
              className={`px-3 py-1 text-xs rounded-lg transition-all duration-200 ${
                gameType === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {topChampions.length > 0 ? (
        <div className="space-y-3">
          {topChampions.map((champion) => (
            <div
              key={champion.championName}
              className="flex items-center p-2 bg-slate-900/60 rounded-lg"
            >
              <div className="w-12 h-12 mr-3 overflow-hidden rounded-md">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/champion/${champion.championName}.png`}
                  alt={champion.championName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-sm">
                  {champion.championName}
                </div>
                <div className="flex items-center text-xs space-x-2 mt-1">
                  <span className="text-blue-300">
                    {champion.games} partie{champion.games > 1 ? "s" : ""}
                  </span>
                  <span className="text-green-400">
                    {Math.round((champion.wins / champion.games) * 100)}% win
                  </span>
                  <span>
                    {(champion.kills / champion.games).toFixed(1)}/
                    {(champion.deaths / champion.games).toFixed(1)}/
                    {(champion.assists / champion.games).toFixed(1)}
                  </span>
                </div>
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

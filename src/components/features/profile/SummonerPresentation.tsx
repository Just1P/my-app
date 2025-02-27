// src/components/features/profile/SummonerPresentation.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TopChampions from "@/components/features/champions/TopChampions";
import PerformanceCharts from "@/components/features/performance/PerformanceCharts";
import Favorites from "@/components/features/favorites/Favorites";
import ProfileFavoriteButton from "@/components/features/profile/ProfileFavoriteButton";
import MatchDetails from "@/components/features/matches/MatchDetails";
import { Summoner, Match } from "@/types/riotTypes";
import { QUEUE_TYPES } from "@/lib/constants/gameConstants";
import {
  calculateKDA,
} from "@/lib/utils/formatters";

interface SummonerPresentationProps {
  // État du formulaire de recherche
  gameName: string;
  setGameName: (value: string) => void;
  tagLine: string;
  setTagLine: (value: string) => void;

  // Données et état de l'application
  summoner: Summoner | null;
  error: string;
  loading: boolean;
  matchCount: number;
  setMatchCount: React.Dispatch<React.SetStateAction<number>>;
  selectedQueue: string;
  setSelectedQueue: (value: string) => void;
  selectedMatch: Match | null;
  filteredMatches: Match[];

  // Fonctions de rappel
  handleSearch: () => Promise<void>;
  calculateCsPerMin: (totalCs: number, gameDurationInSeconds: number) => string;
  viewMatchDetails: (match: Match) => void;
  closeMatchDetails: () => void;

  championWinRateChart?: React.ReactNode;
  virtualMatchList?: React.ReactNode;
}

export const SummonerPresentation: React.FC<SummonerPresentationProps> = ({
  gameName,
  setGameName,
  tagLine,
  setTagLine,
  summoner,
  error,
  loading,
  matchCount,
  setMatchCount,
  selectedQueue,
  setSelectedQueue,
  selectedMatch,
  filteredMatches,
  handleSearch,
  calculateCsPerMin,
  viewMatchDetails,
  closeMatchDetails,
}) => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white p-4">
      {/* Barre de recherche */}
      <div className="w-full max-w-md p-6 bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl mb-8 border border-blue-900/50">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Game Name (ex: Faker)"
              className="bg-slate-800/70 border-slate-700 focus-visible:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Input
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              placeholder="#Tag"
              className="w-28 bg-slate-800/70 border-slate-700 focus-visible:ring-blue-500"
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

        {/* Message d'erreur */}
        {error && (
          <div
            className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Système de favoris */}
        <div className="mt-4">
          <Favorites
            onSelectPlayer={(name, tag) => {
              setGameName(name);
              setTagLine(tag);
              handleSearch();
            }}
            currentGameName={summoner?.name}
            currentTagLine={summoner?.tag}
            profileIconId={summoner?.profileIconId}
          />
        </div>
      </div>

      {/* Détails du match sélectionné */}
      {selectedMatch && (
        <MatchDetails
          match={selectedMatch}
          summonerPuuid={summoner?.puuid || ""}
          onClose={closeMatchDetails}
          calculateCsPerMin={calculateCsPerMin}
        />
      )}

      {/* Profil du joueur (si disponible) */}
      {summoner && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-blue-900/40 p-6 rounded-2xl shadow-xl w-full max-w-6xl flex flex-col md:flex-row gap-6 animate-fade-in">
          {/* Profil Summoner (côté gauche) */}
          <div className="w-full md:w-1/3 order-1 md:order-none">
            <div className="bg-slate-800/70 p-6 rounded-xl shadow-md flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 blur-md opacity-70"></div>
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/profileicon/${summoner.profileIconId}.png`}
                  alt="Icône d'invocateur"
                  className="relative w-24 h-24 rounded-full border-2 border-blue-400"
                  width={96}
                  height={96}
                />
                {/* Bouton Favoris */}
                {summoner && (
                  <ProfileFavoriteButton
                    gameName={summoner.name}
                    tagLine={summoner.tag}
                    profileIconId={summoner.profileIconId}
                  />
                )}
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                  {summoner.name}
                </h2>
                <p className="text-blue-300 text-sm">#{summoner.tag}</p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-900/40 text-blue-300 text-sm">
                  Niveau {summoner.summonerLevel}
                </div>
              </div>

              {/* Top Champions Section */}
              <div className="mt-8 w-full">
                <TopChampions
                  matches={summoner.matches}
                  puuid={summoner.puuid}
                />
              </div>

              {/* Graphiques de performances */}
              <div className="mt-8 w-full">
                <PerformanceCharts
                  matches={summoner.matches}
                  puuid={summoner.puuid}
                />
              </div>
            </div>
          </div>

          {/* Section Historique des matchs (côté droit) */}
          <div className="w-full md:w-2/3">
            {/* Filtrage par type de partie */}
            <div className="mb-6 flex flex-wrap gap-2 justify-center md:justify-start">
              {["Tous", "Normal Game", "Classée Solo/Duo"].map((queue) => (
                <button
                  key={queue}
                  onClick={() => setSelectedQueue(queue)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                    selectedQueue === queue
                      ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md"
                      : "bg-slate-800/90 text-slate-300 hover:bg-slate-700"
                  }`}
                  aria-pressed={selectedQueue === queue}
                >
                  {queue}
                </button>
              ))}
            </div>

            {/* En-tête de la liste des matchs */}
            <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Historique des matchs
            </h3>

            {/* Liste des matchs */}
            <div className="space-y-4">
              {filteredMatches.length > 0 ? (
                filteredMatches
                  .slice(0, matchCount)
                  .map((match: Match, index: number) => {
                    const playerData = match.info.participants.find(
                      (p) => p.puuid === summoner.puuid
                    );

                    if (!playerData) return null;

                    // Calcul des CS par minute
                    const csPerMin = calculateCsPerMin(
                      playerData.totalMinionsKilled +
                        (playerData.neutralMinionsKilled || 0),
                      match.info.gameDuration
                    );

                    return (
                      <div
                        key={index}
                        className={`relative p-4 rounded-xl backdrop-blur-sm shadow-lg border transition-all duration-300 hover:translate-y-1 hover:shadow-xl cursor-pointer ${
                          playerData.win
                            ? "bg-gradient-to-r from-teal-900/30 to-blue-900/30 border-teal-900"
                            : "bg-gradient-to-r from-red-900/30 to-slate-900/30 border-red-900"
                        }`}
                        onClick={() => viewMatchDetails(match)}
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
                          <div className="relative overflow-hidden rounded-lg w-20 h-20 mr-4">
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

                          <div className="flex-1">
                            <div className="mb-1 text-sm text-blue-300">
                              {QUEUE_TYPES[match.info.queueId] ||
                                "Mode inconnu"}{" "}
                              • {Math.floor(match.info.gameDuration / 60)} min
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 bg-slate-800/70 px-2 py-1 rounded-md">
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

                              <div className="text-sm text-slate-300">
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
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center p-6 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-400">
                    Aucune partie trouvée pour ce mode de jeu.
                  </p>
                </div>
              )}
            </div>

            {/* Bouton pour voir plus de matchs */}
            {summoner.matches.length > matchCount && (
              <button
                onClick={() => setMatchCount((prev) => prev + 5)}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-blue-300 transition-all duration-300"
              >
                Voir plus de matchs
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

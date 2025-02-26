"use client";

import { useState } from "react";
import { searchSummoners, getSummonerData } from "../lib/riotApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TopChampions from "@/components/TopChampions";
import PerformanceCharts from "@/components/PerformanceCharts";
import Favorites from "@/components/Favorites";
import ProfileFavoriteButton from "@/components/ProfileFavoriteButton";
import { Summoner, Match, Participant } from "../types/riotTypes";

export default function Home() {
  const [gameName, setGameName] = useState<string>("");
  const [tagLine, setTagLine] = useState<string>("");
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [matchCount, setMatchCount] = useState<number>(10);
  const [selectedQueue, setSelectedQueue] = useState<string>("Tous");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Mapping des queueId vers des noms de parties lisibles
  const queueTypes: Record<number, string> = {
    420: "Classée Solo/Duo",
    440: "Classée Flex",
    400: "Partie Normale (Draft)",
    430: "Partie Normale (Blind)",
    450: "ARAM",
    900: "URF",
    1010: "URF",
    1020: "One for All",
    700: "Clash",
  };

  // Function pour formater la durée en minutes et secondes
  const formatGameDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Fonction pour formater la date
  const formatGameDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = async () => {
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
      const data = await getSummonerData(gameName, tagLine);
      if (!data) {
        setError("Joueur introuvable");
      } else {
        setSummoner(data);
      }
    } catch (err) {
      setError("Erreur lors de la récupération des données.");
      console.error(err);
    }

    setLoading(false);
  };

  // Filtrage des matchs en fonction du type sélectionné
  const filteredMatches =
    summoner?.matches.filter((match: Match) => {
      if (selectedQueue === "Tous") return true;
      if (
        selectedQueue === "Normal Game" &&
        (match.info.queueId === 400 || match.info.queueId === 430)
      )
        return true;
      if (selectedQueue === "Classée Solo/Duo" && match.info.queueId === 420)
        return true;
      return false;
    }) || [];

  // Fonction pour calculer les CS par minute
  const calculateCsPerMin = (
    totalCs: number,
    gameDurationInSeconds: number
  ) => {
    const gameDurationInMinutes = gameDurationInSeconds / 60;
    return (totalCs / gameDurationInMinutes).toFixed(1);
  };

  // Fonction pour voir les détails d'un match
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

  // Fonction pour fermer les détails du match
  const closeMatchDetails = () => {
    setSelectedMatch(null);
  };

  // Trier les équipes
  const sortTeams = (match: Match) => {
    const blueTeam = match.info.participants.filter((p) => p.teamId === 100);
    const redTeam = match.info.participants.filter((p) => p.teamId === 200);
    return { blueTeam, redTeam };
  };

  // Fonction pour calculer le KDA
  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    return ((kills + assists) / Math.max(1, deaths)).toFixed(2);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white p-4">
      {/* Header avec animation */}
      <div className="w-full max-w-6xl mb-10 mt-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-blue-500 text-center">
          NEXUS STATS
        </h1>
        <p className="text-center text-blue-300 mt-2 opacity-80">
          Explorez vos performances sur les Failles de l'Invocateur
        </p>
      </div>

      {/* Search Bar Redesigned */}
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
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
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

      {/* Match Details Modal */}
      {selectedMatch && (
        <div
          id="match-details"
          className="w-full max-w-6xl mb-8 animate-fade-in"
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-blue-900/40 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                  Détails de la partie
                </h2>
                <div className="flex gap-2 mt-2">
                  <span className="text-sm bg-slate-800/70 px-3 py-1 rounded-md text-blue-300">
                    {queueTypes[selectedMatch.info.queueId] || "Mode inconnu"}
                  </span>
                  <span className="text-sm bg-slate-800/70 px-3 py-1 rounded-md text-blue-300">
                    {formatGameDuration(selectedMatch.info.gameDuration)}
                  </span>
                  <span className="text-sm bg-slate-800/70 px-3 py-1 rounded-md text-blue-300">
                    {formatGameDate(selectedMatch.info.gameCreation)}
                  </span>
                </div>
              </div>
              <Button
                onClick={closeMatchDetails}
                className="bg-slate-800 hover:bg-slate-700"
              >
                Retour
              </Button>
            </div>

            {/* Team Scoreboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blue Team */}
              <div className="bg-blue-900/30 border border-blue-800/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">
                  Équipe Bleue
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-slate-400 border-b border-slate-700">
                        <th className="py-2 text-left">Champion</th>
                        <th className="py-2 text-left">Joueur</th>
                        <th className="py-2 text-center">KDA</th>
                        <th className="py-2 text-center">CS</th>
                        <th className="py-2 text-center">Dégâts</th>
                        <th className="py-2 text-center">Vision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortTeams(selectedMatch).blueTeam.map((player, idx) => {
                        const isCurrentPlayer =
                          player.puuid === summoner?.puuid;
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-slate-800/50 ${
                              isCurrentPlayer ? "bg-blue-800/20" : ""
                            }`}
                          >
                            <td className="py-2">
                              <div className="flex items-center">
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/champion/${player.championName}.png`}
                                  alt={player.championName}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                                <span className="text-xs truncate max-w-16">
                                  {player.championName}
                                </span>
                              </div>
                            </td>
                            <td className="py-2">
                              <span
                                className={`text-xs ${
                                  isCurrentPlayer
                                    ? "font-bold text-blue-300"
                                    : ""
                                }`}
                              >
                                {player.riotIdGameName || player.summonerName}
                              </span>
                            </td>
                            <td className="py-2 text-center">
                              <div className="text-xs">
                                <span className="text-green-400">
                                  {player.kills}
                                </span>
                                <span className="text-slate-400">/</span>
                                <span className="text-red-400">
                                  {player.deaths}
                                </span>
                                <span className="text-slate-400">/</span>
                                <span className="text-blue-400">
                                  {player.assists}
                                </span>
                                <div className="text-slate-400 text-xs">
                                  {calculateKDA(
                                    player.kills,
                                    player.deaths,
                                    player.assists
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 text-center text-xs">
                              {player.totalMinionsKilled +
                                (player.neutralMinionsKilled || 0)}
                              <div className="text-purple-300 text-xs">
                                {calculateCsPerMin(
                                  player.totalMinionsKilled +
                                    (player.neutralMinionsKilled || 0),
                                  selectedMatch.info.gameDuration
                                )}
                              </div>
                            </td>
                            <td className="py-2 text-center text-xs">
                              {player.totalDamageDealtToChampions.toLocaleString()}
                            </td>
                            <td className="py-2 text-center text-xs">
                              {player.visionScore}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Red Team */}
              <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-red-300 mb-3">
                  Équipe Rouge
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-slate-400 border-b border-slate-700">
                        <th className="py-2 text-left">Champion</th>
                        <th className="py-2 text-left">Joueur</th>
                        <th className="py-2 text-center">KDA</th>
                        <th className="py-2 text-center">CS</th>
                        <th className="py-2 text-center">Dégâts</th>
                        <th className="py-2 text-center">Vision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortTeams(selectedMatch).redTeam.map((player, idx) => {
                        const isCurrentPlayer =
                          player.puuid === summoner?.puuid;
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-slate-800/50 ${
                              isCurrentPlayer ? "bg-red-800/20" : ""
                            }`}
                          >
                            <td className="py-2">
                              <div className="flex items-center">
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/champion/${player.championName}.png`}
                                  alt={player.championName}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                                <span className="text-xs truncate max-w-16">
                                  {player.championName}
                                </span>
                              </div>
                            </td>
                            <td className="py-2">
                              <span
                                className={`text-xs ${
                                  isCurrentPlayer
                                    ? "font-bold text-red-300"
                                    : ""
                                }`}
                              >
                                {player.riotIdGameName || player.summonerName}
                              </span>
                            </td>
                            <td className="py-2 text-center">
                              <div className="text-xs">
                                <span className="text-green-400">
                                  {player.kills}
                                </span>
                                <span className="text-slate-400">/</span>
                                <span className="text-red-400">
                                  {player.deaths}
                                </span>
                                <span className="text-slate-400">/</span>
                                <span className="text-blue-400">
                                  {player.assists}
                                </span>
                                <div className="text-slate-400 text-xs">
                                  {calculateKDA(
                                    player.kills,
                                    player.deaths,
                                    player.assists
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 text-center text-xs">
                              {player.totalMinionsKilled +
                                (player.neutralMinionsKilled || 0)}
                              <div className="text-purple-300 text-xs">
                                {calculateCsPerMin(
                                  player.totalMinionsKilled +
                                    (player.neutralMinionsKilled || 0),
                                  selectedMatch.info.gameDuration
                                )}
                              </div>
                            </td>
                            <td className="py-2 text-center text-xs">
                              {player.totalDamageDealtToChampions.toLocaleString()}
                            </td>
                            <td className="py-2 text-center text-xs">
                              {player.visionScore}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Match Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Objectives */}
              <div className="bg-slate-800/40 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  Objectifs
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-blue-300 mb-2">Équipe Bleue</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Barons:</span>
                        <span>
                          {selectedMatch.info.teams.find(
                            (t) => t.teamId === 100
                          )?.objectives.baron.kills || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dragons:</span>
                        <span>
                          {selectedMatch.info.teams.find(
                            (t) => t.teamId === 100
                          )?.objectives.dragon.kills || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tourelles:</span>
                        <span>
                          {selectedMatch.info.teams.find(
                            (t) => t.teamId === 100
                          )?.objectives.tower.kills || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm text-red-300 mb-2">Équipe Rouge</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Barons:</span>
                        <span>
                          {selectedMatch.info.teams.find(
                            (t) => t.teamId === 200
                          )?.objectives.baron.kills || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dragons:</span>
                        <span>
                          {selectedMatch.info.teams.find(
                            (t) => t.teamId === 200
                          )?.objectives.dragon.kills || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tourelles:</span>
                        <span>
                          {selectedMatch.info.teams.find(
                            (t) => t.teamId === 200
                          )?.objectives.tower.kills || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ban phase */}
              <div className="bg-slate-800/40 rounded-xl p-4 col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  Bans
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-blue-300 mb-2">Équipe Bleue</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.info.teams
                        .find((t) => t.teamId === 100)
                        ?.bans.map((ban, index) => (
                          <div
                            key={index}
                            className="bg-slate-700/40 rounded-lg p-1 text-xs"
                          >
                            {ban.championId}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm text-red-300 mb-2">Équipe Rouge</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.info.teams
                        .find((t) => t.teamId === 200)
                        ?.bans.map((ban, index) => (
                          <div
                            key={index}
                            className="bg-slate-700/40 rounded-lg p-1 text-xs"
                          >
                            {ban.championId}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {summoner && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-blue-900/40 p-6 rounded-2xl shadow-xl w-full max-w-6xl flex flex-col md:flex-row gap-6 animate-fade-in">
          {/* Profil Summoner */}
          <div className="w-full md:w-1/3 order-1 md:order-none">
            <div className="bg-slate-800/70 p-6 rounded-xl shadow-md flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 blur-md opacity-70"></div>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/profileicon/${summoner.profileIconId}.png`}
                  alt="Icône d'invocateur"
                  className="relative w-24 h-24 rounded-full border-2 border-blue-400"
                />
                {/* Bouton Favoris */}
                <ProfileFavoriteButton
                  gameName={summoner.name}
                  tagLine={summoner.tag}
                  profileIconId={summoner.profileIconId}
                />
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

          {/* Section Historique des matchs */}
          <div className="w-full md:w-2/3">
            {/* Filtrage */}
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
                >
                  {queue}
                </button>
              ))}
            </div>

            {/* Liste des matchs */}
            <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Historique des matchs
            </h3>

            <div className="space-y-4">
              {filteredMatches
                .slice(0, matchCount)
                .map((match: Match, index: number) => {
                  const playerData = match.info.participants.find(
                    (p: Participant) => p.puuid === summoner.puuid
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
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData.championName}_0.jpg`}
                            alt={playerData.championName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                            <p className="text-xs text-center font-medium text-white truncate">
                              {playerData.championName}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="mb-1 text-sm text-blue-300">
                            {queueTypes[match.info.queueId] || "Mode inconnu"} •{" "}
                            {Math.floor(match.info.gameDuration / 60)} min
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
                              {(
                                (playerData.kills + playerData.assists) /
                                Math.max(1, playerData.deaths)
                              ).toFixed(2)}
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
                })}
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
}

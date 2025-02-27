// src/components/features/matches/MatchDetails.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { QUEUE_TYPES } from "@/lib/constants/gameConstants";
import { Match} from "@/types/riotTypes";
import {
  formatGameDuration,
  formatGameDate,
  calculateKDA,
} from "@/lib/utils/formatters";

interface MatchDetailsProps {
  match: Match;
  summonerPuuid: string;
  onClose: () => void;
  calculateCsPerMin: (totalCs: number, gameDurationInSeconds: number) => string;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({
  match,
  summonerPuuid,
  onClose,
  calculateCsPerMin,
}) => {
  // Trier les équipes
  const sortTeams = (match: Match) => {
    const blueTeam = match.info.participants.filter((p) => p.teamId === 100);
    const redTeam = match.info.participants.filter((p) => p.teamId === 200);
    return { blueTeam, redTeam };
  };

  const { blueTeam, redTeam } = sortTeams(match);

  return (
    <div id="match-details" className="w-full max-w-6xl mb-8 animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-md border border-blue-900/40 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
              Détails de la partie
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="text-sm bg-slate-800/70 px-3 py-1 rounded-md text-blue-300">
                {QUEUE_TYPES[match.info.queueId] || "Mode inconnu"}
              </span>
              <span className="text-sm bg-slate-800/70 px-3 py-1 rounded-md text-blue-300">
                {formatGameDuration(match.info.gameDuration)}
              </span>
              <span className="text-sm bg-slate-800/70 px-3 py-1 rounded-md text-blue-300">
                {formatGameDate(match.info.gameCreation)}
              </span>
            </div>
          </div>
          <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-700">
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
                  {blueTeam.map((player, idx) => {
                    const isCurrentPlayer = player.puuid === summonerPuuid;
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-slate-800/50 ${
                          isCurrentPlayer ? "bg-blue-800/20" : ""
                        }`}
                      >
                        <td className="py-2">
                          <div className="flex items-center">
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/champion/${player.championName}.png`}
                              alt={player.championName}
                              className="w-8 h-8 rounded-full mr-2"
                              width={64}
                              height={64}
                            />
                            <span className="text-xs truncate max-w-16">
                              {player.championName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-xs ${
                              isCurrentPlayer ? "font-bold text-blue-300" : ""
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
                              match.info.gameDuration
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
                  {redTeam.map((player, idx) => {
                    const isCurrentPlayer = player.puuid === summonerPuuid;
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-slate-800/50 ${
                          isCurrentPlayer ? "bg-red-800/20" : ""
                        }`}
                      >
                        <td className="py-2">
                          <div className="flex items-center">
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/champion/${player.championName}.png`}
                              alt={player.championName}
                              className="w-8 h-8 rounded-full mr-2"
                              width={64}
                              height={64}
                            />
                            <span className="text-xs truncate max-w-16">
                              {player.championName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-xs ${
                              isCurrentPlayer ? "font-bold text-red-300" : ""
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
                              match.info.gameDuration
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
                      {match.info.teams.find((t) => t.teamId === 100)
                        ?.objectives.baron.kills || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dragons:</span>
                    <span>
                      {match.info.teams.find((t) => t.teamId === 100)
                        ?.objectives.dragon.kills || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tourelles:</span>
                    <span>
                      {match.info.teams.find((t) => t.teamId === 100)
                        ?.objectives.tower.kills || 0}
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
                      {match.info.teams.find((t) => t.teamId === 200)
                        ?.objectives.baron.kills || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dragons:</span>
                    <span>
                      {match.info.teams.find((t) => t.teamId === 200)
                        ?.objectives.dragon.kills || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tourelles:</span>
                    <span>
                      {match.info.teams.find((t) => t.teamId === 200)
                        ?.objectives.tower.kills || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ban phase */}
          <div className="bg-slate-800/40 rounded-xl p-4 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Bans</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-blue-300 mb-2">Équipe Bleue</h4>
                <div className="flex flex-wrap gap-2">
                  {match.info.teams
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
                  {match.info.teams
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
  );
};

export default MatchDetails;

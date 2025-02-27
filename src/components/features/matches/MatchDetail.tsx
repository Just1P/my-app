// src/components/features/matches/MatchDetails.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { QUEUE_TYPES } from "@/lib/constants/gameConstants";
import { Match, Participant } from "@/types/riotTypes";
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
            {/* Tableau d'équipe bleue... */}
          </div>

          {/* Red Team */}
          <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-3">
              Équipe Rouge
            </h3>
            {/* Tableau d'équipe rouge... */}
          </div>
        </div>

        {/* Match Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Objectifs et statistiques... */}
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;

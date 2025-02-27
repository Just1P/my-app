// src/components/features/champions/ChampionWinRateChart.tsx
"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Match, Participant } from "@/types/riotTypes";
import { CHART_COLORS } from "@/lib/constants/gameConstants";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface ChampionWinRateChartProps {
  matches: Match[];
  puuid: string;
  minGames?: number;
}

interface ChampionStats {
  name: string;
  games: number;
  wins: number;
  winRate: number;
}

const ChampionWinRateChart: React.FC<ChampionWinRateChartProps> = ({
  matches,
  puuid,
  minGames = 3,
}) => {
  // Process match data to calculate champion statistics
  const championStats = useMemo(() => {
    // Initialize a map to track stats for each champion
    const statsMap: Record<string, ChampionStats> = {};

    // Process each match to gather statistics
    matches.forEach((match) => {
      // Find the player in the match
      const player = match.info.participants.find(
        (p: Participant) => p.puuid === puuid
      );

      if (!player) return;

      const { championName, win } = player;

      // Initialize champion stats if first encounter
      if (!statsMap[championName]) {
        statsMap[championName] = {
          name: championName,
          games: 0,
          wins: 0,
          winRate: 0,
        };
      }

      // Update champion stats
      statsMap[championName].games += 1;
      if (win) {
        statsMap[championName].wins += 1;
      }
    });

    // Calculate win rates and filter champions with enough games
    return Object.values(statsMap)
      .map((champion) => ({
        ...champion,
        winRate: Math.round((champion.wins / champion.games) * 100),
      }))
      .filter((champion) => champion.games >= minGames)
      .sort((a, b) => b.winRate - a.winRate); // Sort by win rate (highest first)
  }, [matches, puuid, minGames]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    // Take top champions (maximum 10 for readability)
    return championStats.slice(0, 10);
  }, [championStats]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ 
    active, 
    payload 
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChampionStats;
      return (
        <div className="bg-slate-800 p-3 rounded-md border border-slate-700 shadow-lg">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-blue-300">
            Win Rate: <span className="font-bold">{data.winRate}%</span>
          </p>
          <p className="text-slate-300">
            {data.wins} victoires / {data.games} parties
          </p>
        </div>
      );
    }
    return null;
  };

  // If no champion has enough games, show a message
  if (chartData.length === 0) {
    return (
      <div className="bg-slate-800/70 p-4 rounded-xl mb-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">
          Win Rate par Champion
        </h3>
        <div className="text-center p-4 bg-slate-900/60 rounded-lg text-slate-400">
          Pas assez de données. Jouez au moins {minGames} parties avec un
          champion pour voir les statistiques.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/70 p-4 rounded-xl mb-6">
      <h3 className="text-lg font-semibold text-blue-300 mb-4">
        Win Rate par Champion
        <span className="ml-2 text-sm font-normal text-slate-400">
          (minimum {minGames} parties)
        </span>
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 5, bottom: 70 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            stroke="#94a3b8"
          />
          <YAxis
            domain={[0, 100]}
            label={{
              value: "Win Rate (%)",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
            }}
            stroke="#94a3b8"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={() => "Win Rate (%)"}
          />
          <Bar dataKey="winRate" name="Win Rate (%)">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.winRate >= 50 ? CHART_COLORS.win : CHART_COLORS.loss}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-green-400 mb-2">
            Meilleur Champion
          </h4>
          {chartData.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-bold text-white">{chartData[0].name}</span>
                <span className="text-sm text-slate-300">
                  {chartData[0].wins} victoires / {chartData[0].games} parties
                </span>
              </div>
              <div
                className={`text-xl font-bold ${
                  chartData[0].winRate >= 60
                    ? "text-green-400"
                    : chartData[0].winRate >= 50
                    ? "text-blue-400"
                    : "text-yellow-400"
                }`}
              >
                {chartData[0].winRate}%
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-400 mb-2">
            Win Rate Moyen
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Sur tous les champions joués</span>
            <span className="text-xl font-bold text-blue-400">
              {Math.round(
                (championStats.reduce(
                  (total, champion) => total + champion.wins,
                  0
                ) /
                  championStats.reduce(
                    (total, champion) => total + champion.games,
                    0
                  )) *
                  100
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionWinRateChart;
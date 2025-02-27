// src/components/features/performance/PerformanceCharts.tsx
"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ChartDataPoint, Match, Participant } from "@/types/riotTypes";
import {
  CHART_COLORS,
  KDA_LEVELS,
  CS_PER_MIN_THRESHOLDS,
  VISION_SCORE_LEVELS,
} from "@/lib/constants/gameConstants";
import { calculateKDA } from "@/lib/utils/formatters";

interface PerformanceChartsProps {
  matches: Match[];
  puuid: string;
}

/**
 * Composant qui affiche les graphiques de performance du joueur
 * basés sur son historique de matchs classés
 */
const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  matches,
  puuid,
}) => {
  // Convertir les données des matchs en format adapté aux graphiques
  const chartData = useMemo(() => {
    if (!matches || !matches.length) return [];

    // Filtrer pour ne garder que les matchs classés (queueId 420 pour solo/duo, 440 pour flex)
    const rankedMatches = matches.filter(
      (match) => match.info.queueId === 420 || match.info.queueId === 440
    );

    if (rankedMatches.length === 0) {
      return []; // Retourner un tableau vide si aucun match classé
    }

    // Trier les matchs par date (du plus ancien au plus récent)
    const sortedMatches = [...rankedMatches].sort(
      (a, b) => a.info.gameCreation - b.info.gameCreation
    );

    return sortedMatches
      .map((match, index) => {
        // Trouver les données du joueur
        const playerData = match.info.participants.find(
          (p: Participant) => p.puuid === puuid
        );

        if (!playerData) return null;

        // Calculer les statistiques importantes
        const totalCs =
          playerData.totalMinionsKilled +
          (playerData.neutralMinionsKilled || 0);
        const gameDurationMinutes = match.info.gameDuration / 60;
        const csPerMinute = Number((totalCs / gameDurationMinutes).toFixed(1));

        const kdaValue = playerData.deaths
          ? (playerData.kills + playerData.assists) / playerData.deaths
          : 10; // KDA parfait plafonné à 10 pour l'affichage

        // Calculer le pourcentage de dégâts du joueur dans son équipe
        const damageShare = (() => {
          // Calculer le dégât total de l'équipe
          const teamId = playerData.teamId;
          const teamMembers = match.info.participants.filter(
            (p) => p.teamId === teamId
          );
          const teamTotalDamage = teamMembers.reduce(
            (sum, player) => sum + player.totalDamageDealtToChampions,
            0
          );
          // Calculer le pourcentage de dégâts du joueur
          return teamTotalDamage
            ? Number(
                (
                  (playerData.totalDamageDealtToChampions / teamTotalDamage) *
                  100
                ).toFixed(1)
              )
            : 0;
        })();

        // Simplifier le nom du champion s'il est trop long pour l'affichage
        const championName =
          playerData.championName.length > 8
            ? `${playerData.championName.substring(0, 7)}...`
            : playerData.championName;

        return {
          gameNumber: index + 1,
          championName,
          kda: Number(kdaValue.toFixed(2)),
          csPerMinute,
          visionScore: playerData.visionScore,
          damageShare,
          win: playerData.win ? 1 : 0, // 1 pour victoire, 0 pour défaite
          gameMode: match.info.queueId,
          date: new Date(match.info.gameCreation).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
          }),
          kills: playerData.kills,
          deaths: playerData.deaths,
          assists: playerData.assists,
          timestamp: match.info.gameCreation,
        };
      })
      .filter(Boolean) as ChartDataPoint[];
  }, [matches, puuid]);

  // Calculer les moyennes mobiles pour chaque statistique (5 dernières parties)
  const movingAverages = useMemo(() => {
    return chartData
      .map((entry, index, array) => {
        if (index < 4) return entry; // Pas assez de données pour une moyenne mobile
        if (!entry) return null; // Protection contre les valeurs nulles

        const lastFiveGames = array.slice(index - 4, index + 1);
        const validGames = lastFiveGames.filter(
          (game): game is ChartDataPoint => game !== null
        );
        const gameCount = validGames.length || 1; // Éviter division par zéro

        const kdaAvg =
          validGames.reduce((sum, game) => sum + (game?.kda || 0), 0) /
          gameCount;
        const csAvg =
          validGames.reduce((sum, game) => sum + (game?.csPerMinute || 0), 0) /
          gameCount;
        const visionAvg =
          validGames.reduce((sum, game) => sum + (game?.visionScore || 0), 0) /
          gameCount;

        return {
          ...entry,
          kdaAvg: Number(kdaAvg.toFixed(2)),
          csAvg: Number(csAvg.toFixed(1)),
          visionAvg: Number(visionAvg.toFixed(1)),
        };
      })
      .filter(Boolean) as ChartDataPoint[];
  }, [chartData]);

  // Calculer les tendances
  const getPerformanceTrend = (
    data: ChartDataPoint[],
    key: keyof ChartDataPoint
  ): "up" | "down" | "stable" => {
    if (data.length < 5) return "stable";

    const recentGames = data.slice(-5);
    const olderGames = data.slice(-10, -5);

    if (recentGames.length >= 3 && olderGames.length >= 3) {
      const recentAvg =
        recentGames.reduce((acc, game) => {
          const value = game && game[key] !== undefined ? Number(game[key]) : 0;
          return acc + value;
        }, 0) / recentGames.length;

      const olderAvg =
        olderGames.reduce((acc, game) => {
          const value = game && game[key] !== undefined ? Number(game[key]) : 0;
          return acc + value;
        }, 0) / olderGames.length;

      if (olderAvg === 0) return "stable"; // Éviter division par zéro

      const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

      if (percentChange > 10) return "up";
      if (percentChange < -10) return "down";
    }

    return "stable";
  };

  // Obtenir les tendances pour chaque statistique
  const kdaTrend = useMemo(
    () => getPerformanceTrend(chartData, "kda"),
    [chartData]
  );
  const csTrend = useMemo(
    () => getPerformanceTrend(chartData, "csPerMinute"),
    [chartData]
  );
  const visionTrend = useMemo(
    () => getPerformanceTrend(chartData, "visionScore"),
    [chartData]
  );

  // Calculer les moyennes globales
  const averages = useMemo(() => {
    if (chartData.length === 0) return { kda: 0, cs: 0, vision: 0, winRate: 0 };

    return {
      kda: Number(
        (
          chartData.reduce((sum, entry) => sum + entry.kda, 0) /
          chartData.length
        ).toFixed(2)
      ),
      cs: Number(
        (
          chartData.reduce((sum, entry) => sum + entry.csPerMinute, 0) /
          chartData.length
        ).toFixed(1)
      ),
      vision: Math.round(
        chartData.reduce((sum, entry) => sum + entry.visionScore, 0) /
          chartData.length
      ),
      winRate: Number(
        (
          (chartData.filter((entry) => entry.win).length / chartData.length) *
          100
        ).toFixed(1)
      ),
    };
  }, [chartData]);

  // Formatter personnalisé pour le tooltip
  const customTooltipFormatter = (value: any, name: string) => {
    switch (name) {
      case "kda":
        return [
          Number(value) >= 20 ? "Perfect" : Number(value).toFixed(2),
          "KDA",
        ];
      case "kdaAvg":
        return [Number(value).toFixed(2), "Moyenne (5 derniers)"];
      case "csPerMinute":
        return [Number(value).toFixed(1), "CS/min"];
      case "csAvg":
        return [Number(value).toFixed(1), "Moyenne (5 derniers)"];
      case "visionScore":
        return [Number(value).toFixed(0), "Vision Score"];
      case "visionAvg":
        return [Number(value).toFixed(1), "Moyenne (5 derniers)"];
      case "damageShare":
        return [`${Number(value).toFixed(1)}%`, "Part des dégâts"];
      default:
        return [value, name];
    }
  };

  // Si aucune donnée disponible, afficher un message
  if (!chartData.length) {
    return (
      <div className="w-full mt-6">
        <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Évolution des performances
          <span className="ml-2 text-sm font-normal text-blue-400">
            (parties classées uniquement)
          </span>
        </h3>
        <div className="p-6 bg-slate-800/50 rounded-xl text-center">
          <div className="text-blue-300 mb-2">
            Aucune partie classée trouvée
          </div>
          <p className="text-slate-400 text-sm">
            Les statistiques de performance sont calculées uniquement à partir
            des parties classées (Solo/Duo et Flex). Jouez quelques parties
            classées pour voir vos statistiques apparaître ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      <h3 className="text-xl font-bold text-blue-300 mb-6 flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Évolution des performances
        <span className="ml-2 text-sm font-normal text-blue-400">
          (parties classées uniquement)
        </span>
      </h3>

      {/* Cards de résumé des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* KDA Card */}
        <StatCard
          title="KDA Moyen"
          value={averages.kda.toString()}
          trend={kdaTrend}
          level={getStatLevel(averages.kda, KDA_LEVELS)}
        />

        {/* CS Card */}
        <StatCard
          title="CS/Min Moyen"
          value={averages.cs.toString()}
          trend={csTrend}
          level={getStatLevel(averages.cs, CS_PER_MIN_THRESHOLDS)}
        />

        {/* Vision Card */}
        <StatCard
          title="Vision Score Moyen"
          value={averages.vision.toString()}
          trend={visionTrend}
          level={getStatLevel(averages.vision, VISION_SCORE_LEVELS)}
        />
      </div>

      {/* KDA Chart */}
      <ChartContainer title="KDA par match">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={movingAverages}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="gameNumber"
              stroke="#94a3b8"
              label={{
                value: "Match #",
                position: "insideBottomRight",
                offset: -5,
                fill: "#94a3b8",
              }}
            />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "#3b82f6",
                borderRadius: "0.5rem",
                color: "white",
              }}
              formatter={customTooltipFormatter}
              labelFormatter={(value) => `Match #${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Line
              type="monotone"
              dataKey="kda"
              name="KDA"
              stroke={CHART_COLORS.kda}
              activeDot={{ r: 6, fill: CHART_COLORS.kda }}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS.kda }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="kdaAvg"
              name="Moyenne mobile"
              stroke={CHART_COLORS.average}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* CS Chart */}
      <ChartContainer title="CS par minute">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={movingAverages}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="gameNumber"
              stroke="#94a3b8"
              label={{
                value: "Match #",
                position: "insideBottomRight",
                offset: -5,
                fill: "#94a3b8",
              }}
            />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "#f59e0b",
                borderRadius: "0.5rem",
                color: "white",
              }}
              formatter={customTooltipFormatter}
              labelFormatter={(value) => `Match #${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Line
              type="monotone"
              dataKey="csPerMinute"
              name="CS/min"
              stroke={CHART_COLORS.cs}
              activeDot={{ r: 6, fill: CHART_COLORS.cs }}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS.cs }}
            />
            <Line
              type="monotone"
              dataKey="csAvg"
              name="Moyenne mobile"
              stroke={CHART_COLORS.average}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Vision Score Chart */}
      <ChartContainer title="Vision Score">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={movingAverages}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="gameNumber"
              stroke="#94a3b8"
              label={{
                value: "Match #",
                position: "insideBottomRight",
                offset: -5,
                fill: "#94a3b8",
              }}
            />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "#3b82f6",
                borderRadius: "0.5rem",
                color: "white",
              }}
              formatter={customTooltipFormatter}
              labelFormatter={(value) => `Match #${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Line
              type="monotone"
              dataKey="visionScore"
              name="Vision Score"
              stroke={CHART_COLORS.vision}
              activeDot={{ r: 6, fill: CHART_COLORS.vision }}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS.vision }}
            />
            <Line
              type="monotone"
              dataKey="visionAvg"
              name="Moyenne mobile"
              stroke={CHART_COLORS.average}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Damage Share Chart */}
      <ChartContainer title="Part des dégâts dans l'équipe (%)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="championName"
              stroke="#94a3b8"
              label={{
                value: "Champion",
                position: "insideBottomRight",
                offset: -5,
                fill: "#94a3b8",
              }}
            />
            <YAxis
              stroke="#94a3b8"
              domain={[0, 100]}
              label={{
                value: "%",
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "#ec4899",
                borderRadius: "0.5rem",
                color: "white",
              }}
              formatter={customTooltipFormatter}
              labelFormatter={(value) => `${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Bar
              dataKey="damageShare"
              name="Part des dégâts"
              fill={CHART_COLORS.damage}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Win Rate Chart */}
      <ChartContainer title="Résultats récents">
        <div className="flex flex-col items-center">
          <div className="flex justify-center gap-2 mb-4">
            {chartData.slice(-10).map((entry, index) => (
              <div
                key={index}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  entry?.win
                    ? "bg-green-500/20 text-green-300 border border-green-500/50"
                    : "bg-red-500/20 text-red-300 border border-red-500/50"
                }`}
                title={`${entry?.championName || "Champion"}: ${
                  entry?.kills || 0
                }/${entry?.deaths || 0}/${entry?.assists || 0}`}
              >
                {entry?.win ? "V" : "D"}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-lg font-bold">
              Victoires: {chartData.filter((entry) => entry?.win).length} /{" "}
              {chartData.length} ({averages.winRate}
              %)
            </span>
          </div>
        </div>
      </ChartContainer>
    </div>
  );
};

// Composant réutilisable pour les cards de statistiques
interface StatCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "stable";
  level: "poor" | "average" | "good" | "excellent";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, level }) => {
  const getLevelColor = () => {
    switch (level) {
      case "poor":
        return "text-red-400";
      case "average":
        return "text-yellow-400";
      case "good":
        return "text-green-400";
      case "excellent":
        return "text-blue-400";
      default:
        return "text-white";
    }
  };

  return (
    <div
      className={`p-4 rounded-xl ${
        trend === "up"
          ? "bg-green-900/30 border-green-700/50"
          : trend === "down"
          ? "bg-red-900/30 border-red-700/50"
          : "bg-slate-800/70"
      } border`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{title}</span>
        {trend === "up" ? (
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        ) : trend === "down" ? (
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
          </svg>
        )}
      </div>
      <div className="mt-2">
        <span className={`text-2xl font-bold ${getLevelColor()}`}>{value}</span>
      </div>
    </div>
  );
};

// Composant réutilisable pour les conteneurs de graphiques
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-xl mb-6">
      <h4 className="text-md font-semibold text-blue-300 mb-4">{title}</h4>
      {children}
    </div>
  );
};

// Fonction pour déterminer le niveau d'une statistique
function getStatLevel<T extends Record<string, number>>(
  value: number,
  thresholds: T
): "poor" | "average" | "good" | "excellent" {
  const levels = Object.values(thresholds).sort((a, b) => a - b);
  if (value < levels[0]) return "poor";
  if (value < levels[1]) return "average";
  if (value < levels[2]) return "good";
  return "excellent";
}

export default PerformanceCharts;

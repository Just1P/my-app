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
import { ChartDataPoint, Match, Participant } from "../types/riotTypes";

interface PerformanceChartsProps {
  matches: Match[];
  puuid: string;
}

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
        const csPerMinute = (
          (playerData.totalMinionsKilled +
            (playerData.neutralMinionsKilled || 0)) /
          (match.info.gameDuration / 60)
        ).toFixed(1);

        const kda = playerData.deaths
          ? (
              (playerData.kills + playerData.assists) /
              playerData.deaths
            ).toFixed(2)
          : `${playerData.kills + playerData.assists}.0`; // Format spécial pour KDA parfait

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
            ? (
                (playerData.totalDamageDealtToChampions / teamTotalDamage) *
                100
              ).toFixed(1)
            : "0";
        })();

        // Simplifier le nom du champion s'il est trop long pour l'affichage
        const championName =
          playerData.championName.length > 8
            ? `${playerData.championName.substring(0, 7)}...`
            : playerData.championName;

        return {
          gameNumber: index + 1,
          championName,
          kda: typeof kda === "string" ? 10 : parseFloat(kda), // Si KDA parfait (pas de morts), afficher 10
          csPerMinute: parseFloat(csPerMinute),
          visionScore: playerData.visionScore,
          damageShare: parseFloat(damageShare),
          win: playerData.win ? 1 : 0, // 1 pour victoire, 0 pour défaite
          gameMode: match.info.queueId,
          date: new Date(match.info.gameCreation).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
          }),
          kills: playerData.kills,
          deaths: playerData.deaths,
          assists: playerData.assists,
        };
      })
      .filter(Boolean);
  }, [matches, puuid]);

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

  // Calculer les tendances
  const getPerformanceTrend = (data: ChartDataPoint[], key: keyof ChartDataPoint) => {
    if (data.length < 3) return "stable";

    const recentGames = data.slice(-5);
    const olderGames = data.slice(-10, -5);

    if (recentGames.length && olderGames.length) {
      const recentAvg =
        recentGames.reduce((acc, game) => {
          // Convertir explicitement en nombre pour garantir le type
          const value = game && game[key] !== undefined ? Number(game[key]) : 0;
          return acc + value;
        }, 0) / recentGames.length;
      
      const olderAvg =
        olderGames.reduce((acc, game) => {
          // Même approche pour olderGames
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
  const validChartData: ChartDataPoint[] = chartData.filter((item): item is ChartDataPoint => Boolean(item));
  const kdaTrend = getPerformanceTrend(validChartData, "kda");
  const csTrend = getPerformanceTrend(validChartData, "csPerMinute");
  const visionTrend = getPerformanceTrend(validChartData, "visionScore");

  // Calculer la moyenne mobile pour chaque statistique (5 dernières parties)
  const movingAverages = chartData
    .map((entry, index, array) => {
      if (index < 4) return entry; // Pas assez de données pour une moyenne mobile
      if (!entry) return null; // Gérer les valeurs nulles

      const lastFiveGames = array.slice(index - 4, index + 1);
      const validGames = lastFiveGames.filter((game) => game !== null);
      const gameCount = validGames.length || 1; // Éviter division par zéro

      const kdaAvg =
        validGames.reduce((sum, game) => sum + (game?.kda || 0), 0) / gameCount;
      const csAvg =
        validGames.reduce((sum, game) => sum + (game?.csPerMinute || 0), 0) /
        gameCount;
      const visionAvg =
        validGames.reduce((sum, game) => sum + (game?.visionScore || 0), 0) /
        gameCount;

      return {
        ...entry,
        kdaAvg,
        csAvg,
        visionAvg,
      };
    })
    .filter(Boolean);

  // Couleurs et styles pour les graphiques
  const chartColors = {
    kda: "#4ade80", // vert
    cs: "#f59e0b", // orange
    vision: "#3b82f6", // bleu
    damage: "#ec4899", // rose
    win: "#10b981", // turquoise
    loss: "#ef4444", // rouge
    average: "#94a3b8", // gris
  };

  return (
    <div className="w-full mt-6">
      <h3 className="text-xl font-bold text-blue-300 mb-6 flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className={`p-4 rounded-xl ${
            kdaTrend === "up"
              ? "bg-green-900/30 border-green-700/50"
              : kdaTrend === "down"
              ? "bg-red-900/30 border-red-700/50"
              : "bg-slate-800/70"
          } border`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">KDA Moyen</span>
            {kdaTrend === "up" ? (
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ) : kdaTrend === "down" ? (
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
            <span className="text-2xl font-bold text-white">
              {(
                validChartData.reduce(
                  (sum, entry) => sum + (entry?.kda || 0),
                  0
                ) / (validChartData.length || 1)
              ).toFixed(2)}
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl ${
            csTrend === "up"
              ? "bg-green-900/30 border-green-700/50"
              : csTrend === "down"
              ? "bg-red-900/30 border-red-700/50"
              : "bg-slate-800/70"
          } border`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">CS/Min Moyen</span>
            {csTrend === "up" ? (
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ) : csTrend === "down" ? (
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
            <span className="text-2xl font-bold text-white">
              {(
                validChartData.reduce(
                  (sum, entry) => sum + (entry?.csPerMinute || 0),
                  0
                ) / (validChartData.length || 1)
              ).toFixed(1)}
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl ${
            visionTrend === "up"
              ? "bg-green-900/30 border-green-700/50"
              : visionTrend === "down"
              ? "bg-red-900/30 border-red-700/50"
              : "bg-slate-800/70"
          } border`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Vision Score Moyen</span>
            {visionTrend === "up" ? (
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ) : visionTrend === "down" ? (
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
            <span className="text-2xl font-bold text-white">
              {(
                validChartData.reduce(
                  (sum, entry) => sum + (entry?.visionScore || 0),
                  0
                ) / (validChartData.length || 1)
              ).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* KDA Chart */}
      <div className="bg-slate-800/50 p-4 rounded-xl mb-6">
        <h4 className="text-md font-semibold text-blue-300 mb-4">
          KDA par match
        </h4>
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
              formatter={(value, name) => {
                if (name === "kda") {
                  // Convertir value en nombre pour pouvoir faire la comparaison
                  const numValue = Number(value);
                  if (!isFinite(numValue) || numValue >= 20) {
                    // Pour les KDA parfaits (pas de morts)
                    return ["Perfect", "KDA"];
                  }
                  return [numValue.toFixed(2), "KDA"];
                }
                if (name === "kdaAvg")
                  return [Number(value).toFixed(2), "Moyenne (5 derniers)"];
                return [value, name];
              }}
              labelFormatter={(value) => `Match #${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Line
              type="monotone"
              dataKey="kda"
              name="KDA"
              stroke={chartColors.kda}
              activeDot={{ r: 6, fill: chartColors.kda }}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.kda }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="kdaAvg"
              name="Moyenne mobile"
              stroke={chartColors.average}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CS Chart */}
      <div className="bg-slate-800/50 p-4 rounded-xl mb-6">
        <h4 className="text-md font-semibold text-blue-300 mb-4">
          CS par minute
        </h4>
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
              formatter={(value, name) => {
                if (name === "csPerMinute")
                  return [Number(value).toFixed(1), "CS/min"];
                if (name === "csAvg")
                  return [Number(value).toFixed(1), "Moyenne (5 derniers)"];
                return [value, name];
              }}
              labelFormatter={(value) => `Match #${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Line
              type="monotone"
              dataKey="csPerMinute"
              name="CS/min"
              stroke={chartColors.cs}
              activeDot={{ r: 6, fill: chartColors.cs }}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.cs }}
            />
            <Line
              type="monotone"
              dataKey="csAvg"
              name="Moyenne mobile"
              stroke={chartColors.average}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Vision Score Chart */}
      <div className="bg-slate-800/50 p-4 rounded-xl mb-6">
        <h4 className="text-md font-semibold text-blue-300 mb-4">
          Vision Score
        </h4>
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
              formatter={(value, name) => {
                if (name === "visionScore")
                  return [Number(value).toFixed(0), "Vision Score"];
                if (name === "visionAvg")
                  return [Number(value).toFixed(1), "Moyenne (5 derniers)"];
                return [value, name];
              }}
              labelFormatter={(value) => `Match #${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Line
              type="monotone"
              dataKey="visionScore"
              name="Vision Score"
              stroke={chartColors.vision}
              activeDot={{ r: 6, fill: chartColors.vision }}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.vision }}
            />
            <Line
              type="monotone"
              dataKey="visionAvg"
              name="Moyenne mobile"
              stroke={chartColors.average}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Damage Share Chart */}
      <div className="bg-slate-800/50 p-4 rounded-xl mb-6">
        <h4 className="text-md font-semibold text-blue-300 mb-4">
          Part des dégâts dans l&apos;équipe (%)
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData.filter(Boolean)}
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
              formatter={(value, name) => {
                if (name === "damageShare")
                  return [`${Number(value).toFixed(1)}%`, "Part des dégâts"];
                return [value, name];
              }}
              labelFormatter={(value) => `${value}`}
            />
            <Legend wrapperStyle={{ paddingTop: 5 }} />
            <Bar
              dataKey="damageShare"
              name="Part des dégâts"
              fill={chartColors.damage}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Win Rate Chart */}
      <div className="bg-slate-800/50 p-4 rounded-xl">
        <h4 className="text-md font-semibold text-blue-300 mb-4">
          Résultats récents
        </h4>
        <div className="flex justify-center gap-2 mb-4">
          {validChartData.slice(-10).map((entry, index) => (
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
            Victoires: {validChartData.filter((entry) => entry?.win).length} /{" "}
            {validChartData.length}(
            {(
              (validChartData.filter((entry) => entry?.win).length /
                (validChartData.length || 1)) *
              100
            ).toFixed(1)}
            %)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;

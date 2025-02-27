// src/components/features/profile/SummonerContainer.tsx
"use client";

import { useState } from "react";
import { SummonerPresentation } from "./SummonerPresentation";
import { Summoner, Match } from "@/types/riotTypes";

export function SummonerContainer() {
  const [gameName, setGameName] = useState<string>("");
  const [tagLine, setTagLine] = useState<string>("");
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [matchCount, setMatchCount] = useState<number>(10);
  const [selectedQueue, setSelectedQueue] = useState<string>("Tous");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
      const response = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(
          gameName
        )}&tagLine=${encodeURIComponent(tagLine)}`
      );

      if (!response.ok) {
        throw new Error("Joueur introuvable");
      }

      const data = await response.json();
      setSummoner(data);
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

  // Les autres fonctions utilitaires...

  return (
    <SummonerPresentation
      gameName={gameName}
      setGameName={setGameName}
      tagLine={tagLine}
      setTagLine={setTagLine}
      summoner={summoner}
      error={error}
      loading={loading}
      matchCount={matchCount}
      setMatchCount={setMatchCount}
      selectedQueue={selectedQueue}
      setSelectedQueue={setSelectedQueue}
      selectedMatch={selectedMatch}
      filteredMatches={filteredMatches}
      handleSearch={handleSearch}
      calculateCsPerMin={calculateCsPerMin}
      viewMatchDetails={viewMatchDetails}
      closeMatchDetails={closeMatchDetails}
    />
  );
}

"use client";

import { useState } from "react";

import { SummonerContainer } from "@/components/features/profile/SummonerContainer";

export default function Home() {
  const [showSearch, setShowSearch] = useState(true);

  return (
    <div className=" bg-gradient-to-b from-blue-950 to-slate-950 text-white">
      {showSearch ? (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 mb-4">
              LoL Analytics
            </h1>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Explorez vos performances sur League of Legends. Recherchez un
              invocateur pour obtenir des statistiques détaillées de vos matchs
              récents.
            </p>
          </div>

          <div className="w-full  bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-blue-900/50">
            <SummonerContainer />
          </div>
        </div>
      ) : (
        <SummonerContainer />
      )}
    </div>
  );
}

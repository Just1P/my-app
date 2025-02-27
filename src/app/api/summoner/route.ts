// src/app/api/summoner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { riotService } from "@/lib/api/riotService";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "Missing gameName or tagLine" },
      { status: 400 }
    );
  }

  try {
    const data = await riotService.getSummonerData(gameName, tagLine);

    if (!data) {
      return NextResponse.json(
        { error: "Joueur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summoner data" },
      { status: 500 }
    );
  }
}

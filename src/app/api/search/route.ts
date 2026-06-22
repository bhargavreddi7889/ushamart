import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/actions/products";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const suggestions = await searchSuggestions(query);
  return NextResponse.json(suggestions);
}

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("teams")
    .select("name, age_group, gender")
    .limit(5); // Query teams table (assume it's seeded in Supabase)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // Handle errors gracefully
  }
  return NextResponse.json({ teams: data });
}

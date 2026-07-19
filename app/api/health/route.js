import { NextResponse } from "next/server";
import { supabasePublic } from "../../../lib/supabase";

export async function GET() {
  try {
    const { error } = await supabasePublic.from("posts").select("id").limit(1);
    if (error) {
      return NextResponse.json({ status: "error", database: "unreachable", detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ status: "ok", database: "connected", checked_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ status: "error", detail: String(err) }, { status: 500 });
  }
}

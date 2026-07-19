import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(request) {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .gte("attempted_at", windowStart);

  if (count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${WINDOW_MINUTES} minutes.` },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    await supabaseAdmin.from("login_attempts").insert({});
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}

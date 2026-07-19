import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../lib/supabase";

function checkAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from("post-images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("post-images")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}

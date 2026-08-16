import { NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

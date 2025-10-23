import { NextResponse } from "next/server";

export async function POST(req) {
  const { token } = await req.json();

  const res = NextResponse.json({ ok: true });
  res.cookies.set("__session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });
  return res;
}

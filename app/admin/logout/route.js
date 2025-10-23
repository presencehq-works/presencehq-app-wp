import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.redirect(new URL('/admin/login', 'http://localhost:3000'));
  res.cookies.set({
    name: '__session',
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  return res;
}

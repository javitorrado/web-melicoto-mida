import { NextRequest, NextResponse } from "next/server";
import { getAdminByEmail, verifyPassword, createAdminUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, name } = await req.json();

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 });
      }

      const admin = await getAdminByEmail(email);
      if (!admin || !verifyPassword(password, admin.password)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const response = NextResponse.json({ success: true, email: admin.email });
      response.cookies.set("admin-token", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    if (action === "register") {
      if (!email || !password || !name) {
        return NextResponse.json({ error: "Email, password, and name required" }, { status: 400 });
      }

      const existing = await getAdminByEmail(email);
      if (existing) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 });
      }

      await createAdminUser(email, password, name);
      return NextResponse.json({ success: true }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-token", "", { maxAge: 0 });
  return response;
}

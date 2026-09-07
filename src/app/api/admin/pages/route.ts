import { NextRequest, NextResponse } from "next/server";
import { getAllPagesAdmin, createPage, getPageAdmin } from "@/lib/db";

export async function GET() {
  try {
    const pages = await getAllPagesAdmin();
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, title, content, description } = await req.json();

    if (!slug || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await getPageAdmin(slug);
    if (existing) {
      return NextResponse.json({ error: "Page with this slug already exists" }, { status: 409 });
    }

    const page = await createPage(slug, title, content, description);
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

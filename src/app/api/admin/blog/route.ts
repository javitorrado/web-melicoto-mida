import { NextRequest, NextResponse } from "next/server";
import { getAllBlogPostsAdmin, createBlogPost, getBlogPostAdmin } from "@/lib/db";

export async function GET() {
  try {
    const posts = getAllBlogPostsAdmin();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, title, content, date, description, excerpt, cover } = await req.json();

    if (!slug || !title || !content || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (getBlogPostAdmin(slug)) {
      return NextResponse.json({ error: "Post with this slug already exists" }, { status: 409 });
    }

    const post = createBlogPost(slug, title, content, date, description, excerpt, cover);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

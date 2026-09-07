import { NextRequest, NextResponse } from "next/server";
import { updateBlogPost, deleteBlogPost } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    const { title, content, date, description, excerpt, cover, published } = await req.json();

    if (!title || !content || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updateBlogPost(postId, title, content, date, description, excerpt, cover, published);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    await deleteBlogPost(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}

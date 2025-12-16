import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/user/insights
// ?status=DRAFT|PUBLISHED (optional)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // generic string, validate later if needed

  const where: any = { userId: session.user.id };
  if (status) {
    where.status = status;
  }

  const posts = await prisma.insightPost.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ posts });
}

// POST /api/user/insights (create)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    // Basic validation
    if (!body.title || !body.slug || !body.contentMd) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const post = await prisma.insightPost.create({
      data: {
        userId: session.user.id,
        title: body.title,
        slug: body.slug,
        status: body.status || "DRAFT",
        contentMd: body.contentMd,
        tickers: body.tickers || [],
        fundSlug: body.fundSlug || null,
        // Convert strings to Date objects if present
        weekStart: body.weekStart ? new Date(body.weekStart) : null,
        weekEnd: body.weekEnd ? new Date(body.weekEnd) : null,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to create insight", error);
    // Unique constraint violation on slug?
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT /api/user/insights?id=... (update)
// Or better: PUT /api/user/insights/[id] but we are using query param for simplicity in this file structure
// Actually, let's allow body.id or query param.
// Wait, REST standard usually puts ID in URL. 
// But Next.js App Router dynamic routes are separate files.
// For simplicity, let's handle PUT here and expect 'id' in body.
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    const post = await prisma.insightPost.update({
      where: {
        id: body.id,
        // Ensure user owns it
        userId: session.user.id, 
      },
      data: {
        title: body.title,
        slug: body.slug,
        status: body.status,
        contentMd: body.contentMd,
        tickers: body.tickers,
        fundSlug: body.fundSlug,
        weekStart: body.weekStart ? new Date(body.weekStart) :  (body.weekStart === null ? null : undefined),
        weekEnd: body.weekEnd ? new Date(body.weekEnd) : (body.weekEnd === null ? null : undefined),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to update insight", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/user/insights?id=...
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing ID", { status: 400 });
  }

  try {
    await prisma.insightPost.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete insight", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

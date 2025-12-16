import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/user/alert-prefs
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const prefs = await prisma.alertPreferences.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ 
    types: prefs?.types || null 
  });
}

// POST /api/user/alert-prefs
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    // Validate types? For now allow any JSON array
    const types = body.types; 

    await prisma.alertPreferences.upsert({
      where: { userId: session.user.id },
      update: { types },
      create: { 
        userId: session.user.id,
        types,
      },
    });

    return NextResponse.json({ success: true, types });
  } catch (error) {
    console.error("Failed to save alert prefs", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

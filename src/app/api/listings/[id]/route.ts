import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteListing } from "@/services/listingService";
import { ServiceError } from "@/services/ServiceError";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteListing(id, session.user.id, session.user.role ?? "USER");
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

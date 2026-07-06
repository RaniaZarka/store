import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateListingStatus } from "@/services/adminService";
import { ServiceError } from "@/services/ServiceError";

type ApprovalStatus = "APPROVED" | "REJECTED";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as { status: ApprovalStatus; reason?: string };

  const validStatuses: ApprovalStatus[] = ["APPROVED", "REJECTED"];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    await updateListingStatus(id, body.status, body.reason);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

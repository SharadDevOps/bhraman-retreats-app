import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "WAITLISTED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"];

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  return NextResponse.json({ bookings });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, paymentStatus } = await request.json().catch(() => ({}));
  if (typeof id !== "string") return NextResponse.json({ error: "Booking id required" }, { status: 400 });

  const data: Record<string, string> = {};
  if (typeof status === "string" && BOOKING_STATUSES.includes(status)) data.status = status;
  if (typeof paymentStatus === "string" && PAYMENT_STATUSES.includes(paymentStatus)) data.paymentStatus = paymentStatus;
  if (!Object.keys(data).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const booking = await prisma.booking.update({ where: { id }, data });
  return NextResponse.json({ booking });
}

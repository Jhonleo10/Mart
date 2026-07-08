import type { BookingStatus, Prisma } from "@prisma/client";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["NEW", "CONTACTED", "QUALIFIED"];

export const TERMINAL_BOOKING_STATUSES: BookingStatus[] = ["CLOSED", "CONVERTED"];

export async function releaseTerminalAvailabilityHold(
  tx: Prisma.TransactionClient,
  availabilityId: string,
) {
  await tx.booking.updateMany({
    where: {
      availabilityId,
      status: { in: TERMINAL_BOOKING_STATUSES },
    },
    data: { availabilityId: null },
  });
}

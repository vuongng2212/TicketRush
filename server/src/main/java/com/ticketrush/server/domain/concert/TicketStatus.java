package com.ticketrush.server.domain.concert;

/**
 * Sales-state of a concert exposed in the Editorial Music Discovery UI.
 * Distinct from {@link ConcertStatus} (which tracks the concert lifecycle:
 * DRAFT / OPEN / CLOSED). A concert with status OPEN can still be SOLD_OUT
 * or COMING_SOON from the ticket-buyer's perspective.
 */
public enum TicketStatus {
    /** Tickets are available for purchase right now. */
    ON_SALE,
    /** All tickets have been sold; no inventory remaining. */
    SOLD_OUT,
    /** Pre-sale window: tickets not yet on sale but event is announced. */
    COMING_SOON
}

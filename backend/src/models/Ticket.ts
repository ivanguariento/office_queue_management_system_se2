import { removeNullAttributes } from "utils";

export interface Ticket {
  /**
   * Unique identifier for the ticket
   * @type {string}
   * @memberof Ticket
   */
  ticket_id: string;
  /**
   * Ticket code
   * @type {string}
   * @memberof Ticket
   */
  ticket_code: string;
  /**
   * Date and time when the ticket was issued
   * @type {Date} ISO date string
   * @memberof Ticket
   */
  issued_at: Date;
  /**
   * Service type ID associated with the ticket
   * @type {string}
   * @memberof Ticket
   */
  service_id: string;
}

/**
 * Check if a given object implements the Ticket interface.
 */
export function instanceOfTicket(value: object): value is Ticket {
  if (!("ticket_id" in value) || value["ticket_id"] === undefined) return false;
  if (!("ticket_code" in value) || value["ticket_code"] === undefined)
    return false;
  if (!("issued_at" in value) || value["issued_at"] === undefined) return false;
  if (!("service_id" in value) || value["service_id"] === undefined)
    return false;
  return true;
}

export function TicketFromJSON(json: any): Ticket {
  if (json == null) {
    return json;
  }
  return {
    ticket_id: json["ticket_id"],
    ticket_code: json["ticket_code"],
    issued_at: new Date(json["issued_at"]),
    service_id: json["service_id"],
  };
}

export function TicketToJSON(ticket: Ticket): any {
  if (ticket == null) {
    return ticket;
  }
  return {
    ticket_id: ticket.ticket_id,
    ticket_code: ticket.ticket_code,
    issued_at: ticket.issued_at.toISOString(),
    service_id: ticket.service_id,
  };
}

export function createTicketDTO(
  ticket_id?: string,
  ticket_code?: string,
  issued_at?: Date,
  service_id?: string
): Ticket {
  return removeNullAttributes({
    ticket_id,
    ticket_code,
    issued_at,
    service_id,
  }) as Ticket;
}

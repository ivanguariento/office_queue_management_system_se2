import { Ticket, createTicketDTO } from "@models/Ticket";
import { TicketRepository } from "@repositories/ticketRepositories";

import { logInfo } from "@services/loggingService";

export async function getTicket(ticketId: string): Promise<Ticket> {
  const ticketRepository = new TicketRepository();
  const ticket = await ticketRepository.getTicketById(ticketId);

  return createTicketDTO(
    ticket.ticket_id,
    ticket.ticket_code,
    ticket.issued_at,
    ticket.service_id
  );
}

export async function nextTicket(counterId: string): Promise<Ticket> {
  const ticketRepository = new TicketRepository();
  const ticket = await ticketRepository.getNextTicketForCounter(counterId);

  return createTicketDTO(
    ticket.ticket_id,
    ticket.ticket_code,
    ticket.issued_at,
    ticket.service_id
  );
}

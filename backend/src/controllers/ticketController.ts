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
import { TicketDTO, toTicketDTO } from "../dto/Ticket";
import { NotFoundError } from "../errors/NotFoundError";
import { serviceRepository } from "../repositories/serviceRepository";
import { ticketRepository } from "../repositories/ticketRepository";

export async function createTicket(serviceTypeId: string): Promise<TicketDTO> {
  const ticketRepo = new ticketRepository();
  const serviceRepo = new serviceRepository();
  
  const service = await serviceRepo.getServiceById(serviceTypeId);
  if (!service) throw new NotFoundError("Service not found");

  return toTicketDTO(await ticketRepo.createTicket(service));
}

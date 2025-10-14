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
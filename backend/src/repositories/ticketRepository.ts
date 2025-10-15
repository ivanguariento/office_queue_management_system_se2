import { PrismaClient, ServiceType, Ticket } from '@prisma/client';
import { add_to_queue } from '../services/queueServices';

export class ticketRepository {
private prisma = new PrismaClient()

  async createTicket(service: ServiceType): Promise<Ticket> {
  return await this.prisma.$transaction(async (tx) => {

    // get last ticket by ticket_code
    const last = await tx.ticket.findFirst({
      where: { service_id: service.service_id },
      orderBy: { ticket_code: 'desc' }, 
    });

    let nextNum = 0;
    if (last && last.ticket_code) {
      const parsed = parseInt((last.ticket_code.match(/\d+/) || ['0'])[0], 10);
      if (!Number.isNaN(parsed)) nextNum = parsed + 1;
    }
    
    const ticketCode = String(service.tag_name + nextNum); 

    const created = await tx.ticket.create({
      data: { ticket_code: ticketCode, service_id: service.service_id },
    });

    // add the ticket to the queue of the serviceType (create the queue if it doesn't exist)
    add_to_queue(service.service_id, created);

    return created;
  });
}
}
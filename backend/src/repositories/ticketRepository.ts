import { PrismaClient, ServiceType, Ticket } from '@prisma/client';
import { add_to_queue } from '../services/queueServices';
import { prisma } from "@database";

import { NotFoundError } from "@errors/NotFoundError";
import AppError from "@errors/AppError";

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

  private repo = prisma.ticket;
  
    async getTicketById(id: string): Promise<Ticket> {
      try {
        return await this.repo.findUniqueOrThrow({ where: { ticket_id: id } });
      } catch (error) {
        throw new NotFoundError(`Ticket with ID '${id}' not found`);
      }
    }
  
    async getNextTicketForCounter(counterId: string): Promise<Ticket> {
      throw new AppError("Method not implemented", 500);
    }
  
    async updateTicketStatus(
      ticketId: string,
      counterId: string,
      served_at: Date,
      ended_at?: Date
    ): Promise<void> {
      const ticket = await this.getTicketById(ticketId);
  
      prisma.servedTicket.create({
        data: { ticket_id: ticketId, counter_id: counterId, served_at, ended_at },
      });
    }
}
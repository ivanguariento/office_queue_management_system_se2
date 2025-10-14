import { Ticket } from "@prisma/client";
import { prisma } from "@database";

import { NotFoundError } from "@errors/NotFoundError";
import AppError from "@errors/AppError";

export class TicketRepository {
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

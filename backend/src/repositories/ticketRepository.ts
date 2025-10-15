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
        // 1. find services that this counter can serve via CounterService
        const prismaClient = this.prisma;

        const counterServices = await prismaClient.counterService.findMany({
          where: { counter_id: counterId },
          select: { service_id: true },
        });

        const serviceIds = counterServices.map((cs) => cs.service_id);

        if (serviceIds.length === 0) {
          throw new NotFoundError(`Counter with ID '${counterId}' not found or serves no services`);
        }

        // 2. For each service, get queue length and service time
        type Candidate = { service_id: string; queueLength: number; serviceTime: number };
        const candidates: Candidate[] = [];

        for (const sid of serviceIds) {
          const svc = await prismaClient.serviceType.findUnique({ where: { service_id: sid } });
          const qLen = (await import("../services/queueServices")).get_queue_length(sid);
          if (svc) {
            candidates.push({ service_id: sid, queueLength: qLen, serviceTime: svc.average_service_time });
          }
        }

        // 3. select the longest queue(s)
        const maxLen = Math.max(...candidates.map((c) => c.queueLength), 0);
        if (maxLen === 0) {
          // No tickets in any queue the counter can serve
          throw new NotFoundError(`No tickets available for counter '${counterId}'`);
        }

        let longest = candidates.filter((c) => c.queueLength === maxLen);

        // 4. in the case of same length, choose the one with lowest serviceTime
        longest.sort((a, b) => a.serviceTime - b.serviceTime);
        const selected = longest[0];

        // 5. take ticket from in-memory queue
        const queueSvc = await import("../services/queueServices");
        const next = queueSvc.take_from_queue(selected.service_id);

        if (!next) {
          // Race: queue appeared non-empty but now empty; try to find any other candidate with tickets
          for (const c of longest.slice(1)) {
            const t = queueSvc.take_from_queue(c.service_id);
            if (t) {
              // persist servedTicket via centralized method
              await this.updateTicketStatus(t.ticket_id, counterId, new Date());
              return t;
            }
          }
          throw new NotFoundError(`No tickets available for counter '${counterId}'`);
        }

        // 6. update ticket status (persist ServedTicket) using centralized method
        await this.updateTicketStatus(next.ticket_id, counterId, new Date());

        // emit an event via queueServices so other parts (display, notifications) can react
        try {
          const qs = await import("../services/queueServices");
          qs.emitter.emit('ticket_served', { counterId, ticket: next, serviceId: next.service_id });
        } catch (e) {
          // swallow; non-critical
        }

        return next;
    }
  
    async updateTicketStatus(
      ticketId: string,
      counterId: string,
      served_at: Date,
      ended_at?: Date
    ): Promise<void> {
      const ticket = await this.getTicketById(ticketId);
  
      await this.prisma.servedTicket.create({
        data: { ticket_id: ticketId, counter_id: counterId, served_at, ended_at },
      });
    }
}
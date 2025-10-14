import { Ticket, createTicketDTO } from "@models/Ticket";
import { ServiceRepository } from "@repositories/serviceRepositories";

import AppError from "@errors/AppError";
import { logInfo } from "@services/loggingService";

// In-memory map: serviceTypeId -> queue length
const queues = new Map<string, number>();

export async function getQueueLength(serviceId: string): Promise<number> {
  return queues.get(serviceId) || 0;
}

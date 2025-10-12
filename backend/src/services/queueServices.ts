import type { Ticket } from '@prisma/client';

// In-memory map: serviceTypeId -> queue (array FIFO)
const queues = new Map<string, Ticket[]>();

export function add_to_queue(serviceTypeId: string, ticket: Ticket) {
  let q = queues.get(serviceTypeId);
  if (!q) {
    q = [];
    queues.set(serviceTypeId, q);
  }
  q.push(ticket);
  console.log("queue:", queues.get(serviceTypeId));
  return;
}

export function clear_queue(serviceTypeId: string): void {
  queues.delete(serviceTypeId);
}

export default {
  add_to_queue,
  clear_queue,
};

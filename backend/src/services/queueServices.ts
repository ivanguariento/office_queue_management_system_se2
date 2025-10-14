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
  return;
}

export function clear_queue(serviceTypeId: string): void {
  queues.delete(serviceTypeId);
}

export function get_queue_length(serviceTypeId: string): number {
  const q = queues.get(serviceTypeId);
  if (!q) return 0;
  return q.length;
}

export default {
  add_to_queue,
  clear_queue,
};

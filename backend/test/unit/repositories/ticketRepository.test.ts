// mock @prisma/client to simulate prisma behavior
jest.mock('@prisma/client', () => {
  const mockTx = {
    ticket: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $transaction: async (cb: any) => cb(mockTx),
    })),
  };
});

import { ticketRepository } from '../../../src/repositories/ticketRepository';

describe('ticketRepository', () => {
  it('createTicket generates incremental ticket codes when no previous ticket', async () => {
    const { PrismaClient } = require('@prisma/client');
    const tx = { ticket: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ ticket_id: 't1', ticket_code: 'A0', service_id: 's1', issued_at: new Date().toISOString() }) } };
    PrismaClient.mockImplementation(() => ({ $transaction: async (cb: any) => cb(tx) }));

    const repo = new ticketRepository();
    const result = await repo.createTicket({ service_id: 's1', tag_name: 'A', average_service_time: 5 } as any);

    expect(result.ticket_code).toBe('A0');
    expect(tx.ticket.findFirst).toHaveBeenCalled();
    expect(tx.ticket.create).toHaveBeenCalled();
  });

  it('createTicket increments ticket number when last ticket exists', async () => {
    const { PrismaClient } = require('@prisma/client');
    const last = { ticket_id: 't1', ticket_code: 'A3', service_id: 's1', issued_at: new Date().toISOString() };
    const tx = { ticket: { findFirst: jest.fn().mockResolvedValue(last), create: jest.fn().mockResolvedValue({ ticket_id: 't2', ticket_code: 'A4', service_id: 's1', issued_at: new Date().toISOString() }) } };
    PrismaClient.mockImplementation(() => ({ $transaction: async (cb: any) => cb(tx) }));

    const repo = new ticketRepository();
    const result = await repo.createTicket({ service_id: 's1', tag_name: 'A', average_service_time: 5 } as any);

    expect(result.ticket_code).toBe('A4');
    expect(tx.ticket.findFirst).toHaveBeenCalled();
    expect(tx.ticket.create).toHaveBeenCalled();
  });
});

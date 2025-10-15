import { NotFoundError } from '@errors/NotFoundError';
import { ticketRepository } from '../../../src/repositories/ticketRepository';
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

// Mock the @database module to provide a mocked prisma.ticket
jest.mock('@database', () => ({
  prisma: {
    ticket: {
      findUniqueOrThrow: jest.fn(),
    },
  },
}));

// Mock queueServices module
jest.mock('../../../src/services/queueServices', () => ({
  get_queue_length: jest.fn(),
  take_from_queue: jest.fn(),
  add_to_queue: jest.fn(),
  emitter: {
    emit: jest.fn(),
  },
}));

describe('ticketRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('createTicket handles NaN parsing from ticket_code', async () => {
    const { PrismaClient } = require('@prisma/client');
    
    const originalMatch = String.prototype.match;
    jest.spyOn(String.prototype, 'match').mockReturnValue([undefined] as any);
    
    const last = { ticket_id: 't1', ticket_code: 'A123', service_id: 's1', issued_at: new Date().toISOString() };
    const tx = { ticket: { findFirst: jest.fn().mockResolvedValue(last), create: jest.fn().mockResolvedValue({ ticket_id: 't2', ticket_code: 'A0', service_id: 's1', issued_at: new Date().toISOString() }) } };
    PrismaClient.mockImplementation(() => ({ $transaction: async (cb: any) => cb(tx) }));

    const repo = new ticketRepository();
    const result = await repo.createTicket({ service_id: 's1', tag_name: 'A', average_service_time: 5 } as any);

    // Should default to 0 when parseInt returns NaN
    expect(result.ticket_code).toBe('A0');
    expect(tx.ticket.findFirst).toHaveBeenCalled();
    expect(tx.ticket.create).toHaveBeenCalled();
    
    (String.prototype.match as jest.Mock).mockRestore();
  });

  it('createTicket handles ticket_code with no numbers (uses fallback)', async () => {
    const { PrismaClient } = require('@prisma/client');
    
    // Last ticket has no numbers - this will make match(/\d+/) return null
    const last = { ticket_id: 't1', ticket_code: 'ABCD', service_id: 's1', issued_at: new Date().toISOString() };
    const tx = { ticket: { findFirst: jest.fn().mockResolvedValue(last), create: jest.fn().mockResolvedValue({ ticket_id: 't2', ticket_code: 'A1', service_id: 's1', issued_at: new Date().toISOString() }) } };
    PrismaClient.mockImplementation(() => ({ $transaction: async (cb: any) => cb(tx) }));

    const repo = new ticketRepository();
    const result = await repo.createTicket({ service_id: 's1', tag_name: 'A', average_service_time: 5 } as any);

    expect(result.ticket_code).toBe('A1');
    expect(tx.ticket.findFirst).toHaveBeenCalled();
    expect(tx.ticket.create).toHaveBeenCalled();
  });

  it('should throw NotFoundError when ticket does not exist', async () => {
    const repo = new ticketRepository();
    
    const { prisma } = require('@database');
    prisma.ticket.findUniqueOrThrow.mockRejectedValue(new Error('Record not found'));

    await expect(repo.getTicketById('nonexistent-id')).rejects.toThrow(NotFoundError);
    await expect(repo.getTicketById('nonexistent-id')).rejects.toThrow("Ticket with ID 'nonexistent-id' not found");
  });

  it('should return ticket when it exists', async () => {
    const repo = new ticketRepository();
    const mockTicket = {
      ticket_id: 'test-id',
      ticket_code: 'A001',
      service_id: 'service-1',
      issued_at: new Date()
    };
    
    const { prisma } = require('@database');
    prisma.ticket.findUniqueOrThrow.mockResolvedValue(mockTicket);

    const result = await repo.getTicketById('test-id');
    expect(result).toEqual(mockTicket);
  });

  // Tests for getNextTicketForCounter
  it('should throw NotFoundError when counter serves no services', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([])
      }
    };
    repo['prisma'] = mockPrisma as any;

    await expect(repo.getNextTicketForCounter('counter-1')).rejects.toThrow(NotFoundError);
    await expect(repo.getNextTicketForCounter('counter-1')).rejects.toThrow("Counter with ID 'counter-1' not found or serves no services");
  });

  it('should throw NotFoundError when no tickets available in any queue', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([
          { service_id: 'service-1' }
        ])
      },
      serviceType: {
        findUnique: jest.fn().mockResolvedValue({
          service_id: 'service-1',
          average_service_time: 300
        })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length.mockReturnValue(0);

    await expect(repo.getNextTicketForCounter('counter-1')).rejects.toThrow(NotFoundError);
    await expect(repo.getNextTicketForCounter('counter-1')).rejects.toThrow("No tickets available for counter 'counter-1'");
  });

  it('should skip services when serviceType is not found', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([
          { service_id: 'service-1' },
          { service_id: 'service-2' }
        ])
      },
      serviceType: {
        findUnique: jest.fn()
          .mockResolvedValueOnce(null) 
          .mockResolvedValueOnce({ service_id: 'service-2', average_service_time: 300 })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const mockTicket = { ticket_id: 't1', ticket_code: 'A001', service_id: 'service-2' };
    
    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length
      .mockReturnValueOnce(0)  
      .mockReturnValueOnce(1); 
    queueServices.take_from_queue.mockReturnValue(mockTicket);

    jest.spyOn(repo, 'updateTicketStatus').mockResolvedValue();

    const result = await repo.getNextTicketForCounter('counter-1');
    expect(result).toEqual(mockTicket);
  });

  it('should select service with longest queue', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([
          { service_id: 'service-1' },
          { service_id: 'service-2' }
        ])
      },
      serviceType: {
        findUnique: jest.fn()
          .mockResolvedValueOnce({ service_id: 'service-1', average_service_time: 300 })
          .mockResolvedValueOnce({ service_id: 'service-2', average_service_time: 400 })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const mockTicket = { ticket_id: 't1', ticket_code: 'A001', service_id: 'service-2' };
    
    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length
      .mockReturnValueOnce(2)  
      .mockReturnValueOnce(5); 
    queueServices.take_from_queue.mockReturnValue(mockTicket);

    jest.spyOn(repo, 'updateTicketStatus').mockResolvedValue();

    const result = await repo.getNextTicketForCounter('counter-1');
    expect(result).toEqual(mockTicket);
  });

  it('should select service with lowest service time when queue lengths are equal', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([
          { service_id: 'service-1' },
          { service_id: 'service-2' }
        ])
      },
      serviceType: {
        findUnique: jest.fn()
          .mockResolvedValueOnce({ service_id: 'service-1', average_service_time: 200 }) // faster
          .mockResolvedValueOnce({ service_id: 'service-2', average_service_time: 400 })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const mockTicket = { ticket_id: 't1', ticket_code: 'A001', service_id: 'service-1' };
    
    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length
      .mockReturnValueOnce(3) 
      .mockReturnValueOnce(3); 
    queueServices.take_from_queue.mockReturnValue(mockTicket);

    jest.spyOn(repo, 'updateTicketStatus').mockResolvedValue();

    const result = await repo.getNextTicketForCounter('counter-1');
    expect(result).toEqual(mockTicket);
  });

  it('should handle race condition when selected queue becomes empty', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([
          { service_id: 'service-1' },
          { service_id: 'service-2' },
          { service_id: 'service-3' }
        ])
      },
      serviceType: {
        findUnique: jest.fn()
          .mockResolvedValueOnce({ service_id: 'service-1', average_service_time: 300 })
          .mockResolvedValueOnce({ service_id: 'service-2', average_service_time: 400 })
          .mockResolvedValueOnce({ service_id: 'service-3', average_service_time: 500 })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const mockTicket = { ticket_id: 't3', ticket_code: 'C001', service_id: 'service-3' };
    
    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length
      .mockReturnValueOnce(2)  
      .mockReturnValueOnce(2)    
      .mockReturnValueOnce(2); 
    queueServices.take_from_queue
      .mockReturnValueOnce(null)     
      .mockReturnValueOnce(null)     
      .mockReturnValueOnce(mockTicket);

    jest.spyOn(repo, 'updateTicketStatus').mockResolvedValue();

    const result = await repo.getNextTicketForCounter('counter-1');
    expect(result).toEqual(mockTicket);
  });

  it('should throw NotFoundError when all queues become empty due to race condition', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([
          { service_id: 'service-1' }
        ])
      },
      serviceType: {
        findUnique: jest.fn().mockResolvedValue({
          service_id: 'service-1',
          average_service_time: 300
        })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length.mockReturnValue(1);
    queueServices.take_from_queue.mockReturnValue(null); // Queue empty

    await expect(repo.getNextTicketForCounter('counter-1')).rejects.toThrow(NotFoundError);
    await expect(repo.getNextTicketForCounter('counter-1')).rejects.toThrow("No tickets available for counter 'counter-1'");
  });

  it('should emit ticket_served event successfully', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([{ service_id: 'service-1' }])
      },
      serviceType: {
        findUnique: jest.fn().mockResolvedValue({
          service_id: 'service-1',
          average_service_time: 300
        })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const mockTicket = { ticket_id: 't1', ticket_code: 'A001', service_id: 'service-1' };
    
    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length.mockReturnValue(1);
    queueServices.take_from_queue.mockReturnValue(mockTicket);

    jest.spyOn(repo, 'updateTicketStatus').mockResolvedValue();

    const result = await repo.getNextTicketForCounter('counter-1');
    
    expect(result).toEqual(mockTicket);
    expect(queueServices.emitter.emit).toHaveBeenCalledWith('ticket_served', {
      counterId: 'counter-1',
      ticket: mockTicket,
      serviceId: 'service-1'
    });
  });

  it('should handle event emission error gracefully', async () => {
    const repo = new ticketRepository();
    
    const mockPrisma = {
      counterService: {
        findMany: jest.fn().mockResolvedValue([{ service_id: 'service-1' }])
      },
      serviceType: {
        findUnique: jest.fn().mockResolvedValue({
          service_id: 'service-1',
          average_service_time: 300
        })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const mockTicket = { ticket_id: 't1', ticket_code: 'A001', service_id: 'service-1' };
    
    const queueServices = require('../../../src/services/queueServices');
    queueServices.get_queue_length.mockReturnValue(1);
    queueServices.take_from_queue.mockReturnValue(mockTicket);
    queueServices.emitter.emit.mockImplementation(() => {
      throw new Error('Emit failed');
    });

    jest.spyOn(repo, 'updateTicketStatus').mockResolvedValue();
    const result = await repo.getNextTicketForCounter('counter-1');
    expect(result).toEqual(mockTicket);
  });

  // Tests for updateTicketStatus
  it('should create served ticket record', async () => {
    const repo = new ticketRepository();
    const mockTicket = { ticket_id: 't1', ticket_code: 'A001', service_id: 's1' };
    
    jest.spyOn(repo, 'getTicketById').mockResolvedValue(mockTicket as any);
    
    const mockPrisma = {
      servedTicket: {
        create: jest.fn().mockResolvedValue({
          ticket_id: 't1',
          counter_id: 'counter-1',
          served_at: new Date(),
          ended_at: null
        })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const servedAt = new Date();
    await repo.updateTicketStatus('t1', 'counter-1', servedAt);

    expect(mockPrisma.servedTicket.create).toHaveBeenCalledWith({
      data: { 
        ticket_id: 't1', 
        counter_id: 'counter-1', 
        served_at: servedAt, 
        ended_at: undefined 
      }
    });
  });

  it('should create served ticket record with ended_at when provided', async () => {
    const repo = new ticketRepository();
    const mockTicket = { ticket_id: 't1', ticket_code: 'A001', service_id: 's1' };
    
    jest.spyOn(repo, 'getTicketById').mockResolvedValue(mockTicket as any);
    
    const mockPrisma = {
      servedTicket: {
        create: jest.fn().mockResolvedValue({
          ticket_id: 't1',
          counter_id: 'counter-1',
          served_at: new Date(),
          ended_at: new Date()
        })
      }
    };
    repo['prisma'] = mockPrisma as any;

    const servedAt = new Date();
    const endedAt = new Date();
    await repo.updateTicketStatus('t1', 'counter-1', servedAt, endedAt);

    expect(mockPrisma.servedTicket.create).toHaveBeenCalledWith({
      data: { 
        ticket_id: 't1', 
        counter_id: 'counter-1', 
        served_at: servedAt, 
        ended_at: endedAt 
      }
    });
  });
});

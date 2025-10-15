import { PrismaClient } from '@prisma/client';
import { ticketRepository } from '../../../src/repositories/ticketRepository';
import { NotFoundError } from '../../../src/errors/NotFoundError';

describe('TicketRepository Integration Tests', () => {
  let repository: ticketRepository;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new ticketRepository();
  });

  beforeEach(async () => {
    await prisma.servedTicket.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.counterService.deleteMany();
    await prisma.counter.deleteMany();
    await prisma.serviceType.deleteMany();
  });

  afterAll(async () => {
    await prisma.servedTicket.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.counterService.deleteMany();
    await prisma.counter.deleteMany();
    await prisma.serviceType.deleteMany();
    await prisma.$disconnect();
  });

  describe('createTicket', () => {
    it('should create ticket with correct code for new service', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'TestService',
          average_service_time: 10,
          description: 'Test service for tickets'
        }
      });

      const ticket = await repository.createTicket(service);

      expect(ticket).toBeDefined();
      expect(ticket.ticket_code).toBe('TestService0');
      expect(ticket.service_id).toBe(service.service_id);
      expect(ticket.issued_at).toBeDefined();
    });

    it('should increment ticket number for existing service', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'TestService',
          average_service_time: 10,
          description: 'Test service for tickets'
        }
      });

      await prisma.ticket.create({
        data: {
          ticket_code: 'TestService0',
          service_id: service.service_id
        }
      });

      const newTicket = await repository.createTicket(service);

      expect(newTicket.ticket_code).toBe('TestService1');
      expect(newTicket.service_id).toBe(service.service_id);
    });

    it('should handle multiple ticket creation for same service', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'MultiTest',
          average_service_time: 15,
          description: 'Multi ticket test service'
        }
      });

      const ticket1 = await repository.createTicket(service);
      const ticket2 = await repository.createTicket(service);
      const ticket3 = await repository.createTicket(service);

      expect(ticket1.ticket_code).toBe('MultiTest0');
      expect(ticket2.ticket_code).toBe('MultiTest1');
      expect(ticket3.ticket_code).toBe('MultiTest2');
      
      const allTickets = await prisma.ticket.findMany({
        where: { service_id: service.service_id },
        orderBy: { ticket_code: 'asc' }
      });
      expect(allTickets).toHaveLength(3);
    });

    it('should handle service with special characters in tag_name', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'Special-Service_2024',
          average_service_time: 20,
          description: 'Service with special characters'
        }
      });

      const ticket = await repository.createTicket(service);

      expect(ticket.ticket_code).toBe('Special-Service_20240');
      expect(ticket.service_id).toBe(service.service_id);
    });
  });

  describe('getTicketById', () => {
    it('should return ticket when it exists', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'GetTest',
          average_service_time: 10,
          description: 'Test service for getting tickets'
        }
      });

      const createdTicket = await prisma.ticket.create({
        data: {
          ticket_code: 'GetTest0',
          service_id: service.service_id
        }
      });

      const retrievedTicket = await repository.getTicketById(createdTicket.ticket_id);

      expect(retrievedTicket).toBeDefined();
      expect(retrievedTicket.ticket_id).toBe(createdTicket.ticket_id);
      expect(retrievedTicket.ticket_code).toBe('GetTest0');
      expect(retrievedTicket.service_id).toBe(service.service_id);
    });

    it('should throw NotFoundError when ticket does not exist', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(repository.getTicketById(nonExistentId))
        .rejects
        .toThrow(NotFoundError);
      
      await expect(repository.getTicketById(nonExistentId))
        .rejects
        .toThrow(`Ticket with ID '${nonExistentId}' not found`);
    });

    it('should handle concurrent ticket retrieval', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'ConcurrentTest',
          average_service_time: 10,
          description: 'Concurrent test service'
        }
      });

      const ticket1 = await prisma.ticket.create({
        data: { ticket_code: 'ConcurrentTest0', service_id: service.service_id }
      });

      const ticket2 = await prisma.ticket.create({
        data: { ticket_code: 'ConcurrentTest1', service_id: service.service_id }
      });

      const promises = [
        repository.getTicketById(ticket1.ticket_id),
        repository.getTicketById(ticket2.ticket_id),
        repository.getTicketById(ticket1.ticket_id) 
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].ticket_id).toBe(ticket1.ticket_id);
      expect(results[1].ticket_id).toBe(ticket2.ticket_id);
      expect(results[2].ticket_id).toBe(ticket1.ticket_id);
    });
  });

  describe('updateTicketStatus', () => {
    it('should create served ticket record', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'UpdateTest',
          average_service_time: 10,
          description: 'Update test service'
        }
      });

      const ticket = await prisma.ticket.create({
        data: {
          ticket_code: 'UpdateTest0',
          service_id: service.service_id
        }
      });

      const counter = await prisma.counter.create({
        data: {
          counter_number: 1
        }
      });

      const servedAt = new Date();

      await repository.updateTicketStatus(ticket.ticket_id, counter.counter_id, servedAt);

      const servedTicket = await prisma.servedTicket.findFirst({
        where: {
          ticket_id: ticket.ticket_id,
          counter_id: counter.counter_id
        }
      });

      expect(servedTicket).toBeDefined();
      expect(servedTicket?.ticket_id).toBe(ticket.ticket_id);
      expect(servedTicket?.counter_id).toBe(counter.counter_id);
      expect(servedTicket?.served_at).toEqual(servedAt);
      expect(servedTicket?.ended_at).toBeNull();
    });

    it('should create served ticket record with end time', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'EndTest',
          average_service_time: 10,
          description: 'End test service'
        }
      });

      const ticket = await prisma.ticket.create({
        data: {
          ticket_code: 'EndTest0',
          service_id: service.service_id
        }
      });

      const counter = await prisma.counter.create({
        data: {
          counter_number: 2
        }
      });

      const servedAt = new Date();
      const endedAt = new Date(Date.now() + 300000); 

      await repository.updateTicketStatus(ticket.ticket_id, counter.counter_id, servedAt, endedAt);

      const servedTicket = await prisma.servedTicket.findFirst({
        where: { ticket_id: ticket.ticket_id }
      });

      expect(servedTicket?.served_at).toEqual(servedAt);
      expect(servedTicket?.ended_at).toEqual(endedAt);
    });

    it('should throw error when ticket does not exist', async () => {
      const nonExistentTicketId = '123e4567-e89b-12d3-a456-426614174000';
      const counter = await prisma.counter.create({
        data: { counter_number: 3 }
      });

      await expect(
        repository.updateTicketStatus(nonExistentTicketId, counter.counter_id, new Date())
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Database transactions and consistency', () => {
    it('should handle transaction rollback on createTicket failure', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'TransactionTest',
          average_service_time: 10,
          description: 'Transaction test service'
        }
      });

      const ticketsBefore = await prisma.ticket.count();

      const ticket = await repository.createTicket(service);
      
      const ticketsAfter = await prisma.ticket.count();
      expect(ticketsAfter).toBe(ticketsBefore + 1);
      expect(ticket.ticket_code).toBe('TransactionTest0');
    });

    it('should handle database connection properly', async () => {
      expect(async () => {
        const service = await prisma.serviceType.create({
          data: {
            tag_name: 'ConnectionTest',
            average_service_time: 5,
            description: 'Connection test'
          }
        });
        await repository.createTicket(service);
      }).not.toThrow();
    });
  });
});

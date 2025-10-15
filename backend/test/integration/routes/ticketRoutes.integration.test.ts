import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../src/app';

const prisma = new PrismaClient();

describe('TicketRoutes Integration Tests', () => {
  let testService: any;

  beforeAll(async () => {
    testService = await prisma.serviceType.create({
      data: {
        tag_name: 'Test Service for Tickets',
        average_service_time: 300,
        description: 'Service used for ticket integration testing'
      }
    });
  });

  beforeEach(async () => {
    await prisma.ticket.deleteMany({});
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({});
    await prisma.serviceType.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/v1/tickets/new', () => {
    it('should create a new ticket successfully', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: testService.service_id
        })
        .expect(200);

      expect(response.body).toHaveProperty('ticketId');
      expect(response.body).toHaveProperty('serviceId', testService.service_id);
      expect(response.body).toHaveProperty('ticketCode');
      expect(response.body).toHaveProperty('issuedAt');
      expect(typeof response.body.ticketId).toBe('string');
      expect(typeof response.body.ticketCode).toBe('string');
    });

    it('should create multiple tickets with correct codes', async () => {
      const ticket1Response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: testService.service_id
        })
        .expect(200);

      const ticket2Response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: testService.service_id
        })
        .expect(200);

      const ticket3Response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: testService.service_id
        })
        .expect(200);

      expect(ticket1Response.body.ticketCode).toBeTruthy();
      expect(ticket2Response.body.ticketCode).toBeTruthy();
      expect(ticket3Response.body.ticketCode).toBeTruthy();
      
      expect(ticket1Response.body.ticketId).not.toBe(ticket2Response.body.ticketId);
      expect(ticket2Response.body.ticketId).not.toBe(ticket3Response.body.ticketId);
      expect(ticket1Response.body.ticketId).not.toBe(ticket3Response.body.ticketId);
    });

    it('should return 500 for missing serviceTypeId', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent service', async () => {
      const nonExistentServiceId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: nonExistentServiceId
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/service.*not found/i);
    });

    it('should return 500 for invalid UUID format', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: 'invalid-uuid'
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle concurrent ticket creation', async () => {
      const concurrentRequests = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/v1/tickets/new')
          .send({
            serviceTypeId: testService.service_id
          })
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('ticketId');
      });

      const ticketIds = responses.map(r => r.body.ticketId);
      const uniqueTicketIds = [...new Set(ticketIds)];
      expect(uniqueTicketIds).toHaveLength(5);
    });
  });

  describe('GET /api/v1/tickets/:ticketId', () => {
    let testTicket: any;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: testService.service_id
        });
      testTicket = createResponse.body;
    });

    it('should retrieve an existing ticket with snake_case properties', async () => {
      const response = await request(app)
        .get(`/api/v1/tickets/${testTicket.ticketId}`)
        .expect(200);

      expect(response.body).toHaveProperty('ticket_id', testTicket.ticketId);
      expect(response.body).toHaveProperty('service_id', testService.service_id);
      expect(response.body).toHaveProperty('ticket_code');
      expect(response.body).toHaveProperty('issued_at');
    });

    it('should return 404 for non-existent ticket', async () => {
      const nonExistentTicketId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .get(`/api/v1/tickets/${nonExistentTicketId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/ticket.*not found/i);
    });

    it('should return 404 for invalid ticket ID format', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/invalid-uuid')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return correct data types', async () => {
      const response = await request(app)
        .get(`/api/v1/tickets/${testTicket.ticketId}`)
        .expect(200);

      expect(typeof response.body.ticket_id).toBe('string');
      expect(typeof response.body.service_id).toBe('string');
      expect(typeof response.body.ticket_code).toBe('string');
      expect(typeof response.body.issued_at).toBe('string');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should set correct content-type headers', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: testService.service_id
        });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle requests with various Accept headers', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .set('Accept', 'application/json, text/plain, */*')
        .send({
          serviceTypeId: testService.service_id
        })
        .expect(200);

      expect(response.body).toHaveProperty('ticketId');
    });

    it('should handle large service IDs (edge case testing)', async () => {
      const largeServiceName = 'A'.repeat(100); 
      
      const largeService = await prisma.serviceType.create({
        data: {
          tag_name: largeServiceName,
          average_service_time: 300,
          description: 'Large service for testing'
        }
      });

      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({
          serviceTypeId: largeService.service_id
        })
        .expect(200);

      expect(response.body).toHaveProperty('ticketId');
      expect(response.body).toHaveProperty('serviceId', largeService.service_id);

      // Cleanup
      await prisma.serviceType.delete({
        where: { service_id: largeService.service_id }
      });
    });
  });
});

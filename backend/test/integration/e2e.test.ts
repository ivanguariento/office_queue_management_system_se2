import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('E2E Tests - Office Queue Management System', () => {
  let testServiceId: string;

  beforeAll(async () => {
    // Setup: ensure at least one service exists for testing
    const service = await prisma.serviceType.upsert({
      where: { tag_name: 'test-service' },
      update: {},
      create: {
        tag_name: 'test-service',
        average_service_time: 10,
        description: 'Test service for e2e',
      },
    });
    testServiceId = service.service_id;
  });
/*
  afterAll(async () => {
    // Cleanup: delete all test data in correct order (respecting foreign keys)
    await prisma.servedTicket.deleteMany({});
    await prisma.counterService.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.counter.deleteMany({});
    await prisma.serviceType.deleteMany({});
    
    // Disconnect prisma
    await prisma.$disconnect();
  });
*/
  describe('GET /api/v1/services', () => {
    it('should return a list of all services', async () => {
      const response = await request(app)
        .get('/api/v1/services')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify structure of first service
      const firstService = response.body[0];
      expect(firstService).toHaveProperty('serviceId');
      expect(firstService).toHaveProperty('tagName');
      expect(firstService).toHaveProperty('averageServiceTime');
    });
  });

  describe('GET /api/v1/services/:serviceTypeId', () => {
    it('should return the queue length for a specific service', async () => {
      const response = await request(app)
        .get(`/api/v1/services/${testServiceId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(typeof response.body).toBe('number');
      expect(response.body).toBeGreaterThanOrEqual(0);
    });

    it('should return 404 for non-existent service', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/services/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/tickets/new', () => {
    it('should create a new ticket for a valid service', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({ serviceTypeId: testServiceId })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('ticketId');
      expect(response.body).toHaveProperty('ticketCode');
      expect(response.body).toHaveProperty('serviceId', testServiceId);
      expect(response.body).toHaveProperty('issuedAt');
    });

    it('should return 500 when serviceTypeId is missing', async () => {
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({})
        .expect(500);
    });

    it('should return 404 for non-existent service', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/v1/tickets/new')
        .send({ serviceTypeId: fakeId })
        .expect(404);

    });
  });

  describe('GET /api/v1/tickets/:id', () => {
    it('should return a ticket by id', async () => {
      // First create a ticket
      const createResponse = await request(app)
        .post('/api/v1/tickets/new')
        .send({ serviceTypeId: testServiceId })
        .expect(200);

      const ticketId = createResponse.body.ticketId;

      // Get the ticket by id
      const response = await request(app)
        .get(`/api/v1/tickets/${ticketId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('ticketId', ticketId);
      expect(response.body).toHaveProperty('ticketCode');
      expect(response.body).toHaveProperty('serviceId', testServiceId);
    });

    it('should return 404 for non-existent ticket', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/tickets/${fakeId}`)
        .expect(404);

    });
  });

  describe('GET /api/v1/tickets/next', () => {
    let testCounterId: string;

    beforeAll(async () => {
      // Setup: create a counter for testing
      const counter = await prisma.counter.create({
        data: {
          counter_number: 999,
        },
      });
      testCounterId = counter.counter_id;

      // Associate counter with test service
      await prisma.counterService.create({
        data: {
          counter_id: testCounterId,
          service_id: testServiceId,
        },
      });
    });

    it('should return 400 when counterId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/next')
        .expect(400);
    });

    it('should return the next ticket in queue for a counter', async () => {
      // Create a ticket first
      await request(app)
        .post('/api/v1/tickets/new')
        .send({ serviceTypeId: testServiceId })
        .expect(200);

      // Get next ticket
      const response = await request(app)
        .get('/api/v1/tickets/next')
        .query({ counterId: testCounterId })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('ticketId');
      expect(response.body).toHaveProperty('ticketCode');
      expect(response.body).toHaveProperty('serviceId', testServiceId);
    });

    it('should return 404 when no tickets are available', async () => {
      // Create a new counter that has no tickets
      const emptyCounter = await prisma.counter.create({
        data: {
          counter_number: 888,
        },
      });

      // Try to get next ticket (should fail as no tickets in queue)
      const response = await request(app)
        .get('/api/v1/tickets/next')
        .query({ counterId: emptyCounter.counter_id })
        .expect(404);
      
      // Cleanup
      await prisma.counter.delete({ where: { counter_id: emptyCounter.counter_id } });
    });
  });

  describe('Integration: Create ticket and check queue', () => {
    it('should increase queue length after creating a ticket', async () => {
      // Get initial queue length
      const initialResponse = await request(app)
        .get(`/api/v1/services/${testServiceId}`)
        .expect(200);
      const initialQueueLength = initialResponse.body;

      // Create a new ticket
      await request(app)
        .post('/api/v1/tickets/new')
        .send({ serviceTypeId: testServiceId })
        .expect(200);

      // Check queue length increased
      const finalResponse = await request(app)
        .get(`/api/v1/services/${testServiceId}`)
        .expect(200);
      const finalQueueLength = finalResponse.body;

      expect(finalQueueLength).toBe(initialQueueLength + 1);
    });
  });
});

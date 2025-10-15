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

  afterAll(async () => {
    // Cleanup: disconnect prisma
    await prisma.$disconnect();
  });

  describe('GET /api/services', () => {
    it('should return a list of all services', async () => {
      const response = await request(app)
        .get('/api/services')
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

  describe('GET /api/services/:serviceTypeId', () => {
    it('should return the queue length for a specific service', async () => {
      const response = await request(app)
        .get(`/api/services/${testServiceId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(typeof response.body).toBe('number');
      expect(response.body).toBeGreaterThanOrEqual(0);
    });

    it('should return 404 for non-existent service', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/services/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /api/tickets/new', () => {
    it('should create a new ticket for a valid service', async () => {
      const response = await request(app)
        .post('/api/tickets/new')
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
        .post('/api/tickets/new')
        .send({})
        .expect(500);
    });

    it('should return 404 for non-existent service', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/tickets/new')
        .send({ serviceTypeId: fakeId })
        .expect(404);

    });
  });

  describe('Integration: Create ticket and check queue', () => {
    it('should increase queue length after creating a ticket', async () => {
      // Get initial queue length
      const initialResponse = await request(app)
        .get(`/api/services/${testServiceId}`)
        .expect(200);
      const initialQueueLength = initialResponse.body;

      // Create a new ticket
      await request(app)
        .post('/api/tickets/new')
        .send({ serviceTypeId: testServiceId })
        .expect(200);

      // Check queue length increased
      const finalResponse = await request(app)
        .get(`/api/services/${testServiceId}`)
        .expect(200);
      const finalQueueLength = finalResponse.body;

      expect(finalQueueLength).toBe(initialQueueLength + 1);
    });
  });
});

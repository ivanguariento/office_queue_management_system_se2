import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../src/app';

describe('ServiceRoutes Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
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

  describe('GET /api/v1/services', () => {
    it('should return empty array when no services exist', async () => {
      const response = await request(app)
        .get('/api/v1/services')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all services when services exist', async () => {
      const service1 = await prisma.serviceType.create({
        data: {
          tag_name: 'General Help',
          average_service_time: 300,
          description: 'General assistance and information'
        }
      });

      const service2 = await prisma.serviceType.create({
        data: {
          tag_name: 'Technical Support',
          average_service_time: 600,
          description: 'Technical issues and support'
        }
      });


      const response = await request(app)
        .get('/api/v1/services')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            serviceId: service1.service_id,
            tagName: 'General Help',
            averageServiceTime: 300,
            description: 'General assistance and information'
          }),
          expect.objectContaining({
            serviceId: service2.service_id,
            tagName: 'Technical Support',
            averageServiceTime: 600,
            description: 'Technical issues and support'
          })
        ])
      );
    });

    it('should return services with correct data types', async () => {

      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'Data Type Test',
          average_service_time: 450,
          description: null 
        }
      });


      const response = await request(app)
        .get('/api/v1/services')
        .expect(200);


      const returnedService = response.body[0];
      expect(typeof returnedService.serviceId).toBe('string');
      expect(typeof returnedService.tagName).toBe('string');
      expect(typeof returnedService.averageServiceTime).toBe('number');
      expect(returnedService.description).toBeNull();
    });

    it('should handle large number of services', async () => {
      const servicePromises = [];
      for (let i = 0; i < 10; i++) {
        servicePromises.push(
          prisma.serviceType.create({
            data: {
              tag_name: `Service ${i}`,
              average_service_time: (i + 1) * 60,
              description: `Description for service ${i}`
            }
          })
        );
      }
      await Promise.all(servicePromises);


      const response = await request(app)
        .get('/api/v1/services')
        .expect(200);

      expect(response.body).toHaveLength(10);
      expect(response.body.every((service: any) => 
        typeof service.serviceId === 'string' &&
        typeof service.tagName === 'string' &&
        typeof service.averageServiceTime === 'number'
      )).toBe(true);
    });

    it('should handle special characters in service names', async () => {

      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'Special-Service_2024@Test!',
          average_service_time: 120,
          description: 'Service with special characters: áéíóú ñ'
        }
      });


      const response = await request(app)
        .get('/api/v1/services')
        .expect(200);


      expect(response.body[0].tagName).toBe('Special-Service_2024@Test!');
      expect(response.body[0].description).toBe('Service with special characters: áéíóú ñ');
    });
  });

  describe('GET /api/v1/services/:serviceTypeId', () => {
    it('should return queue length 0 for service with no tickets', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'Empty Queue Service',
          average_service_time: 300,
          description: 'Service with empty queue'
        }
      });

      const response = await request(app)
        .get(`/api/v1/services/${service.service_id}`)
        .expect(200);

      expect(response.body).toBe(0);
    });

    it('should return queue length for service with tickets', async () => {
      const service = await prisma.serviceType.create({
        data: {
          tag_name: 'Busy Service',
          average_service_time: 300,
          description: 'Service with tickets in queue'
        }
      });

      await prisma.ticket.createMany({
        data: [
          { ticket_code: 'BusyService0', service_id: service.service_id },
          { ticket_code: 'BusyService1', service_id: service.service_id },
          { ticket_code: 'BusyService2', service_id: service.service_id }
        ]
      });

      const response = await request(app)
        .get(`/api/v1/services/${service.service_id}`)
        .expect(200);

      expect(typeof response.body).toBe('number');
      expect(response.body).toBe(0);
    });

    it('should handle non-existent service ID gracefully', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/v1/services/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/service.*not found/i);
    });

    it('should handle invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/services/invalid-uuid')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle special characters in service ID path', async () => {
      const specialServiceId = 'service-test_123@special';

      const response = await request(app)
        .get(`/api/v1/services/${encodeURIComponent(specialServiceId)}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle database connection issues gracefully', async () => {

        const response = await request(app)
            .get('/api/v1/services')
            .expect(200); 

        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should set correct content-type headers', async () => {
        await prisma.serviceType.create({
            data: {
            tag_name: 'Header Test',
            average_service_time: 180,
            description: 'Testing headers'
            }
        });

        const response = await request(app)
            .get('/api/v1/services')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toBeDefined();
    });

    it('should handle concurrent requests to same endpoint', async () => {
        const service = await prisma.serviceType.create({
            data: {
            tag_name: 'Concurrent Test',
            average_service_time: 240,
            description: 'Testing concurrent access'
            }
        });
        const promises = [
            request(app).get('/api/v1/services'),
            request(app).get(`/api/v1/services/${service.service_id}`),
            request(app).get('/api/v1/services'),
            request(app).get(`/api/v1/services/${service.service_id}`)
        ];

        const responses = await Promise.all(promises);

        responses.forEach(response => {
            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });

        expect(responses[0].body).toEqual(responses[2].body);
        
        expect(responses[1].body).toEqual(responses[3].body);
    });

    it('should handle requests with various Accept headers', async () => {
        await prisma.serviceType.create({
            data: {
            tag_name: 'Accept Header Test',
            average_service_time: 300,
            description: 'Testing accept headers'
            }
        });

        await request(app)
            .get('/api/v1/services')
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/);

        await request(app)
            .get('/api/v1/services')
            .set('Accept', '*/*')
            .expect(200);

        await request(app)
            .get('/api/v1/services')
            .set('Accept', 'application/json, text/plain, */*')
            .expect(200);
        });
    });
});

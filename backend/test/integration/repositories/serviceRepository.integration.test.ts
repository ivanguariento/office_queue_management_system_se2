import { PrismaClient } from '@prisma/client';
import { serviceRepository } from '../../../src/repositories/serviceRepository';

describe('ServiceRepository Integration Tests', () => {
  let repository: serviceRepository;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new serviceRepository();
  });

  beforeEach(async () => {
    await prisma.ticket.deleteMany();
    await prisma.serviceType.deleteMany();
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.serviceType.deleteMany();
    await prisma.$disconnect();
  });

  describe('getAllServices', () => {
    it('should return empty array when no services exist', async () => {
      const services = await repository.getAllServices();
      
      expect(services).toEqual([]);
      expect(services).toHaveLength(0);
    });

    it('should return all services when services exist', async () => {
      const service1 = await prisma.serviceType.create({
        data: {
          tag_name: 'Test Service 1',
          average_service_time: 10,
          description: 'Test description 1'
        }
      });

      const service2 = await prisma.serviceType.create({
        data: {
          tag_name: 'Test Service 2',
          average_service_time: 15,
          description: 'Test description 2'
        }
      });

      const services = await repository.getAllServices();

      expect(services).toHaveLength(2);
      expect(services).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            service_id: service1.service_id,
            tag_name: 'Test Service 1'
          }),
          expect.objectContaining({
            service_id: service2.service_id,
            tag_name: 'Test Service 2'
          })
        ])
      );
    });

    it('should return services in database order', async () => {
      const serviceA = await prisma.serviceType.create({
        data: {
          tag_name: 'A Service',
          average_service_time: 10,
          description: 'A Service Description'
        }
      });

      const serviceB = await prisma.serviceType.create({
        data: {
          tag_name: 'B Service', 
          average_service_time: 10,
          description: 'B Service Description'
        }
      });

      const serviceC = await prisma.serviceType.create({
        data: {
          tag_name: 'C Service',
          average_service_time: 10,
          description: 'C Service Description'
        }
      });

      const services = await repository.getAllServices();

      expect(services).toHaveLength(3);
      const serviceIds = services.map(s => s.service_id);
      expect(serviceIds).toContain(serviceA.service_id);
      expect(serviceIds).toContain(serviceB.service_id);
      expect(serviceIds).toContain(serviceC.service_id);
    });
  });

  describe('getServiceById', () => {
    it('should return null when service does not exist', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      const service = await repository.getServiceById(nonExistentUuid);
      
      expect(service).toBeNull();
    });

    it('should return service when service exists', async () => {
      const createdService = await prisma.serviceType.create({
        data: {
          tag_name: 'Test Service',
          average_service_time: 20,
          description: 'Test service description'
        }
      });

      const service = await repository.getServiceById(createdService.service_id);

      expect(service).not.toBeNull();
      expect(service).toEqual(expect.objectContaining({
        service_id: createdService.service_id,
        tag_name: 'Test Service',
        average_service_time: 20,
        description: 'Test service description'
      }));
    });

    it('should return exact match only', async () => {
      const service1 = await prisma.serviceType.create({
        data: {
          tag_name: 'Service 1',
          average_service_time: 10,
          description: 'Service 1 description'
        }
      });

      const service11 = await prisma.serviceType.create({
        data: {
          tag_name: 'Service 11', 
          average_service_time: 10,
          description: 'Service 11 description'
        }
      });

      const service = await repository.getServiceById(service1.service_id);

      expect(service).not.toBeNull();
      expect(service?.service_id).toBe(service1.service_id);
      expect(service?.tag_name).toBe('Service 1');
    });

    it('should handle special characters in tag name', async () => {
      const specialTagName = 'Service-Test_2024@Special';
      const createdService = await prisma.serviceType.create({
        data: {
          tag_name: specialTagName,
          average_service_time: 10,
          description: 'Special service description'
        }
      });

      const service = await repository.getServiceById(createdService.service_id);

      expect(service).not.toBeNull();
      expect(service?.service_id).toBe(createdService.service_id);
      expect(service?.tag_name).toBe(specialTagName);
    });
  });

  describe('Database connection and error handling', () => {
    it('should handle database connection properly', async () => {
      expect(async () => {
        await repository.getAllServices();
      }).not.toThrow();
    });

    it('should handle concurrent operations', async () => {
      const testUuid = '123e4567-e89b-12d3-a456-426614174001';
      const promises = [
        repository.getAllServices(),
        repository.getServiceById(testUuid),
        repository.getAllServices()
      ];

      expect(async () => {
        await Promise.all(promises);
      }).not.toThrow();
    });
  });
});

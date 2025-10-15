import { ServiceType, PrismaClient } from '@prisma/client';

export class serviceRepository {
private prisma = new PrismaClient()

  async getAllServices(): Promise<ServiceType[]> {
    return await this.prisma.serviceType.findMany();
  }

  async getServiceById(serviceId: string): Promise<ServiceType | null> {
    return await this.prisma.serviceType.findUnique({
      where: { service_id: serviceId },
    });
  }
}
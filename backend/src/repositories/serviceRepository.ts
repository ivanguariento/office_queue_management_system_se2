import { ServiceType, PrismaClient } from '@prisma/client';

export class serviceRepository {
private prisma = new PrismaClient()

  async getAllServices(): Promise<ServiceType[]> {
    return await this.prisma.serviceType.findMany();
  }
}
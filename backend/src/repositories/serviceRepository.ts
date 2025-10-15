import { ServiceType, PrismaClient } from '@prisma/client';
import { NotFoundError } from "@errors/NotFoundError";
import AppError from "@errors/AppError";

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
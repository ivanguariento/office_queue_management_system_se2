import { ServiceDTO, toServiceDTO } from "../dto/Service";
import { serviceRepository } from "../repositories/serviceRepository";

export async function getAllServices(): Promise<ServiceDTO[]> {
  const serviceRepo = new serviceRepository();
  return (await serviceRepo.getAllServices()).map(toServiceDTO);
}

export async function getServiceById(serviceId: string): Promise<ServiceDTO | null> {
  const serviceRepo = new serviceRepository();
  const service = await serviceRepo.getServiceById(serviceId);
  return service ? toServiceDTO(service) : null;
}
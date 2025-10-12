import { ServiceDTO, toServiceDTO } from "../dto/Service";
import { serviceRepository } from "../repositories/serviceRepository";

export async function getAllServices(): Promise<ServiceDTO[]> {
  const serviceRepo = new serviceRepository();
  return (await serviceRepo.getAllServices()).map(toServiceDTO);
}
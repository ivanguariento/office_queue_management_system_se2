import { ServiceDTO, toServiceDTO } from "../dto/Service";
import { serviceRepository } from "../repositories/serviceRepository";
import { get_queue_length } from "../services/queueServices";

export async function getAllServices(): Promise<ServiceDTO[]> {
    const serviceRepo = new serviceRepository();
    return (await serviceRepo.getAllServices()).map(toServiceDTO);
}

export async function getServiceById(serviceId: string): Promise<ServiceDTO | null> {
    const serviceRepo = new serviceRepository();
    const service = await serviceRepo.getServiceById(serviceId);
    if (!service) throw new Error("Service not found");

    return toServiceDTO(service);
}

export async function getQueueLength(serviceId: string): Promise<number> {
    const serviceRepo = new serviceRepository();
    const service = await serviceRepo.getServiceById(serviceId);
    if (!service) throw new Error("Service not found");
    return get_queue_length(serviceId);
}
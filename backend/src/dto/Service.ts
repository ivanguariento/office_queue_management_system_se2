export interface ServiceDTO {
  serviceId: string;
  tagName: string;
  averageServiceTime: number;
  description?: string | null;
}

export function toServiceDTO(prismaObj: any): ServiceDTO {
  return {
    serviceId: prismaObj.service_id,
    tagName: prismaObj.tag_name,
    averageServiceTime: prismaObj.average_service_time,
    description: prismaObj.description ?? null,
  };
}

export default ServiceDTO;

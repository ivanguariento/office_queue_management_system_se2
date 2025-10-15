export interface TicketDTO {
  ticketId: string;
  ticketCode: string;
  issuedAt?: string ; // ISO timestamp
  serviceId: string;
}

// Mappa un oggetto Ticket generato da Prisma al DTO usato nell'app
export function toTicketDTO(prismaObj: any): TicketDTO {
  return {
    ticketId: prismaObj.ticket_id,
    ticketCode: prismaObj.ticket_code,
    issuedAt: new Date(prismaObj.issued_at).toISOString(),
    serviceId: prismaObj.service_id,
  };
}

export default TicketDTO;

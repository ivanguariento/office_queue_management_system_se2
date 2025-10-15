export interface ServedTicketDTO {
    servedTicketId: string;
    ticketId: string;
    counterId: string;
    servedAt: string;
    endedAt?: string;
}

export function toServedTicketDTO(prismaObj: any): ServedTicketDTO {
    return {
        servedTicketId: prismaObj.served_ticket_id,
        ticketId: prismaObj.ticket_id,
        counterId: prismaObj.counter_id,
        servedAt: new Date(prismaObj.served_at).toISOString(),
        endedAt: prismaObj.ended_at ? new Date(prismaObj.ended_at).toISOString() : undefined
    };
}

export default ServedTicketDTO
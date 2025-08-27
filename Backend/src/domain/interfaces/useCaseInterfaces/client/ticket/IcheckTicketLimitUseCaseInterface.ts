export interface IcheckTicketLimitUseCaseInterface {
    checkTicketLimit(
        clientId: string,
        eventId: string,
        ticketVariant: 'standard' | 'premium' | 'vip',
        requestedQuantity: number
    ): Promise<{ canBook: boolean; remainingLimit: number; maxPerUser: number }>;
}

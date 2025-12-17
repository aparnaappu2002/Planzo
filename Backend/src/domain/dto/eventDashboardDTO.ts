export type EventDashboardDTO = {
    totalEvents: number
    activeEvents: number
    inactiveEvents: number
    statusCount: {
        upcoming: number
        completed: number
        cancelled: number
    }
    totalTicketsSold: number
}

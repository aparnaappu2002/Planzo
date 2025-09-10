

export interface IrejectBookingVendorUseCase {
    rejectBooking(bookingId: string,rejectionReason:string): Promise<boolean>
}
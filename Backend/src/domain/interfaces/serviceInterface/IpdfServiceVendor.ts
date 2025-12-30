import { VendorPdfReportInput } from "../../entities/vendorPdfReportInput"

export interface IpdfServiceVendor {
    generateVendorReportPdf(data: VendorPdfReportInput): Promise<Buffer>
}
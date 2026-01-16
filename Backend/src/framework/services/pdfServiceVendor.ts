import PDFDocument from "pdfkit";
import { IpdfServiceVendor } from "../../domain/interfaces/serviceInterface/IpdfServiceVendor";
import { VendorPdfReportInput } from "../../domain/entities/vendorPdfReportInput";

export class PdfServiceVendor implements IpdfServiceVendor {
  async generateVendorReportPdf(data: VendorPdfReportInput): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Uint8Array[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      

      // Main Title
      doc
        .fontSize(24)
        .fillColor("black")
        .text("Vendor Report", { align: "center", underline: true });
      doc.moveDown(2);

      // -------- EVENTS SECTION --------
      doc.fontSize(18).fillColor("black").text("Event Summary", { underline: true });
      doc.moveDown(1);

      // Table setup for events
      const eventTableTop = doc.y;
      const eventRowHeight = 30;
      const eventColumns = [
        { label: "Event Title", width: 150 },
        { label: "Start Date", width: 90 },
        { label: "Ticket Type", width: 80 },
        { label: "Sold/Total", width: 80 },
        { label: "Income", width: 90 },
      ];

      const startX = doc.page.margins.left;

      // Draw event table header
      let x = startX;
      doc.font("Helvetica-Bold").fontSize(11);
      eventColumns.forEach((col) => {
        doc.text(col.label, x, eventTableTop, { width: col.width });
        x += col.width;
      });

      // Draw line under header
      doc
        .moveTo(startX, eventTableTop + eventRowHeight - 5)
        .lineTo(
          startX + eventColumns.reduce((sum, c) => sum + c.width, 0),
          eventTableTop + eventRowHeight - 5
        )
        .stroke();

      // Draw event rows with ticket variants
      doc.font("Helvetica").fontSize(9);
      let y = eventTableTop + eventRowHeight;

      data.events.forEach((event) => {
        const hasVariants = event.ticketVariants && event.ticketVariants.length > 0;

        if (hasVariants) {
          // Calculate totals across all variants
          const totalTicketsSold = event.ticketVariants.reduce(
            (sum, variant) => sum + variant.ticketsSold,
            0
          );
          const totalIncome = event.ticketVariants.reduce(
            (sum, variant) => sum + variant.price * variant.ticketsSold,
            0
          );

          // First row - Event summary
          x = startX;
          doc.font("Helvetica-Bold").fontSize(9);
          doc.text(event.title, x, y, { width: eventColumns[0].width });
          x += eventColumns[0].width;
          doc.text(new Date(event.startTime).toDateString(), x, y, {
            width: eventColumns[1].width,
          });
          x += eventColumns[1].width;
          doc.text("All Types", x, y, { width: eventColumns[2].width });
          x += eventColumns[2].width;
          doc.text(`${totalTicketsSold}`, x, y, { width: eventColumns[3].width });
          x += eventColumns[3].width;
          doc.text(`₹${totalIncome.toFixed(2)}`, x, y, { width: eventColumns[4].width });

          y += eventRowHeight;

          // Check pagination before variants
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = doc.page.margins.top;
          }

          // Variant breakdown
          doc.font("Helvetica").fontSize(8);
          event.ticketVariants.forEach((variant) => {
            x = startX + 10; // Indent variant rows
            doc.text("", x, y, { width: eventColumns[0].width - 10 });
            x += eventColumns[0].width;
            doc.text("", x, y, { width: eventColumns[1].width });
            x += eventColumns[1].width;
            doc.text(variant.type.toUpperCase(), x, y, { width: eventColumns[2].width });
            x += eventColumns[2].width;
            doc.text(`${variant.ticketsSold}/${variant.totalTickets}`, x, y, {
              width: eventColumns[3].width,
            });
            x += eventColumns[3].width;
            doc.text(`₹${(variant.price * variant.ticketsSold).toFixed(2)}`, x, y, {
              width: eventColumns[4].width,
            });

            y += eventRowHeight - 5; // Slightly less height for variant rows

            // Check pagination
            if (y > doc.page.height - 50) {
              doc.addPage();
              y = doc.page.margins.top;
            }
          });

          y += 5; // Extra space between events
        } else {
          // Fallback for events without variants (if any)
          x = startX;
          doc.font("Helvetica").fontSize(9);
          doc.text(event.title, x, y, { width: eventColumns[0].width });
          x += eventColumns[0].width;
          doc.text(new Date(event.startTime).toDateString(), x, y, {
            width: eventColumns[1].width,
          });
          x += eventColumns[1].width;
          doc.text("N/A", x, y, { width: eventColumns[2].width });
          x += eventColumns[2].width;
          doc.text("0", x, y, { width: eventColumns[3].width });
          x += eventColumns[3].width;
          doc.text("₹0.00", x, y, { width: eventColumns[4].width });

          y += eventRowHeight;
        }

        // Check pagination
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = doc.page.margins.top;
        }
      });

      // -------- BOOKINGS SECTION --------
      // Check if we need a new page before bookings section
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      } else {
        doc.moveDown(2);
      }

      const headingX = doc.page.margins.left;
      const headingY = doc.y;
      doc.fontSize(18).fillColor("black").text("Service Booking Summary", headingX, headingY, {
        underline: true,
        align: "left",
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      });
      doc.moveDown(1);

      const bookingTableTop = doc.y;
      const bookingRowHeight = 25;
      const bookingColumns = [
        { label: "Service Title", width: 120 },
        { label: "Price", width: 50 },
        { label: "Date", width: 90 },
        { label: "Payment", width: 70 },
        { label: "Status", width: 70 },
        { label: "Client Email", width: 95 },
      ];

      // Draw bookings header
      x = startX;
      doc.font("Helvetica-Bold").fontSize(11);
      bookingColumns.forEach((col) => {
        doc.text(col.label, x, bookingTableTop, { width: col.width });
        x += col.width;
      });

      // Line under header
      doc
        .moveTo(startX, bookingTableTop + bookingRowHeight - 5)
        .lineTo(
          startX + bookingColumns.reduce((sum, c) => sum + c.width, 0),
          bookingTableTop + bookingRowHeight - 5
        )
        .stroke();

      // Draw bookings rows
      doc.font("Helvetica").fontSize(9);
      y = bookingTableTop + bookingRowHeight;

      // Check if bookings exist
      if (!data.bookings || data.bookings.length === 0) {
        doc.text("No bookings available for the selected period.", startX, y);
        console.log('No bookings to display');
      } else {
        console.log(`Rendering ${data.bookings.length} bookings`);
        
        data.bookings.forEach((booking, index) => {
          console.log(`Processing booking ${index + 1}/${data.bookings.length}`);
          
          x = startX;
          
          // Safe data extraction with fallbacks
          const serviceTitle = booking.serviceId?.serviceTitle || 'N/A';
          const servicePrice = booking.serviceId?.servicePrice || 0;
          // Use booking.date[0] if available, otherwise use createdAt
          const bookingDate = booking.date && booking.date.length > 0 
            ? new Date(booking.date[0]).toDateString() 
            : new Date(booking.createdAt).toDateString();
          const paymentStatus = booking.paymentStatus || 'N/A';
          const status = booking.status || 'N/A';
          const clientEmail = booking.clientId?.email || booking.email || 'N/A';
          
          const values = [
            serviceTitle,
            `Rs ${servicePrice}`,
            bookingDate,
            paymentStatus,
            status,
            clientEmail,
          ];

          values.forEach((text, i) => {
            doc.text(String(text), x, y, { width: bookingColumns[i].width, lineBreak: false });
            x += bookingColumns[i].width;
          });

          y += bookingRowHeight;

          // Pagination if bottom reached
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = doc.page.margins.top;

            // Repeat booking table header on new page
            x = startX;
            doc.font("Helvetica-Bold").fontSize(11);
            bookingColumns.forEach((col) => {
              doc.text(col.label, x, y, { width: col.width });
              x += col.width;
            });
            doc
              .moveTo(startX, y + bookingRowHeight - 5)
              .lineTo(
                startX + bookingColumns.reduce((sum, c) => sum + c.width, 0),
                y + bookingRowHeight - 5
              )
              .stroke();
            y += bookingRowHeight;
            doc.font("Helvetica").fontSize(9);
          }
        });
        
        console.log('Finished rendering all bookings');
      }

      doc.end();
    });
  }
}
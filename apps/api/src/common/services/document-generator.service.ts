import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class DocumentGeneratorService {
    async generatePayslip(data: any): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // Header
            doc.fontSize(20).text('Payslip', { align: 'center' });
            doc.moveDown();

            // Branch Info
            doc.fontSize(12).text(`Branch ID: ${data.branchId}`);
            doc.text(`Period: ${new Date(data.month).toLocaleDateString()}`);
            doc.moveDown();

            // Staff Info
            doc.text(`Staff Name: ${data.staffName}`);
            doc.text(`Designation: ${data.designation}`);
            doc.moveDown();

            // Earnings
            doc.text('Earnings:', { underline: true });
            doc.text(`Base Salary: $${data.baseSalary}`);
            doc.moveDown();

            // Deductions
            doc.text('Deductions:', { underline: true });
            doc.text(`LOP/Deductions: $${data.totalDeductions}`);
            doc.moveDown();

            // Net Pay
            doc.moveDown();
            doc.fontSize(14).font('Helvetica-Bold').text(`Net Salary: $${data.netSalary}`);

            doc.end();
        });
    }
}

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PayrollListener {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly prisma: PrismaService
    ) { }

    @OnEvent('payroll.committed')
    async handlePayrollCommittedEvent(payload: { runId: string }) {
        console.log('[Listener] Payroll Committed Event Received');

        // Fetch ledgers for this run to know who to email
        const ledgers = await this.prisma.payrollLedger.findMany({
            where: { payrollRunId: payload.runId },
            include: { staff: { include: { user: true } } }
        });

        console.log(`[Listener] Queuing ${ledgers.length} payslip notifications...`);

        for (const ledger of ledgers) {
            const subject = `Payslip Generated - ${ledger.month.toISOString().split('T')[0]}`;
            const body = `Dear ${ledger.staff.user?.email || 'Staff Member'}, \n\nYour salary of $${ledger.netSalary} has been processed. \n\nLogin to view your payslip.`;

            if (ledger.staff.user?.email) {
                this.notificationService.sendEmail(ledger.staff.user.email, subject, body).catch(e => console.error(e));
            }
        }
    }
}

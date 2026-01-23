import { Injectable } from '@nestjs/common';
import { GlobalContextService } from '../../common/context/global-context.service';
import { ReportingService } from '../reporting/reporting.service';
import { FeesService } from '../fees/fees.service';

@Injectable()
export class AssistantService {
    constructor(
        private readonly reportingService: ReportingService,
        private readonly feesService: FeesService,
        private readonly context: GlobalContextService
    ) { }

    async processQuery(query: string) {
        const lowerQuery = query.toLowerCase();

        // 1. KPI / Revenue Queries
        if (lowerQuery.includes('revenue') || lowerQuery.includes('collection')) {
            return this.handleRevenueQuery();
        }

        // 2. Student Count Query
        if (lowerQuery.includes('student') && (lowerQuery.includes('count') || lowerQuery.includes('total') || lowerQuery.includes('many'))) {
            return this.handleStudentCountQuery();
        }

        // 3. Pending Fees
        if (lowerQuery.includes('pending') || lowerQuery.includes('dues')) {
            return this.handleDuesQuery();
        }

        // 4. Default / Fallback
        return {
            type: 'text',
            content: "I'm not sure about that. Try asking about 'Total Revenue', 'Student Count', or 'Pending Dues'."
        };
    }

    private async handleRevenueQuery() {
        const kpis = await this.reportingService.getKPIs();
        // Format as currency
        const revenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(kpis.revenue || 0);
        return {
            type: 'text',
            content: `The total revenue collected this month is ${revenue}.`
        };
    }

    private async handleStudentCountQuery() {
        const kpis = await this.reportingService.getKPIs();
        return {
            type: 'text',
            content: `There are currently ${kpis.totalStudents} active students enrolled.`
        };
    }

    private async handleDuesQuery() {
        // ReportingService.getKPIs() doesn't currently return Pending Dues.
        // For MVP, we can say we don't know or fetch from FeesService if possible.
        // Or we can just calculate it here if we inject FeeService logic, but let's stick to what we have.
        // Let's defer to a specific service call or return a placeholder.
        return {
            type: 'text',
            content: `I can currently only show collected revenue. Please check the Fees Dashboard for detailed pending dues.`
        };
    }
}

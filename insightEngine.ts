export type InsightSeverity = 'critical' | 'warning' | 'info' | 'positive';

export interface Insight {
    message: string;
    severity: InsightSeverity;
    icon: string;
}

export interface Stats {
    effectiveRate: number;
    totalHours: number;
    nonBillableRatio: number; // Ratio from 0 to 1
    revisionPercent: number; // Percentage from 0 to 100
    categoryBreakdown: Record<string, number>; // Maps category name to hours spent
    isBelowThreshold: boolean;
}

/**
 * Generates an array of actionable insights based on project statistics.
 * Helps freelancers identify where time is wasted and whether the project remains profitable.
 */
export function generateInsights(stats: Stats): Insight[] {
    const insights: Insight[] = [];

    // Critical Insight: Effective rate below minimum threshold
    if (stats.isBelowThreshold) {
        insights.push({
            message: 'Effective rate has dropped below your minimum acceptable threshold.',
            severity: 'critical',
            icon: '📉',
        });
    }

    // Warning Insight: Too many revisions
    if (stats.revisionPercent > 25) {
        insights.push({
            message: `High revision time. Revisions account for ${stats.revisionPercent.toFixed(1)}% of total effort.`,
            severity: 'warning',
            icon: '⚠️',
        });
    }

    // Warning Insight: High non-billable ratio
    if (stats.nonBillableRatio > 0.35) {
        insights.push({
            message: `Over ${(stats.nonBillableRatio * 100).toFixed(1)}% of your time is spent on non-billable work.`,
            severity: 'warning',
            icon: '⏱️',
        });
    }

    // Info Insight: Too much time on calls
    const callHours = stats.categoryBreakdown['calls'] || 0;
    if (callHours > 3) {
        insights.push({
            message: `You've spent ${callHours} hours on calls. Try streamlining future meetings.`,
            severity: 'info',
            icon: '📞',
        });
    }

    // Positive Insight: Highly profitable project
    if (stats.effectiveRate > 1000) {
        insights.push({
            message: `Great job! Your effective hourly rate is a solid ₹${stats.effectiveRate.toFixed(2)}.`,
            severity: 'positive',
            icon: '🚀',
        });
    }

    return insights;
}

import { predictRiskFromModel } from './mlRiskDetector';

export type ClientRisk = 'good' | 'risky' | 'bad';

/**
 * Calculates a risk score for the client based on provided statistics.
 * Helps identify problematic clients early on based on time wastage.
 */
export function detectClientRisk(stats: Stats): ClientRisk {
    // 🧠 Route directly to your newly integrated ML model!
    return predictRiskFromModel(stats);
}

import { Stats } from './insightEngine';

export function explainRisk(stats: Stats): string[] {
    const reasons: string[] = [];

    if (stats.nonBillableRatio > 0.4) {
        reasons.push("High non-billable time (>40%)");
    }

    if (stats.revisionPercent > 25) {
        reasons.push("Too many revisions");
    }

    if (stats.effectiveRate < 500) {
        reasons.push("Effective rate below ₹500/hr");
    }

    // Access the string record safely
    const calls = stats.categoryBreakdown?.['calls'] || 0;
    if (calls > 3) {
        reasons.push("Too much time spent on calls");
    }

    return reasons;
}

export function suggestActions(stats: Stats): string[] {
    const suggestions: string[] = [];

    if (stats.revisionPercent > 25) {
        suggestions.push("Limit revision rounds in contract");
    }

    // Access the string record safely
    const calls = stats.categoryBreakdown?.['calls'] || 0;
    if (calls > 3) {
        suggestions.push("Charge separately for meetings");
    }

    if (stats.nonBillableRatio > 0.4) {
        suggestions.push("Reduce unpaid work or renegotiate scope");
    }

    return suggestions;
}
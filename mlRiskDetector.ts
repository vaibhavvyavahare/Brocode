import { Stats, ClientRisk } from './insightEngine';

// This is the output generated from m2cgen. 
// We simply add "input: number[]" to please TypeScript, and change "inf" to "Infinity".
export function score(input: number[]): number[] {
    var var0: number[];
    if (input[1] <= 0.39499999582767487) {
        if (input[1] <= 0.26500000059604645) {
            var0 = [0.0, 1.0, 0.0, 0.0]; // Class 1 ('good')
        } else {
            var0 = [0.0, 0.0, 1.0, 0.0]; // Class 2 ('risky')
        }
    } else {
        if (input[0] <= Infinity) { // fixed 'inf' to 'Infinity'
            if (input[1] <= 0.4050000011920929) {
                if (input[0] <= 775.0) {
                    var0 = [0.0, 0.0, 1.0, 0.0]; // Class 2 ('risky')
                } else {
                    var0 = [1.0, 0.0, 0.0, 0.0]; // Class 0 ('bad')
                }
            } else {
                var0 = [1.0, 0.0, 0.0, 0.0]; // Class 0 ('bad')
            }
        } else {
            var0 = [0.0, 0.0, 0.0, 1.0]; // Fallback class
        }
    }
    return var0;
}

/**
 * Maps our App's 'Stats' object into the array format your
 * completely raw ML model expects, and converts the result back.
 */
export function predictRiskFromModel(stats: Stats): ClientRisk {
    // As per your model's exact logic structure:
    // input[0] maps to `effectiveRate`
    // input[1] maps to `nonBillableRatio`
    const modelFeatures = [stats.effectiveRate, stats.nonBillableRatio];

    const predictedProbs = score(modelFeatures);

    // Find which class "won" by finding the index of the 1.0
    const classIndex = predictedProbs.indexOf(Math.max(...predictedProbs));

    // Map the raw integer index back to a formatted ClientRisk string
    if (classIndex === 0) return 'bad';
    if (classIndex === 1) return 'good';
    if (classIndex === 2) return 'risky';

    return 'good';
}
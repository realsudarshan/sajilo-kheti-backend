import type z from "zod";
import type { LandSizeSchema } from "../models/land.models.js";
/**
 * Converts various Nepali land units and Square Feet into Square Meters.
 * Constants are based on standard conversions: 1 Ropani = 508.72 m² approx.
 */
export declare const calculateSqMtr: (size: z.infer<typeof LandSizeSchema>) => number;
//# sourceMappingURL=converttosqmeter.d.ts.map
import type z from "zod";
import type { LandSizeSchema } from "../models/land.models.js";

/**
 * Converts various Nepali land units and Square Feet into Square Meters.
 * Constants are based on standard conversions: 1 Ropani = 508.72 m² approx.
 */
export const calculateSqMtr = (size: z.infer<typeof LandSizeSchema>): number => {
  switch (size.system) {
    case "HILLY":
      // Ropani (508.72), Aana (31.80), Paisa (7.95), Daam (1.99)
      return (
        size.ropani * 508.72 +
        size.aana * 31.80 +
        size.paisa * 7.95 +
        size.daam * 1.99
      );
    case "TERAI":
      // Bigha (6772.63), Kattha (338.63), Dhur (16.93)
      return (
        size.bigha * 6772.63 +
        size.kattha * 338.63 +
        size.dhur * 16.93
      );
    case "FLAT":
      // If SQ_FT, divide by 10.7639 to get SQ_MTR
      return size.unit === "SQ_FT" 
        ? size.value / 10.7639 
        : size.value;
    default:
      return 0;
  }
};
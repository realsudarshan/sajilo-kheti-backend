export const convertToSqMeter = (size, unit) => {
    switch (unit.toUpperCase()) {
        // Hilly System
        case "ROPANI":
            return size * 508.72;
        case "AANA":
            return size * 31.80;
        case "PAISA":
            return size * 7.95;
        case "DAAM":
            return size * 1.99;
        // Terai System
        case "BIGHA":
            return size * 6772.63;
        case "KATTHA":
            return size * 338.63;
        case "DHUR":
            return size * 16.93;
        // Standard Metrics
        case "SQ_FT":
            return size * 0.092903;
        case "SQ_MTR":
            return size;
        default:
            throw new Error(`Unsupported unit: ${unit}`);
    }
};
//# sourceMappingURL=converttosqmeter.js.map
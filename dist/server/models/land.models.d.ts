import { z } from 'zod';
export declare const LandStatusSchema: z.ZodEnum<{
    AVAILABLE: "AVAILABLE";
    IN_NEGOTIATION: "IN_NEGOTIATION";
    LEASED: "LEASED";
    HIDDEN: "HIDDEN";
}>;
export declare const publishLandInputSchema: z.ZodObject<{
    ownerId: z.ZodString;
    location: z.ZodString;
    size: z.ZodNumber;
    price: z.ZodNumber;
    description: z.ZodString;
    landpic: z.ZodString;
    morelandpic: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    title: z.ZodOptional<z.ZodString>;
    lalpurjaUrl: z.ZodString;
}, z.core.$strip>;
export declare const publishLandResponseSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    location: z.ZodString;
    sizeInSqFt: z.ZodNumber;
    pricePerMonth: z.ZodNumber;
    description: z.ZodString;
    heroImageUrl: z.ZodString;
    galleryUrls: z.ZodArray<z.ZodString>;
    status: z.ZodString;
    createdAt: z.ZodDate;
}, z.core.$strip>;
export declare const searchLandInputSchema: z.ZodObject<{
    location: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    minSize: z.ZodOptional<z.ZodNumber>;
    maxSize: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const landSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    description: z.ZodString;
    location: z.ZodString;
    area: z.ZodNullable<z.ZodString>;
    sizeInSqFt: z.ZodNumber;
    pricePerMonth: z.ZodNumber;
    heroImageUrl: z.ZodString;
    galleryUrls: z.ZodArray<z.ZodString>;
    status: z.ZodString;
    createdAt: z.ZodDate;
}, z.core.$strip>;
export declare const searchLandResponseSchema: z.ZodObject<{
    lands: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        location: z.ZodString;
        area: z.ZodNullable<z.ZodString>;
        sizeInSqFt: z.ZodNumber;
        pricePerMonth: z.ZodNumber;
        heroImageUrl: z.ZodString;
        galleryUrls: z.ZodArray<z.ZodString>;
        status: z.ZodString;
        createdAt: z.ZodDate;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const getLandByIdInputSchema: z.ZodObject<{
    landId: z.ZodString;
}, z.core.$strip>;
export declare const updateLandStatusInputSchema: z.ZodObject<{
    landId: z.ZodString;
    status: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
}, z.core.$strip>;
export declare const updateLandStatusResponseSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=land.models.d.ts.map
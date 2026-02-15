import { z } from 'zod';
export declare const LandStatusSchema: z.ZodEnum<{
    AVAILABLE: "AVAILABLE";
    UNVERIFIED: "UNVERIFIED";
    REJECTED: "REJECTED";
    IN_NEGOTIATION: "IN_NEGOTIATION";
    LEASED: "LEASED";
    HIDDEN: "HIDDEN";
}>;
export declare const LandSizeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    system: z.ZodLiteral<"HILLY">;
    ropani: z.ZodDefault<z.ZodNumber>;
    aana: z.ZodDefault<z.ZodNumber>;
    paisa: z.ZodDefault<z.ZodNumber>;
    daam: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    system: z.ZodLiteral<"TERAI">;
    bigha: z.ZodDefault<z.ZodNumber>;
    kattha: z.ZodDefault<z.ZodNumber>;
    dhur: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    system: z.ZodLiteral<"FLAT">;
    value: z.ZodNumber;
    unit: z.ZodEnum<{
        SQ_FT: "SQ_FT";
        SQ_MTR: "SQ_MTR";
    }>;
}, z.core.$strip>], "system">;
export declare const landSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    owner: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    sizeInSqmeter: z.ZodNumber;
    pricePerMonth: z.ZodNumber;
    heroImageUrl: z.ZodString;
    galleryUrls: z.ZodArray<z.ZodString>;
    lalpurjaUrl: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        UNVERIFIED: "UNVERIFIED";
        REJECTED: "REJECTED";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const publishLandInputSchema: z.ZodObject<{
    ownerId: z.ZodString;
    title: z.ZodString;
    location: z.ZodString;
    size: z.ZodDiscriminatedUnion<[z.ZodObject<{
        system: z.ZodLiteral<"HILLY">;
        ropani: z.ZodDefault<z.ZodNumber>;
        aana: z.ZodDefault<z.ZodNumber>;
        paisa: z.ZodDefault<z.ZodNumber>;
        daam: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        system: z.ZodLiteral<"TERAI">;
        bigha: z.ZodDefault<z.ZodNumber>;
        kattha: z.ZodDefault<z.ZodNumber>;
        dhur: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        system: z.ZodLiteral<"FLAT">;
        value: z.ZodNumber;
        unit: z.ZodEnum<{
            SQ_FT: "SQ_FT";
            SQ_MTR: "SQ_MTR";
        }>;
    }, z.core.$strip>], "system">;
    price: z.ZodNumber;
    description: z.ZodString;
    landpic: z.ZodString;
    morelandpic: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    lalpurjaUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const publishLandResponseSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    owner: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    sizeInSqmeter: z.ZodNumber;
    pricePerMonth: z.ZodNumber;
    heroImageUrl: z.ZodString;
    galleryUrls: z.ZodArray<z.ZodString>;
    lalpurjaUrl: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        UNVERIFIED: "UNVERIFIED";
        REJECTED: "REJECTED";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const searchLandInputSchema: z.ZodObject<{
    location: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    minSize: z.ZodOptional<z.ZodNumber>;
    maxSize: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const searchLandResponseSchema: z.ZodObject<{
    lands: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        owner: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodString;
        sizeInSqmeter: z.ZodNumber;
        pricePerMonth: z.ZodNumber;
        heroImageUrl: z.ZodString;
        galleryUrls: z.ZodArray<z.ZodString>;
        lalpurjaUrl: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            AVAILABLE: "AVAILABLE";
            UNVERIFIED: "UNVERIFIED";
            REJECTED: "REJECTED";
            IN_NEGOTIATION: "IN_NEGOTIATION";
            LEASED: "LEASED";
            HIDDEN: "HIDDEN";
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const getLandByIdInputSchema: z.ZodObject<{
    landId: z.ZodString;
}, z.core.$strip>;
export declare const updateLandStatusInputSchema: z.ZodObject<{
    landId: z.ZodString;
    status: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        UNVERIFIED: "UNVERIFIED";
        REJECTED: "REJECTED";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
}, z.core.$strip>;
export declare const updateLandStatusResponseSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        UNVERIFIED: "UNVERIFIED";
        REJECTED: "REJECTED";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=land.models.d.ts.map
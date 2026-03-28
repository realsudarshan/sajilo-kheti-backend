import { TRPCError } from '@trpc/server';
import { prisma } from '../lib/prisma.js';
import { posthog } from '../lib/analytics.js';
const COMMISSION_RATE = 0.05;
export async function payEscrowService(input) {
    const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
        include: { land: true, escrow: true },
    });
    if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
    }
    if (application.leaserId !== input.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
    }
    if (application.status !== 'ACCEPTED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Application must be ACCEPTED before paying escrow' });
    }
    // Idempotency — already paid, just return existing record
    if (application.escrow) {
        return {
            success: true,
            alreadyRecorded: true,
            message: 'Escrow already recorded.',
            escrow: {
                id: application.escrow.id,
                applicationId: application.escrow.applicationId,
                amount: application.escrow.amount,
                status: application.escrow.status,
            },
            landStatus: application.land.status,
        };
    }
    if (application.land.status !== 'IN_NEGOTIATION') {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Land must be IN_NEGOTIATION status. Application must be accepted first.',
        });
    }
    const commission = input.commission ?? input.amount * COMMISSION_RATE;
    const escrow = await prisma.escrow.create({
        data: {
            applicationId: input.applicationId,
            amount: input.amount,
            paymentId: input.paymentId,
            commission,
            status: 'HOLDING',
            ownerId: application.land.ownerId,
            leaserId: application.leaserId,
        },
    });
    posthog.capture({
        distinctId: input.userId,
        event: 'escrow_paid',
        properties: {
            escrow_id: escrow.id,
            application_id: input.applicationId,
            amount: input.amount,
            commission,
            land_id: application.landId,
            owner_id: application.land.ownerId,
        },
    });
    return {
        success: true,
        alreadyRecorded: false,
        message: 'Escrow payment successful. You can now arrange to meet at Malpot Karyalaya.',
        escrow: {
            id: escrow.id,
            applicationId: escrow.applicationId,
            amount: escrow.amount,
            status: escrow.status,
        },
        landStatus: application.land.status,
    };
}
//# sourceMappingURL=escrow.service.js.map
import { EscrowModel, payEscrowInputSchema, payEscrowResponseSchema, verifyMalpotPapersInputSchema, verifyMalpotPapersResponseSchema } from "../../models/escrow.models.js";
import { adminProcedure, publicProcedure, router } from "../../trpc.js";
export const escrowRouter = router({
    PayEscrow: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: '/lease/pay-escrow',
            description: 'Pay escrow for an accepted application',
        },
    })
        .input(payEscrowInputSchema)
        .output(payEscrowResponseSchema)
        .mutation(async ({ ctx, input }) => {
        // Delegate logic to model
        return await EscrowModel.payEscrow(ctx, input);
    }),
    VerifyMalpotPapers: adminProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/lease/verify-malpot-papers',
            description: 'Admin verifies the Malpot agreement papers'
        }
    })
        .input(verifyMalpotPapersInputSchema)
        .output(verifyMalpotPapersResponseSchema)
        .mutation(async ({ ctx, input }) => {
        return await EscrowModel.verifyMalpotPapers(ctx, input);
    }),
});
//# sourceMappingURL=escrow.routes.js.map
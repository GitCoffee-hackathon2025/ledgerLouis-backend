import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { buildAuthModule } from "../module.js";

import {
  EmailVerificationResendBody,
  EmailVerificationResponse,
} from "../schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const verificationEmailRouter =
  (
    verificationEmail: ReturnType<typeof buildAuthModule>["emailService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.post(
      "/resend",
      {
        config: { rateLimit: { max: 5, window: 180 } },
        schema: {
          tags: ["email-verification"],
          summary: "Resend email verification",
          body: EmailVerificationResendBody,
          response: {
            200: EmailVerificationResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              "INVALID_JSON",
              "USER_NOT_FOUND",
              "EMAIL_ALREADY_VERIFIED",
              "VERIFICATION_EMAIL_NOT_FOUND",
              "EMAIL_VERIFICATION_COOLDOWN",
            ]),
          },
        },
      },
      async (req, reply) => {
        const result = await verificationEmail.resend(
          req.body.email,
          req.server.config.WEB_URL,
        );

        return reply
          .status(200)
          .send(result);
      },
    );
  };

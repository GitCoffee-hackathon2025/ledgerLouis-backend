import type { createKeyService } from "./key.service.js";
import { AppError } from "../../../shared/errors/index.js";
import { authPolicy } from "../auth.policy.js";

import { SignJWT, jwtVerify, decodeProtectedHeader } from "jose";
import type { ULID } from "../../../lib/id.js";

type AccessPayload = {
  sub: ULID;
  sid: ULID;
};

type RefreshPayload = {
  sub: ULID;
  sid: ULID;
  jti: ULID;
};

type TokenPayloadMap = {
  access: AccessPayload;
  refresh: RefreshPayload;
};

export const createTokenService = (
  keyService: ReturnType<typeof createKeyService>,
) => {
  const sign = async <T extends keyof TokenPayloadMap>(
    type: T,
    payload: TokenPayloadMap[T],
    privateKey: CryptoKey,
    kid: ULID,
    expiresIn: string,
  ) => {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "EdDSA", kid })
      .setExpirationTime(expiresIn)
      .sign(privateKey);
  };

  return {
    async signAccessToken(payload: AccessPayload) {
      const { kid, privateKey } = await keyService.getPrivateKey();

      return {
        token: await sign(
          "access",
          payload,
          privateKey,
          kid,
          `${authPolicy.session / 1000}s`,
        ),
      };
    },
    async signRefreshToken(payload: RefreshPayload) {
      const { kid, privateKey } = await keyService.getPrivateKey();

      return {
        token: await sign(
          "refresh",
          payload,
          privateKey,
          kid,
          `${authPolicy.refresh / 1000}s`,
        ),
      };
    },
    async verifyAccess(token: string) {
      let kid: ULID | undefined;

      try {
        const header = decodeProtectedHeader(token);
        kid = header.kid as ULID;
      } catch {
        throw new AppError("INVALID_TOKEN");
      }

      if (!kid) throw new AppError("INVALID_TOKEN");

      try {
        const { payload } = await jwtVerify<AccessPayload>(
          token,
          await keyService.getPublicKeyByKid(kid),
          {
            algorithms: ["EdDSA"],
          },
        );

        // validação estrutural
        if (
          typeof payload.sub !== "string" ||
          typeof payload.sid !== "string" ||
          "jti" in payload // access NÃO deve ter jti
        ) {
          throw new AppError("INVALID_TOKEN");
        }

        return payload;
      } catch (err: any) {
        if (err.code === "ERR_JWT_EXPIRED") throw new AppError("TOKEN_EXPIRED");

        throw new AppError("INVALID_TOKEN");
      }
    },
    async verifyRefreshToken(token: string) {
      let kid: ULID | undefined;
      try {
        kid = decodeProtectedHeader(token).kid as ULID;
        if (!kid) throw new Error();
      } catch (error) {
        throw new AppError("INVALID_TOKEN");
      }
      const publicKey = await keyService.getPublicKeyByKid(kid);

      const { payload } = await jwtVerify<RefreshPayload>(token, publicKey, {
        algorithms: ["EdDSA"],
      });

      if (
        typeof payload.sub !== "string" ||
        typeof payload.sid !== "string" ||
        !("jti" in payload)
      )
        throw new AppError("INVALID_TOKEN");

      return payload;
    },
    // async verifySessionToken(token: string) {
    //   let kid: ULID | undefined;

    //   try {
    //     const header = decodeProtectedHeader(token);
    //     kid = header.kid as ULID;
    //   } catch {
    //     throw new AppError("INVALID_TOKEN");
    //   }

    //   if (!kid) throw new AppError("INVALID_TOKEN");

    //   try {
    //     const { payload } = await jwtVerify(
    //       token,
    //       await keyService.getPublicKeyByKid(kid),
    //       {
    //         algorithms: ["EdDSA"],
    //       },
    //     );

    //     return payload;
    //   } catch (err: any) {
    //     if (err.code === "ERR_JWT_EXPIRED") throw new AppError("TOKEN_EXPIRED");

    //     throw new AppError("INVALID_TOKEN");
    //   }
    // },
  };
};

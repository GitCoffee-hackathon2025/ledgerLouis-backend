ALTER TABLE "invites" RENAME COLUMN "token" TO "token_hash";--> statement-breakpoint
DROP INDEX "uq_token_invites";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_token_invites" ON "invites" USING btree ("token_hash");
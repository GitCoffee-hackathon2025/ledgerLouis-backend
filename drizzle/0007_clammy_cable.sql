ALTER TYPE "public"."guest_role" RENAME TO "permission_role";--> statement-breakpoint
ALTER TYPE "public"."permission_role" ADD VALUE 'owner' BEFORE 'admin';
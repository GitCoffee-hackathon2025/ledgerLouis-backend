ALTER TABLE `refresh_tokens` DROP INDEX `uq_refresh_tokens_token_hash`;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `user_id` char(26) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `last_activity_at` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_verified` timestamp;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `uq_refresh_token_hash` UNIQUE(`token_hash`);--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jwt_keys` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `jwt_keys` DROP COLUMN `deletedAt`;
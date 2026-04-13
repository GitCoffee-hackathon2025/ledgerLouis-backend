CREATE TABLE `jwt_keys` (
	`id` char(26) NOT NULL,
	`kid` char(26) NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text NOT NULL,
	`expires_at` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `jwt_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_jwt_keys_kid` UNIQUE(`kid`)
);
--> statement-breakpoint
ALTER TABLE `refresh_tokens` RENAME COLUMN `replaced_by_token_id` TO `replaced_by`;--> statement-breakpoint
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_replaced_by_token_id_refresh_tokens_id_fk`;
--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_replaced_by_refresh_tokens_id_fk` FOREIGN KEY (`replaced_by`) REFERENCES `refresh_tokens`(`id`) ON DELETE restrict ON UPDATE no action;
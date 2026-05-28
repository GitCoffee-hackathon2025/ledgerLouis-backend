CREATE TABLE `files` (
	`id` char(26) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`storage_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`provider` varchar(50) NOT NULL,
	`path` varchar(500) NOT NULL,
	`size` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profile_images` (
	`id` char(26) NOT NULL,
	`user_id` varchar(26) NOT NULL,
	`file_id` varchar(26) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `user_profile_images_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profile_images_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `user_profile_images_file_id_unique` UNIQUE(`file_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` varchar(255);
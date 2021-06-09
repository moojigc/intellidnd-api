ALTER TABLE `user`
    MODIFY `username` VARCHAR(128) COLLATE utf8mb4_bin;
ALTER TABLE `userRole`
    DROP PRIMARY KEY, ADD PRIMARY KEY (`roleKey`, `userId`);

CREATE TABLE phone (
        `userId` VARCHAR(40) NOT NULL,
        `number` VARCHAR(20) NOT NULL,
        `createdAt` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`userId`, `number`),
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE TABLE email (
        `userId` VARCHAR(40) NOT NULL,
        `address` VARCHAR(255) NOT NULL,
        `createdAt` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`userId`, `address`),
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

INSERT INTO `role` (`key`, `displayName`) VALUES ('unverified', 'Unverified User');
INSERT INTO `role` (`key`, `displayName`) VALUES ('recovery', 'In Recovery');

ALTER TABLE `token` ADD COLUMN `expiresAt` BIGINT UNSIGNED NULL;
ALTER TABLE `userRole` DROP COLUMN `id`;

ALTER TABLE `item`
    ADD COLUMN `name` VARCHAR(255) NOT NULL AFTER `id`,
    ADD COLUMN `value` INT UNSIGNED NULL AFTER `name`,
    CHANGE COLUMN `inventoryId` `inventoryId` VARCHAR(40) NOT NULL AFTER `id`;

ALTER TABLE `wallet` 
    CHANGE COLUMN `copper` `copper` BIGINT NOT NULL ,
    CHANGE COLUMN `gold` `gold` BIGINT NOT NULL ,
    CHANGE COLUMN `silver` `silver` BIGINT NOT NULL ,
    CHANGE COLUMN `platinum` `platinum` BIGINT NOT NULL ,
    CHANGE COLUMN `electrum` `electrum` BIGINT NOT NULL ;

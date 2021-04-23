CREATE TABLE roll (
        `name` VARCHAR(128) NOT NULL,
        `userId` VARCHAR(128) NOT NULL,
        `guildId` VARCHAR(128) DEFAULT 'global',
        `input` VARCHAR(255) NOT NULL,
        `lastRolledAt` BIGINT UNSIGNED NOT NULL,
        `createdAt` BIGINT UNSIGNED NOT NULL,
        `modifiedAt` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`name`, `userId`, `guildId`)
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE TRIGGER `roll_before_update` BEFORE UPDATE ON `roll`
    FOR EACH ROW BEGIN
        SET NEW.`modifiedAt` = UNIX_TIMESTAMP(NOW(6)) * 1000;
    END $$

DELIMITER ;

CREATE TABLE `character` (
        id VARCHAR(40) NOT NULL,
        userId VARCHAR(40) NOT NULL,
        guildId VARCHAR(128) NULL,
        name VARCHAR(128) NOT NULL,
        race VARCHAR(128) NULL,
        class VARCHAR(128) NULL,
        background VARCHAR(128) NULL,
        experience INT NOT NULL,
        level INT NOT NULL,
        maxHp INT NOT NULL,
        hp INT NOT NULL,
        armorClass INT NOT NULL,
        initiative INT NOT NULL,
        strength INT NOT NULL,
        dexterity INT NOT NULL,
        constitution INT NOT NULL,
        intelligence INT NOT NULL,
        wisdom INT NOT NULL,
        charisma INT NOT NULL,
        createdAt BIGINT UNSIGNED NOT NULL,
        modifiedAt BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`id`),
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE TABLE inventory (
        `id` VARCHAR(40) NOT NULL,
        `characterId` VARCHAR(40) NOT NULL,
        `createdAt` BIGINT UNSIGNED NOT NULL,
        `modifiedAt` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`id`),
        FOREIGN KEY (`characterId`) REFERENCES `character` (`id`) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE TABLE wallet (
        `id` VARCHAR(40) NOT NULL,
        `inventoryId` VARCHAR(40) NOT NULL,
        `copper` INT NOT NULL,
        `gold` INT NOT NULL,
        `silver` INT NOT NULL,
        `platinum` INT NOT NULL,
        `electrum` INT NOT NULL,
        `createdAt` BIGINT UNSIGNED NOT NULL,
        `modifiedAt` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`id`),
        FOREIGN KEY (`inventoryId`) REFERENCES `inventory` (`id`) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE TABLE item (
        `id` VARCHAR(40) NOT NULL,
        `inventoryId` VARCHAR(40) NOT NULL,
        `type` VARCHAR(20) NOT NULL,
        `createdAt` BIGINT UNSIGNED NOT NULL,
        `modifiedAt` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`id`),
        FOREIGN KEY (`inventoryId`) REFERENCES `inventory` (`id`) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE TRIGGER `character_before_update` BEFORE UPDATE ON `character`
    FOR EACH ROW BEGIN
        SET NEW.`modifiedAt` = UNIX_TIMESTAMP(NOW(6)) * 1000;
    END $$

CREATE TRIGGER `wallet_before_update` BEFORE UPDATE ON `wallet`
    FOR EACH ROW BEGIN
        SET NEW.`modifiedAt` = UNIX_TIMESTAMP(NOW(6)) * 1000;
    END $$

CREATE TRIGGER `item_before_update` BEFORE UPDATE ON `item`
FOR EACH ROW BEGIN
    SET NEW.`modifiedAt` = UNIX_TIMESTAMP(NOW(6)) * 1000;
END $$

CREATE TRIGGER `inventory_before_update` BEFORE UPDATE ON `inventory`
    FOR EACH ROW BEGIN
        SET NEW.`modifiedAt` = UNIX_TIMESTAMP(NOW(6)) * 1000;
    END $$

DELIMITER ;

CREATE TABLE guildUser (
        `userId` VARCHAR(40) NOT NULL,
        `guildId` VARCHAR(128) NOT NULL,
        `alias` VARCHAR(255),
        `createdAt` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY(`userId`, `guildId`),
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;
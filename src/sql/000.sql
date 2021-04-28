CREATE TABLE user (
        id VARCHAR(40) NOT NULL,
        username VARCHAR(255) COLLATE utf8mb4_bin,
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password MEDIUMTEXT NOT NULL,
        phone VARCHAR(20),
        phoneVerifiedAt BIGINT UNSIGNED,
        discordId VARCHAR(255),
        discordNickname VARCHAR(255),
        discordUsername VARCHAR(255),
        discordDiscriminator VARCHAR(4),
        emailValidatedAt BIGINT UNSIGNED,
        lastLoginAt BIGINT UNSIGNED,
        lastPasswordChangeAt BIGINT UNSIGNED,
        deletedAt BIGINT UNSIGNED,
        createdAt BIGINT UNSIGNED NOT NULL,
        modifiedAt BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (username),
        UNIQUE KEY (email)
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE TABLE token (
        id VARCHAR(40) NOT NULL,
        jwt LONGTEXT NOT NULL,
        userId VARCHAR(40) NOT NULL,
        createdAt BIGINT UNSIGNED NOT NULL,
        revokedAt BIGINT UNSIGNED,
        roles JSON NOT NULL,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE TABLE `role` (
        `key` VARCHAR(128) NOT NULL,
        `displayName` VARCHAR(128) NOT NULL,
        PRIMARY KEY (`key`),
        UNIQUE KEY (`displayName`)
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

INSERT INTO `role` (`key`, `displayName`) VALUES ('sysAdmin', 'System Administrator');

CREATE TABLE userRole (
        id VARCHAR(40) NOT NULL,
        roleKey VARCHAR(128) NOT NULL,
        userId VARCHAR(40) NOT NULL,
        createdAt BIGINT UNSIGNED NOT NULL,
        expiresAt BIGINT UNSIGNED,
        PRIMARY KEY (id),
        UNIQUE KEY (roleKey, userId),
        FOREIGN KEY (roleKey) REFERENCES `role` (`key`) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
    )
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
    DEFAULT CHARSET=utf8mb4
    COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE TRIGGER `user_before_update` BEFORE UPDATE ON `user`
    FOR EACH ROW BEGIN
        SET NEW.`modifiedAt` = UNIX_TIMESTAMP(NOW(6)) * 1000;
    END $$

DELIMITER ;
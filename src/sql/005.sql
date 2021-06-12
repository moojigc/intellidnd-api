ALTER TABLE `user` 
    CHANGE COLUMN `email` `email` VARCHAR(255) NULL ,
    CHANGE COLUMN `password` `password` MEDIUMTEXT NULL;
ALTER TABLE `roll` 
    ADD COLUMN `id` VARCHAR(21) NULL FIRST,
    ADD COLUMN `discordUserId` VARCHAR(255) NULL AFTER `name`;

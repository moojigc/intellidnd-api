ALTER TABLE `phone`
 	ADD UNIQUE KEY (`number`),
    ADD COLUMN `verifiedAt` BIGINT UNSIGNED NULL;
    
ALTER TABLE `email`
	ADD COLUMN `verifiedAt` BIGINT UNSIGNED NULL,
	ADD UNIQUE KEY (`address`);

ALTER TABLE `user`
	ADD FOREIGN KEY (`phone`) REFERENCES `phone` (`number`) ON DELETE SET NULL,
	ADD FOREIGN KEY (`email`) REFERENCES `email` (`address`) ON DELETE SET NULL,
	DROP COLUMN `phoneVerifiedAt`,
	DROP COLUMN `emailValidatedAt`;

ALTER TABLE `user` 
DROP FOREIGN KEY `user_ibfk_1`,
DROP FOREIGN KEY `user_ibfk_2`;
ALTER TABLE `user` 
CHANGE COLUMN `email` `emailAddress` VARCHAR(255) NULL DEFAULT NULL ,
CHANGE COLUMN `phone` `phoneNumber` VARCHAR(20) NULL DEFAULT NULL ;
ALTER TABLE `user` 
ADD CONSTRAINT `user_ibfk_1`
  FOREIGN KEY (`phoneNumber`)
  REFERENCES `phone` (`number`)
  ON DELETE SET NULL,
ADD CONSTRAINT `user_ibfk_2`
  FOREIGN KEY (`emailAddress`)
  REFERENCES `email` (`address`)
  ON DELETE SET NULL;

DROP DATABASE IF EXISTS `pairs_test`;
CREATE DATABASE `pairs_test`;

-- this will create the user if not exists
GRANT ALL ON `pairs_test`.* TO 'pairs_test'@'localhost' IDENTIFIED BY 'sriap';

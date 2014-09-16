SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `pairs` (
  `pid` int(11) NOT NULL AUTO_INCREMENT,
  `uid1` int(11) NOT NULL,
  `uid2` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ctime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE `pairs_success` (
  `sid` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(11) NOT NULL,
  `valid` tinyint(1) NOT NULL,
  `ctime` timestamp NULL DEFAULT NULL,
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `noticed1` tinyint(1) NOT NULL DEFAULT '0',
  `noticed2` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`sid`),
  UNIQUE KEY `pid` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE `user` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `fbid` bigint(20) NOT NULL,
  `fbid_real` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gender` tinyint(4) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `photo_id` bigint(20) NOT NULL,
  `ctime` timestamp NULL DEFAULT NULL,
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE `vote` (
  `pid` int(11) NOT NULL,
  `voter` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `is_myself` tinyint(4) NOT NULL,
  `ctime` timestamp NULL DEFAULT NULL,
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pid`,`voter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_pool` (
  `photo_id` bigint(20) NOT NULL,
  `refer_uid` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `fbid_real` bigint(20) NOT NULL,
  `photo_url` varchar(512) NOT NULL,
  `tag_id` varchar(255) NOT NULL,
  `is_silhouette` tinyint(4) NOT NULL,
  `ctime` timestamp NULL DEFAULT NULL,
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`photo_id`,`refer_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

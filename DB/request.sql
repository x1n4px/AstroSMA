-- astro.requests definition

CREATE TABLE `requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_user_id` int(11) NOT NULL,
  `reviewer_user_id` int(11) DEFAULT NULL,
  `report_type` varchar(100) NOT NULL,
  `height` float DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `ratio` float DEFAULT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in_review','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_requester` (`requester_user_id`),
  KEY `fk_reviewer` (`reviewer_user_id`),
  CONSTRAINT `fk_requester` FOREIGN KEY (`requester_user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_reviewer` FOREIGN KEY (`reviewer_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

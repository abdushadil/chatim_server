-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 24, 2020 at 03:57 PM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.2.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chatim`
--

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `from_user` int(11) NOT NULL,
  `to_user` int(11) NOT NULL,
  `body` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `is_received` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `from_user`, `to_user`, `body`, `createdAt`, `updatedAt`, `is_read`, `is_received`) VALUES
(1, 1, 2, 'blah blah', '2020-08-24 11:30:30', '2020-08-24 11:30:30', 0, 0),
(2, 1, 2, 'Hey I am user 1', '2020-08-24 11:31:06', '2020-08-24 11:31:06', 0, 0),
(3, 2, 1, 'Hi, User 1', '2020-08-24 11:31:18', '2020-08-24 11:31:18', 0, 0),
(4, 2, 1, 'How Are You ?', '2020-08-24 11:31:25', '2020-08-24 11:31:25', 0, 0),
(5, 1, 2, 'Doing great what about you?', '2020-08-24 11:31:35', '2020-08-24 11:31:35', 0, 0),
(6, 2, 1, 'I am fine thanks for asking', '2020-08-24 11:31:46', '2020-08-24 11:31:46', 0, 0),
(7, 3, 1, 'Hi 1 I am three', '2020-08-24 11:32:03', '2020-08-24 11:32:03', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `name` text NOT NULL,
  `profile_picture` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `profile_picture`) VALUES
(1, 'abdush@chatim.com', '1234', 'Abdush Adil', '/media/users_profile/1_profile.jpeg'),
(2, 'test@chatim.com', '1234', 'Test Chatim', ''),
(3, 'einas@chatim.com', '1234', 'Einas', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

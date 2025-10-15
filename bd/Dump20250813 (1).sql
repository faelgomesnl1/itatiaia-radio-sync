-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_multip
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int(10) unsigned NOT NULL,
  `data` mediumtext DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('dVNo-gWRfreBrrvnUOp1C88QC8oip93m',1755174743,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"passport\":{},\"userId\":2}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_copiados`
--

DROP TABLE IF EXISTS `tb_copiados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_copiados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_funcionario` int(11) DEFAULT NULL,
  `id_evento` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_funcionario` (`id_funcionario`),
  CONSTRAINT `tb_copiados_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `tb_funcionario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_copiados`
--

LOCK TABLES `tb_copiados` WRITE;
/*!40000 ALTER TABLE `tb_copiados` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_copiados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_evento`
--

DROP TABLE IF EXISTS `tb_evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_evento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(45) DEFAULT NULL,
  `id_origem` int(11) DEFAULT NULL,
  `copiados_vinculado` int(11) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `h_inicio` time DEFAULT NULL,
  `h_fim` time DEFAULT NULL,
  `local` varchar(100) DEFAULT NULL,
  `diretriz` text DEFAULT NULL,
  `plataforma` text DEFAULT NULL,
  `dial` text DEFAULT NULL,
  `antes_evento` text DEFAULT NULL,
  `linha_editorial` text DEFAULT NULL,
  `divulgacao` text DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_origem` (`id_origem`),
  KEY `id_copiados` (`copiados_vinculado`),
  CONSTRAINT `tb_evento_ibfk_1` FOREIGN KEY (`id_origem`) REFERENCES `tb_origem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_evento`
--

LOCK TABLES `tb_evento` WRITE;
/*!40000 ALTER TABLE `tb_evento` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_func_setor`
--

DROP TABLE IF EXISTS `tb_func_setor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_func_setor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_funcionario` int(11) DEFAULT NULL,
  `id_setor` int(11) DEFAULT NULL,
  `id_planejamento` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_funcionario` (`id_funcionario`),
  KEY `id_setor` (`id_setor`),
  CONSTRAINT `tb_func_setor_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `tb_funcionario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tb_func_setor_ibfk_2` FOREIGN KEY (`id_setor`) REFERENCES `tb_setor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_func_setor`
--

LOCK TABLES `tb_func_setor` WRITE;
/*!40000 ALTER TABLE `tb_func_setor` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_func_setor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_funcionario`
--

DROP TABLE IF EXISTS `tb_funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_funcionario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `setor` varchar(100) DEFAULT NULL,
  `ativo` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_funcionario`
--

LOCK TABLES `tb_funcionario` WRITE;
/*!40000 ALTER TABLE `tb_funcionario` DISABLE KEYS */;
INSERT INTO `tb_funcionario` VALUES (10,'Fernanda  Rodrigues','fernandarodrigues@itatiaia.com.br','4',1),(11,'Jacqueline  Moura','jacquelinemoura@itatiaia.com.br','4',1),(12,'Amanda  Carvalho','amandacarvalho@itatiaia.com.br','4',1),(13,'Luiza Segatto','luizasegatto@itatiaia.com.br','9',1),(14,'Fernanda Paes','fernandapaes@itatiaia.com.br','10',1),(15,'Cida Quintão','cidaquintao@itatiaia.com.br','11',1),(16,'Junior Moreira','juniormoreira@itatiaia.com.br','4',1),(17,'Helen Araújo','helenaraujo@itatiaia.com.br','4',1),(18,'Cândido Henrique \n','candidohenrique@itatiaia.com.br','5',1),(19,'Bruno Furtado \n','brunofurtado@itatiaia.com.br','5',1),(20,'Fabrício Lima    \n','fabriciolima@itatiaia.com.br','5',1),(21,'Marcelo Pereira  \n','marcellopereira@itatiaia.com.br','6',1),(22,'Cássia Cristina     \n','cassiacristina@itatiaia.com.br','8',1),(23,'Armando  Oliveira \n','armandooliveira@itatiaia.com.br','12',1),(24,'Allan Carvalho  \n','allan@itatiaia.com.br','7',1),(25,'Judson Porto  \n','Judsonporto@itatiaia.com.br','7',1),(26,'Luciomar  ','luciomarmendes@itatiaia.com.br','7',1),(27,'Fernanda Paes \n','fernandapaes@itatiaia.com.br','10',1);
/*!40000 ALTER TABLE `tb_funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_origem`
--

DROP TABLE IF EXISTS `tb_origem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_origem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_origem`
--

LOCK TABLES `tb_origem` WRITE;
/*!40000 ALTER TABLE `tb_origem` DISABLE KEYS */;
INSERT INTO `tb_origem` VALUES (1,'Comercial'),(3,'Marketing'),(4,'Conteúdo');
/*!40000 ALTER TABLE `tb_origem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_origem_eventos`
--

DROP TABLE IF EXISTS `tb_origem_eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_origem_eventos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_origem` int(11) DEFAULT NULL,
  `id_evento` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_origem_eventos`
--

LOCK TABLES `tb_origem_eventos` WRITE;
/*!40000 ALTER TABLE `tb_origem_eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_origem_eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_planejamento`
--

DROP TABLE IF EXISTS `tb_planejamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_planejamento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_evento` int(11) DEFAULT NULL,
  `producao` text DEFAULT NULL,
  `escala` text DEFAULT NULL,
  `logistica` text DEFAULT NULL,
  `outros` text DEFAULT NULL,
  `id_setor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_evento` (`id_evento`),
  CONSTRAINT `tb_planejamento_ibfk_3` FOREIGN KEY (`id_evento`) REFERENCES `tb_evento` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_planejamento`
--

LOCK TABLES `tb_planejamento` WRITE;
/*!40000 ALTER TABLE `tb_planejamento` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_planejamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_prog_conteudo`
--

DROP TABLE IF EXISTS `tb_prog_conteudo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_prog_conteudo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_programa` int(11) DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  `id_planejamento` int(11) DEFAULT NULL,
  `id_setor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_programa` (`id_programa`),
  CONSTRAINT `tb_prog_conteudo_ibfk_1` FOREIGN KEY (`id_programa`) REFERENCES `tb_programa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_prog_conteudo`
--

LOCK TABLES `tb_prog_conteudo` WRITE;
/*!40000 ALTER TABLE `tb_prog_conteudo` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_prog_conteudo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_programa`
--

DROP TABLE IF EXISTS `tb_programa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_programa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_programa`
--

LOCK TABLES `tb_programa` WRITE;
/*!40000 ALTER TABLE `tb_programa` DISABLE KEYS */;
INSERT INTO `tb_programa` VALUES (7,'Jornal da Itatiaia'),(8,'IA'),(9,'Chamada Geral'),(10,'Plantão da Cidade'),(11,'Jornal Noite'),(12,'JI1');
/*!40000 ALTER TABLE `tb_programa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_setor`
--

DROP TABLE IF EXISTS `tb_setor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tb_setor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `exibicao` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_setor`
--

LOCK TABLES `tb_setor` WRITE;
/*!40000 ALTER TABLE `tb_setor` DISABLE KEYS */;
INSERT INTO `tb_setor` VALUES (4,'RÁDIO/ DIAL',1),(5,'PORTAL',2),(6,'REDES',3),(7,'TÉCNICA',5),(8,'SAT',6),(9,'MARKETING',7),(10,'PRODUTOS',8),(11,'SECRETARIA DE JORNALISMO',9),(12,'VIDEO',4);
/*!40000 ALTER TABLE `tb_setor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(45) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `permissao` int(1) DEFAULT NULL,
  `setor` int(11) DEFAULT NULL,
  `ADMIN` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Luigi','luigi','$2a$10$3CNXE3L4lRsW9aZKcHO9j.5PlV5Wibsp1opSJBVxDa7TGN.olsjG2',1,4,1),(3,'Luiza Segatto','luizas','$2a$10$JJbfpe1Xr8/4YmJ41c0ce.Dvze6dmkpGbBWqeihf0yvldXLrfhwgW',1,9,0),(4,'Patrick Calazans','patrickc','$2a$10$lCVU7fHQh7vtz8ShPeZNBuivhJpuHG/SqsATIHqMSHBhYMXY1GXk2',0,9,0),(5,'Fernanda  Rodrigues','fernandar','$2a$10$CfGi9llcIlpFCfbVHQ5w5uVUXeu/uo07VkCFj1jmNVdvHZ.IbEq1y',1,4,0),(6,'Fernanda Paes','fernandap','$2a$10$kXcqD5lDouxTcL2rntRXUOV3ey2iigPutzR8QxFMRcZCKV0BMnx3S',1,10,0),(7,'Cida Quintão','cidaq','$2a$10$FVlNQZEc1X8eHNz6zVjv4eabUNfNNxuVhGajXMEOVPpa1t0MMdYc6',1,11,0),(8,'Armando Oliveira','armando','$2a$10$StshKUzX9GV11mNK9eIeDuDPqL1gz/7GqA6ze77pPIvZUAbyuiMX2',1,12,0),(9,'Marcelo Pereira    ','marcelop','$2a$10$wB/yQTcZDhhlnytC2kSttO08dPQBKcdSOCA11klYYY3Cv4KypqMuC',1,6,0),(10,'Cândido Henrique   ','candidoh','$2a$10$ZFDMR0eaYZzKnOwLn0AZ2usQWS9TfEDprKSJSiMv.fFbjKp9OMSrS',1,5,0),(11,'Allan Carvalho','allanc','$2a$10$LxEVQHkn0/v7PT11mFCeiu25fRgSJlvHEwhmPye35R9W.R7JRUW0m',1,7,0),(12,'Cássia Cristina','cassiac','$2a$10$cnG3VL4FW8sxpgCIaow42eTz2/1706HH2eD0T1lsn2Yv7dndtC5iS',1,8,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-13  9:50:02

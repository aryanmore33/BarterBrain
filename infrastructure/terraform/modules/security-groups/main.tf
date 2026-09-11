# ALB SECURITY GROUP
resource "aws_security_group" "alb" {
  name = "${var.project_name}-${var.environment}-alb-sg"
  vpc_id = var.vpc_id
  tags = {
    Name        = "${var.project_name}-${var.environment}-alb-sg"
    Project     = var.project_name
    Environment = var.environment
    Tier        = "public" 
  }
}
resource "aws_vpc_security_group_ingress_rule" "alb_http" { # HTTP - Internet -> ALB
  security_group_id = aws_security_group.alb.id
  cidr_ipv4 = "0.0.0.0/0"
  from_port = 80
  to_port = 80
  ip_protocol = "tcp"
}
resource "aws_vpc_security_group_ingress_rule" "alb_https" { # HTTPS - Internet -> ALB
    security_group_id = aws_security_group.alb.id
    cidr_ipv4 = "0.0.0.0/0"
    from_port = 443
    to_port = 443
    ip_protocol = "tcp"
}
resource "aws_vpc_security_group_egress_rule" "alb_all" { # ALB -> Internet
    security_group_id = aws_security_group.alb.id
    cidr_ipv4 = "0.0.0.0/0"
    ip_protocol = "-1"
}

# EKS NODE SECURITY GROUP
resource "aws_security_group" "eks_node" {
  name = "${var.project_name}-${var.environment}-eks-node-sg"
  vpc_id = var.vpc_id
  tags = {
    Name        = "${var.project_name}-${var.environment}-eks-node-sg"
    Project     = var.project_name
    Environment = var.environment
    Tier        = "private" 
  }
}
resource "aws_vpc_security_group_ingress_rule" "eks_node_self" { # EKS node -> EKS node
  security_group_id = aws_security_group.eks_node.id
  referenced_security_group_id = aws_security_group.eks_node.id
  ip_protocol = "-1"
}
resource "aws_vpc_security_group_ingress_rule" "eks_node_alb" { # ALB -> Backend
    security_group_id = aws_security_group.eks_node.id
    referenced_security_group_id = aws_security_group.alb.id
    from_port = 3000
    to_port = 3000
    ip_protocol = "tcp"
}
resource "aws_vpc_security_group_egress_rule" "eks_node_all" { # EKS nodes -> Internet through NAT
    security_group_id = aws_security_group.eks_node.id
    cidr_ipv4 = "0.0.0.0/0"
    ip_protocol = "-1"
}

# RDS POSTGRESQL SECURITY GROUP
resource "aws_security_group" "rds" {
  name = "${var.project_name}-${var.environment}-rds-sg"
  vpc_id = var.vpc_id
  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Project     = var.project_name
    Environment = var.environment
    Tier        = "database"
  }
}
resource "aws_vpc_security_group_ingress_rule" "rds_postgres" { # EKS -> RDS
  security_group_id = aws_security_group.rds.id
  referenced_security_group_id = aws_security_group.eks_node.id
  from_port = 5432
  to_port = 5432
  ip_protocol = "tcp"
}
resource "aws_vpc_security_group_egress_rule" "rds_all" { # outbound rules
  security_group_id = aws_security_group.rds.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "-1"
}

# REDIS / ELASTICACHE SECURITY GROUP
resource "aws_security_group" "redis" {
  name = "${var.project_name}-${var.environment}-redis-sg"
  vpc_id = var.vpc_id
  tags = {
    Name        = "${var.project_name}-${var.environment}-redis-sg"
    Project     = var.project_name
    Environment = var.environment
    Tier        = "database"
  }
}
resource "aws_vpc_security_group_ingress_rule" "redis" { # EKS -> Redis
  security_group_id = aws_security_group.redis.id
  referenced_security_group_id = aws_security_group.eks_node.id
  from_port = 6379
  to_port = 6379
  ip_protocol = "tcp"
}
resource "aws_vpc_security_group_egress_rule" "redis_all" { # Redis outbound
  security_group_id = aws_security_group.redis.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "-1"
}
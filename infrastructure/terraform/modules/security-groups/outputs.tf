output "alb_security_group_id" {
  description = "Security group ID for the Application Load Balancer"
  value       = aws_security_group.alb.id
}

output "eks_node_security_group_id" {
  description = "Security group ID for EKS worker nodes"
  value       = aws_security_group.eks_node.id
}

output "rds_security_group_id" {
  description = "Security group ID for RDS PostgreSQL"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Security group ID for ElastiCache Redis/Valkey"
  value       = aws_security_group.redis.id
}
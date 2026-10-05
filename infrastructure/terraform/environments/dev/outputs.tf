output "account_id" {
  description = "The AWS account ID of the current user"
  value       = data.aws_caller_identity.current.account_id
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}
output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}
output "database_subnet_ids" {
  value = module.vpc.database_subnet_ids
}

output "eks_cluster_role_arn" {
  value = module.iam.eks_cluster_role_arn
}
output "eks_node_role_arn" {
  value = module.iam.eks_node_role_arn  
}
output "eks_cluster_name" {
  value = module.eks.cluster_name
}
output "eks_cluster_arn" {
  value = module.eks.cluster_arn
}
output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}
output "eks_node_group_name" {
  value = module.eks.node_group_name
}

output "alb_security_group_id" {
  value = module.security_groups.alb_security_group_id
}
output "eks_node_security_group_id" {
  value = module.security_groups.eks_node_security_group_id
}
output "rds_security_group_id" {
  value = module.security_groups.rds_security_group_id
}
output "redis_security_group_id" {
  value = module.security_groups.redis_security_group_id
}


output "rds_instance_id" {
  value = module.rds.db_instance_id
}
output "rds_endpoint" {
  value = module.rds.db_endpoint
}
output "rds_port" {
  value = module.rds.db_port
}
output "rds_database_name" {
  value = module.rds.db_name
}

output "redis_replication_group_id" {
  description = "ElastiCache Redis replication group ID"
  value = module.elasticache.redis_replication_group_id
}
output "redis_primary_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value = module.elasticache.redis_primary_endpoint
}
output "redis_port" {
  description = "ElastiCache Redis port"
  value = module.elasticache.redis_port
}

output "frontend_bucket_name" {
  value = module.s3.bucket_name
}
output "frontend_bucket_arn" {
  value = module.s3.bucket_arn
}
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.enable_cloudfront ? module.cloudfront[0].distribution_id : null
}
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.enable_cloudfront ? module.cloudfront[0].distribution_domain_name : null
}
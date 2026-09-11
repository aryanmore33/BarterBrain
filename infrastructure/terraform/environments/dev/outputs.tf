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
  value       = module.security_groups.redis_security_group_id
}
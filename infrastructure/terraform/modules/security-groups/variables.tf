variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

# variable "eks_cluster_security_group_id" {
#   type = string
#   description = "Security group ID used by the EKS control plane"
# }
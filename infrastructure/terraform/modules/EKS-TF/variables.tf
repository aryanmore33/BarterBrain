variable "project_name" {
  type = string
}
variable "environment" {
  type = string
}
variable "cluster_name" {
  type = string
}
variable "kubernetes_version" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "private_subnet_ids" {
  type = list(string)
}
variable "node_instance_types" {
  type = list(string)
}
variable "node_desired_size" {
  type = number
}
variable "node_min_size" {
  description = "Minimum number of EKS nodes"
  type        = number
}
variable "node_max_size" {
  description = "Maximum number of EKS nodes"
  type        = number
}
variable "cluster_role_arn" {
  description = "IAM role ARN for EKS control plane"
  type        = string
}
variable "node_role_arn" {
  description = "IAM role ARN for EKS worker nodes"
  type        = string
}

variable "node_security_group_id" {
  type = string
}
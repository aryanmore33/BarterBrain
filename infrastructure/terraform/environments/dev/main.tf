data "aws_caller_identity" "current" {}

module "vpc" {
  source             = "../../modules/vpc"
  project_name       = var.project_name
  environment        = var.environment
  availability_zones = var.availability_zones
  vpc_cidr           = var.vpc_cidr
}

module "iam" {
  source       = "../../modules/iam"
  project_name = var.project_name
  environment  = var.environment
}

module "eks" {
  source = "../../modules/EKS-TF"
  project_name = var.project_name
  environment = var.environment
  cluster_name = var.cluster_name
  kubernetes_version = var.kubernetes_version
  vpc_id = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_instance_types = var.node_instance_types
  node_desired_size = var.node_desired_size
  node_min_size = var.node_min_size
  node_max_size = var.node_max_size
  cluster_role_arn = module.iam.eks_cluster_role_arn
  node_role_arn = module.iam.eks_node_role_arn
  node_security_group_id = module.security_groups.eks_node_security_group_id
}

module "security_groups" {
  source = "../../modules/security-groups"
  project_name = var.project_name
  environment = var.environment
  vpc_id = module.vpc.vpc_id
}
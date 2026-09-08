data "aws_caller_identity" "current" {}

module "vpc" {
  source = "../../modules/vpc"
  project_name = var.project_name
  environment = var.environment
  availability_zones = var.availability_zones
  vpc_cidr = var.vpc_cidr
}

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
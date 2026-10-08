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
  oidc_provider_arn = aws_iam_openid_connect_provider.eks.arn
  oidc_issuer_url   = module.eks.oidc_issuer_url
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

module "rds" {
  source = "../../modules/rds"
  project_name = var.project_name
  environment = var.environment
  vpc_id = module.vpc.vpc_id
  database_subnet_ids = module.vpc.database_subnet_ids
  security_group_id = module.security_groups.rds_security_group_id
  database_name = var.database_name
  database_username = var.database_username
  database_password = var.database_password
  engine_version = "17"
  instance_class = "db.t3.micro"
  allocated_storage = 20
}

module "elasticache" {
  source = "../../modules/elasticache"
  project_name = var.project_name
  environment = var.environment
  subnet_ids = module.vpc.database_subnet_ids
  security_group_id = module.security_groups.redis_security_group_id
  node_type = var.redis_node_type
  engine_version = var.redis_engine_version
  auth_token = var.redis_auth_token
}

module "s3" {
  source = "../../modules/s3"
  project_name = var.project_name
  environment = var.environment
}

module "cloudfront" {
  count = var.enable_cloudfront ? 1 : 0
  source = "../../modules/cloudfront"
  project_name = var.project_name
  environment = var.environment
  bucket_id = module.s3.bucket_id
  bucket_arn = module.s3.bucket_arn
  bucket_regional_domain_name = module.s3.bucket_regional_domain_name
  enable_cloudfront = var.enable_cloudfront
}

# tls -- Helps securely verify the OIDC provider
data "tls_certificate" "eks_oidc" {
  url = module.eks.oidc_issuer_url
}
resource "aws_iam_openid_connect_provider" "eks" {
  url = module.eks.oidc_issuer_url
  client_id_list = [ "sts.amazonaws.com" ]
  thumbprint_list = [ data.tls_certificate.eks_oidc.certificates[0].sha1_fingerprint ]
  tags = {
    Name        = "${var.project_name}-${var.environment}-eks-oidc"
    Project     = var.project_name
    Environment = var.environment
  }
}
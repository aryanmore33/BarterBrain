resource "aws_eks_cluster" "this" {
  name = var.cluster_name
  role_arn = var.cluster_role_arn
  version = var.kubernetes_version
  vpc_config {
    subnet_ids = var.private_subnet_ids
    endpoint_private_access = true
    endpoint_public_access = true
  }
  tags = {
    Name = var.cluster_name
    Project = var.project_name
    Environment = var.environment
  }
}

resource "aws_eks_node_group" "this" {
  cluster_name = aws_eks_cluster.this.name
  node_group_name = "${var.project_name}-${var.environment}-nodes"
  node_role_arn = var.node_role_arn
  subnet_ids = var.private_subnet_ids
  instance_types = var.node_instance_types
  scaling_config {
    desired_size = var.node_desired_size
    min_size = var.node_min_size
    max_size = var.node_max_size
  }
  capacity_type = "ON_DEMAND"
  tags = {
   Name = "${var.project_name}-${var.environment}-eks-node"
   Project = var.project_name
   Environment = var.environment 
  }
}
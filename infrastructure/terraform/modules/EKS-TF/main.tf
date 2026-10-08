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

resource "aws_launch_template" "eks_node" {
  name = "${var.project_name}-${var.environment}-eks-node-template"
  vpc_security_group_ids = [ var.node_security_group_id ]
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-${var.environment}-eks-node"
      Project = var.project_name
      Environment = var.environment
    }
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
  launch_template {
    id = aws_launch_template.eks_node.id
    version = aws_launch_template.eks_node.latest_version
  }
  tags = {
   Name = "${var.project_name}-${var.environment}-eks-node"
   Project = var.project_name
   Environment = var.environment 
  }
}

resource "aws_vpc_security_group_ingress_rule" "eks_node_from_cluster_webhook" {
  security_group_id = var.node_security_group_id
  from_port = 9443
  to_port = 9443
  ip_protocol = "tcp"
  referenced_security_group_id = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
  description = "Allow EKS control plane to reach AWS Load Balancer Controller webhook"
}

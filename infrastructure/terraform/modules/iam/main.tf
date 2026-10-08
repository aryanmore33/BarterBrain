# EKS CLUSTER IAM ROLE
resource "aws_iam_role" "eks_cluster" {
  name = "${var.project_name}-${var.environment}-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = { Service = "eks.amazonaws.com" }
        Action = "sts:AssumeRole" 
      }
    ]
  })
  tags = {
    Name = "${var.project_name}-${var.environment}-eks-cluster-role"
    Project = var.project_name
    Environment = var.environment
  }
}
# Required permissions for EKS control plane
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# EKS NODE IAM ROLE
resource "aws_iam_role" "eks_node" {
  name = "${var.project_name}-${var.environment}-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action = "sts:AssumeRole" 
      }
    ]
  })
  tags = {
    Name = "${var.project_name}-${var.environment}-eks-node-role"
    Project = var.project_name
    Environment = var.environment
  }
}
# EKS worker node permissions
resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  role = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}
# Allows worker nodes to communicate with ECR
resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  role = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPullOnly"
}
# Allows nodes to manage networking
resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  role = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

# AWS LOAD BALANCER CONTROLLER IAM ROLE
data "aws_iam_policy_document" "aws_load_balancer_controller_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type = "Federated"
      identifiers = [ var.oidc_provider_arn ]
    }
    actions = [ "sts:AssumeRoleWithWebIdentity" ]
    condition {
      test = "StringEquals"
      variable = "${replace(var.oidc_issuer_url, "https://", "")}:aud"
      values = ["sts:amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_issuer_url, "https://", "")}:sub"
      values = [
        "system:serviceaccount:kube-system:aws-load-balancer-controller"
      ]
    }
  }
}
resource "aws_iam_role" "aws_load_balancer_controller" {
  name = "${var.project_name}-${var.environment}-aws-load-balancer-controller"
  assume_role_policy = data.aws_iam_policy_document.aws_load_balancer_controller_assume_role.json
  tags = {
    Name        = "${var.project_name}-${var.environment}-aws-load-balancer-controller"
    Project     = var.project_name
    Environment = var.environment
  }
}
# resource "aws_iam_policy" "aws_load_balancer_controller" {
#   name = "${var.project_name}-${var.environment}-AWSLoadBalancerControllerPolicy"
#   policy = file("${path.module}/aws-load-balancer-controller-policy.json")
#   tags = {
#     Name        = "${var.project_name}-${var.environment}-AWSLoadBalancerControllerPolicy"
#     Project     = var.project_name
#     Environment = var.environment
#   }  
# }
# resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
#   role = aws_iam_role.aws_load_balancer_controller.name
#   policy_arn = aws_iam_policy.aws_load_balancer_controller.arn
# }


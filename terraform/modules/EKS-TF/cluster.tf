resource "aws_eks_cluster" "eks_cluster" {
  name = var.cluster-name
  role_arn = aws_iam_role.EKSClusterRole.arn
  vpc_config {
    subnet_ids = [data.aws_subnet.subnet.id, data.aws_subnet.subnet2.id]
    security_group_ids = [data.aws_security_group.sg-default.id]
  }
  version = 1.33
  depends_on = [ aws_iam_role_policy_attachment.AmazonEKSClusterPolicy ]
}
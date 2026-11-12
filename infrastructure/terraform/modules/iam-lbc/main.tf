
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
      values = ["sts.amazonaws.com"]
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
resource "aws_iam_policy" "aws_load_balancer_controller" {
  name        = "${var.project_name}-${var.environment}-AWSLoadBalancerControllerPolicy"
  description = "AWS Load Balancer Controller permissions, matching controller v3.6.2"
  policy      = file("${path.module}/aws-load-balancer-controller-policy.json")
  tags = {
    Name        = "${var.project_name}-${var.environment}-AWSLoadBalancerControllerPolicy"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  role       = aws_iam_role.aws_load_balancer_controller.name
  policy_arn = aws_iam_policy.aws_load_balancer_controller.arn
}


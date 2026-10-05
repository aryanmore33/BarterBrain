#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/terraform/environments/dev"

REGION="ap-south-1"
CLUSTER_NAME="barterbrain-dev-eks"

echo "======================================"
echo " BarterBrain STATUS"
echo "======================================"

cd "$TERRAFORM_DIR"

echo ""
echo "Terraform outputs:"
terraform output

echo ""
echo "EKS:"
if aws eks describe-cluster \
    --region "$REGION" \
    --name "$CLUSTER_NAME" >/dev/null 2>&1; then

    aws eks describe-cluster \
      --region "$REGION" \
      --name "$CLUSTER_NAME" \
      --query 'cluster.status' \
      --output text

    aws eks update-kubeconfig \
      --region "$REGION" \
      --name "$CLUSTER_NAME" >/dev/null

    echo ""
    kubectl get nodes

    echo ""
    kubectl get pods -A
else
    echo "EKS cluster is not running."
fi
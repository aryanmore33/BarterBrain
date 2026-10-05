#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/terraform/environments/dev"

REGION="ap-south-1"
CLUSTER_NAME="barterbrain-dev-eks"
NAMESPACE="development"

echo "======================================"
echo " BarterBrain - DESTROYING ENVIRONMENT"
echo "======================================"

echo ""
echo "[1/4] Checking whether EKS exists..."

if aws eks describe-cluster \
    --region "$REGION" \
    --name "$CLUSTER_NAME" >/dev/null 2>&1; then

    echo "EKS cluster found."

    aws eks update-kubeconfig \
      --region "$REGION" \
      --name "$CLUSTER_NAME" >/dev/null

    echo ""
    echo "[2/4] Removing Kubernetes application..."

    kubectl delete namespace "$NAMESPACE" \
      --ignore-not-found=true \
      --wait=true
else
    echo "EKS cluster does not exist."
fi

echo ""
echo "[3/4] Terraform destroy..."

cd "$TERRAFORM_DIR"

terraform destroy

echo ""
echo "[4/4] Environment destroyed."

echo ""
echo "======================================"
echo " BarterBrain is DOWN"
echo "======================================"
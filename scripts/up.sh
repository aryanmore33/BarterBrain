#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/terraform/environments/dev"

REGION="ap-south-1"
CLUSTER_NAME="barterbrain-dev-eks"
NAMESPACE="development"

echo "======================================"
echo " BarterBrain - STARTING ENVIRONMENT"
echo "======================================"

echo ""
echo "[1/6] Terraform init..."
cd "$TERRAFORM_DIR"
terraform init

echo ""
echo "[2/6] Terraform apply..."
terraform apply

echo ""
echo "[3/6] Updating kubeconfig..."
aws eks update-kubeconfig \
  --region "$REGION" \
  --name "$CLUSTER_NAME"

echo ""
echo "[4/6] Checking EKS nodes..."
kubectl get nodes

echo ""
echo "[5/6] Creating Kubernetes namespace..."
kubectl apply \
  -f "$PROJECT_ROOT/k8s-manifest-files/base/namespace.yaml"

echo ""
echo "[6/6] Environment infrastructure is ready."

echo ""
echo "======================================"
echo " BarterBrain infrastructure is UP"
echo "======================================"

terraform output
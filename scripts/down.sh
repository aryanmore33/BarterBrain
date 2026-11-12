
#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/terraform/environments/dev"

REGION="ap-south-1"
CLUSTER_NAME="barterbrain-dev-eks"
NAMESPACE="barterbrain-dev"
RDS_INSTANCE="barterbrain-dev-postgres"

log() {
  printf '\n========== %s ==========\n' "$1"
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

for cmd in terraform aws kubectl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "$cmd is not installed"
done

[[ -f "$TERRAFORM_DIR/variables.tfvars" ]] ||
  fail "Terraform variables.tfvars is missing."

cd "$TERRAFORM_DIR"

log "Terraform initialization"
terraform init -input=false

log "Prepare destruction plan"
terraform plan \
  -destroy \
  -input=false \
  -var-file=variables.tfvars \
  -out=destroy.tfplan

terraform show destroy.tfplan

cat <<'WARNING'

WARNING: THIS IS A PERMANENT DESTRUCTION.

The following resources will be destroyed:
- EKS cluster and worker nodes
- RDS instance and ALL RDS data
- VPC, subnets, NAT Gateways and security groups
- Kubernetes-created ALB resources
- S3 frontend bucket and its objects
- CloudFront distribution
- Other Terraform-managed resources

RDS configuration:
- No final snapshot
- No retained automated backups
- Manual snapshots will be deleted

Neon database will NOT be touched.

WARNING

read -r -p "Type DESTROY to continue: " APPROVAL

[[ "$APPROVAL" == "DESTROY" ]] || {
  echo "Cancelled. Nothing destroyed."
  exit 0
}

cleanup_cluster_albs() {
  local arns arn cluster_tag

  arns="$(
    aws elbv2 describe-load-balancers \
      --region "$REGION" \
      --query 'LoadBalancers[].LoadBalancerArn' \
      --output text
  )"

  [[ -n "$arns" && "$arns" != "None" ]] || return 0

  for arn in $arns; do
    cluster_tag="$(
      aws elbv2 describe-tags \
        --region "$REGION" \
        --resource-arns "$arn" \
        --query "TagDescriptions[0].Tags[?Key=='elbv2.k8s.aws/cluster'].Value | [0]" \
        --output text 2>/dev/null || true
    )"

    if [[ "$cluster_tag" == "$CLUSTER_NAME" ]]; then
      echo "Deleting ALB: $arn"

      aws elbv2 delete-load-balancer \
        --region "$REGION" \
        --load-balancer-arn "$arn" || true
    fi
  done
}

log "Delete Kubernetes namespace"

if aws eks describe-cluster \
  --region "$REGION" \
  --name "$CLUSTER_NAME" >/dev/null 2>&1; then

  aws eks update-kubeconfig \
    --region "$REGION" \
    --name "$CLUSTER_NAME"

  kubectl delete namespace "$NAMESPACE" \
    --ignore-not-found \
    --wait=true \
    --timeout=15m || {
      echo "Namespace deletion timed out."
      cleanup_cluster_albs

      kubectl delete namespace "$NAMESPACE" \
        --ignore-not-found \
        --wait=true \
        --timeout=10m
    }
fi

log "Cleanup remaining cluster ALBs"
cleanup_cluster_albs

log "Destroy Terraform infrastructure"
terraform apply \
  -input=false \
  destroy.tfplan

log "Delete remaining manual RDS snapshots"

SNAPSHOTS="$(
  aws rds describe-db-snapshots \
    --region "$REGION" \
    --snapshot-type manual \
    --query "DBSnapshots[?DBInstanceIdentifier=='$RDS_INSTANCE'].DBSnapshotIdentifier" \
    --output text
)"

if [[ -n "$SNAPSHOTS" && "$SNAPSHOTS" != "None" ]]; then
  for snapshot in $SNAPSHOTS; do
    echo "Deleting snapshot: $snapshot"

    aws rds delete-db-snapshot \
      --region "$REGION" \
      --db-snapshot-identifier "$snapshot"

    aws rds wait db-snapshot-deleted \
      --region "$REGION" \
      --db-snapshot-identifier "$snapshot"
  done
fi

log "Verify destruction"

if aws eks describe-cluster \
  --region "$REGION" \
  --name "$CLUSTER_NAME" >/dev/null 2>&1; then
  fail "EKS cluster still exists."
fi

if aws rds describe-db-instances \
  --region "$REGION" \
  --db-instance-identifier "$RDS_INSTANCE" >/dev/null 2>&1; then
  fail "RDS instance still exists."
fi

SNAPSHOTS="$(
  aws rds describe-db-snapshots \
    --region "$REGION" \
    --snapshot-type manual \
    --query "DBSnapshots[?DBInstanceIdentifier=='$RDS_INSTANCE'].DBSnapshotIdentifier" \
    --output text
)"

[[ -z "$SNAPSHOTS" || "$SNAPSHOTS" == "None" ]] ||
  fail "Manual snapshots still exist: $SNAPSHOTS"

echo
echo "Infrastructure destruction completed."
echo "RDS: Deleted"
echo "EKS: Deleted"
echo "Manual RDS snapshots: None remaining"
echo "Neon: Untouched"

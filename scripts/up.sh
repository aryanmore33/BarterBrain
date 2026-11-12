#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/terraform/environments/dev"
K8S_BASE="$PROJECT_ROOT/k8s-manifest-files/base"
K8S_OVERLAYS="$PROJECT_ROOT/k8s-manifest-files/overlays"

REGION="ap-south-1"
CLUSTER_NAME="barterbrain-dev-eks"
NAMESPACE="barterbrain-dev"
LBC_RELEASE="aws-load-balancer-controller"
LBC_CHART_VERSION="3.6.2"

# Keep this aligned with overlays/dev/kustomization.yml.
BACKEND_IMAGE="${BACKEND_IMAGE:-aryanmore33/barterbrain-backend:1.0.5}"

log() {
  printf '\n========== %s ==========\n' "$1"
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is not installed"
}

for cmd in terraform aws kubectl helm docker npm envsubst; do
  require_command "$cmd"
done

[[ -f "$TERRAFORM_DIR/variables.tfvars" ]] ||
  fail "Terraform variables.tfvars is missing."

[[ -f "$K8S_BASE/kustomization.yml" ]] ||
  fail "Base Kustomization file is missing."

[[ -f "$K8S_BASE/namespace.yaml" ]] ||
  fail "Namespace manifest is missing."

[[ -f "$K8S_BASE/backend.yaml" ]] ||
  fail "Backend manifest is missing."

[[ -f "$K8S_BASE/secret.yaml" ]] ||
  fail "Backend Secret manifest is missing."

[[ -f "$K8S_BASE/rds-secret.yml" ]] ||
  fail "RDS Secret manifest is missing."

[[ -f "$K8S_BASE/neon-to-rds/neon-to-rds-secret.yml" ]] ||
  fail "Neon Secret manifest is missing."

log "Verify AWS and Docker"

aws sts get-caller-identity >/dev/null
docker info >/dev/null 2>&1 || fail "Docker is not running."

log "Build backend image"

docker build \
  -t "$BACKEND_IMAGE" \
  "$PROJECT_ROOT/application/server"

log "Initialize Terraform"

terraform -chdir="$TERRAFORM_DIR" init -input=false

log "Create and review Terraform plan"

terraform -chdir="$TERRAFORM_DIR" plan \
  -input=false \
  -var-file=variables.tfvars \
  -out=dev.tfplan

terraform -chdir="$TERRAFORM_DIR" show dev.tfplan

read -r -p "Apply this infrastructure plan? Type yes: " APPROVAL
[[ "$APPROVAL" == "yes" ]] || {
  echo "Cancelled before infrastructure changes."
  exit 0
}

log "Publish backend image"

# Ensure you've authenticated with Docker Hub using `docker login`.
docker push "$BACKEND_IMAGE"

log "Apply infrastructure"

terraform -chdir="$TERRAFORM_DIR" apply \
  -input=false \
  dev.tfplan

log "Read current Terraform outputs"

VPC_ID="$(terraform -chdir="$TERRAFORM_DIR" output -raw vpc_id)"
LBC_ROLE_ARN="$(terraform -chdir="$TERRAFORM_DIR" output -raw aws_load_balancer_controller_role_arn)"
NODE_GROUP_NAME="$(terraform -chdir="$TERRAFORM_DIR" output -raw eks_node_group_name)"
# RDS_INSTANCE_ID="$(terraform -chdir="$TERRAFORM_DIR" output -raw rds_instance_id)"
RDS_INSTANCE_IDENTIFIER="barterbrain-dev-postgres"
RDS_ENDPOINT="$(terraform -chdir="$TERRAFORM_DIR" output -raw rds_endpoint)"
ALB_SECURITY_GROUP_ID="$(terraform -chdir="$TERRAFORM_DIR" output -raw alb_security_group_id)"
FRONTEND_BUCKET="$(terraform -chdir="$TERRAFORM_DIR" output -raw frontend_bucket_name)"
CLOUDFRONT_DOMAIN="$(terraform -chdir="$TERRAFORM_DIR" output -raw cloudfront_domain_name)"
DISTRIBUTION_ID="$(terraform -chdir="$TERRAFORM_DIR" output -raw cloudfront_distribution_id)"

export RDS_ENDPOINT ALB_SECURITY_GROUP_ID CLOUDFRONT_DOMAIN

# Validate Terraform outputs before applying Kubernetes manifests.
[[ -n "$RDS_ENDPOINT" ]] ||
  fail "RDS_ENDPOINT is empty."

[[ -n "$ALB_SECURITY_GROUP_ID" ]] ||
  fail "ALB_SECURITY_GROUP_ID is empty."

[[ -n "$CLOUDFRONT_DOMAIN" ]] ||
  fail "CLOUDFRONT_DOMAIN is empty."

log "Terraform outputs validated"

echo "RDS endpoint: $RDS_ENDPOINT"
echo "ALB security group: $ALB_SECURITY_GROUP_ID"
echo "CloudFront domain: $CLOUDFRONT_DOMAIN"

log "Wait for RDS and EKS"

# aws rds wait db-instance-available \
#   --region "$REGION" \
#   --db-instance-identifier "$RDS_INSTANCE_ID"
aws rds wait db-instance-available \
  --region "$REGION" \
  --db-instance-identifier "$RDS_INSTANCE_IDENTIFIER"

aws eks wait cluster-active \
  --region "$REGION" \
  --name "$CLUSTER_NAME"

aws eks update-kubeconfig \
  --region "$REGION" \
  --name "$CLUSTER_NAME"

aws eks wait nodegroup-active \
  --region "$REGION" \
  --cluster-name "$CLUSTER_NAME" \
  --nodegroup-name "$NODE_GROUP_NAME"

kubectl wait \
  --for=condition=Ready \
  nodes \
  --all \
  --timeout=10m

log "Install AWS Load Balancer Controller"

helm repo add eks https://aws.github.io/eks-charts --force-update
helm repo update

helm upgrade --install "$LBC_RELEASE" eks/aws-load-balancer-controller \
  --version "$LBC_CHART_VERSION" \
  --namespace kube-system \
  --set clusterName="$CLUSTER_NAME" \
  --set region="$REGION" \
  --set vpcId="$VPC_ID" \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"="$LBC_ROLE_ARN" \
  --wait \
  --timeout 10m

kubectl rollout status \
  deployment/aws-load-balancer-controller \
  -n kube-system \
  --timeout=5m

log "Create namespace and apply rendered dev overlay"

kubectl apply -f "$K8S_BASE/namespace.yaml"

# Secret values remain literal in the ignored Secret files.
# Only these Terraform-generated values are substituted.
RENDERED_MANIFEST="$(
  kubectl kustomize "$K8S_OVERLAYS/dev" |
    envsubst '${RDS_ENDPOINT} ${ALB_SECURITY_GROUP_ID} ${CLOUDFRONT_DOMAIN}'
)"

# Prevent applying manifests with unresolved Terraform placeholders.
if grep -Eq '\$\{(RDS_ENDPOINT|ALB_SECURITY_GROUP_ID|CLOUDFRONT_DOMAIN)\}' \
  <<< "$RENDERED_MANIFEST"; then
  fail "Unresolved Terraform placeholder found in Kubernetes manifests."
fi

# Verify actual ALB security group is present.
grep -F "alb.ingress.kubernetes.io/security-groups:" \
  <<< "$RENDERED_MANIFEST" |
  grep -Fq "$ALB_SECURITY_GROUP_ID" ||
  fail "ALB security group substitution failed."

printf '%s\n' "$RENDERED_MANIFEST" | kubectl apply -f -

log "Wait for Redis"

kubectl rollout status \
  deployment/barterbrain-redis \
  -n "$NAMESPACE" \
  --timeout=5m

log "Check RDS connectivity"

kubectl delete job rds-connectivity-check \
  -n "$NAMESPACE" \
  --ignore-not-found \
  --wait=true

kubectl apply -k "$K8S_OVERLAYS/dev-rds-check"

if ! kubectl wait \
  --for=condition=complete \
  job/rds-connectivity-check \
  -n "$NAMESPACE" \
  --timeout=5m; then
  kubectl logs job/rds-connectivity-check -n "$NAMESPACE" || true
  fail "RDS connectivity check failed."
fi

kubectl logs job/rds-connectivity-check -n "$NAMESPACE"

log "Wait for Neon-to-RDS restore"

if ! kubectl wait \
  --for=condition=complete \
  job/neon-to-rds-migration \
  -n "$NAMESPACE" \
  --timeout=30m; then
  kubectl logs job/neon-to-rds-migration -n "$NAMESPACE" || true
  fail "Neon-to-RDS restore failed."
fi

kubectl logs job/neon-to-rds-migration -n "$NAMESPACE"

log "Wait for backend"

kubectl rollout status \
  deployment/barterbrain-backend \
  -n "$NAMESPACE" \
  --timeout=15m

log "Build frontend"

(
  cd "$PROJECT_ROOT/application/client"
  npm ci
  npm run build
)

log "Publish frontend to S3"

aws s3 sync \
  "$PROJECT_ROOT/application/client/dist/" \
  "s3://$FRONTEND_BUCKET/" \
  --delete \
  --region "$REGION"

log "Invalidate CloudFront cache"

aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths '/*' >/dev/null

log "Deployment completed"

echo "EKS: $CLUSTER_NAME"
echo "RDS: $RDS_ENDPOINT"
echo "ALB security group: $ALB_SECURITY_GROUP_ID"
echo "Frontend: https://$CLOUDFRONT_DOMAIN"
echo "Backend: deployed in Kubernetes"
echo "Ingress: applied with HTTP listener"

kubectl get pods -n "$NAMESPACE"
kubectl get jobs -n "$NAMESPACE"
kubectl get ingress -n "$NAMESPACE"
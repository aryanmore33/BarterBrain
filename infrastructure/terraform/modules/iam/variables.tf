variable "project_name" {
  type = string
}
variable "environment" {
  type = string
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS IAM OIDC provider"
  type        = string
}

variable "oidc_issuer_url" {
  description = "OIDC issuer URL of the EKS cluster"
  type        = string
}
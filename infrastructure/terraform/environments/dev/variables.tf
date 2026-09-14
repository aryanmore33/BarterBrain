variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "barterbrain"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)

  default = [
    "ap-south-1a",
    "ap-south-1b"
  ]
}

variable "cluster_name" {
  type = string
  default = "barterbrain-dev-eks"
}
variable "kubernetes_version" {
  type = string
  default = "1.33"
}
variable "node_instance_types" {
  type = list(string)
  default = [ "t3.medium" ]
}
variable "node_desired_size" {
  type = number
  default = 2
}
variable "node_min_size" {
  type = number
  default = 2
}
variable "node_max_size" {
 type = number
 default = 3
}

variable "database_name" {
  type    = string
}
variable "database_username" {
  type    = string
}
variable "database_password" {
  type      = string
  sensitive = true
}
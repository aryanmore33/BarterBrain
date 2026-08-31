variable "aws_region" {
  default = "ap-south-1"
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
  type    = string
  default = "10.20.0.0/16"
}

variable "cluster_name" {
  type    = string
  default = "barterbrain-eks"
}

variable "kubernetes_version" {
  type        = string
  default = "1.36"
}

variable "ec2_ami_id" {
  type        = string
  description = "Linux AMI ID for the Jenkins EC2 instance."
  default = "ami-01a00762f46d584a1"
}

variable "ec2_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "eks_node_instance_type" {
  type    = string
  default = "t3a.medium"
}

variable "ec2_public_key_path" {
  type        = string
  default = "/terraKeys/terraKey.pub"
}

variable "admin_cidrs" {
  type        = list(string)
  description = "Your fixed public IP CIDR(s), for example [\"203.0.113.10/32\"]."
  default = [ "103.87.28.190/32" ]
}
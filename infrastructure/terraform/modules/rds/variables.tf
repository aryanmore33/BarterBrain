variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "database_subnet_ids" {
  description = "Private database subnet IDs"
  type        = list(string)
}

variable "security_group_id" {
  description = "RDS security group ID"
  type        = string
}

variable "database_name" {
  description = "Initial PostgreSQL database name"
  type        = string
  # default     = "barterbrain"
}

variable "database_username" {
  description = "Master username"
  type        = string
  # default     = "barterbrain_admin"
}

variable "database_password" {
  description = "Master password"
  type        = string
  sensitive   = true
}

variable "engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  # default     = "17"
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  # default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Initial storage in GB"
  type        = number
  # default     = 20
}
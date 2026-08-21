terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0" # Keeps your configuration stable on major version 5
    }
  }
}

provider "aws" {
  region = var.aws_region
}

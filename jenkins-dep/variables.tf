variable "aws_region" {
  description = "aws region"
  default = "ap-south-1"
  type = string
}

variable "ami_id" {
  description = "ami_id for ec2 instance"
  default = "ami-01a00762f46d584a1"
}

variable "instance_type" {
  description = "instance type for ec2"
  default = "t3.medium"
}
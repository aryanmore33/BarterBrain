# key pair login
resource "aws_key_pair" "deployer" {
  key_name   = "terraKey"
  public_key = file("D:\terraKeys.pub")
}

# VPC and security grpups
resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
} 

resource "aws_security_group" "my_security_grp" {
  name        = "my_security_grp"
  description = "Allow TLS inbound traffic and all outbound traffic"
  vpc_id      = aws_default_vpc.default.id

  tags = {
    Name = "my_security_grp"
  }
  ingress {
    from_port = 22
    protocol = "tcp"
    to_port = 22
    cidr_blocks= ["0.0.0.0/0"]
  }
  ingress {
    from_port = 443
    protocol = "tcp"
    to_port = 443
    cidr_blocks= ["0.0.0.0/0"]
  }
  ingress {
    from_port = 80
    protocol = "tcp"
    to_port = 80
    cidr_blocks= ["0.0.0.0/0"]
  }
  ingress {
    from_port = 8000
    protocol = "tcp"
    to_port = 8000
    cidr_blocks= ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ec2 instance
resource "aws_instance" "my_instance" {
    key_name = aws_key_pair.deployer.key_name
    security_groups = [aws_security_group.my_security_grp.name]
    ami = var.ami_id
    instance_type = var.instance_type
    root_block_device {
      volume_size = 15
      volume_type = "gp3"
    }
    tags = {
        Name = "Jenkins-tf-dep"
    }
    region = var.aws_region

#   cpu_options {
#     core_count       = 2
#     threads_per_core = 2
#   }
}
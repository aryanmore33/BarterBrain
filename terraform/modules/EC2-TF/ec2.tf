# key pair login
resource "aws_key_pair" "deployer" {
  key_name   = "terraKey"
  public_key = file("${path.module}/terrakeys/terraKey.pub")
}

resource "aws_iam_instance_profile" "iam-profile" {
  name = "Jenkins-profile"
  role = aws_iam_role.iam-role.name
}

# VPC and security groups
resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_subnet" "jenkins_sub" {
  vpc_id = aws_default_vpc.default.id
  cidr_block = "172.31.0.0/16"
  map_public_ip_on_launch = true
  tags = {
    Name = "Jenkins-Subnet"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_default_vpc.default.id
  tags = {
    Name = "jenkins-igw"
  }
}

resource "aws_route_table" "rt" {
  vpc_id = aws_default_vpc.default.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  tags = {
    Name = "jenkins-route-table"
  }
}

resource "aws_route_table_association" "rt_a" {
  subnet_id = aws_subnet.jenkins_sub.id
  route_table_id = aws_route_table.rt.id
}

resource "aws_security_group" "my_security_grp" {
  name        = "my_security_grp"
  description = "Allow TLS inbound traffic and all outbound traffic"
  vpc_id      = aws_default_vpc.default.id

  tags = {
    Name = "my_security_grp"
  }

  ingress {
    from_port   = 22
    protocol    = "tcp"
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    protocol    = "tcp"
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    protocol    = "tcp"
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    protocol    = "tcp"
    to_port     = 8000
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Added for Jenkins Web UI dashboard
  ingress {
    from_port   = 8080
    protocol    = "tcp"
    to_port     = 8080
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 30000
    protocol    = "tcp"
    to_port     = 32767
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 6379
    protocol    = "tcp"
    to_port     = 6379
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 465
    protocol    = "tcp"
    to_port     = 465
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SMTPS email traffic"
  }
  ingress {
    from_port   = 25
    protocol    = "tcp"
    to_port     = 25
    cidr_blocks = ["0.0.0.0/0"]
     description = "Allow SMTP email traffic"
  }
  ingress {
    from_port   = 6443
    protocol    = "tcp"
    to_port     = 6443
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3000
    protocol    = "tcp"
    to_port     = 10000
    cidr_blocks = ["0.0.0.0/0"]
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ec2 instance
resource "aws_instance" "my_instance" {
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.my_security_grp.id] # Fixed: changed argument and used .id
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.jenkins_sub.id
  iam_instance_profile = aws_iam_instance_profile.iam-profile.name
  
  # Ensures you get an external IP address to log into
  associate_public_ip_address = true 

  root_block_device {
    volume_size = 15
    volume_type = "gp3"
  }

  tags = {
    Name = "Jenkins-tf-dep"
  } 
  #   cpu_options {
#     core_count       = 2
#     threads_per_core = 2
#   }

  # Fixed: Removed "region = var.aws_region" (this belongs in provider.tf)
}

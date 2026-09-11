resource "aws_vpc" "this" {
    cidr_block = var.vpc_cidr
    enable_dns_support   = true
    enable_dns_hostnames = true

    tags = {
        Name= "${var.project_name}-${var.environment}-vpc"
        Environment= var.environment
        Project= var.project_name
    }
}

resource "aws_subnet" "public" {
    count = length(var.availability_zones)  # to create multiple copies of a resource
    vpc_id = aws_vpc.this.id
    availability_zone = var.availability_zones[count.index]
    cidr_block = "10.0.${count.index+1}.0/24"
    map_public_ip_on_launch = true
    tags = {
        Name= "${var.project_name}-${var.environment}-public-${count.index+1}"
        Environment= var.environment
        Project= var.project_name
        Tier= "public"
        "kubernetes.io/role/elb" = "1" # identifies the subnet's role for the AWS Load Balancer Controller
        # It tells Kubernetes: "Hey, if you need to create a public, internet-facing load balancer, you are allowed to put it in this specific subnet."
    }
}

resource "aws_subnet" "private" {
    count = length(var.availability_zones)
    vpc_id = aws_vpc.this.id
    availability_zone = var.availability_zones[count.index]
    cidr_block = "10.0.${count.index+11}.0/24"
    tags = {
        Name= "${var.project_name}-${var.environment}-private-${count.index+1}"
        Environment= var.environment
        Project= var.project_name
        Tier= "private"
        "kubernetes.io/role/internal-elb" = "1" 
    }
}

resource "aws_subnet" "database" {
  count = length(var.availability_zones)
  vpc_id = aws_vpc.this.id
  availability_zone = var.availability_zones[count.index]
  cidr_block = "10.0.${count.index + 21}.0/24"
  tags = {
   Name = "${var.project_name}-${var.environment}-database-${count.index + 1}"
   Environment = var.environment
   Project = var.project_name
   Tier= "database" 
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = {
    Name= "${var.project_name}-${var.environment}-igw"
    Environment=var.environment
    Project= var.project_name
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block="0.0.0.0/0"
    gateway_id= aws_internet_gateway.this.id
  }
  tags = {
    Name= "${var.project_name}-${var.environment}-public-rt"
    Environment=var.environment
    Project= var.project_name
  }
}

resource "aws_route_table_association" "public" {
  count = length(var.availability_zones)
  subnet_id = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
   Name        = "${var.project_name}-${var.environment}-nat-eip"
    Environment = var.environment
    Project     = var.project_name 
  }
}

resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.nat.id
  subnet_id = aws_subnet.public[0].id
  depends_on = [ aws_internet_gateway.this ]
  tags = {
   Name        = "${var.project_name}-${var.environment}-nat"
    Environment = var.environment
    Project     = var.project_name 
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block="0.0.0.0/0"
    nat_gateway_id= aws_nat_gateway.this.id
  }
  tags = {
    Name= "${var.project_name}-${var.environment}-private-rt"
    Environment=var.environment
    Project= var.project_name
  }
}

resource "aws_route_table_association" "private" {
  count = length(var.availability_zones)
  subnet_id = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table" "database" {
  vpc_id = aws_vpc.this.id
  tags = {
   Name= "${var.project_name}-${var.environment}-database-rt"
   Environment= var.environment
   Project = var.project_name 
  }
}

resource "aws_route_table_association" "database" {
  count = length(var.availability_zones)
  subnet_id = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}
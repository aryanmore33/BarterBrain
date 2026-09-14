resource "aws_db_subnet_group" "this" {
  name = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.database_subnet_ids
  tags = {
    Name= "${var.project_name}-${var.environment}-db-subnet-group"
    Project= var.project_name
    Environment= var.environment
  }
}

resource "aws_db_instance" "this" {
  identifier = "${var.project_name}-${var.environment}-postgres"
  engine = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type = "gp3"
  storage_encrypted = true
  max_allocated_storage = 100
  
  db_name = var.database_name
  username = var.database_username
  password = var.database_password
  port = 5432
  db_subnet_group_name = aws_db_subnet_group.this.name
  vpc_security_group_ids = [var.security_group_id]

  publicly_accessible = false
  multi_az = false
  backup_retention_period = 7
  deletion_protection = false
  skip_final_snapshot = true
  auto_minor_version_upgrade = true
  apply_immediately = true
  tags = {
    Name= "${var.project_name}-${var.environment}-postgres"
    Project= var.project_name
    Environment= var.environment
    Tier= "database"
  }
}


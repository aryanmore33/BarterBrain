resource "aws_elasticache_subnet_group" "this" {
  name = "${var.project_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.subnet_ids
  tags = {
    Name= "${var.project_name}-${var.environment}-redis-subnet-group"
    Project= var.project_name
    Environment= var.environment 
  }
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id = "${var.project_name}-${var.environment}-redis"
  description = "BarterBrain Redis/Socket.IO backend"
  engine = "redis"
  engine_version = var.engine_version
  node_type = var.node_type
  num_cache_clusters = 1
  port = 6379
  subnet_group_name = aws_elasticache_subnet_group.this.name
  security_group_ids = [var.security_group_id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token = var.auth_token
  automatic_failover_enabled = false
  multi_az_enabled = false
  auto_minor_version_upgrade = true
  apply_immediately = true
  tags = {
    Name= "${var.project_name}-${var.environment}-redis"
    Project= var.project_name
    Environment= var.environment
    Tier= "database"
  }
}
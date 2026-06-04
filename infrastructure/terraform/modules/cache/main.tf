variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "velora-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.default.name
}

resource "aws_elasticache_subnet_group" "default" {
  name       = "velora-redis-subnets"
  subnet_ids = var.subnet_ids
}

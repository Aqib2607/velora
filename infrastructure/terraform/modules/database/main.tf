variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}

resource "aws_rds_cluster" "postgresql" {
  cluster_identifier      = "velora-aurora-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "14.6"
  master_username         = "velora_master"
  master_password         = "must_be_changed"
  db_subnet_group_name    = aws_db_subnet_group.default.name
  skip_final_snapshot     = true
}

resource "aws_db_subnet_group" "default" {
  name       = "velora-aurora-subnets"
  subnet_ids = var.subnet_ids
}

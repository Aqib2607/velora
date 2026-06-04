provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/network"
  vpc_cidr = var.vpc_cidr
  cluster_name = var.cluster_name
}

module "eks" {
  source = "./modules/compute"
  cluster_name = var.cluster_name
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
}

module "aurora" {
  source = "./modules/database"
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
}

module "redis" {
  source = "./modules/cache"
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
}

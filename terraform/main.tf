# Terraform Configuration for Velora
provider "aws" { region = "us-east-1" }
module "vpc" { source = "terraform-aws-modules/vpc/aws" }
module "eks" { source = "terraform-aws-modules/eks/aws" }
module "rds" { source = "terraform-aws-modules/rds-aurora/aws" }
resource "aws_opensearch_domain" "velora_search" { domain_name = "velora-search" }

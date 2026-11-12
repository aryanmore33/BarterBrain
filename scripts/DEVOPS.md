# Dev environment lifecycle

`up.sh` creates the Terraform environment, restores a fresh RDS database from Neon, compares public-table row counts, runs Knex migrations, deploys the backend, and publishes the frontend. `down.sh` shows the destroy plan first and requires the exact word `DESTROY`; after that it removes manual RDS snapshots, deletes the Kubernetes namespace so the ALB controller can clean up its load balancer, and applies the Terraform destroy plan. RDS has no final snapshot or automated backup retention. Neon is read-only from these scripts and is not part of Terraform.

## Local setup

1. Copy `scripts/dev-secrets.env.example` to `scripts/dev-secrets.env` and fill in the values. The copied file is ignored by Git.
2. Keep `RDS_PASSWORD`, `DATABASE_NAME`, and `DATABASE_USERNAME` aligned with `database_password`, `database_name`, and `database_username` in `infrastructure/terraform/environments/dev/variables.tfvars`.
3. Use Neon’s **direct** PostgreSQL connection URL for `NEON_DATABASE_URL`; `pg_dump` cannot use the pooled endpoint reliably.
4. Provide an ACM certificate in `ap-south-1` with status `ISSUED`, covering `API_DOMAIN`, and set `API_HOSTED_ZONE_ID` to the Route 53 public hosted zone that owns that name. `up.sh` creates or updates the API A alias after the ALB is ready.
5. Set the Docker image repository in `BACKEND_IMAGE` if needed and authenticate with Docker before running `up.sh` so it can build and push the backend image.
6. Run the scripts with Bash from the repository root: `bash scripts/up.sh` and `bash scripts/down.sh`.

The frontend uses the CloudFront domain from Terraform and calls the API through `https://API_DOMAIN`. Make sure the AWS identity can manage the Terraform resources, EKS/ELB, ACM reads, Route 53 records, CloudFront invalidations, and S3 objects. Rotate any Neon database password or JWT secret that was ever committed or shared; removing a local file does not revoke credentials.

`down.sh` removes manual snapshots associated with the dev RDS identifier, including snapshots created before this lifecycle change. Terraform also has `skip_final_snapshot = true` and `backup_retention_period = 0`.

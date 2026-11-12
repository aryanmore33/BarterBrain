# Kubernetes application flow

RDS is an AWS resource created by Terraform. These Kubernetes manifests connect to that database; they do not create an AWS RDS instance. The RDS endpoint and credentials must exist as a Kubernetes Secret before applying database workloads.

## Resource order

The `dev` overlay contains the namespace, backend ConfigMap, Redis Deployment and Service, Neon-to-RDS Secret and restore Job, backend Deployment and Service, and Ingress. The backend Pod gates startup with init containers:

1. Wait for the in-cluster Redis Service.
2. Wait for the restore Job to create the `barterbrain_internal.bootstrap_status` marker in RDS.
3. Run `knex migrate:latest` using the backend Secret's `DATABASE_URL`.
4. Start the backend container.

The Deployment uses one replica and the `Recreate` strategy so two Pods do not bootstrap the database at the same time. The restore Job copies from Neon only when RDS is empty. If RDS already has tables, it compares table names and row counts before writing the bootstrap marker. The marker is outside the `public` schema so it does not change application table counts.

The `dev-rds-check` overlay is an optional connectivity diagnostic. The `dev-neon-restore` overlay can apply the restore Secret and Job after the namespace and RDS credentials Secret exist. The `dev-migration` overlay is a standalone Knex migration Job; when applying the full `dev` overlay, the backend init container already runs Knex, so do not run the standalone migration Job concurrently.

## Required Kubernetes Secrets

All Secrets must be in the `barterbrain-dev` namespace:

- `neon-to-rds-migration`: `SOURCE_DATABASE_URL`. The ignored `base/neon-to-rds/neon-to-rds-secret.yml` supplies this Secret and is included by the restore Kustomization.
- `barterbrain-rds-credentials`: `PGHOST`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`. The RDS endpoint is dynamic, so provision this Secret from the Terraform RDS outputs before applying the RDS check or full dev overlay.
- `barterbrain-backend-secret`: `DATABASE_URL` must point to RDS, plus `JWT_SECRET`, `JWT_SECRET_KEY`, and `REDIS_URL=redis://barterbrain-redis:6379`.

The legacy ignored `base/secret.yaml` contains the old Neon `DATABASE_URL`; it is intentionally not included in the `dev` Kustomization. Do not apply it as the backend Secret after cutover. The legacy `base/rds-secret.yml` uses a different Secret name and does not contain the full RDS connection settings; the workloads use `barterbrain-rds-credentials` instead.

The ConfigMap contains a `FRONTEND_ORIGIN` placeholder. Replace it with the deployed CloudFront origin before applying the full dev overlay.

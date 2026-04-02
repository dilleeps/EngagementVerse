"""CDK stack for Multi-AZ PostgreSQL 15 RDS with Secrets Manager rotation."""

import aws_cdk as cdk
from aws_cdk import (
    Duration,
    RemovalPolicy,
    Stack,
    aws_ec2 as ec2,
    aws_rds as rds,
    aws_secretsmanager as secretsmanager,
)
from constructs import Construct


class RdsStack(Stack):
    """Multi-AZ PostgreSQL 15 on db.t3.medium with encrypted storage and Secrets Manager rotation."""

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        stage: str = "dev",
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ---- VPC ----
        self.vpc = ec2.Vpc(
            self,
            "EngagementVerseVpc",
            max_azs=2,
            nat_gateways=1 if stage == "dev" else 2,
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="Public",
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24,
                ),
                ec2.SubnetConfiguration(
                    name="Private",
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidr_mask=24,
                ),
                ec2.SubnetConfiguration(
                    name="Isolated",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24,
                ),
            ],
        )

        # ---- Security group for RDS ----
        self.db_security_group = ec2.SecurityGroup(
            self,
            "RdsSecurityGroup",
            vpc=self.vpc,
            description="Security group for EngagementVerse RDS PostgreSQL",
            allow_all_outbound=False,
        )
        self.db_security_group.add_ingress_rule(
            peer=ec2.Peer.ipv4(self.vpc.vpc_cidr_block),
            connection=ec2.Port.tcp(5432),
            description="Allow PostgreSQL access from within VPC",
        )

        # ---- Secrets Manager secret for DB credentials ----
        self.db_secret = secretsmanager.Secret(
            self,
            "RdsSecret",
            secret_name=f"engagementverse/{stage}/rds-credentials",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                secret_string_template='{"username": "ev_admin"}',
                generate_string_key="password",
                exclude_punctuation=True,
                password_length=30,
            ),
        )

        # ---- RDS Parameter Group ----
        parameter_group = rds.ParameterGroup(
            self,
            "PgParameterGroup",
            engine=rds.DatabaseInstanceEngine.postgres(
                version=rds.PostgresEngineVersion.VER_15,
            ),
            parameters={
                "shared_preload_libraries": "pg_stat_statements",
                "log_min_duration_statement": "1000",
            },
        )

        # ---- RDS Instance ----
        self.db_instance = rds.DatabaseInstance(
            self,
            "PostgresInstance",
            engine=rds.DatabaseInstanceEngine.postgres(
                version=rds.PostgresEngineVersion.VER_15,
            ),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM
            ),
            vpc=self.vpc,
            vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_ISOLATED
            ),
            security_groups=[self.db_security_group],
            credentials=rds.Credentials.from_secret(self.db_secret),
            database_name="engagementverse",
            multi_az=True,
            allocated_storage=50,
            max_allocated_storage=200,
            storage_encrypted=True,
            parameter_group=parameter_group,
            backup_retention=Duration.days(7),
            deletion_protection=stage == "prod",
            removal_policy=RemovalPolicy.SNAPSHOT if stage == "prod" else RemovalPolicy.DESTROY,
            publicly_accessible=False,
            monitoring_interval=Duration.seconds(60),
            enable_performance_insights=True,
        )

        # ---- Secrets Manager rotation ----
        self.db_instance.add_rotation_single_user(
            automatically_after=Duration.days(30),
        )

        # ---- Outputs ----
        cdk.CfnOutput(self, "DbEndpoint", value=self.db_instance.db_instance_endpoint_address)
        cdk.CfnOutput(self, "DbPort", value=self.db_instance.db_instance_endpoint_port)
        cdk.CfnOutput(self, "DbSecretArn", value=self.db_secret.secret_arn)
        cdk.CfnOutput(self, "VpcId", value=self.vpc.vpc_id)

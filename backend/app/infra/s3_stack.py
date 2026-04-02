"""CDK stack for S3 buckets with lifecycle rules."""

import aws_cdk as cdk
from aws_cdk import (
    Duration,
    RemovalPolicy,
    Stack,
    aws_s3 as s3,
)
from constructs import Construct


class S3Stack(Stack):
    """Four S3 buckets:
    - ev-call-recordings (Glacier transition at 90 days)
    - ev-mlr-scripts
    - ev-exports (auto-delete at 7 days)
    - ev-hcp-imports
    """

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        stage: str = "dev",
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        is_prod = stage == "prod"
        removal = RemovalPolicy.RETAIN if is_prod else RemovalPolicy.DESTROY

        # ---- ev-call-recordings ----
        self.call_recordings_bucket = s3.Bucket(
            self,
            "CallRecordingsBucket",
            bucket_name=f"ev-call-recordings-{stage}-{cdk.Aws.ACCOUNT_ID}",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=removal,
            auto_delete_objects=not is_prod,
            lifecycle_rules=[
                s3.LifecycleRule(
                    id="GlacierTransition90d",
                    transitions=[
                        s3.Transition(
                            storage_class=s3.StorageClass.GLACIER,
                            transition_after=Duration.days(90),
                        )
                    ],
                )
            ],
        )

        # ---- ev-mlr-scripts ----
        self.mlr_scripts_bucket = s3.Bucket(
            self,
            "MLRScriptsBucket",
            bucket_name=f"ev-mlr-scripts-{stage}-{cdk.Aws.ACCOUNT_ID}",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=removal,
            auto_delete_objects=not is_prod,
        )

        # ---- ev-exports ----
        self.exports_bucket = s3.Bucket(
            self,
            "ExportsBucket",
            bucket_name=f"ev-exports-{stage}-{cdk.Aws.ACCOUNT_ID}",
            versioned=False,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=removal,
            auto_delete_objects=not is_prod,
            lifecycle_rules=[
                s3.LifecycleRule(
                    id="AutoDelete7d",
                    expiration=Duration.days(7),
                )
            ],
        )

        # ---- ev-hcp-imports ----
        self.hcp_imports_bucket = s3.Bucket(
            self,
            "HCPImportsBucket",
            bucket_name=f"ev-hcp-imports-{stage}-{cdk.Aws.ACCOUNT_ID}",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=removal,
            auto_delete_objects=not is_prod,
        )

        # ---- Outputs ----
        cdk.CfnOutput(self, "CallRecordingsBucketName", value=self.call_recordings_bucket.bucket_name)
        cdk.CfnOutput(self, "MLRScriptsBucketName", value=self.mlr_scripts_bucket.bucket_name)
        cdk.CfnOutput(self, "ExportsBucketName", value=self.exports_bucket.bucket_name)
        cdk.CfnOutput(self, "HCPImportsBucketName", value=self.hcp_imports_bucket.bucket_name)

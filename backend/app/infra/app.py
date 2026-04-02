#!/usr/bin/env python3
"""CDK application entry point for EngagementVerse infrastructure."""

import aws_cdk as cdk

from app.infra.rds_stack import RdsStack
from app.infra.cognito_stack import CognitoStack
from app.infra.elasticache_stack import ElastiCacheStack
from app.infra.opensearch_stack import OpenSearchStack
from app.infra.sqs_stack import SqsStack
from app.infra.s3_stack import S3Stack
from app.infra.connect_stack import ConnectStack

app = cdk.App()

env_us_east = cdk.Environment(
    account=app.node.try_get_context("account") or "123456789012",
    region=app.node.try_get_context("region") or "us-east-1",
)

stage = app.node.try_get_context("stage") or "dev"

rds_stack = RdsStack(
    app,
    f"EngagementVerse-RDS-{stage}",
    env=env_us_east,
    stage=stage,
)

cognito_stack = CognitoStack(
    app,
    f"EngagementVerse-Cognito-{stage}",
    env=env_us_east,
    stage=stage,
)

elasticache_stack = ElastiCacheStack(
    app,
    f"EngagementVerse-ElastiCache-{stage}",
    env=env_us_east,
    stage=stage,
    vpc=rds_stack.vpc,
)

opensearch_stack = OpenSearchStack(
    app,
    f"EngagementVerse-OpenSearch-{stage}",
    env=env_us_east,
    stage=stage,
    vpc=rds_stack.vpc,
)

sqs_stack = SqsStack(
    app,
    f"EngagementVerse-SQS-{stage}",
    env=env_us_east,
    stage=stage,
)

s3_stack = S3Stack(
    app,
    f"EngagementVerse-S3-{stage}",
    env=env_us_east,
    stage=stage,
)

connect_stack = ConnectStack(
    app,
    f"EngagementVerse-Connect-{stage}",
    env=env_us_east,
    stage=stage,
)

app.synth()

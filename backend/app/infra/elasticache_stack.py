"""CDK stack for ElastiCache Redis 7 cluster in private subnet."""

import aws_cdk as cdk
from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_elasticache as elasticache,
)
from constructs import Construct


class ElastiCacheStack(Stack):
    """Redis 7 single-node replication group on cache.t3.micro."""

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        stage: str = "dev",
        vpc: ec2.IVpc,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ---- Security group ----
        self.redis_sg = ec2.SecurityGroup(
            self,
            "RedisSG",
            vpc=vpc,
            description="Security group for EngagementVerse Redis",
            allow_all_outbound=False,
        )
        self.redis_sg.add_ingress_rule(
            peer=ec2.Peer.ipv4(vpc.vpc_cidr_block),
            connection=ec2.Port.tcp(6379),
            description="Allow Redis access from within VPC",
        )

        # ---- Subnet group (private subnets) ----
        private_subnet_ids = [
            subnet.subnet_id
            for subnet in vpc.select_subnets(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS
            ).subnets
        ]

        subnet_group = elasticache.CfnSubnetGroup(
            self,
            "RedisSubnetGroup",
            description="Subnet group for EngagementVerse Redis",
            subnet_ids=private_subnet_ids,
            cache_subnet_group_name=f"ev-redis-{stage}",
        )

        # ---- Redis replication group ----
        self.redis_cluster = elasticache.CfnReplicationGroup(
            self,
            "RedisReplicationGroup",
            replication_group_description=f"EngagementVerse Redis {stage}",
            engine="redis",
            engine_version="7.0",
            cache_node_type="cache.t3.micro",
            num_cache_clusters=1 if stage == "dev" else 2,
            automatic_failover_enabled=stage != "dev",
            cache_subnet_group_name=subnet_group.cache_subnet_group_name,
            security_group_ids=[self.redis_sg.security_group_id],
            at_rest_encryption_enabled=True,
            transit_encryption_enabled=True,
            port=6379,
        )
        self.redis_cluster.add_dependency(subnet_group)

        # ---- Outputs ----
        cdk.CfnOutput(
            self,
            "RedisPrimaryEndpoint",
            value=self.redis_cluster.attr_primary_end_point_address,
        )
        cdk.CfnOutput(
            self,
            "RedisPort",
            value=self.redis_cluster.attr_primary_end_point_port,
        )

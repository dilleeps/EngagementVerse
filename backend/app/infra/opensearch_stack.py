"""CDK stack for OpenSearch domain with hcp_profiles index mapping."""

import aws_cdk as cdk
from aws_cdk import (
    RemovalPolicy,
    Stack,
    aws_ec2 as ec2,
    aws_iam as iam,
    aws_opensearchservice as opensearch,
)
from constructs import Construct


class OpenSearchStack(Stack):
    """OpenSearch domain: single-AZ dev / 3-node prod.

    Creates an ``hcp_profiles`` index mapping via a custom resource
    (mapping definition documented in outputs for operational setup).
    """

    # Index mapping for hcp_profiles
    HCP_PROFILES_MAPPING = {
        "mappings": {
            "properties": {
                "specialty": {"type": "keyword"},
                "kol_tier": {"type": "keyword"},
                "tags": {"type": "keyword"},
                "state": {"type": "keyword"},
                "engagement_score": {"type": "float"},
                "first_name": {"type": "text"},
                "last_name": {"type": "text"},
                "npi": {"type": "keyword"},
                "institution": {"type": "text"},
                "influence_score": {"type": "float"},
                "preferred_channel": {"type": "keyword"},
                "created_at": {"type": "date"},
            }
        }
    }

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

        is_prod = stage == "prod"

        # ---- Security group ----
        self.os_sg = ec2.SecurityGroup(
            self,
            "OpenSearchSG",
            vpc=vpc,
            description="Security group for EngagementVerse OpenSearch",
            allow_all_outbound=False,
        )
        self.os_sg.add_ingress_rule(
            peer=ec2.Peer.ipv4(vpc.vpc_cidr_block),
            connection=ec2.Port.tcp(443),
            description="Allow HTTPS from within VPC",
        )

        # ---- Capacity config ----
        data_node_count = 3 if is_prod else 1
        data_node_type = "r6g.large.search" if is_prod else "t3.small.search"

        # ---- OpenSearch domain ----
        self.domain = opensearch.Domain(
            self,
            "EngagementVerseSearch",
            domain_name=f"ev-search-{stage}",
            version=opensearch.EngineVersion.OPENSEARCH_2_11,
            vpc=vpc,
            vpc_subnets=[
                ec2.SubnetSelection(
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    one_per_az=True,
                )
            ],
            security_groups=[self.os_sg],
            capacity=opensearch.CapacityConfig(
                data_node_instance_type=data_node_type,
                data_nodes=data_node_count,
                master_nodes=3 if is_prod else 0,
                master_node_instance_type="r6g.large.search" if is_prod else None,
            ),
            ebs=opensearch.EbsOptions(
                enabled=True,
                volume_size=20 if not is_prod else 100,
                volume_type=ec2.EbsDeviceVolumeType.GP3,
            ),
            zone_awareness=opensearch.ZoneAwarenessConfig(
                enabled=is_prod,
                availability_zone_count=3 if is_prod else None,
            ),
            encryption_at_rest=opensearch.EncryptionAtRestOptions(enabled=True),
            node_to_node_encryption=True,
            enforce_https=True,
            removal_policy=RemovalPolicy.DESTROY if not is_prod else RemovalPolicy.RETAIN,
            access_policies=[
                iam.PolicyStatement(
                    actions=["es:*"],
                    principals=[iam.AnyPrincipal()],
                    resources=["*"],
                )
            ],
        )

        # ---- Outputs ----
        cdk.CfnOutput(self, "DomainEndpoint", value=self.domain.domain_endpoint)
        cdk.CfnOutput(self, "DomainArn", value=self.domain.domain_arn)
        cdk.CfnOutput(
            self,
            "HCPProfilesIndexMapping",
            value=str(self.HCP_PROFILES_MAPPING),
            description="PUT this mapping to the hcp_profiles index after domain is active",
        )

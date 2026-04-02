"""CDK stack for Cognito User Pool with 5 role-based groups."""

import aws_cdk as cdk
from aws_cdk import (
    RemovalPolicy,
    Stack,
    aws_cognito as cognito,
)
from constructs import Construct


class CognitoStack(Stack):
    """Cognito User Pool with hosted UI and five role-based groups."""

    GROUPS = [
        "MSL_LEAD",
        "COMMERCIAL_OPS",
        "MEDICAL_AFFAIRS",
        "BRAND_MARKETING",
        "KOL_MANAGEMENT",
    ]

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        stage: str = "dev",
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ---- User Pool ----
        self.user_pool = cognito.UserPool(
            self,
            "EngagementVerseUserPool",
            user_pool_name=f"engagementverse-{stage}",
            self_sign_up_enabled=False,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=True),
                fullname=cognito.StandardAttribute(required=True, mutable=True),
            ),
            custom_attributes={
                "role": cognito.StringAttribute(min_len=1, max_len=50, mutable=True),
            },
            password_policy=cognito.PasswordPolicy(
                min_length=12,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=True,
                temp_valid_duration=cdk.Duration.days(7),
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            removal_policy=RemovalPolicy.DESTROY if stage != "prod" else RemovalPolicy.RETAIN,
        )

        # ---- Groups ----
        for group_name in self.GROUPS:
            cognito.CfnUserPoolGroup(
                self,
                f"Group{group_name}",
                user_pool_id=self.user_pool.user_pool_id,
                group_name=group_name,
                description=f"EngagementVerse {group_name.replace('_', ' ').title()} group",
            )

        # ---- App Client ----
        self.app_client = self.user_pool.add_client(
            "EngagementVerseAppClient",
            user_pool_client_name=f"ev-app-client-{stage}",
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True,
            ),
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(
                    authorization_code_grant=True,
                    implicit_code_grant=True,
                ),
                scopes=[
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.PROFILE,
                ],
                callback_urls=[
                    "http://localhost:3000/callback",
                    f"https://engagementverse-{stage}.example.com/callback",
                ],
                logout_urls=[
                    "http://localhost:3000",
                    f"https://engagementverse-{stage}.example.com",
                ],
            ),
            generate_secret=False,
            id_token_validity=cdk.Duration.hours(1),
            access_token_validity=cdk.Duration.hours(1),
            refresh_token_validity=cdk.Duration.days(30),
        )

        # ---- Hosted UI domain ----
        self.user_pool_domain = self.user_pool.add_domain(
            "HostedUIDomain",
            cognito_domain=cognito.CognitoDomainOptions(
                domain_prefix=f"engagementverse-{stage}",
            ),
        )

        # ---- Outputs ----
        cdk.CfnOutput(self, "UserPoolId", value=self.user_pool.user_pool_id)
        cdk.CfnOutput(self, "UserPoolArn", value=self.user_pool.user_pool_arn)
        cdk.CfnOutput(self, "AppClientId", value=self.app_client.user_pool_client_id)
        cdk.CfnOutput(
            self,
            "HostedUIUrl",
            value=self.user_pool_domain.base_url(),
        )

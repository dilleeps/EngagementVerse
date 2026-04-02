"""CDK stack for Amazon Connect instance with outbound queue and contact flow."""

import aws_cdk as cdk
from aws_cdk import (
    Stack,
    aws_connect as connect,
)
from constructs import Construct


class ConnectStack(Stack):
    """Amazon Connect instance, outbound queue, and placeholder contact flow."""

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        stage: str = "dev",
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ---- Connect Instance ----
        self.instance = connect.CfnInstance(
            self,
            "ConnectInstance",
            attributes=connect.CfnInstance.AttributesProperty(
                inbound_calls=True,
                outbound_calls=True,
                contactflow_logs=True,
                contact_lens=True,
                auto_resolve_best_voices=True,
                use_custom_tts_voices=False,
                early_media=True,
            ),
            identity_management_type="CONNECT_MANAGED",
            instance_alias=f"engagementverse-{stage}",
        )

        # ---- Hours of Operation (required for queue) ----
        self.hours_of_operation = connect.CfnHoursOfOperation(
            self,
            "HoursOfOperation",
            instance_arn=self.instance.attr_arn,
            name=f"ev-business-hours-{stage}",
            time_zone="America/New_York",
            config=[
                connect.CfnHoursOfOperation.HoursOfOperationConfigProperty(
                    day="MONDAY",
                    end_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=18, minutes=0
                    ),
                    start_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=8, minutes=0
                    ),
                ),
                connect.CfnHoursOfOperation.HoursOfOperationConfigProperty(
                    day="TUESDAY",
                    end_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=18, minutes=0
                    ),
                    start_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=8, minutes=0
                    ),
                ),
                connect.CfnHoursOfOperation.HoursOfOperationConfigProperty(
                    day="WEDNESDAY",
                    end_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=18, minutes=0
                    ),
                    start_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=8, minutes=0
                    ),
                ),
                connect.CfnHoursOfOperation.HoursOfOperationConfigProperty(
                    day="THURSDAY",
                    end_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=18, minutes=0
                    ),
                    start_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=8, minutes=0
                    ),
                ),
                connect.CfnHoursOfOperation.HoursOfOperationConfigProperty(
                    day="FRIDAY",
                    end_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=17, minutes=0
                    ),
                    start_time=connect.CfnHoursOfOperation.HoursOfOperationTimeSliceProperty(
                        hours=8, minutes=0
                    ),
                ),
            ],
        )

        # ---- Outbound Queue ----
        self.outbound_queue = connect.CfnQueue(
            self,
            "OutboundQueue",
            instance_arn=self.instance.attr_arn,
            name=f"ev-outbound-{stage}",
            hours_of_operation_arn=self.hours_of_operation.attr_hours_of_operation_arn,
            description="EngagementVerse outbound calling queue",
        )

        # ---- Contact Flow (placeholder) ----
        self.contact_flow = connect.CfnContactFlow(
            self,
            "OutboundContactFlow",
            instance_arn=self.instance.attr_arn,
            name=f"ev-outbound-flow-{stage}",
            type="CONTACT_FLOW",
            content='{"Version":"2019-10-30","StartAction":"start","Actions":[{"Identifier":"start","Type":"MessageParticipant","Parameters":{"Text":"Hello, this is EngagementVerse calling."},"Transitions":{"NextAction":"disconnect","Errors":[{"NextAction":"disconnect","ErrorType":"NoMatchingError"}],"Conditions":[]}},{"Identifier":"disconnect","Type":"DisconnectParticipant","Parameters":{},"Transitions":{}}]}',
            description="EngagementVerse outbound AI call contact flow",
        )

        # ---- Outputs ----
        cdk.CfnOutput(self, "ConnectInstanceId", value=self.instance.ref)
        cdk.CfnOutput(self, "ConnectInstanceArn", value=self.instance.attr_arn)
        cdk.CfnOutput(self, "OutboundQueueArn", value=self.outbound_queue.attr_queue_arn)
        cdk.CfnOutput(self, "ContactFlowArn", value=self.contact_flow.attr_contact_flow_arn)

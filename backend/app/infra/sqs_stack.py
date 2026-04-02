"""CDK stack for SQS queues: call-dispatch.fifo, crm-sync.fifo, follow-up-tasks."""

import aws_cdk as cdk
from aws_cdk import (
    Duration,
    Stack,
    aws_sqs as sqs,
)
from constructs import Construct


class SqsStack(Stack):
    """Three SQS queues each paired with a dead-letter queue (maxReceiveCount=3)."""

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        *,
        stage: str = "dev",
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ---- Helper to build a queue + DLQ pair ----
        def _make_queue(
            logical_id: str,
            queue_name: str,
            fifo: bool = False,
        ) -> tuple[sqs.Queue, sqs.Queue]:
            suffix = ".fifo" if fifo else ""
            dlq_resource = sqs.Queue(
                self,
                f"{logical_id}DLQ",
                queue_name=f"{queue_name}-dlq{suffix}",
                fifo=fifo,
                retention_period=Duration.days(14),
                visibility_timeout=Duration.seconds(60),
            )
            main_queue = sqs.Queue(
                self,
                logical_id,
                queue_name=f"{queue_name}{suffix}",
                fifo=fifo,
                content_based_deduplication=fifo,
                visibility_timeout=Duration.seconds(30),
                retention_period=Duration.days(4),
                dead_letter_queue=sqs.DeadLetterQueue(
                    max_receive_count=3,
                    queue=dlq_resource,
                ),
            )
            return main_queue, dlq_resource

        # ---- call-dispatch.fifo ----
        self.call_dispatch_queue, self.call_dispatch_dlq = _make_queue(
            "CallDispatchQueue",
            f"ev-call-dispatch-{stage}",
            fifo=True,
        )

        # ---- crm-sync.fifo ----
        self.crm_sync_queue, self.crm_sync_dlq = _make_queue(
            "CrmSyncQueue",
            f"ev-crm-sync-{stage}",
            fifo=True,
        )

        # ---- follow-up-tasks (standard) ----
        self.follow_up_queue, self.follow_up_dlq = _make_queue(
            "FollowUpQueue",
            f"ev-follow-up-tasks-{stage}",
            fifo=False,
        )

        # ---- Outputs ----
        cdk.CfnOutput(self, "CallDispatchQueueUrl", value=self.call_dispatch_queue.queue_url)
        cdk.CfnOutput(self, "CallDispatchQueueArn", value=self.call_dispatch_queue.queue_arn)
        cdk.CfnOutput(self, "CrmSyncQueueUrl", value=self.crm_sync_queue.queue_url)
        cdk.CfnOutput(self, "CrmSyncQueueArn", value=self.crm_sync_queue.queue_arn)
        cdk.CfnOutput(self, "FollowUpQueueUrl", value=self.follow_up_queue.queue_url)
        cdk.CfnOutput(self, "FollowUpQueueArn", value=self.follow_up_queue.queue_arn)

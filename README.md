# Engagement Verse

AI-powered HCP/KOL/HCE calling and drug updates platform for pharma.

```
                                  ┌─────────────────┐
                                  │   CloudFront     │
                                  │   (Frontend)     │
                                  └────────┬────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
             ┌──────▼──────┐     ┌────────▼────────┐    ┌───────▼───────┐
             │  Next.js    │     │  FastAPI         │    │  WebSocket    │
             │  Frontend   │────▶│  Backend         │    │  (Transcript) │
             │  (Port 3000)│     │  (Port 8000)     │    │               │
             └─────────────┘     └────────┬────────┘    └───────┬───────┘
                                          │                     │
                    ┌─────────────────────┼─────────────────────┤
                    │                     │                     │
             ┌──────▼──────┐    ┌────────▼────────┐    ┌──────▼──────┐
             │  PostgreSQL  │    │  Redis           │    │  SQS Queues  │
             │  (RDS)       │    │  (ElastiCache)   │    │  (FIFO+Std)  │
             └─────────────┘    └─────────────────┘    └─────────────┘
                    │                                          │
             ┌──────▼──────┐                           ┌──────▼──────┐
             │  OpenSearch  │                           │  S3 Buckets  │
             │  (HCP Index) │                           │  (Recordings)│
             └─────────────┘                           └─────────────┘
                                                              │
                                                       ┌──────▼──────┐
                                                       │  Amazon      │
                                                       │  Connect     │
                                                       └─────────────┘
```

## Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- AWS CLI v2
- AWS CDK CLI (`npm i -g aws-cdk`)

## Project Structure

```
engagement-verse/
├── backend/          # Python FastAPI + AWS CDK
│   ├── app/
│   │   ├── api/v1/   # REST endpoints
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   ├── workers/   # SQS consumers
│   │   ├── websocket/ # Live transcript streaming
│   │   └── infra/     # CDK stacks
│   ├── alembic/       # DB migrations
│   └── tests/         # pytest suite
├── frontend/         # Next.js 14 App Router
│   ├── app/           # Pages & layouts
│   ├── components/    # UI components
│   ├── hooks/         # TanStack Query hooks
│   ├── lib/           # API client, WebSocket, auth
│   └── store/         # Zustand stores
├── shared/           # Shared TypeScript types
└── docker-compose.yml
```

## Local Development Setup

```bash
# 1. Clone and enter the project
git clone <repo-url> && cd engagement-verse

# 2. Start infrastructure services
docker compose up postgres redis localstack -d

# 3. Set up backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 4. Set up frontend (new terminal)
cd frontend
npm install
npm run dev

# 5. Open http://localhost:3000
```

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `REDIS_URL` | Backend | Redis connection string |
| `AWS_ENDPOINT_URL` | Backend | LocalStack endpoint (dev) |
| `COGNITO_USER_POOL_ID` | Backend | Cognito user pool ID |
| `COGNITO_CLIENT_ID` | Backend | Cognito app client ID |
| `S3_RECORDINGS_BUCKET` | Backend | Call recordings bucket |
| `S3_MLR_BUCKET` | Backend | MLR scripts bucket |
| `S3_EXPORTS_BUCKET` | Backend | CSV exports bucket |
| `S3_IMPORTS_BUCKET` | Backend | HCP import bucket |
| `CONNECT_INSTANCE_ID` | Backend | Amazon Connect instance |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL |
| `NEXT_PUBLIC_WS_URL` | Frontend | WebSocket base URL |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Frontend | Cognito pool ID |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Frontend | Cognito client ID |

## Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## Running Tests

```bash
# Backend
cd backend
pytest -v

# Frontend
cd frontend
npm test
```

## CDK Deploy

```bash
cd backend
cdk bootstrap   # First time only
cdk deploy RdsStack
cdk deploy ElastiCacheStack
cdk deploy OpenSearchStack
cdk deploy SqsStack
cdk deploy S3Stack
cdk deploy CognitoStack
cdk deploy ConnectStack
```

## Screens

1. **Dashboard** — KPI cards, call volume chart, recent calls, activity feed
2. **AI Call Console** — Live transcript (WebSocket), AI insights, call controls, CRM sync
3. **HCP/KOL Profile** — Prescribing behavior, engagement timeline, contact info
4. **Campaign Builder** — 5-step wizard (setup, audience, MLR script, schedule, launch)
5. **Analytics & Reports** — Outcomes chart, channel donut, campaign performance, CSV export

## Production Checklist

- [ ] Configure Cognito user pool with custom domain
- [ ] Set up RDS multi-AZ with automated backups
- [ ] Enable ElastiCache encryption at rest and in transit
- [ ] Configure S3 bucket policies and lifecycle rules
- [ ] Set up CloudWatch alarms for API latency and error rates
- [ ] Enable X-Ray tracing across all services
- [ ] Configure WAF rules on API Gateway / ALB
- [ ] Set up CI/CD pipeline (CodePipeline + CodeBuild)
- [ ] Enable Secrets Manager rotation for DB credentials
- [ ] Configure VPC endpoints for AWS services

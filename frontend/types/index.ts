// Re-export all shared types
export type {
  Specialty,
  KOLTier,
  Channel,
  CallStatus,
  Speaker,
  InsightType,
  CommunicationType,
  CampaignStatus,
  MLRStatus,
  UserRole,
  HCP,
  PrescribingBehavior,
  CallSession,
  Transcript,
  AIInsight,
  Campaign,
  CampaignAudience,
  MLRScript,
  AppUser,
  DashboardSummary,
  AnalyticsSummary,
  CallQueueItem,
  EngagementTimelineEvent,
  OutcomeData,
  ChannelMixData,
  CampaignPerformance,
} from './shared';

// ─── Frontend-specific types ─────────────────────────────────────────────────

import type { Speaker, InsightType } from './shared';

/** WebSocket transcript message received in real-time during a call. */
export interface TranscriptMessage {
  type: 'transcript' | 'insight' | 'status' | 'error';
  callSessionId: string;
  payload: TranscriptPayload | InsightPayload | StatusPayload | ErrorPayload;
}

export interface TranscriptPayload {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: string;
  sentimentScore: number | null;
}

export interface InsightPayload {
  id: string;
  insightType: InsightType;
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export interface StatusPayload {
  status: string;
  message: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

/** Generic paginated API response. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/** Filters for call history queries. */
export interface CallFilters {
  status?: string;
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

/** Filters for HCP search. */
export interface HCPSearchParams {
  q?: string;
  specialty?: string;
  kolTier?: string;
  state?: string;
  page?: number;
  size?: number;
}

/** Filters for campaign listing. */
export interface CampaignFilters {
  status?: string;
  channel?: string;
  page?: number;
  size?: number;
}

/** Types used by useAuth hook. */
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/** Types used by useLiveCall hook. */
export type TranscriptLine = TranscriptPayload;
export type CallInsight = InsightPayload;
export type Call = CallSession;

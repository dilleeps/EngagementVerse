// ─── Enums ───────────────────────────────────────────────────────────────────

export type Specialty =
  | 'RHEUMATOLOGY'
  | 'DERMATOLOGY'
  | 'GASTROENTEROLOGY'
  | 'HEMATOLOGY'
  | 'ONCOLOGY'
  | 'OTHER';

export type KOLTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'NONE';

export type Channel = 'VOICE' | 'SMS' | 'EMAIL' | 'DIGITAL';

export type CallStatus =
  | 'QUEUED'
  | 'LIVE'
  | 'COMPLETED'
  | 'NO_ANSWER'
  | 'ESCALATED'
  | 'OPTED_OUT';

export type Speaker = 'AI' | 'HCP';

export type InsightType =
  | 'UPSELL'
  | 'FLAG_MLR'
  | 'ENGAGEMENT_SCORE'
  | 'SUGGEST_DATA'
  | 'NEXT_BEST_ACTION';

export type CommunicationType =
  | 'LABEL_CHANGE'
  | 'SAFETY_ALERT'
  | 'PIPELINE_UPDATE'
  | 'GENERAL';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_MLR'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED';

export type MLRStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export type UserRole =
  | 'MSL_LEAD'
  | 'COMMERCIAL_OPS'
  | 'MEDICAL_AFFAIRS'
  | 'BRAND_MARKETING'
  | 'KOL_MANAGEMENT';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface HCP {
  id: string;
  npiNumber: string;
  firstName: string;
  lastName: string;
  specialty: Specialty;
  institution: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  kolTier: KOLTier;
  preferredChannel: Channel;
  optedOut: boolean;
  lastContactDate: string | null;
  totalCalls: number;
  engagementScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrescribingBehavior {
  id: string;
  hcpId: string;
  drugName: string;
  trxCount: number;
  nbrxCount: number;
  marketShare: number;
  periodStart: string;
  periodEnd: string;
  trend: 'UP' | 'DOWN' | 'FLAT';
  createdAt: string;
}

export interface CallSession {
  id: string;
  campaignId: string;
  hcpId: string;
  channel: Channel;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  recordingUrl: string | null;
  sentimentScore: number | null;
  engagementScore: number | null;
  summaryText: string | null;
  mlrScriptId: string | null;
  createdAt: string;
  updatedAt: string;
  hcp?: HCP;
  campaign?: Campaign;
  transcripts?: Transcript[];
  insights?: AIInsight[];
}

export interface Transcript {
  id: string;
  callSessionId: string;
  speaker: Speaker;
  text: string;
  timestamp: string;
  sentimentScore: number | null;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  callSessionId: string;
  insightType: InsightType;
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  communicationType: CommunicationType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  targetSpecialties: Specialty[];
  targetKolTiers: KOLTier[];
  channels: Channel[];
  totalContacts: number;
  completedContacts: number;
  mlrScriptId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  audiences?: CampaignAudience[];
  mlrScript?: MLRScript;
}

export interface CampaignAudience {
  id: string;
  campaignId: string;
  hcpId: string;
  priorityOrder: number;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'SKIPPED';
  assignedAt: string;
  hcp?: HCP;
}

export interface MLRScript {
  id: string;
  campaignId: string | null;
  title: string;
  version: number;
  content: string;
  status: MLRStatus;
  reviewerNotes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  submittedById: string | null;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  cognitoSub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalHCPs: number;
  activeCampaigns: number;
  callsToday: number;
  callsThisWeek: number;
  avgEngagementScore: number;
  avgSentimentScore: number;
  completionRate: number;
  topInsights: AIInsight[];
  recentCalls: CallSession[];
  upcomingCampaigns: Campaign[];
}

export interface AnalyticsSummary {
  totalCalls: number;
  avgDuration: number;
  avgEngagement: number;
  avgSentiment: number;
  callsByChannel: Record<Channel, number>;
  callsByStatus: Record<CallStatus, number>;
  callsByDay: { date: string; count: number }[];
  topSpecialties: { specialty: Specialty; count: number }[];
  engagementTrend: { date: string; score: number }[];
  sentimentTrend: { date: string; score: number }[];
}

export interface CallQueueItem {
  id: string;
  callSessionId: string;
  hcpId: string;
  hcpName: string;
  hcpSpecialty: Specialty;
  kolTier: KOLTier;
  campaignName: string;
  channel: Channel;
  status: CallStatus;
  priorityOrder: number;
  scheduledAt: string | null;
  estimatedDuration: number;
}

export interface EngagementTimelineEvent {
  id: string;
  hcpId: string;
  eventType: 'CALL' | 'EMAIL' | 'SMS' | 'NOTE' | 'INSIGHT';
  title: string;
  description: string;
  channel: Channel | null;
  callSessionId: string | null;
  occurredAt: string;
  metadata: Record<string, unknown> | null;
}

export interface OutcomeData {
  label: string;
  value: number;
  percentage: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  previousValue: number;
}

export interface ChannelMixData {
  channel: Channel;
  totalCalls: number;
  completedCalls: number;
  avgEngagement: number;
  avgSentiment: number;
  avgDuration: number;
  successRate: number;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  status: CampaignStatus;
  totalContacts: number;
  completedContacts: number;
  avgEngagement: number;
  avgSentiment: number;
  completionRate: number;
  channelMix: ChannelMixData[];
  outcomes: OutcomeData[];
  dailyProgress: { date: string; completed: number; total: number }[];
}

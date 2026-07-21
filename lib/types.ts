// Enums as `as const` maps (not native TS enum) — no runtime reverse-mapping object,
// and values serialize predictably across the Server/Client Component boundary.

export const PlanType = { Weekly: 0, Monthly: 1, Custom: 2 } as const;
export type PlanType = (typeof PlanType)[keyof typeof PlanType];
export const PlanTypeLabels: Record<PlanType, string> = {
  [PlanType.Weekly]: "Weekly",
  [PlanType.Monthly]: "Monthly",
  [PlanType.Custom]: "Custom",
};

export const Emotion = {
  Happy: 0,
  Sad: 1,
  Excited: 2,
  Angry: 3,
  Anxious: 4,
  Calm: 5,
  Tired: 6,
  Neutral: 7,
} as const;
export type Emotion = (typeof Emotion)[keyof typeof Emotion];
export const EmotionLabels: Record<Emotion, string> = {
  [Emotion.Happy]: "Happy",
  [Emotion.Sad]: "Sad",
  [Emotion.Excited]: "Excited",
  [Emotion.Angry]: "Angry",
  [Emotion.Anxious]: "Anxious",
  [Emotion.Calm]: "Calm",
  [Emotion.Tired]: "Tired",
  [Emotion.Neutral]: "Neutral",
};

export const NotificationType = { WeeklySummary: 0, GoalPurgeWarning: 1 } as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ---- Auth ----

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

// ---- Goals ----

// Values are appended-only to match the backend enum — never reorder, since
// existing goals store this as a plain int.
export const GoalIcon = {
  General: 0,
  Health: 1,
  Learning: 2,
  Finance: 3,
  Career: 4,
  Creativity: 5,
  Social: 6,
  Mindfulness: 7,
  Fitness: 8,
  Nutrition: 9,
  Hydration: 10,
  Motivation: 11,
  Writing: 12,
  Technology: 13,
  Music: 14,
  Celebration: 15,
  Teamwork: 16,
  Travel: 17,
  Nature: 18,
  Energy: 19,
} as const;
export type GoalIcon = (typeof GoalIcon)[keyof typeof GoalIcon];
export const GoalIconLabels: Record<GoalIcon, string> = {
  [GoalIcon.General]: "General",
  [GoalIcon.Health]: "Health",
  [GoalIcon.Learning]: "Learning",
  [GoalIcon.Finance]: "Finance",
  [GoalIcon.Career]: "Career",
  [GoalIcon.Creativity]: "Creativity",
  [GoalIcon.Social]: "Social",
  [GoalIcon.Mindfulness]: "Mindfulness",
  [GoalIcon.Fitness]: "Fitness",
  [GoalIcon.Nutrition]: "Nutrition",
  [GoalIcon.Hydration]: "Hydration",
  [GoalIcon.Motivation]: "Motivation",
  [GoalIcon.Writing]: "Writing",
  [GoalIcon.Technology]: "Technology",
  [GoalIcon.Music]: "Music",
  [GoalIcon.Celebration]: "Celebration",
  [GoalIcon.Teamwork]: "Teamwork",
  [GoalIcon.Travel]: "Travel",
  [GoalIcon.Nature]: "Nature",
  [GoalIcon.Energy]: "Energy",
};
export const GoalIconEmojis: Record<GoalIcon, string> = {
  [GoalIcon.General]: "🎯",
  [GoalIcon.Health]: "🏋️",
  [GoalIcon.Learning]: "📚",
  [GoalIcon.Finance]: "💰",
  [GoalIcon.Career]: "💼",
  [GoalIcon.Creativity]: "🎨",
  [GoalIcon.Social]: "👥",
  [GoalIcon.Mindfulness]: "🧘",
  [GoalIcon.Fitness]: "🏃",
  [GoalIcon.Nutrition]: "🥗",
  [GoalIcon.Hydration]: "💧",
  [GoalIcon.Motivation]: "🤩",
  [GoalIcon.Writing]: "✏️",
  [GoalIcon.Technology]: "💻",
  [GoalIcon.Music]: "🎵",
  [GoalIcon.Celebration]: "🎉",
  [GoalIcon.Teamwork]: "🤝",
  [GoalIcon.Travel]: "✈️",
  [GoalIcon.Nature]: "🌱",
  [GoalIcon.Energy]: "⚡",
};

export const GoalColor = {
  Red: 0,
  Orange: 1,
  Yellow: 2,
  Green: 3,
  Sky: 4,
  Blue: 5,
  Purple: 6,
  Pink: 7,
  Brown: 8,
  Teal: 9,
} as const;
export type GoalColor = (typeof GoalColor)[keyof typeof GoalColor];
export const GoalColorLabels: Record<GoalColor, string> = {
  [GoalColor.Red]: "Red",
  [GoalColor.Orange]: "Orange",
  [GoalColor.Yellow]: "Yellow",
  [GoalColor.Green]: "Green",
  [GoalColor.Sky]: "Sky",
  [GoalColor.Blue]: "Blue",
  [GoalColor.Purple]: "Purple",
  [GoalColor.Pink]: "Pink",
  [GoalColor.Brown]: "Brown",
  [GoalColor.Teal]: "Teal",
};
export const GoalColorHex: Record<GoalColor, string> = {
  [GoalColor.Red]: "#ef4444",
  [GoalColor.Orange]: "#f97316",
  [GoalColor.Yellow]: "#eab308",
  [GoalColor.Green]: "#22c55e",
  [GoalColor.Sky]: "#0ea5e9",
  [GoalColor.Blue]: "#3b82f6",
  [GoalColor.Purple]: "#a855f7",
  [GoalColor.Pink]: "#ec4899",
  [GoalColor.Brown]: "#92400e",
  [GoalColor.Teal]: "#14b8a6",
};

export interface Goal {
  id: string;
  name: string;
  description?: string;
  icon: GoalIcon;
  emoji: string;
  color: GoalColor;
  colorHex: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ---- Tasks ----

export interface Task {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  achieveAction: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Plans ----

export interface Plan {
  id: string;
  goalId: string;
  type: PlanType;
  startDate?: string;
  endDate?: string;
  repeatCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Task completions ----

export interface TaskCompletion {
  id: string;
  taskId: string;
  date: string;
  count: number;
  note?: string;
  createdAt: string;
}

// ---- Daily reports ----

export interface DailyReport {
  id: string;
  date: string;
  emotion?: Emotion;
  emoji?: string;
  diaryText?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Calendar ----

export interface CalendarGoalSummary {
  goalId: string;
  name: string;
  icon: GoalIcon;
  emoji: string;
  color: GoalColor;
  colorHex: string;
  achieved: boolean;
}

export interface CalendarDay {
  date: string;
  emotion?: Emotion;
  emoji?: string;
  goals: CalendarGoalSummary[];
}

// ---- Notifications ----

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// ---- Errors (RFC 9110 ProblemDetails) ----

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  traceId: string;
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;
}

// ---- Shared Server Action result shape ----

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

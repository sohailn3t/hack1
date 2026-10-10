import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    email: v.string(),
    fullName: v.string(),
    passwordHash: v.string(),
    accountType: v.union(v.literal('demo'), v.literal('user')),
    subscriptionStatus: v.union(v.literal('free'), v.literal('premium')),
  }).index('by_email', ['email']),
  sessions: defineTable({
    userId: v.id('users'),
    tokenHash: v.string(),
    expiresAt: v.number(),
  }).index('by_token_hash', ['tokenHash']),
  history: defineTable({
    userId: v.id('users'),
    locationId: v.string(),
    displayName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    visitedAt: v.number(),
    radiusKm: v.number(),
    riskScore: v.optional(v.number()),
    riskCategory: v.optional(v.string()),
    isSimulated: v.boolean(),
    deletedAt: v.optional(v.number()),
  }).index('by_user', ['userId']),
  checklistProgress: defineTable({
    userId: v.id('users'),
    historyId: v.id('history'),
    completedTitles: v.array(v.string()),
    updatedAt: v.number(),
  }).index('by_user_history', ['userId', 'historyId']),
  reminderPreferences: defineTable({
    userId: v.id('users'),
    enabled: v.boolean(),
  }).index('by_user', ['userId']),
});

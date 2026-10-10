import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireUser } from './account';

const historyArgs = {
  token: v.string(),
  locationId: v.string(),
  displayName: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  radiusKm: v.number(),
  riskScore: v.optional(v.number()),
  riskCategory: v.optional(v.string()),
  isSimulated: v.boolean(),
};

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const entries = (await ctx.db.query('history').withIndex('by_user', (q) => q.eq('userId', user._id)).collect())
      .filter((entry) => !entry.deletedAt).sort((a, b) => b.visitedAt - a.visitedAt);
    return Promise.all(entries.map(async (entry) => ({
      ...entry,
      completedTitles: (await ctx.db.query('checklistProgress').withIndex('by_user_history', (q) => q.eq('userId', user._id).eq('historyId', entry._id)).unique())?.completedTitles ?? [],
    })));
  },
});

export const upsert = mutation({
  args: historyArgs,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const existing = (await ctx.db.query('history').withIndex('by_user', (q) => q.eq('userId', user._id)).collect())
      .find((entry) => entry.locationId === args.locationId && !entry.deletedAt);
    const values = {
      userId: user._id,
      locationId: args.locationId,
      displayName: args.displayName,
      latitude: args.latitude,
      longitude: args.longitude,
      radiusKm: args.radiusKm,
      riskScore: args.riskScore,
      riskCategory: args.riskCategory,
      isSimulated: args.isSimulated,
      visitedAt: Date.now(),
      deletedAt: undefined,
    };
    if (existing) {
      await ctx.db.patch(existing._id, values);
      return existing._id;
    }
    return ctx.db.insert('history', values);
  },
});

export const remove = mutation({
  args: { token: v.string(), historyId: v.id('history') },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const entry = await ctx.db.get(args.historyId);
    if (!entry || entry.userId !== user._id) throw new Error('History entry not found.');
    await ctx.db.delete(args.historyId);
    const progress = await ctx.db.query('checklistProgress').withIndex('by_user_history', (q) => q.eq('userId', user._id).eq('historyId', args.historyId)).unique();
    if (progress) await ctx.db.delete(progress._id);
  },
});

export const clearAll = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const entries = await ctx.db.query('history').withIndex('by_user', (q) => q.eq('userId', user._id)).collect();
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
      const progress = await ctx.db.query('checklistProgress').withIndex('by_user_history', (q) => q.eq('userId', user._id).eq('historyId', entry._id)).unique();
      if (progress) await ctx.db.delete(progress._id);
    }
  },
});

export const getProgress = query({
  args: { token: v.string(), historyId: v.id('history') },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const entry = await ctx.db.get(args.historyId);
    if (!entry || entry.userId !== user._id) throw new Error('History entry not found.');
    return (await ctx.db.query('checklistProgress').withIndex('by_user_history', (q) => q.eq('userId', user._id).eq('historyId', args.historyId)).unique())?.completedTitles ?? [];
  },
});

export const saveProgress = mutation({
  args: { token: v.string(), historyId: v.id('history'), completedTitles: v.array(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const entry = await ctx.db.get(args.historyId);
    if (!entry || entry.userId !== user._id) throw new Error('History entry not found.');
    const existing = await ctx.db.query('checklistProgress').withIndex('by_user_history', (q) => q.eq('userId', user._id).eq('historyId', args.historyId)).unique();
    const values = { userId: user._id, historyId: args.historyId, completedTitles: args.completedTitles, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, values);
    else await ctx.db.insert('checklistProgress', values);
  },
});

import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => ctx.db.query('users').withIndex('by_email', (q) => q.eq('email', args.email)).unique(),
});

export const findSession = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query('sessions').withIndex('by_token_hash', (q) => q.eq('tokenHash', args.tokenHash)).unique();
    if (!session || session.expiresAt <= Date.now()) return null;
    return session;
  },
});

export const createUser = internalMutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    passwordHash: v.string(),
    accountType: v.union(v.literal('demo'), v.literal('user')),
  },
  handler: async (ctx, args) => ctx.db.insert('users', { ...args, subscriptionStatus: 'free' }),
});

export const createSession = internalMutation({
  args: { userId: v.id('users'), tokenHash: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => ctx.db.insert('sessions', args),
});

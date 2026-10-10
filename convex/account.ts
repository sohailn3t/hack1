import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const requireUser = async (ctx: { db: any }, token: string) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const session = await ctx.db.query('sessions').withIndex('by_token_hash', (q: any) => q.eq('tokenHash', tokenHash)).unique();
  if (!session || session.expiresAt <= Date.now()) throw new Error('Your session has expired. Please sign in again.');
  const user = await ctx.db.get(session.userId);
  if (!user) throw new Error('Account not found.');
  return user;
};

export const profile = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    return { userId: user._id, fullName: user.fullName, email: user.email, accountType: user.accountType, subscriptionStatus: user.subscriptionStatus };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(args.token));
    const tokenHash = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
    const session = await ctx.db.query('sessions').withIndex('by_token_hash', (q) => q.eq('tokenHash', tokenHash)).unique();
    if (session) await ctx.db.delete(session._id);
  },
});

export { requireUser };

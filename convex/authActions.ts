"use node";

import { action } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SESSION_DAYS = 30;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

const hashPassword = (password: string, salt = randomBytes(16).toString('hex')) => ({
  salt,
  digest: scryptSync(password, salt, 64).toString('hex'),
});

const issueSession = async (ctx: any, user: any): Promise<any> => {
  const token = randomBytes(32).toString('hex');
  await ctx.runMutation(internal.auth.createSession, {
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  return { token, userId: user._id, fullName: user.fullName, email: user.email, accountType: user.accountType, subscriptionStatus: user.subscriptionStatus };
};

export const signup = action({
  args: { email: v.string(), fullName: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    if (args.password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (email === 'demo') throw new Error('The demo account cannot be registered.');
    if (await ctx.runQuery(internal.auth.findUserByEmail, { email })) throw new Error('An account with this email already exists.');
    const { salt, digest } = hashPassword(args.password);
    const userId: any = await ctx.runMutation(internal.auth.createUser, {
      email,
      fullName: args.fullName.trim(),
      passwordHash: `${salt}:${digest}`,
      accountType: 'user',
    });
    return issueSession(ctx, { _id: userId, fullName: args.fullName.trim(), email, accountType: 'user', subscriptionStatus: 'free' });
  },
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    let user: any = await ctx.runQuery(internal.auth.findUserByEmail, { email });
    if (!user && email === 'demo' && args.password === 'demo') {
      const { salt, digest } = hashPassword('demo');
      const userId = await ctx.runMutation(internal.auth.createUser, {
        email: 'demo',
        fullName: 'HeatShield Demo User',
        passwordHash: `${salt}:${digest}`,
        accountType: 'demo',
      });
      user = { _id: userId, fullName: 'HeatShield Demo User', email: 'demo', accountType: 'demo', subscriptionStatus: 'free' };
    }
    if (!user) throw new Error('Invalid email or password.');
    const [salt, expectedHex] = user.passwordHash.split(':');
    const actual = scryptSync(args.password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (expected.length !== actual.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid email or password.');
    return issueSession(ctx, user);
  },
});

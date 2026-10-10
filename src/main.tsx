import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider } from './context/AuthContext';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL as string | undefined;
const isValidUrl = (value: string | undefined) => Boolean(value && /^https?:\/\/[^/\s]+/.test(value) && !value.includes('your-deployment'));
const configurationError = !isValidUrl(convexUrl)
  ? 'VITE_CONVEX_URL is missing or invalid. Set it to your deployed Convex cloud URL (for example, https://your-deployment.convex.cloud) and restart Vite.'
  : !isValidUrl(convexSiteUrl)
    ? 'VITE_CONVEX_SITE_URL is missing or invalid. Set it to the matching Convex site URL (for example, https://your-deployment.convex.site) and restart Vite.'
    : null;
const convex = !configurationError ? new ConvexReactClient(convexUrl!) : null;

function ConfigurationError({ message }: { message: string }) {
  return <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4"><section className="max-w-lg rounded-2xl border border-amber-200 bg-white p-7 shadow-xl"><h1 className="text-xl font-bold text-[#14213D]">HeatShield AI needs configuration</h1><p className="mt-3 text-sm text-slate-600">{message}</p><p className="mt-3 text-xs text-slate-500">These are public client configuration values, not secrets. Do not add fake credentials.</p></section></main>;
}

createRoot(document.getElementById('root')!).render(
  convex ? <ConvexProvider client={convex}><AuthProvider><App /></AuthProvider></ConvexProvider> : <ConfigurationError message={configurationError!} />,
);

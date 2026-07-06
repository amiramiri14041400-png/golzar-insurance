import React, { useState } from 'react';
import { X, Copy, Check, Database, Sparkles, Server, Terminal, ExternalLink, Code2 } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSchema';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'env' | 'nextjs'>('sql');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center font-black shadow">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                راهنمای راه‌اندازی Supabase و ساخت جدول‌ها
              </h3>
              <p className="text-xs text-emerald-200">
                دستورات SQL آماده دیتابیس + کلیدهای محیطی و پیکربندی Cloudflare / Next.js
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 border-b p-2 flex items-center gap-2 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'sql' ? 'bg-emerald-800 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            دستورات SQL برای Supabase Editor
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'env' ? 'bg-emerald-800 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            متغیرهای محیطی (.env)
          </button>

          <button
            onClick={() => setActiveTab('nextjs')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'nextjs' ? 'bg-emerald-800 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            پیکربندی Cloudflare Pages & Next.js
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-800 text-xs">
          
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-emerald-950 space-y-1">
                <p className="font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  مراحل ساخت جدول‌ها در Supabase:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed">
                  <li>وارد پنل کنسول پروژه Supabase خود به آدرس <code className="bg-emerald-100 px-1 rounded dir-ltr inline-block">supabase.com/dashboard</code> شوید.</li>
                  <li>از منوی سمت چپ، بخش <strong>SQL Editor</strong> را انتخاب نمایید.</li>
                  <li>کد زیر را کپی کرده و در انتهای صفحه روی <strong>RUN</strong> کلیک کنید تا جدول‌های <code className="font-bold">inquiries</code> و <code className="font-bold">inquiry_documents</code> ساخته شوند.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'کپی شد!' : 'کپی کامل دستورات SQL'}</span>
                  </button>
                </div>

                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto border dir-ltr text-left max-h-96 leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed font-medium">
                برای متصل کردن این پروژه یا پروژه Next.js به Supabase، متغیرهای محیطی زیر را در فایل <code className="font-mono bg-slate-100 px-1 rounded">.env.local</code> تنظیم نمایید:
              </p>

              <div className="bg-slate-950 text-amber-300 p-4 rounded-2xl font-mono dir-ltr text-left space-y-2 border">
                <p className="text-slate-400"># Supabase Credentials for Iran Insurance Agency Code 30962</p>
                <p>VITE_SUPABASE_URL="https://your-project-ref.supabase.co"</p>
                <p>VITE_SUPABASE_ANON_KEY="your-anon-key-here"</p>
                <p className="text-slate-400 pt-2"># Gemini AI Consultant Key</p>
                <p>GEMINI_API_KEY="your-gemini-api-key"</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-1">
                <p className="font-bold text-amber-900">آدرس و کلیدها کجا قرار دارند؟</p>
                <p className="text-slate-700 leading-relaxed">
                  در پنل Supabase به مسیر <strong>Project Settings &gt; API</strong> بروید. آدرس URL و کلید <code className="bg-amber-100 px-1 rounded font-mono">anon public</code> را کپی نمایید.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'nextjs' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">راهنمای استقرار روی Cloudflare Pages / Next.js:</h4>

              <div className="space-y-2 leading-relaxed text-slate-700">
                <p><strong>۱. نصب بسته Cloudflare Adapter:</strong></p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono dir-ltr text-left">
                  npm install -D @cloudflare/next-on-pages
                </pre>

                <p className="pt-2"><strong>۲. فایل next.config.mjs:</strong></p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono dir-ltr text-left">
                  {`import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;`}
                </pre>

                <p className="pt-2"><strong>۳. دستور ساخت جهت Cloudflare:</strong></p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono dir-ltr text-left">
                  npx @cloudflare/next-on-pages
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            متوجه شدم / بستن
          </button>
        </div>

      </div>
    </div>
  );
};

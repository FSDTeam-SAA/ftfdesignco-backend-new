import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { formatUptime } from './uptime.util';

export const serverTemplate = (_req: Request, res: Response): void => {
    const isDbConnected = mongoose.connection.readyState === 1;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FTF Design Co. | API Status</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes pulse-soft {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-indigo { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    </style>
</head>
<body class="bg-[#030712] text-slate-300 font-sans min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <div class="bg-[#0f172a] border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-indigo-900/20">
            <div class="flex items-center justify-between mb-10">
                <div class="flex items-center gap-3">
                    <div class="h-3 w-3 rounded-full ${isDbConnected ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'} animate-pulse-indigo"></div>
                    <span class="text-[10px] font-black tracking-[0.2em] ${isDbConnected ? 'text-indigo-400' : 'text-rose-400'} uppercase">
                        ${isDbConnected ? 'Core Operational' : 'Database Offline'}
                    </span>
                </div>
                <span class="text-[10px] text-slate-600 font-mono tracking-tighter uppercase">Build 2026.02.08</span>
            </div>

            <h1 class="text-3xl font-bold text-white mb-3 tracking-tight">FTF Design Co.</h1>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed font-light">
                Secure backend gateway for FTF Design Co. commerce and assets. All API modules are currently optimized for peak performance.
            </p>

            <div class="grid grid-cols-2 gap-4 mb-10">
                <div class="bg-[#030712]/50 rounded-xl p-4 border border-slate-800/50">
                    <span class="block text-[9px] text-slate-500 uppercase font-bold mb-1">Environment</span>
                    <span class="text-xs text-indigo-300 font-mono italic">Production</span>
                </div>
                <div class="bg-[#030712]/50 rounded-xl p-4 border border-slate-800/50">
                    <span class="block text-[9px] text-slate-500 uppercase font-bold mb-1">Uptime</span>
                    <span class="text-xs text-slate-300 font-mono">${formatUptime(process.uptime())}</span>
                </div>
            </div>

            <div class="pt-8 border-t border-slate-800/60 flex items-center justify-between">
                <p class="text-[10px] text-slate-600 font-medium">© 2026 FTF DESIGN CO.</p>
                <div class="flex gap-1.5">
                    <div class="h-1 w-4 rounded-full bg-slate-800"></div>
                    <div class="h-1 w-8 rounded-full bg-indigo-900"></div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `);
};
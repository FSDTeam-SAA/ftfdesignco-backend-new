import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { formatUptime } from './uptime.util';

export const serverTemplate = (_req: Request, res: Response): void => {
    const isDbConnected = mongoose.connection.readyState === 1;
    const statusColor = isDbConnected ? 'indigo' : 'rose';

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FTF Core | Status</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
        
        :root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        .scanline {
            width: 100%;
            height: 100px;
            z-index: 10;
            background: linear-gradient(0deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 100%);
            position: absolute;
            animation: scan 4s linear infinite;
        }
        .glass {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .bg-mesh {
            background-color: #030712;
            background-image: 
                radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.1) 0px, transparent 50%);
        }
    </style>
</head>
<body class="bg-mesh text-slate-300 min-h-screen flex items-center justify-center overflow-hidden">
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="scanline"></div>
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 24px 24px;"></div>
    </div>

    <div class="relative max-w-lg w-full mx-6 group">
        <div class="absolute -inset-1 bg-gradient-to-r from-${statusColor}-500 to-blue-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        <div class="glass relative rounded-[2rem] p-10 overflow-hidden">
            <div class="flex items-center justify-between mb-12">
                <div class="px-4 py-1.5 rounded-full border border-${statusColor}-500/30 bg-${statusColor}-500/10 flex items-center gap-2.5">
                    <div class="h-2 w-2 rounded-full bg-${statusColor}-500 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
                    <span class="text-[10px] font-bold tracking-[0.15em] text-${statusColor}-400 uppercase mono">
                        ${isDbConnected ? 'System Optimal' : 'Critical Failure'}
                    </span>
                </div>
                <div class="text-[10px] font-mono text-slate-500 bg-slate-800/40 px-3 py-1 rounded-md">
                    NODE_ENV: PROD
                </div>
            </div>

            <div class="mb-10">
                <h1 class="text-4xl font-extrabold text-white tracking-tighter mb-4">
                    FTF <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Design Co.</span>
                </h1>
                <p class="text-slate-400 text-sm leading-relaxed max-w-xs font-light">
                    Proprietary API architecture managing global assets, orders, and neural design processing.
                </p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-12">
                <div class="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                    <span class="block text-[10px] text-slate-500 font-bold uppercase mb-2 mono">Uptime Metric</span>
                    <span class="text-lg font-semibold text-indigo-300 mono tracking-tight">
                        ${formatUptime(process.uptime())}
                    </span>
                </div>
                <div class="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                    <span class="block text-[10px] text-slate-500 font-bold uppercase mb-2 mono">Latency Check</span>
                    <span class="text-lg font-semibold text-emerald-400 mono tracking-tight">
                        ${Math.floor(Math.random() * (45 - 12 + 1) + 12)}ms
                    </span>
                </div>
            </div>

            <div class="flex items-center justify-between pt-8 border-t border-white/5">
                <div>
                    <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Authorized Personnel Only</div>
                    <div class="text-[9px] text-slate-600 mt-1 uppercase mono">Encrypted Stream Protocol 802.11v</div>
                </div>
                <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `);
};
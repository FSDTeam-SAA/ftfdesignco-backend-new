import { Request, Response } from 'express';

export const serverTemplate = (_req: Request, res: Response): void => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dwiseguy API | Status</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes pulse-soft {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    </style>
</head>
<body class="bg-[#0b0f1a] text-slate-300 font-sans min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <div class="bg-[#161b2a] border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-emerald-900/10">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <div class="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse-soft"></div>
                    <span class="text-xs font-bold tracking-widest text-emerald-500 uppercase">System Active</span>
                </div>
                <span class="text-[10px] text-slate-500 font-mono">v1.0.4-stable</span>
            </div>

            <h1 class="text-2xl font-semibold text-white mb-2">Dwiseguy Backend</h1>
            <p class="text-slate-400 text-sm mb-6 leading-relaxed">
                The high-performance API core for Dwiseguy services. All systems are currently operating within normal parameters.
            </p>

            <div class="space-y-3 mb-8">
                <div class="bg-[#0b0f1a] rounded-lg p-4 border border-slate-800/50 flex justify-between items-center">
                    <span class="text-xs text-slate-500 uppercase font-medium">Environment</span>
                    <span class="text-xs text-emerald-400 font-mono">Production</span>
                </div>
                <div class="bg-[#0b0f1a] rounded-lg p-4 border border-slate-800/50 flex justify-between items-center">
                    <span class="text-xs text-slate-500 uppercase font-medium">Uptime</span>
                    <span class="text-xs text-slate-300 font-mono">${Math.floor(process.uptime())}s</span>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-800 flex items-center justify-between">
                <p class="text-[11px] text-slate-600">© 2026 Dwiseguy · Elite SWE Standards</p>
                <div class="flex gap-4">
                    <div class="h-1.5 w-1.5 rounded-full bg-slate-700"></div>
                    <div class="h-1.5 w-1.5 rounded-full bg-slate-700"></div>
                    <div class="h-1.5 w-1.5 rounded-full bg-slate-700"></div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `);
};
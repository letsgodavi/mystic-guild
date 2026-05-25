/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Radar as RechartsRadar, Tooltip as RechartsTooltip, 
  PieChart, Pie, Cell 
} from 'recharts'
import { 
  Castle, Swords, BarChart3, Map as MapIcon, User, Hammer, Scale, Clock,
  Crosshair, Shield, Diamond, Layers, Wind, Zap, Crown, Trophy,
  ShieldAlert, Target, Play, Save, X, Users, MapPin, Sparkles, Skull, Lock, Eye, Plus, Trash2
} from 'lucide-react';

// --- 🔐 SECURITY CONFIG 🔐 ---
const GLOBAL_ADMINS = ['BlueLabel', 'GreenLabel', 'CaramelMacchiato', 'SLANE', 'Highball']; 
const TOI_ADMINS = ['SLANE', 'Highball'];

// --- ⚙️ SYSTEM CONFIG ⚙️ ---
// ✅ กำหนดวันเปิดระบบ TOI ที่นี่ที่เดียว (ใช้ร่วมกันทั้งหน้าจองและ Live Feed)
const LAUNCH_DATE = new Date(2026, 1, 18, 0, 0, 0); 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const MYSTIC_API_URL = "https://script.google.com/macros/s/AKfycbxPDfozrm7VxhPkeXnqEIZR4NedjnSj9ZxAUBYACitvzy9zr4KFMLRQJ9s5mDALF643KQ/exec"
const BOSS_API_URL = "https://script.google.com/macros/s/AKfycbz-43koxTy_FlyFsAWfFlAQxUWQG_7RY0SFeJzFHtuCyQxgETTcJwyACLZboYgVZdhh7A/exec" 
const CLASS_COLORS = ['#a855f7', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#64748b'];

// --- HELPERS ---
const getPlaceholderImage = (tier: string) => {
    if (tier.startsWith('red')) return "https://freepngimg.com/thumb/sword/22-sword-png-image-thumb.png";
    if (tier.startsWith('purple')) return "https://freepngimg.com/thumb/sword/8-2-sword-png-picture-thumb.png";
    if (tier.startsWith('blue')) return "https://freepngimg.com/thumb/sword/10-sword-png-image-thumb.png";
    return "https://freepngimg.com/thumb/sword/1-sword-png-image-thumb.png";
};

// --- ✅ HELPER: สูตรคำนวณ Zone แบบ Custom 4 สัปดาห์ (Cycle 28 วัน) ---
const getToiStatus = () => {
    // 1. กำหนด Pattern 28 วัน ตามที่คุณระบุมาเป๊ะๆ (เริ่มนับจากวันจันทร์ Week 1)
    const CYCLE_PATTERN = [
        // --- Week 1 (เริ่มจันทร์ 26) ---
        'E', 'E', // จันทร์-อังคาร (E)
        'F', 'F', // พุธ-พฤหัส (F)
        'G', 'G', // ศุกร์-เสาร์ (G)
        'H',      // อาทิตย์ (H)

        // --- Week 2 ---
        'H',      // จันทร์ (H)
        'A', 'A', // อังคาร-พุธ (A)
        'B', 'B', // พฤหัส-ศุกร์ (B)
        'C', 'C', // เสาร์-อาทิตย์ (C)

        // --- Week 3 ---
        'D', 'D', // จันทร์-อังคาร (D)
        'E', 'E', // พุธ-พฤหัส (E)
        'F', 'F', // ศุกร์-เสาร์ (F)
        'G',      // อาทิตย์ (G)

        // --- Week 4 ---
        'G',      // จันทร์ (G)
        'H', 'H', // อังคาร-พุธ (H)
        'A', 'A', // พฤหัส-ศุกร์ (A)
        'B', 'B'  // เสาร์-อาทิตย์ (B)
    ];

    // 2. วัน Anchor: จันทร์ที่ 26 มกราคม 2026 (จุดเริ่มของ Array ตัวแรก)
    const ANCHOR_DATE = new Date(2026, 0, 26, 0, 0, 0); // Month 0 = Jan

    // 3. คำนวณวันที่ผ่านไปจาก Anchor
    const now = new Date();
    // ตัดเวลาทิ้ง เอาแค่วัน เพื่อความชัวร์
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    
    const diffTime = today.getTime() - ANCHOR_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 4. หา Index ใน Array (ใช้ Modulo 28 เพื่อวนลูปตลอดกาล)
    let index = diffDays % 28;
    if (index < 0) index = 28 + index; // กันเหนียวเผื่อ System Time ย้อนหลัง

    return { normalZone: CYCLE_PATTERN[index] };
};

// ... (หลังจากนี้พวก Component ย่อยๆ FontSystem, CountUp, StatGroup, OracleLoungeCard, OnlineSquad ใช้ของเดิมได้เลยครับ ไม่ต้องแก้) ...

// --- 0. SATO'S DESIGN SYSTEM (Updated with Animation) ---
const FontSystem = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;600;800&display=swap');
    
    body { font-family: 'Inter', sans-serif; background-color: #020205; }
    h1, h2, h3, h4, .font-tech, button, .stat-value { font-family: 'Rajdhani', sans-serif; }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(147, 51, 234, 0.5); }

    @keyframes pulse-red {
      0%, 100% { text-shadow: 0 0 10px rgba(239, 68, 68, 0.5); transform: scale(1); }
      50% { text-shadow: 0 0 30px rgba(239, 68, 68, 0.8); transform: scale(1.05); }
    }

    .tactical-grid {
      background-size: 50px 50px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      mask-image: radial-gradient(circle at var(--x, 50%) var(--y, 50%), black 0%, transparent 80%);
      -webkit-mask-image: radial-gradient(circle 600px at var(--x, 50%) var(--y, 50%), black 0%, transparent 80%);
    }

    /* --- ✅ NEW ANIMATIONS FOR ENCHANT SIM --- */
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    @keyframes shake-hard {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(3px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(1px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    
    /* Class เรียกใช้ */
    .animate-float { animation: float 4s ease-in-out infinite; }
    .animate-shake-hard { animation: shake-hard 0.5s infinite; }
  `}</style>
);

// --- COMPONENT: CountUp ---
const CountUp = React.memo(({ value, formatter = (v: number) => v.toFixed(0), duration = 1500 }: { value: any, formatter?: (v: number) => string, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = Number(value) || 0;
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = 0 + (targetValue - 0) * easeOut;
      setDisplayValue(current);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [targetValue, duration]);
  return <>{formatter(displayValue)}</>;
});
CountUp.displayName = 'CountUp';

// --- COMPONENT: StatGroup ---
const StatGroup = ({ title, items, colorClass, members }: any) => {
    const gradientMap: any = {
      'text-red-500': 'bg-gradient-to-r from-red-600 to-orange-500', 
      'text-blue-500': 'bg-gradient-to-r from-blue-600 to-cyan-500',
      'text-indigo-500': 'bg-gradient-to-r from-indigo-600 to-purple-500', 
      'text-emerald-500': 'bg-gradient-to-r from-emerald-600 to-teal-500',
      'text-amber-500': 'bg-gradient-to-r from-amber-500 to-yellow-400',
      'text-purple-500': 'bg-gradient-to-r from-purple-600 to-pink-500',
    };

    return (
      <div className="bg-[#0f0f13]/60 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/[0.08] shadow-lg">
        <div className="flex items-center gap-3 mb-4 border-b border-white/[0.08] pb-3">
           <div className={`w-1.5 h-4 rounded-full ${gradientMap[colorClass] || 'bg-white'}`}></div>
           <h4 className={`text-sm md:text-lg font-bold uppercase tracking-wide ${colorClass}`}>{title}</h4>
        </div>
        <div className="space-y-3 md:space-y-4">
          {items.map((item: any, idx: number) => {
            
            // ✅ ดักจับพิเศษ: ถ้าเป็น Salvation ให้โชว์กล่อง "มี / ไม่มี"
            if (item.key === 'salvation') {
                return (
                    <div key={idx} className="flex justify-between items-center bg-white/[0.03] p-2 md:p-3 rounded-xl border border-white/10 mt-2">
                        <span className="text-slate-400 font-medium uppercase text-[9px] md:text-[10px] tracking-wider">{item.label}</span>
                        <span className={`text-xs md:text-sm tracking-widest font-black ${item.val ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-slate-600'}`}>
                            {item.val ? '✅ ENABLED' : '❌ NONE'}
                        </span>
                    </div>
                );
            }

            // ถ้าเป็น Stat ปกติ ให้แสดงแบบมีหลอดสี
            const validValues = members.map((m: any) => Number(m.stats?.[item.key] || 0)).filter((v: any) => !isNaN(v) && v !== 0);
            const avg = validValues.length > 0 ? validValues.reduce((a: any, b: any) => a + b, 0) / validValues.length : 0;
            const maxVal = validValues.length > 0 ? Math.max(...validValues) : 1; 
            const currentVal = Number(item.val || 0);
            
            return (
              <div key={idx} className="group relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-slate-400 font-medium uppercase text-[9px] md:text-[10px] tracking-wider truncate mr-2">{item.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {currentVal >= maxVal && currentVal > 0 && <span className="text-[10px] animate-pulse">👑</span>}
                    <span className={`stat-value text-xs md:text-sm tracking-wide ${currentVal >= maxVal && currentVal > 0 ? 'text-yellow-400 font-bold' : 'text-white'}`}>
                      <CountUp value={currentVal} formatter={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 1 })} />
                    </span>
                  </div>
                </div>
                <div className="h-1 md:h-1.5 w-full bg-slate-800/40 rounded-full overflow-hidden">
                  <div className={`h-full ${gradientMap[colorClass] || 'bg-white'} shadow-[0_0_12px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, (currentVal / maxVal) * 100)}%` }} ></div>
                </div>
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -top-8 right-0 bg-slate-900/90 border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold z-50 shadow-xl whitespace-nowrap backdrop-blur-md translate-y-2 group-hover:translate-y-0">
                  AVG: {avg.toFixed(1)} | MAX: {maxVal.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
};

// --- COMPONENT: ORACLE LOUNGE CARD (Widget) ---
const OracleLoungeCard = ({ onNavigate }: any) => {
    const [savedRank, setSavedRank] = useState<string | null>(null);

    useEffect(() => {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('oracle_date');
        const lastResult = localStorage.getItem('oracle_result');
        if (lastDate === today && lastResult) {
            setSavedRank(JSON.parse(lastResult).rank);
        }
    }, []);

    const getRankColor = (rank: string) => {
        if (rank === 'SSS') return 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]';
        if (rank === 'A') return 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(192,38,211,0.6)]';
        if (rank === 'B') return 'text-cyan-400';
        if (rank === 'F') return 'text-red-500';
        return 'text-white';
    };

    return (
        <div 
            onClick={() => onNavigate('ORACLE')}
            className="group relative h-full min-h-[140px] bg-[#0a0a0e] border border-white/10 rounded-[24px] overflow-hidden cursor-pointer hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all"
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-amber-900/10"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 text-center">
                {savedRank ? (
                    <div className="animate-in zoom-in duration-300">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Today's Prophecy</div>
                        <div className={`text-5xl font-black italic font-tech ${getRankColor(savedRank)}`}>{savedRank}</div>
                        <div className="text-[9px] text-amber-200/60 mt-1">Tap to view details</div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 border border-amber-400/30 rounded-full animate-spin-slow"></div>
                            {/* ✅ แก้ตรงนี้: ใช้ไอคอน Eye แทน emoji */}
                            <Eye size={28} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                        </div>
                        <div>
                            <div className="text-amber-400 font-bold text-sm font-tech uppercase tracking-wider">Daily Oracle</div>
                            <div className="text-[10px] text-slate-500">Reveal your destiny</div>
                        </div>
                    </div>
                )}
            </div>
            {!savedRank && <div className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>}
        </div>
    );
};

// --- COMPONENT: ONLINE SQUAD ---
const OnlineSquad = ({ user, ingameName }: any) => {
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !ingameName) return;
        const channel = supabase.channel('room-mystic', { config: { presence: { key: user.id } } });
        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const users: any[] = [];
                for (const id in newState) { users.push(newState[id][0]); }
                setOnlineUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        id: user.id,
                        name: ingameName,
                        avatar: user.user_metadata?.avatar_url || '',
                        online_at: new Date().toISOString(),
                    });
                }
            });
        return () => { supabase.removeChannel(channel); };
    }, [user, ingameName]);

    if (onlineUsers.length === 0) return null;

    return (
        <div className="bg-[#0f0f13]/60 border border-green-500/20 rounded-2xl p-4 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest font-tech">
                    Active Operators ({onlineUsers.length})
                </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {onlineUsers.map((u, idx) => (
                    <div key={u.id + idx} className="group relative">
                        <div className="relative">
                            {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-white/10 group-hover:border-green-400 transition-colors object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] text-white font-bold group-hover:border-green-400">
                                    {u.name.charAt(0)}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0f0f13] rounded-full"></div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-tech z-50">
                            {u.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMPONENT: TOI DASHBOARD (Consolidated UI) ---
const ToiDashboard = ({ onNavigate }: any) => { 
    const { normalZone } = getToiStatus();
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedFloorMap, setSelectedFloorMap] = useState(1);

    // Modal Map (คงเดิม)
    const MapModal = () => (
        <div 
            onClick={(e) => e.stopPropagation()} 
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
            <div className="bg-[#0f0f13] border border-white/10 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col relative shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-white font-bold uppercase tracking-widest font-tech flex items-center gap-2">
                        <MapIcon className="text-purple-500" /> Tactical Maps <span className="text-slate-500 text-xs">(Zone A-H)</span>
                    </h3>
                    <button onClick={() => setShowMapModal(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"><X size={18} /></button>
                </div>
                <div className="flex gap-1 p-2 bg-black/40 border-b border-white/5 overflow-x-auto">
                    {[1, 2, 3, 4].map(f => (
                        <button key={f} onClick={() => setSelectedFloorMap(f)} className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedFloorMap === f ? 'bg-purple-600 text-white shadow-lg' : 'bg-[#15151a] text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>Floor {f}</button>
                    ))}
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#050508] relative">
                    <img src={`/maps/toi_${selectedFloorMap}f.jpg`} alt={`TOI Floor ${selectedFloorMap}`} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5" />
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-xl">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Current Normal Zone</div>
                        <div className="text-xl font-black text-purple-400 font-tech">ZONE {normalZone}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div 
                onClick={() => onNavigate && onNavigate('TOI')} 
                className="bg-[#0f0f13]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 relative overflow-hidden group cursor-pointer hover:border-purple-500/30 transition-all h-full flex flex-col justify-between"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-purple-900/10 to-transparent pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest font-tech">TOI Operations (T7)</h3>
                </div>

                {/* Main Display: Zone Info */}
                <div className="flex flex-col items-center justify-center flex-1 relative z-10 py-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">Current Normal Zone</span>
                    <div className="text-7xl font-black text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.4)] font-tech flex items-baseline gap-1">
                        <span className="text-purple-500">{normalZone}</span>
                    </div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase mt-2 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                        Active on Floor 1F - 4F
                    </div>
                </div>

                {/* Map Buttons Grid */}
                <div className="mt-6 relative z-10">
                    <div className="text-[9px] text-slate-500 uppercase font-bold mb-2 ml-1">Tactical Maps</div>
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(f => (
                            <button 
                                key={f}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setSelectedFloorMap(f); 
                                    setShowMapModal(true); 
                                }}
                                className="py-2 rounded-lg bg-white/5 hover:bg-purple-600 hover:text-white border border-white/5 hover:border-purple-500 text-slate-400 text-[10px] font-bold transition-all"
                            >
                                {f}F
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer System Time */}
                <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-slate-500 text-center uppercase tracking-widest flex justify-between items-center">
                    <span>System Time</span>
                    <span className="font-mono text-slate-300 font-bold">{new Date().toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
            </div>

            {showMapModal && <MapModal />}
        </>
    );
};
// --- HELPER FUNCTIONS & SUB-COMPONENTS ---

// 1. Helper คำนวณ Status (แยกออกมาใช้ร่วมกัน)
const getBossStatus = (spawnTime: number, now: Date) => {
    if (spawnTime === Infinity) return { status: 'UNKNOWN', label: 'Unknown', color: 'text-slate-500', timer: '--:--:--', diff: 0 };
    
    const diff = spawnTime - now.getTime();
    if (diff <= 0) return { status: 'ALIVE', label: 'ALIVE', color: 'text-green-500 animate-pulse', timer: 'SPAWNED', diff };
    
    const hLeft = Math.floor(diff / (1000 * 60 * 60));
    const mLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const sLeft = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { status: 'DEAD', label: 'RESPAWNING', color: 'text-red-500', timer: `${hLeft}h ${mLeft}m ${sLeft}s`, diff };
};

// --- COMPONENT: BOSS CARD (Updated: Show Spawn Time) ---
const BossCard = ({ boss, variant, now, isAdmin, onEdit }: any) => {
    // Helper คำนวณเวลาเกิด
    const getSpawnTs = (b: any) => {
       if (!b || !b.death_time) return Infinity;
       const deathTimeStr = String(b.death_time);
       const cooldownVal = Number(b.cooldown); 
       if (!deathTimeStr.includes(':') || isNaN(cooldownVal)) return Infinity; 
       const [h, m] = deathTimeStr.split(':').map(Number);
       let deathDate = new Date();
       deathDate.setHours(h, m, 0, 0);
       if (b.last_updated) {
           const lastUpdateDate = new Date(b.last_updated);
           if (!isNaN(lastUpdateDate.getTime())) {
               deathDate.setFullYear(lastUpdateDate.getFullYear());
               deathDate.setMonth(lastUpdateDate.getMonth());
               deathDate.setDate(lastUpdateDate.getDate());
           }
       } else {
           if (deathDate.getTime() > now.getTime() + 3600000) { deathDate.setDate(deathDate.getDate() - 1); }
       }
       return deathDate.getTime() + (cooldownVal * 60000); 
    };

    const spawnTime = getSpawnTs(boss);
    const { status, label, color, timer, diff } = getBossStatus(spawnTime, now);
    const chance = boss.chance ? Number(boss.chance) : 100;
    const bgImage = boss.image && boss.image.startsWith('http') ? boss.image : null;
    
    // Time String (HH:mm)
    const spawnDate = new Date(spawnTime);
    const spawnTimeStr = spawnTime !== Infinity 
        ? `${spawnDate.getHours().toString().padStart(2, '0')}:${spawnDate.getMinutes().toString().padStart(2, '0')}` 
        : '--:--';

    // Progress Bar Logic
    let progressPercent = 0;
    if (status === 'DEAD' && boss.death_time && !isNaN(Number(boss.cooldown))) {
        const totalDuration = Number(boss.cooldown) * 60 * 1000;
        const timePassed = totalDuration - (diff || 0); 
        progressPercent = Math.min(100, Math.max(0, (timePassed / totalDuration) * 100));
    }

    let containerStyle = "relative rounded-xl border transition-all duration-500 overflow-hidden group ";
    if (variant === 'threat') containerStyle += "bg-red-900/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] p-4";
    else if (variant === 'warning') containerStyle += "bg-yellow-900/10 border-yellow-500/30 p-4";
    else containerStyle += "bg-[#0a0a0e] border-white/5 hover:border-white/10 hover:bg-[#121216] flex items-center justify-between gap-4 py-3 px-4";

    return (
        <div className={containerStyle}>
            {bgImage && (
                <>
                    <div className={`absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-700 mix-blend-luminosity group-hover:mix-blend-normal ${variant === 'safe' ? 'opacity-[0.07] group-hover:opacity-[0.15]' : 'opacity-20 group-hover:opacity-40'}`} style={{ backgroundImage: `url(${bgImage})` }}></div>
                    <div className={`absolute inset-0 z-0 bg-gradient-to-t from-black ${variant === 'safe' ? 'via-black/50' : 'via-black/80'} to-transparent`}></div>
                </>
            )}

            {/* Progress Bar */}
            {status === 'DEAD' && variant !== 'safe' && (
                <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full z-0">
                    <div className={`h-full transition-all duration-1000 ease-linear ${variant === 'threat' ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${progressPercent}%` }}></div>
                </div>
            )}

            <div className={`relative z-10 w-full ${variant === 'safe' ? 'flex items-center justify-between w-full' : ''}`}>
                <div className={`flex justify-between items-start ${variant === 'safe' ? 'flex-1' : 'mb-3'}`}>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            {variant === 'safe' && bgImage && (<div className="w-8 h-8 rounded-full border border-white/10 p-0.5 bg-black/50"><img src={bgImage} className="w-full h-full rounded-full object-cover" alt="icon" /></div>)}
                            <h3 className={`font-bold font-tech uppercase ${variant === 'threat' ? 'text-2xl text-white drop-shadow-md' : variant === 'warning' ? 'text-lg text-white' : 'text-sm text-slate-300 group-hover:text-white transition-colors'}`}>{boss.name}</h3>
                            {chance < 100 && <span className={`text-[9px] px-1.5 rounded font-bold border ${chance <= 33 ? 'border-red-500 text-red-400' : 'border-yellow-500 text-yellow-400'}`}>{chance}%</span>}
                        </div>
                        {variant !== 'safe' && <span className={`text-[10px] font-bold tracking-widest ${color}`}>{label}</span>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isAdmin && <button onClick={(e) => { e.stopPropagation(); onEdit(boss); }} className="w-6 h-6 rounded-full bg-black/50 hover:bg-white/20 flex items-center justify-center text-[10px] text-slate-400 border border-white/10 transition-colors backdrop-blur-sm">✎</button>}
                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'ALIVE' ? 'bg-green-500 animate-ping' : 'bg-slate-700'}`}></div>
                    </div>
                </div>

                <div className={`${variant === 'safe' ? 'text-right' : 'text-center py-2'}`}>
                    <div className={`font-bold font-tech tracking-wider ${variant === 'threat' ? 'text-4xl text-red-100 animate-pulse drop-shadow-lg' : variant === 'warning' ? 'text-3xl text-yellow-100' : 'text-xl text-slate-500 group-hover:text-slate-300 transition-colors'}`}>
                        {timer}
                    </div>
                    
                    {/* กรณี: ตายอยู่ (แสดงเวลาเกิด) */}
                    {status === 'DEAD' && (
                        <div className={`text-[10px] font-bold uppercase mt-0.5 flex items-center justify-center gap-1.5 ${variant === 'safe' ? 'justify-end text-slate-500' : 'text-slate-400'}`}>
                            <Clock size={12} strokeWidth={2.5} />
                            <span>{spawnTimeStr}</span>
                        </div>
                    )}
                    
                    {/* ✅ กรณี: เกิดแล้ว (แสดงเวลาที่เกิด แทน Ready to Kill) */}
                    {status === 'ALIVE' && (
                        <div className="text-[10px] text-green-400 uppercase font-bold animate-bounce mt-1 flex items-center justify-center gap-1">
                             <Clock size={12} strokeWidth={2.5} />
                             <span>Spawned at {spawnTimeStr}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: TOI LIVE FEED (Widget for Dashboard) ---
const ToiLiveFeed = ({ members }: any) => {
    const [liveData, setLiveData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const CONFIG: any = {
        'red_toi2': { label: 'TOI 2 (Red)', cap: 1 },
        'red_toi3': { label: 'TOI 3 (Red)', cap: 1 },
        'red_toi4': { label: 'TOI 4 (Red)', cap: 1 },
        'normal_toi2': { label: 'TOI 2', cap: 4 },
        'normal_toi3': { label: 'TOI 3', cap: 4 },
        'normal_toi4': { label: 'TOI 4', cap: 2 },
    };

    useEffect(() => {
        const fetchAndCalculate = async () => {
            const { data } = await supabase.from('toi_bookings').select('*');
            if (!data) return;

            const now = new Date();
            const hour = now.getHours();
            const isNightShift = hour >= 12;
            
            // ✅ ใช้ LAUNCH_DATE จาก Global Config ด้านบน (ไม่ประกาศซ้ำ)
            let dayDiff = 0;
            if (now >= LAUNCH_DATE) {
                const diffTime = now.getTime() - LAUNCH_DATE.getTime();
                dayDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }

            const activeFarmers: any[] = [];

            data.forEach((room: any) => {
                const conf = CONFIG[room.zone_id];
                if (!conf) return;
                const queue = room.queue || [];
                if (queue.length === 0) return;

                const sorted = [...queue].sort((a: string, b: string) => {
                    const memA = members.find((m: any) => m.ingame_name === a);
                    const memB = members.find((m: any) => m.ingame_name === b);
                    return (Number(memB?.cp) || 0) - (Number(memA?.cp) || 0);
                });

                const perRound = conf.cap;
                const totalSlotsPerDay = perRound * 2;
                
                let startIndex = 0;
                if (sorted.length > 0) {
                    startIndex = (dayDiff * totalSlotsPerDay) % sorted.length;
                }
                
                const currentShiftOffset = isNightShift ? perRound : 0;

                for (let i = 0; i < perRound; i++) {
                    const playerIndex = (startIndex + currentShiftOffset + i) % sorted.length;
                    const playerName = sorted[playerIndex];
                    
                    if (playerName) {
                        const memberInfo = members.find((m: any) => m.ingame_name === playerName);
                        activeFarmers.push({
                            zone: conf.label,
                            player: playerName,
                            cp: memberInfo?.cp || 0,
                            avatar: memberInfo?.avatar || null,
                            isRed: room.zone_id.includes('red'),
                            endTime: isNightShift ? '00:00' : '12:00'
                        });
                    }
                }
            });

            setLiveData(activeFarmers.sort((a, b) => {
                if (a.isRed !== b.isRed) return b.isRed ? 1 : -1;
                return a.zone.localeCompare(b.zone);
            }));
            setLoading(false);
        };

        fetchAndCalculate();
        const interval = setInterval(fetchAndCalculate, 60000);
        return () => clearInterval(interval);
    }, [members]);

    if (loading) return <div className="h-24 bg-[#15151a] rounded-2xl animate-pulse border border-white/5"></div>;
    if (liveData.length === 0) return null;

    return (
        <div className="bg-[#0f0f13]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full relative shadow-[0_0_10px_#22c55e]"></div>
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest font-tech">Live Operations (TOI)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveData.map((data, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${data.isRed ? 'bg-red-900/10 border-red-500/30' : 'bg-black/40 border-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${data.isRed ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                                {data.isRed ? 'RED' : 'NRM'}
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">{data.zone}</div>
                                <div className="text-sm font-bold text-white uppercase italic tracking-wide">{data.player}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase">Ends At</div>
                            <div className="text-xs font-bold text-yellow-400 font-mono">{data.endTime}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
// --- COMPONENT: GUILD EDICT (Gamer Style - Cyan/Purple Neon) ---
const GuildEdict = ({ currentUser }: { currentUser: string }) => {
    const EDICT_ADMINS = ['BLUELABEL', 'HIGHBALL', 'SLANE'];

    const [message, setMessage] = useState("Initializing Command Link...");
    const [lastEditor, setLastEditor] = useState("SYSTEM");
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const canEdit = useMemo(() => {
        if (!currentUser) return false;
        return EDICT_ADMINS.includes(currentUser.toUpperCase());
    }, [currentUser]);

    useEffect(() => {
        const fetchEdict = async () => {
            const { data } = await supabase.from('guild_edicts').select('*').eq('id', 1).single();
            if (data) {
                setMessage(data.message);
                setLastEditor(data.updated_by);
            }
        };
        fetchEdict();

        const channel = supabase.channel('edict-update')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'guild_edicts' }, (payload: any) => {
                if (payload.new) {
                    setMessage(payload.new.message);
                    setLastEditor(payload.new.updated_by);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleSave = async () => {
        if (!editValue.trim()) return setIsEditing(false);
        setIsSaving(true);
        
        const { error } = await supabase.from('guild_edicts').upsert({
            id: 1,
            message: editValue,
            updated_by: currentUser,
            updated_at: new Date()
        });

        if (!error) {
            setMessage(editValue);
            setLastEditor(currentUser);
            setIsEditing(false);
        } else {
            alert("Error saving edict!");
        }
        setIsSaving(false);
    };

    return (
        // ✅ เปลี่ยนธีมจาก แดง -> ฟ้า/ม่วง (Cyberpunk Neon)
        <div className="relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 via-purple-900/10 to-[#0f0f13] shadow-[0_0_25px_rgba(6,182,212,0.15)] mb-6">
            {/* Background Decor: Scanlines & Glow */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50"></div>

            <div className="p-5 flex items-center justify-between gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                    {/* Header Lable */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/50 px-2 py-1 rounded flex items-center gap-2 uppercase tracking-widest font-tech shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Incoming Transmission
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase">
                            Source: {lastEditor}
                        </span>
                    </div>

                    {isEditing ? (
                        // --- EDIT MODE (Input) ---
                        <div className="flex gap-2 mt-2">
                            <input 
                                type="text" 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 bg-black/50 border border-cyan-500/50 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full font-tech shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]"
                                placeholder="Enter command sequence..."
                                autoFocus
                            />
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-6 py-2 rounded-xl text-sm font-bold uppercase transition-all flex items-center gap-2 shadow-lg"
                            >
                                {isSaving ? 'Transmitting...' : 'UPLOAD'}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all">CLOSE</button>
                        </div>
                    ) : (
                        // --- VIEW MODE (Cool Text Effect) ---
                        <div className="flex items-start justify-between gap-4">
                            <div className="relative py-2">
                                {/* Effect Layer: แสงฟุ้งๆ ด้านหลัง */}
                                <div className="absolute inset-0 blur-2xl bg-cyan-500/10 rounded-full scale-y-50 scale-x-110 translate-y-4"></div>
                                
                                {/* ✅✅ ตัวหนังสือแบบ Gamer: Neon Glow + Flicker Animation */}
                                <div 
                                    className="relative text-xl md:text-3xl font-black text-white italic tracking-[0.05em] font-tech break-words line-clamp-3 uppercase leading-tight"
                                    style={{ 
                                        // Neon Glow Effect (ฟ้า + ม่วง)
                                        textShadow: '0 0 5px rgba(6,182,212,0.8), 0 0 15px rgba(168,85,247,0.6), 0 0 30px rgba(6,182,212,0.3)',
                                        // Animation: กระพริบเบาๆ เหมือนไฟไม่นิ่ง
                                        animation: 'text-flicker 4s infinite alternate linear'
                                    }}
                                >
                                    <span className="text-cyan-400 opacity-70 mr-2">{`>`}</span>
                                    {message}
                                    {/* Cursor กระพริบตบท้าย */}
                                    <span className="inline-block w-3 h-6 bg-cyan-400 ml-2 animate-pulse align-middle shadow-[0_0_10px_#06b6d4]"></span>
                                </div>
                            </div>
                            
                            {/* Edit Button */}
                            {canEdit && (
                                <button 
                                    onClick={() => { setEditValue(message); setIsEditing(true); }}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-cyan-300 hover:text-cyan-100 shrink-0 flex flex-col items-center justify-center gap-1 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                    title="Override Command"
                                >
                                    <span className="text-xl">⚙️</span>
                                    <span className="text-[8px] font-bold uppercase tracking-wider">Override</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Inject CSS Animation for Flicker */}
            <style jsx>{`
                @keyframes text-flicker {
                    0%, 100% { opacity: 1; filter: brightness(1); }
                    50% { opacity: 0.92; filter: brightness(1.1); }
                    52% { opacity: 0.98; filter: brightness(1); }
                    54% { opacity: 0.92; filter: brightness(1.2); }
                    56% { opacity: 1; filter: brightness(1); }
                }
            `}</style>
        </div>
    );
};
// --- COMPONENT: WELCOME LOUNGE (Main Dashboard) ---
const WelcomeLounge = ({ user, myStats, bosses, onNavigate, members }: any) => {
    // ✅✅ 1. เพิ่มบรรทัดนี้ เพื่อประกาศตัวแปร currentName ก่อนนำไปใช้
    const currentName = myStats?.ingame_name || user?.user_metadata?.full_name || 'Guest';
    const nextBoss = useMemo(() => {
        if (!bosses || bosses.length === 0) return null;
        const now = new Date().getTime();
        const upcoming = bosses.map((b: any) => {
            const deathTimeStr = String(b.death_time || '');
            const cooldownVal = Number(b.cooldown);
            if (!deathTimeStr.includes(':') || isNaN(cooldownVal)) return { ...b, ts: Infinity };
            const [h, m] = deathTimeStr.split(':').map(Number);
            let deathDate = new Date();
            deathDate.setHours(h, m, 0, 0);
            if (b.last_updated) {
                const lastUpdateDate = new Date(b.last_updated);
                if (!isNaN(lastUpdateDate.getTime())) {
                    deathDate.setFullYear(lastUpdateDate.getFullYear());
                    deathDate.setMonth(lastUpdateDate.getMonth());
                    deathDate.setDate(lastUpdateDate.getDate());
                }
            } else if (deathDate.getTime() > now + 3600000) {
                 deathDate.setDate(deathDate.getDate() - 1);
            }
            return { ...b, ts: deathDate.getTime() + (cooldownVal * 60000) };
        }).filter((b: any) => b.ts !== Infinity).sort((a: any, b: any) => a.ts - b.ts);
        return upcoming[0] || null;
    }, [bosses]);

    const getTimeLeft = (ts: number) => {
        const diff = (ts - new Date().getTime()) / 60000;
        if (diff <= 0) return "SPAWNED NOW!";
        const h = Math.floor(diff / 60);
        const m = Math.ceil(diff % 60);
        return `in ${h > 0 ? h + 'h ' : ''}${m}m`;
    };
    const bossImage = nextBoss?.image && nextBoss.image.startsWith('http') ? nextBoss.image : null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
            {/* ✅✅ วาง Edict ไว้ตรงนี้ (บนสุด) */}
            <GuildEdict currentUser={currentName} />
            <OnlineSquad user={user} ingameName={myStats?.ingame_name || user?.user_metadata?.full_name} />
            
            {/* HERO BANNER */}
            <div 
                onClick={() => onNavigate('PROFILE')} 
                className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 p-8 shadow-2xl cursor-pointer hover:border-purple-500/50 hover:bg-white/[0.02] transition-all group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <img src={user?.user_metadata?.avatar_url} className="w-24 h-24 rounded-full border-4 border-white/10 relative z-10 shadow-xl group-hover:scale-105 transition-transform" alt="Profile" />
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-[#0a0a0e] rounded-full z-20"></div>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-1 font-tech animate-pulse">Welcome Back, Commander</div>
                        <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg leading-tight group-hover:text-purple-300 transition-colors">
                            {myStats?.ingame_name || user?.user_metadata?.full_name}
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 max-w-lg">System online. Synchronization complete. Ready for deployment.</p>
                    </div>
                </div>
                <div className="absolute bottom-4 right-6 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">View Profile &rarr;</div>
            </div>
            {/* ✅✅ แทรกตรงนี้เลยครับ ✅✅ */}
            <ToiLiveFeed members={members} />
            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NEXT BOSS */}
                <div 
                    onClick={() => onNavigate('BOSS_TIME')}
                    className="md:col-span-2 bg-[#0f0f13]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 relative overflow-hidden group cursor-pointer hover:border-red-500/30 transition-all hover:bg-[#0f0f13]/80"
                >
                    {bossImage ? (
                        <>
                            <div className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700 opacity-20 group-hover:opacity-40 group-hover:scale-105 mix-blend-luminosity group-hover:mix-blend-normal" style={{ backgroundImage: `url(${bossImage})` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f13] via-[#0f0f13]/80 to-transparent z-0"></div>
                        </>
                    ) : (
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Swords size={90} /></div>
                    )}
                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-tech">Current Threat Level</h3>
                            <div className="text-white text-2xl font-bold italic uppercase mt-1 flex items-center gap-2">
                                {nextBoss ? (
                                    <>
                                        <span className={nextBoss.ts - new Date().getTime() <= 0 ? "text-red-500 animate-pulse" : "text-yellow-400"}>●</span>
                                        <span className="drop-shadow-md">{nextBoss.name}</span>
                                    </>
                                ) : "No Active Threats"}
                            </div>
                        </div>
                        {nextBoss && (
                            <div className={`px-4 py-2 rounded-lg border text-sm font-bold font-tech backdrop-blur-md shadow-lg ${nextBoss.ts - new Date().getTime() <= 0 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-black/40 border-white/20 text-white'}`}>
                                {getTimeLeft(nextBoss.ts)}
                            </div>
                        )}
                    </div>
                    <div className="relative z-10 mt-8 flex items-center justify-between">
                         <span className="text-xs text-slate-500 group-hover:text-white transition-colors">Go to War Room &rarr;</span>
                         {nextBoss && !bossImage && <div className="text-5xl font-black text-white/5 font-tech absolute bottom-2 right-4">{nextBoss.name}</div>}
                    </div>
                </div>

<ToiDashboard onNavigate={onNavigate} />

                {/* MY STATUS CARD */}
                <div onClick={() => onNavigate('PROFILE')} className="bg-gradient-to-br from-purple-900/20 to-black border border-white/10 rounded-[24px] p-6 cursor-pointer hover:border-purple-500/30 transition-all group">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-tech mb-2">My Performance</h3>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white italic tracking-tighter">{myStats ? Number(myStats.cp).toFixed(1) : '-'}</span>
                            <span className="text-purple-400 font-bold mb-1">%</span>
                        </div>
                        <span className="text-xs text-slate-500 uppercase">Combat Power</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300 bg-white/5 px-2 py-1 rounded">Rank #{myStats?.rank || '-'}</span>
                        <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">View Profile &rarr;</span>
                    </div>
                </div>

                {/* QUICK ACTIONS ROW */}
                <div onClick={() => onNavigate('INTEL')} className="bg-[#0f0f13]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 cursor-pointer hover:bg-white/5 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <BarChart3 className="text-blue-400" size={20} />
                      </div>
                      <h3 className="text-white font-bold uppercase tracking-wider mb-1">Intel Dashboard</h3>
                      <p className="text-xs text-slate-500">View Guild Rankings & Stats</p>
                </div>

                <div onClick={() => onNavigate('COMPARE')} className="bg-[#0f0f13]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 cursor-pointer hover:bg-white/5 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Scale className="text-red-400" size={20} />
                      </div>
                      <h3 className="text-white font-bold uppercase tracking-wider mb-1">Compare</h3>
                      <p className="text-xs text-slate-500">Analyze vs Opponent</p>
                </div>
            </div>
        </div>
    );
};
// --- COMPONENT: BOSS TIME VIEW (MAIN) ---
const BossTimeView = ({ currentUser, isAdmin }: { currentUser: string, isAdmin: boolean }) => {
    const [bosses, setBosses] = useState<any[]>([]);
    const [bossLoading, setBossLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [now, setNow] = useState(new Date());
    const [isCopied, setIsCopied] = useState(false);
    const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
    const [isSoundOn, setIsSoundOn] = useState(false);
    const [selectedSound, setSelectedSound] = useState('/sounds/alarm3n.mp3'); 
    const alertedWarningRef = useRef<Set<string>>(new Set());
    const alertedSpawnRef = useRef<Set<string>>(new Set());
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const isUpdatingRef = useRef(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedBossForEdit, setSelectedBossForEdit] = useState<any>(null);

    // Audio & Fetch Logic (คงเดิม)
    useEffect(() => { const savedSound = localStorage.getItem('mystic_boss_soundv2'); if (savedSound) setSelectedSound(savedSound); }, []);
    useEffect(() => { if (typeof window !== 'undefined') { try { const audio = new Audio(selectedSound); audio.volume = 1.0; audio.load(); audioPlayerRef.current = audio; } catch (err) { console.error("Audio Load Failed:", err); } } }, [selectedSound]);
    const handleSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => { const newSound = e.target.value; setSelectedSound(newSound); localStorage.setItem('mystic_boss_soundv2', newSound); setTimeout(() => { if (audioPlayerRef.current) { audioPlayerRef.current.currentTime = 0; audioPlayerRef.current.play().catch(() => {}); } }, 100); };
    const playWarningSound = () => { try { if (audioPlayerRef.current) { audioPlayerRef.current.currentTime = 0; audioPlayerRef.current.play().catch(e => console.log("Audio prevented:", e)); } } catch (e) { console.error("Audio Error:", e); } };
    const testSound = () => { playWarningSound(); };
    const toggleSound = () => { const newState = !isSoundOn; setIsSoundOn(newState); if (newState) playWarningSound(); };
    useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
    const fetchBosses = async (forceRefresh = false) => { if (isUpdatingRef.current) return; const nowTime = new Date().getTime(); const cachedData = localStorage.getItem('boss_data_cache'); const cachedTimestamp = localStorage.getItem('boss_data_timestamp'); if (!forceRefresh && cachedData && cachedTimestamp && (nowTime - Number(cachedTimestamp) < 60000)) { setBosses(JSON.parse(cachedData)); setLastUpdatedTime(new Date(Number(cachedTimestamp)).toLocaleTimeString()); setBossLoading(false); return; } if (forceRefresh) setIsRefreshing(true); try { const res = await fetch(BOSS_API_URL); const data = await res.json(); if (Array.isArray(data)) { setBosses(data); localStorage.setItem('boss_data_cache', JSON.stringify(data)); localStorage.setItem('boss_data_timestamp', nowTime.toString()); setLastUpdatedTime(new Date().toLocaleTimeString()); } } catch (e) { console.error("Boss fetch error", e); if (cachedData) { setBosses(JSON.parse(cachedData)); } } finally { setBossLoading(false); setIsRefreshing(false); } };
    useEffect(() => { fetchBosses(); const interval = setInterval(() => fetchBosses(false), 60000); return () => clearInterval(interval); }, []);

    // Timestamp Helper
    const getSpawnTimestamp = (b: any) => {
        if (!b || !b.death_time) return Infinity;
        const deathTimeStr = String(b.death_time);
        const cooldownVal = Number(b.cooldown); 
        if (!deathTimeStr.includes(':') || isNaN(cooldownVal)) return Infinity; 
        const [h, m] = deathTimeStr.split(':').map(Number);
        let deathDate = new Date();
        deathDate.setHours(h, m, 0, 0);
        if (b.last_updated) {
            const lastUpdateDate = new Date(b.last_updated);
            if (!isNaN(lastUpdateDate.getTime())) {
                deathDate.setFullYear(lastUpdateDate.getFullYear());
                deathDate.setMonth(lastUpdateDate.getMonth());
                deathDate.setDate(lastUpdateDate.getDate());
            }
        } else {
            if (deathDate.getTime() > now.getTime() + 3600000) { deathDate.setDate(deathDate.getDate() - 1); }
        }
        return deathDate.getTime() + (cooldownVal * 60000); 
    };

    const groupedBosses = useMemo(() => {
        const threat: any[] = [];
        const warning: any[] = [];
        const safe: any[] = [];
        if (!Array.isArray(bosses)) return { threat, warning, safe };
        const sorted = [...bosses].sort((a, b) => getSpawnTimestamp(a) - getSpawnTimestamp(b));
        sorted.forEach(boss => {
            const ts = getSpawnTimestamp(boss);
            const { status, diff } = getBossStatus(ts, now); 
            const diffMinutes = diff ? diff / 60000 : Infinity;
            if (ts === Infinity) safe.push(boss);
            else if (status === 'ALIVE' || diffMinutes <= 3) threat.push(boss); 
            else if (diffMinutes <= 60) warning.push(boss);
            else safe.push(boss);
        });
        return { threat, warning, safe };
    }, [bosses, now]);

    useEffect(() => { if (!isSoundOn) return; let soundQueue: ('SPAWN' | 'WARNING')[] = []; groupedBosses.threat.forEach(boss => { const ts = getSpawnTimestamp(boss); const { diff } = getBossStatus(ts, now); const diffMinutes = diff ? diff / 60000 : Infinity; if (diffMinutes <= 2 && diffMinutes > 0) { if (!alertedWarningRef.current.has(boss.name)) { soundQueue.push('WARNING'); alertedWarningRef.current.add(boss.name); } } }); if (soundQueue.length > 0) { soundQueue.forEach((type, index) => { setTimeout(() => { playWarningSound(); }, index * 600); }); } }, [groupedBosses.threat, isSoundOn]);
    const handleCopySchedule = () => { /* ... Copy Logic เดิม ... */ const upcoming = bosses.filter(b => { const ts = getSpawnTimestamp(b); if (ts === Infinity) return false; const diffMinutes = (ts - now.getTime()) / 60000; return diffMinutes > -30 && diffMinutes <= 360; }).sort((a, b) => getSpawnTimestamp(a) - getSpawnTimestamp(b)); if (upcoming.length === 0) { alert("No bosses in the next 6 hours."); return; } let text = "📡 [BOSS TIME] 6H PLAN\n-------------------------------\n"; upcoming.forEach(b => { const ts = getSpawnTimestamp(b); const date = new Date(ts); const timeStr = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`; const diff = (ts - now.getTime()) / 60000; let status = ""; if (diff <= 0) status = "🔥 เกิดแล้ว!"; else if (diff < 60) status = `(อีก ${Math.ceil(diff)} นาที)`; else { const h = Math.floor(diff/60); const m = Math.ceil(diff%60); status = `(อีก ${h}ชม. ${m}น.)`; } text += `⏰ ${timeStr} - ${b.name} ${status}\n`; }); text += "-------------------------------\nUpdate: " + now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0'); navigator.clipboard.writeText(text).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); };
    
    // Save Function
    const confirmUpdateBossTime = async (bossName: string, timeString: string) => {
        isUpdatingRef.current = true;
        const actionTime = new Date();
        const [h, m] = timeString.split(':').map(Number);
        actionTime.setHours(h, m, 0, 0);
        const updatedBosses = bosses.map(b => { if (b.name === bossName) return { ...b, death_time: timeString, last_updated: actionTime.toISOString() }; return b; });
        setBosses(updatedBosses);
        localStorage.setItem('boss_data_cache', JSON.stringify(updatedBosses));
        localStorage.setItem('boss_data_timestamp', new Date().getTime().toString());
        setEditModalOpen(false); 
        try { await fetch(BOSS_API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: bossName, death_time: timeString }) }); setTimeout(() => { isUpdatingRef.current = false; fetchBosses(true); }, 2500); } catch(e) { alert("Synced (Offline Mode)"); isUpdatingRef.current = false; }
    };

    // Open Edit Modal
const handleEditClick = (boss: any) => {
    setSelectedBossForEdit(boss);
    setEditModalOpen(true);
};

    if (bossLoading && bosses.length === 0) return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in"><div className="relative"><div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin shadow-[0_0_30px_rgba(168,85,247,0.4)]"></div><div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-bold text-white">SCAN</span></div></div><div className="text-purple-400 font-bold tracking-[0.3em] text-xs animate-pulse uppercase">Syncing War Zone...</div></div>;

    return (
        <div className="animate-in fade-in duration-500 space-y-8 pb-20">
            <div className="flex flex-wrap justify-between gap-4 items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchBosses(true)} disabled={isRefreshing} className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 ${isRefreshing ? 'animate-spin text-purple-400 border-purple-500' : 'text-slate-400 hover:text-white'}`} title="Force Refresh Data">⟳</button>
                    <div className="flex flex-col"><span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Last Sync</span><span className="text-[10px] text-slate-300 font-tech">{lastUpdatedTime || "Just now"}</span></div>
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-end">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                        <span className="text-xs text-slate-400 font-bold uppercase">♫</span>
                        <select value={selectedSound} onChange={handleSoundChange} className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer uppercase font-tech appearance-none">
                            <option value="/sounds/alarm3n.mp3" className="bg-black text-white">1. Normal</option>
                            <option value="/sounds/alarm.mp3" className="bg-black text-white">2. Semi-Hardcore</option>
                            <option value="/sounds/alarm2.mp3" className="bg-black text-white">3. Hardcore</option>
                        </select>
                    </div>
                    <button onClick={handleCopySchedule} className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${isCopied ? 'bg-green-500 border-green-500 text-white' : 'bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/40'}`}><span>{isCopied ? '✅ COPIED!' : '📋 COPY 6H'}</span></button>
                    <button onClick={testSound} className="px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all uppercase tracking-widest">🔔 TESTvercel --prod</button>
                    <button onClick={toggleSound} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${isSoundOn ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}><span>{isSoundOn ? '🔊' : '🔇'}</span><span>{isSoundOn ? 'ON' : 'OFF'}</span></button>
                </div>
            </div>
            
            {groupedBosses.threat.length > 0 && <div><h3 className="text-red-500 font-bold font-tech text-xl uppercase tracking-[0.2em] mb-4 flex items-center gap-2 animate-pulse"><span>🚨</span> Imminent Threat / Active</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{groupedBosses.threat.map((boss, idx) => <BossCard key={idx} boss={boss} variant="threat" now={now} isAdmin={isAdmin} onEdit={handleEditClick} />)}</div></div>}
            {groupedBosses.warning.length > 0 && <div><h3 className="text-yellow-500 font-bold font-tech text-lg uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span>⚠️</span> Approaching (Within 1 Hour)</h3><div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">{groupedBosses.warning.map((boss, idx) => <BossCard key={idx} boss={boss} variant="warning" now={now} isAdmin={isAdmin} onEdit={handleEditClick} />)}</div></div>}
            <div><h3 className="text-slate-500 font-bold font-tech text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><span>📡</span> Long Range Sensors</h3>{groupedBosses.safe.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">{groupedBosses.safe.map((boss, idx) => <BossCard key={idx} boss={boss} variant="safe" now={now} isAdmin={isAdmin} onEdit={handleEditClick} />)}</div> : <div className="text-slate-700 text-xs italic">No bosses in long range scan.</div>}</div>

            <BossEditModal 
    isOpen={editModalOpen} 
    onClose={() => setEditModalOpen(false)} 
    boss={selectedBossForEdit} 
    onConfirm={(time: string) => confirmUpdateBossTime(selectedBossForEdit.name, time)} 
/>
        </div>
    );
};

// --- COMPONENT: BOSS EDIT MODAL (Tactical Time Picker) ---
const BossEditModal = ({ isOpen, onClose, onConfirm, boss }: any) => {
    // ถ้าไม่มีข้อมูล หรือไม่ได้เปิด Modal ไม่ต้องแสดงอะไร
    if (!isOpen || !boss) return null;

    // Helper: คำนวณเวลาที่บอส "ควรจะเกิด" (สำหรับปุ่ม Skip)
    // Logic: เอาเวลาตายรอบที่แล้ว + Cooldown = เวลาที่ควรจะเกิดรอบนี้
    const getScheduledSpawnTime = () => {
        if (!boss.death_time) return new Date(); 
        
        const now = new Date();
        // แปลง death_time (HH:mm) เป็นตัวเลข
        const [h, m] = boss.death_time.toString().split(':').map(Number);
        const cooldownVal = Number(boss.cooldown);
        
        let deathDate = new Date();
        deathDate.setHours(h, m, 0, 0);

        // เช็คว่าข้อมูล update ล่าสุดเมื่อไหร่ เพื่อระบุวันให้ถูก
        if (boss.last_updated) {
            const lastUpdateDate = new Date(boss.last_updated);
            if (!isNaN(lastUpdateDate.getTime())) {
                deathDate.setFullYear(lastUpdateDate.getFullYear());
                deathDate.setMonth(lastUpdateDate.getMonth());
                deathDate.setDate(lastUpdateDate.getDate());
            }
        } else {
            // Fallback: ถ้าเวลาตายมันเกินเวลาปัจจุบันไปแล้ว แสดงว่าเป็นของเมื่อวาน
            if (deathDate.getTime() > now.getTime() + 3600000) {
                deathDate.setDate(deathDate.getDate() - 1);
            }
        }

        // เวลาที่ควรจะเกิด = เวลาตายรอบที่แล้ว + คูลดาวน์
        const spawnTime = new Date(deathDate.getTime() + (cooldownVal * 60000));
        return spawnTime;
    };

    // ⏩ ฟังก์ชัน SKIP: บันทึกเวลาตาม "เวลาที่ควรจะเกิด"
    const handleSkip = () => {
        const targetTime = getScheduledSpawnTime();
        const timeStr = `${targetTime.getHours().toString().padStart(2, '0')}:${targetTime.getMinutes().toString().padStart(2, '0')}`;
        onConfirm(timeStr);
    };

    // 🔥 ฟังก์ชัน DIED: บันทึกเวลา "เดี๋ยวนี้" (หรือย้อนหลังตามนาทีที่ระบุ)
    const handleJustDied = (minutesAgo: number = 0) => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - minutesAgo);
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        onConfirm(timeStr);
    };

    // State สำหรับเลือกเวลาเอง
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [customTime, setCustomTime] = useState('');

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                <h3 className="text-xl font-bold text-white mb-1 font-tech uppercase">Update Status</h3>
                <p className="text-sm text-slate-400 mb-6">Target: <span className="text-purple-400 font-bold">{boss.name}</span></p>

                <div className="space-y-3">
                    {/* ✅✅ ส่วนสำคัญ: ปุ่มคู่ DIED และ SKIP */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* ปุ่มซ้าย: DIED (ตายเดี๋ยวนี้) */}
                        <button 
                            onClick={() => handleJustDied(0)}
                            className="bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold text-lg uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                        >
                            <span>🔥 DIED</span>
                            <span className="text-[9px] font-normal opacity-70 normal-case">Reset to NOW</span>
                        </button>

                        {/* ปุ่มขวา: SKIP (ข้ามรอบ/ไม่เกิด) */}
                        <button 
                            onClick={handleSkip} 
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                        >
                            <span>⏩ SKIP</span>
                            <span className="text-[9px] font-normal opacity-70 normal-case">Count from Spawn</span>
                        </button>
                    </div>

                    {/* ปุ่มแก้เวลา: -1 / -2 นาที */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleJustDied(1)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all hover:border-red-500/50 hover:text-white">
                            - 1 Min Ago
                        </button>
                        <button onClick={() => handleJustDied(2)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all hover:border-red-500/50 hover:text-white">
                            - 2 Mins Ago
                        </button>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-600 text-xs uppercase">OR Custom Time</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* เลือกเวลาเอง */}
                    <div className="flex gap-2">
                        <input 
                            type="time" 
                            className="bg-black border border-white/20 text-white rounded-xl px-4 py-3 flex-1 text-center text-lg font-bold focus:border-purple-500 outline-none appearance-none"
                            onChange={(e) => setCustomTime(e.target.value)}
                        />
                        <button 
                            onClick={() => { if(customTime) onConfirm(customTime); }}
                            disabled={!customTime}
                            className="bg-purple-600 disabled:bg-slate-800 text-white px-6 rounded-xl font-bold uppercase"
                        >
                            SET
                        </button>
                    </div>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
            </div>
        </div>
    );
};


// --- COMPONENT: MYSTIC RADIO (Global Music Player) ---
const GuildRadio = () => {
    const playlist = [
        { title: "Call of Destiny", artist: "Lineage2", src: "/music/call-of-destiny.mp3" }, 
        { title: "Caravans Crossing", artist: "Lineage2", src: "/music/caravans-crossing.mp3" },
        { title: "Shepard's flute", artist: "Lineage2", src: "/music/shepard-s-flute.mp3" },
        { title: "Unicorn's Rest", artist: "Lineage2", src: "/music/unicorn-s-rest.mp3" },
        { title: "Tree of Life", artist: "Lineage2", src: "/music/tree-of-life.mp3" },
    ];

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [volume, setVolume] = useState(0.3); 
    const [isMinimized, setIsMinimized] = useState(true); 
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, []);

    const handleVolume = (e: any) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) audioRef.current.volume = vol;
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play().catch(e => console.log("Music blocked:", e));
        setIsPlaying(!isPlaying);
    };

    const changeTrack = (direction: 'next' | 'prev') => {
        let newIndex = direction === 'next' ? currentTrack + 1 : currentTrack - 1;
        if (newIndex >= playlist.length) newIndex = 0;
        if (newIndex < 0) newIndex = playlist.length - 1;
        
        setCurrentTrack(newIndex);
        setIsPlaying(true); 
        
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play();
            }
        }, 100);
    };

    const handleEnded = () => { changeTrack('next'); };

    return (
        // ของใหม่ (ขยับขึ้นหนี Bottom Bar ในมือถือ)
<div className={`fixed bottom-24 md:bottom-4 left-4 z-50 transition-all duration-500 font-tech ${isMinimized ? 'w-12 h-12' : 'w-72'}`}>
            <audio 
                ref={audioRef} 
                src={playlist[currentTrack].src} 
                onEnded={handleEnded} 
            />

            {isMinimized ? (
                <button 
                    onClick={() => setIsMinimized(false)}
                    className={`w-12 h-12 rounded-full border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] bg-black/80 backdrop-blur-md hover:scale-110 transition-transform ${isPlaying ? 'animate-spin-slow' : ''}`}
                >
                    <span className="text-xl">🎵</span>
                </button>
            ) : (
                <div className="bg-[#0a0a0e]/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 pointer-events-none"></div>
                    
                    <button onClick={() => setIsMinimized(true)} className="absolute top-2 right-2 text-slate-500 hover:text-white text-xs">✕</button>

                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}>
                            <span className="text-lg">🎧</span>
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-white text-sm font-bold uppercase truncate tracking-wide">{playlist[currentTrack].title}</h4>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{playlist[currentTrack].artist}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-purple-500 ${isPlaying ? 'animate-progress-infinite' : 'w-0'}`} style={{ width: '100%' }}></div>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                            <button onClick={() => changeTrack('prev')} className="text-slate-400 hover:text-white transition-colors text-lg">⏮</button>
                            <button 
                                onClick={togglePlay} 
                                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_10px_white]"
                            >
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <button onClick={() => changeTrack('next')} className="text-slate-400 hover:text-white transition-colors text-lg">⏭</button>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-slate-500">VOL</span>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.05" 
                                value={volume} 
                                onChange={handleVolume}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- CONFIGURATION ---
const WEAPON_TIERS: any = {
    'green': { name: 'Rare', color: 'text-green-400', border: 'border-green-500', bg: 'bg-green-900/20', price: 10 },
    'blue1': { name: 'Blue I', color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-900/20', price: 20 },
    'blue2': { name: 'Blue II', color: 'text-blue-300', border: 'border-blue-400', bg: 'bg-blue-800/30', price: 50 },
    'blue3': { name: 'Blue III', color: 'text-cyan-300', border: 'border-cyan-400', bg: 'bg-cyan-800/30', price: 70 },
    'blue4': { name: 'Blue IV', color: 'text-indigo-300', border: 'border-indigo-400', bg: 'bg-indigo-800/30', price: 100 },
    'red1':  { name: 'Red T1', color: 'text-red-500', border: 'border-red-600', bg: 'bg-red-900/30', price: 5000 },
    'red2':  { name: 'Red T2', color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-900/40', price: 30000 },
    'red3':  { name: 'Red T3', color: 'text-red-300', border: 'border-red-400', bg: 'bg-red-900/50', price: 100000 },
    'purple': { name: 'LEGEND', color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-900/50', price: 0, isLegend: true }
};

const SELL_PRICES: any = {
    'blue1': { 7: 70, 8: 200, 9: 700, 10: 5000 },
    'blue2': { 7: 120, 8: 350, 9: 1200, 10: 5000 },
    'blue3': { 7: 180, 8: 500, 9: 1500, 10: 5000 },
    'blue4': { 7: 250, 8: 700, 9: 2000, 10: 5000 },
    'red1':  { 7: 7500, 8: 15000, 9: 45000, 10: 200000 },
    'red2':  { 7: 35000, 8: 70000, 9: 200000, 10: 200000 },
    'red3':  { 7: 150000, 8: 200000, 9: 200000, 10: 200000 },
    'purple': { 0: 1000000, 1: 1000000, 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000, 6: 1000000, 7: 1000000, 8: 1000000, 9: 1000000, 10: 1000000 }
};

const SCROLL_COST = { NORMAL: 0, BLESSED: 70 }; 

const EnchantSimulator = () => {
    // --- STATE ---
    const [diamonds, setDiamonds] = useState(30000);
    // ✅ เพิ่ม image?: string เข้าไปใน Type Definition
const [inventory, setInventory] = useState<{ id: number, tier: string, level: number, isBroken: boolean, image?: string }[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectedShopTier, setSelectedShopTier] = useState('blue1');
    const [scrollType, setScrollType] = useState<'NORMAL' | 'BLESSED'>('NORMAL');
    const [history, setHistory] = useState<string[]>([]);
    const [animating, setAnimating] = useState(false);
    
    // Auto Enchant State
    const [isAutoEnchanting, setIsAutoEnchanting] = useState(false);
    const [autoTarget, setAutoTarget] = useState(7); 

    // Stats
    const [stats, setStats] = useState({
        totalItemsBought: 0, 
        totalSpent: 0,
        successCounts: { 7: 0, 8: 0, 9: 0, 10: 0 } as any,
        highestTier: 'None'
    });

    const logsContainerRef = useRef<HTMLDivElement>(null);

    const selectedWeapons = inventory.filter(w => selectedIds.includes(w.id));
    const MAX_SELECT = 16;

    useEffect(() => {
        if (logsContainerRef.current) logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }, [history]);

    // ✅ AUTO ENCHANT SYSTEM
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isAutoEnchanting && !animating) {
            const eligibleItems = selectedWeapons.filter(w => !w.isBroken && w.level < autoTarget);
            if (eligibleItems.length > 0) {
                const cost = eligibleItems.length * SCROLL_COST[scrollType];
                if (diamonds >= cost) {
                    timer = setTimeout(() => { handleEnchantLogic(eligibleItems); }, 800);
                } else {
                    setIsAutoEnchanting(false);
                    addLog("⛔ Auto stopped: Not enough Diamonds!", "fail");
                }
            } else {
                setIsAutoEnchanting(false);
                addLog(`✅ Auto Finished: All items processed for +${autoTarget}`, "safe");
            }
        }
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoEnchanting, animating, inventory, diamonds]); 

    const playSound = (type: 'coin' | 'start' | 'success' | 'fail' | 'legend') => {
        const audioPath = { 'coin': '/sounds/coin.mp3', 'start': '/sounds/enchant-start.mp3', 'success': '/sounds/enchant-success.mp3', 'fail': '/sounds/enchant-fail.mp3', 'legend': '/sounds/enchant-success.mp3' };
        const audio = new Audio(audioPath[type]);
        audio.volume = 0.4;
        audio.play().catch(() => {});
    };

    // --- ACTIONS ---
    const addFunds = () => { setDiamonds(prev => prev + 30000); playSound('coin'); addLog("💎 Top-up successful! (+30,000)", "safe"); };

    const buyWeapon = (amount: number = 1) => {
        const tierConfig = WEAPON_TIERS[selectedShopTier];
        const totalCost = tierConfig.price * amount;
        if (diamonds < totalCost) { addLog(`❌ Not enough Diamonds!`, "fail"); return; }
        
        playSound('coin'); 
        setDiamonds(prev => prev - totalCost);
        
        setStats(prev => ({ 
            ...prev, 
            totalSpent: prev.totalSpent + totalCost,
            totalItemsBought: prev.totalItemsBought + amount 
        }));

        const newItems = Array.from({ length: amount }).map((_, i) => ({ id: Date.now() + i, tier: selectedShopTier, level: 0, isBroken: false }));
        setInventory(prev => [...prev, ...newItems]);
        if (selectedIds.length + amount <= MAX_SELECT) {
            setSelectedIds(prev => [...prev, ...newItems.map(i => i.id)]);
        }
        addLog(`🛒 Bought ${amount}x ${tierConfig.name}.`, "neutral");
    };

    const handleSellSelected = () => {
        if (selectedIds.length === 0) return;
        let totalVal = 0; let soldCount = 0;
        selectedWeapons.forEach(w => {
            if (!w.isBroken && SELL_PRICES[w.tier]?.[w.level]) {
                totalVal += SELL_PRICES[w.tier][w.level];
                soldCount++;
            }
        });
        if (soldCount === 0) { addLog("⚠️ Selected items not eligible for sale (Must be OE +7+ and Unique+)", "fail"); return; }
        playSound('coin');
        setInventory(prev => prev.filter(w => !selectedIds.includes(w.id) || w.isBroken || !SELL_PRICES[w.tier]?.[w.level]));
        setDiamonds(prev => prev + totalVal);
        setSelectedIds([]); 
        addLog(`🤑 SOLD ${soldCount} items. +${totalVal.toLocaleString()} 💎`, "godlike");
    };

    const handleTrash = () => {
        if (selectedIds.length === 0) return;
        setInventory(prev => prev.filter(w => !selectedIds.includes(w.id)));
        setSelectedIds([]);
        addLog("🗑️ Trashed selected items.", "neutral");
    };

    const handleExchangeLegend = (epicId: number) => {
        const epicWeapon = inventory.find(w => w.id === epicId);
        if (!epicWeapon || epicWeapon.level < 10 || !epicWeapon.tier.startsWith('red')) return;
        playSound('legend');
        setInventory(prev => prev.map(w => w.id === epicId ? { ...w, tier: 'purple', level: 0 } : w));
        setStats(prev => ({ ...prev, highestTier: 'LEGEND' }));
        addLog("🟣 CRAFTED LEGENDARY WEAPON!", "godlike");
    };

    // ✅ NEW: RESET STATS FUNCTION
    const handleResetStats = () => {
        if (!confirm("Are you sure you want to reset all statistics?")) return;
        setStats({
            totalItemsBought: 0,
            totalSpent: 0,
            successCounts: { 7: 0, 8: 0, 9: 0, 10: 0 },
            highestTier: 'None'
        });
        addLog("🧹 Statistics have been reset.", "neutral");
    };

// --- ENCHANT CORE LOGIC (UPDATED V9) ---
    const calculateEnchantResult = (weapon: any, type: 'NORMAL' | 'BLESSED') => {
        const chance = Math.random() * 100;
        let newLevel = weapon.level;
        let isBroken = false;
        let status: any = 'fail';

        if (type === 'NORMAL') {
            // --- NORMAL SCROLL ---
            if (weapon.level < 6) { 
                // +0 to +5 -> ติด 100%
                newLevel++; status = 'success'; 
            } else if (weapon.level >= 6 && weapon.level < 9) { 
                // +6 to +8 -> 33%
                if (chance <= 33.33) { newLevel++; status = 'success'; } 
                else { isBroken = true; status = 'fail'; } 
            } else if (weapon.level >= 9) { 
                // +9 up -> 5%
                if (chance <= 5) { newLevel++; status = 'godlike'; } 
                else { isBroken = true; status = 'fail'; } 
            }
        } else { 
            // --- BLESSED SCROLL ---
            if (weapon.level === 5) {
                // +5 Special Rule: สุ่มข้ามขั้น (ไม่แตก)
                if (chance <= 50) { newLevel = 6; status = 'success'; } 
                else { newLevel = 7; status = 'godlike'; } 
            } 
            else if (weapon.level === 9) {
                // +9 Special Rule: มีกันแตก (Safe)
                if (chance <= 5) { newLevel++; status = 'godlike'; } // 5% ติด
                else if (chance <= 50) { status = 'safe'; }          // 45% เท่าเดิม (กันแตก)
                else { isBroken = true; status = 'fail'; }           // 50% แตก
            } 
            else {
                // Levels อื่นๆ (+6, +7, +8, +10...) ไม่มีกันแตกแล้ว!
                let rate = 100;
                if (weapon.level < 6) rate = 100;       // ปลอดภัย
                else if (weapon.level < 9) rate = 33.33; // +6 ถึง +8 โอกาส 33%
                else rate = 5;                           // +10 ขึ้นไป โอกาส 5%

                if (chance <= rate) { 
                    newLevel++; status = 'success'; 
                } else { 
                    // ❌ แก้ไข: ถ้าพลาดคือแตกเลย (ไม่มี Reset เป็น 0 แล้ว)
                    // ยกเว้นช่วงปลอดภัย (+0 ถึง +4)
                    if (weapon.level >= 6) {
                        isBroken = true; 
                        status = 'fail'; 
                    }
                }
            }
        }
        return { newLevel, isBroken, status };
    };

    const handleEnchantManual = () => {
        const validTargets = selectedWeapons.filter(w => !w.isBroken);
        if (validTargets.length === 0) return;
        const cost = validTargets.length * SCROLL_COST[scrollType];
        if (diamonds < cost) { addLog(`❌ Not enough diamonds! Need ${cost}`, "fail"); return; }
        handleEnchantLogic(validTargets);
    };

    const handleEnchantLogic = (targets: typeof inventory) => {
        if (animating) return;
        const cost = targets.length * SCROLL_COST[scrollType];
        setDiamonds(prev => prev - cost);
        setStats(prev => ({ ...prev, totalSpent: prev.totalSpent + cost })); 
        setAnimating(true);
        playSound('start');

        setTimeout(() => {
            let successCount = 0;
            let successCountsUpdate = { ...stats.successCounts };
            const targetIds = targets.map(t => t.id);
            const nextInventory = inventory.map(item => {
                if (targetIds.includes(item.id)) {
                    const res = calculateEnchantResult(item, scrollType);
                    if (res.status === 'success' || res.status === 'godlike') {
                        successCount++;
                        if (res.newLevel >= 7) {
                            successCountsUpdate[res.newLevel] = (successCountsUpdate[res.newLevel] || 0) + 1;
                        }
                    }
                    return { ...item, level: res.newLevel, isBroken: res.isBroken };
                }
                return item;
            });
            setInventory(nextInventory);
            setStats(prev => ({ ...prev, successCounts: successCountsUpdate }));
            if (successCount > 0) playSound('success'); else playSound('fail');
            if (!isAutoEnchanting) {
                addLog(`🔨 Result: ${successCount} Success / ${targets.length - successCount} Fail`, successCount > 0 ? 'success' : 'fail');
            }
            setAnimating(false);
        }, isAutoEnchanting ? 600 : 1200);
    };

    const addLog = (text: string, type: 'success' | 'fail' | 'safe' | 'godlike' | 'neutral') => {
        let colorClass = 'text-slate-300';
        if (type === 'success') colorClass = 'text-green-400';
        if (type === 'fail') colorClass = 'text-red-400';
        if (type === 'safe') colorClass = 'text-yellow-400';
        if (type === 'godlike') colorClass = 'text-amber-300 font-bold';
        setHistory(prev => [...prev, `<span class="${colorClass}">${text}</span>`]);
    };

    const toggleSelection = (id: number) => {
        if (animating || isAutoEnchanting) return;
        if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(sid => sid !== id));
        else if (selectedIds.length < MAX_SELECT) setSelectedIds(prev => [...prev, id]);
    };

    const selectAll = () => {
        const valid = inventory.filter(w => !w.isBroken).slice(0, MAX_SELECT);
        setSelectedIds(valid.map(w => w.id));
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col gap-6 font-sans select-none pb-20 max-w-5xl mx-auto">
            
            {/* 1. DASHBOARD */}
            <div className="bg-[#0f0f13] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <div className="flex items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">💎</div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest">My Diamonds</div>
                            <div className="text-2xl font-black text-white flex items-center gap-2">
                                {diamonds.toLocaleString()}
                                <button onClick={addFunds} className="w-5 h-5 rounded-full bg-white/10 hover:bg-green-500 hover:text-white text-[10px] flex items-center justify-center transition-all">+</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full bg-[#1a1a20] rounded-2xl border border-white/5 p-4 flex justify-between items-center gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { label: 'Items Used', val: stats.totalItemsBought, col: 'text-white' },
                            { label: 'Spent', val: `-${(stats.totalSpent/1000).toFixed(1)}k`, col: 'text-red-400' },
                            { label: '+7 Count', val: stats.successCounts[7], col: 'text-blue-400' },
                            { label: '+8 Count', val: stats.successCounts[8], col: 'text-indigo-400' },
                            { label: '+9 Count', val: stats.successCounts[9], col: 'text-red-500' },
                            { label: '+10 GOD', val: stats.successCounts[10], col: 'text-yellow-400 font-bold' },
                        ].map((s, i) => (
                            <div key={i} className="flex flex-col items-center min-w-[70px] border-r border-white/5 last:border-0 px-2 text-center overflow-hidden">
                                <span className="text-[9px] text-slate-500 uppercase font-bold truncate w-full" title={s.label}>{s.label}</span>
                                <span className={`text-lg font-bold ${s.col}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* ✅ CHANGED BUTTON TO RESET */}
                    <button onClick={handleResetStats} className="p-3 bg-white/5 hover:bg-red-900/30 rounded-xl border border-white/10 hover:border-red-500/50 text-white transition-all flex items-center gap-2" title="Reset Stats">
                        🗑️ <span className="hidden md:inline text-xs font-bold uppercase">Reset</span>
                    </button>
                </div>
            </div>

            {/* 2. WORKSTATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[550px]">
{/* LEFT: Visualizer (Clean & Animated Version) */}
<div className="lg:col-span-2 relative rounded-[32px] overflow-hidden border border-white/10 bg-[#050508] shadow-2xl flex flex-col group h-[400px]">
    
    {/* 1. Dynamic Background (Clean Spotlight) */}
    {/* พื้นหลังจะเปลี่ยนสีตาม Tier ของอาวุธ หรือสถานะการตีบวก */}
    <div className={`absolute inset-0 transition-all duration-700 opacity-30 
        ${selectedIds.length === 1 && selectedWeapons[0].tier.startsWith('red') ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 via-black to-black' : 
          selectedIds.length === 1 && selectedWeapons[0].tier.startsWith('purple') ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900 via-black to-black' :
          'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black'}`} 
    ></div>

    {/* Grid Pattern บางๆ ให้ดู Tech */}
    <div className="absolute inset-0 tactical-grid opacity-20"></div>

    <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        {selectedIds.length === 0 ? (
            // EMPTY STATE
            <div className="text-center opacity-30 flex flex-col items-center animate-pulse">
                <div className="w-24 h-24 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-4xl">⚔️</span>
                </div>
                <span className="uppercase font-bold tracking-[0.2em] text-sm">Waiting for Equipment</span>
                <span className="text-xs mt-2 text-slate-500">Select an item to begin modification</span>
            </div>
        ) : selectedIds.length === 1 ? (
            (() => {
                const w = selectedWeapons[0];
                const cfg = WEAPON_TIERS[w.tier];
                
                // Logic เลือก Animation
                let animClass = "animate-float"; // ปกติลอยๆ
                if (animating) animClass = "animate-shake-hard"; // กำลังตี สั่นแรงๆ
                if (w.isBroken) animClass = "grayscale opacity-50 rotate-12"; // แตก!

                // Logic เลือกรูปภาพ (ใส่ URL รูปจริงตรงนี้ได้เลย)
                // ถ้าไม่มีรูป ให้ใช้รูป Placeholder จากเน็ตไปก่อน
                const weaponImageSrc = w.image || getPlaceholderImage(w.tier); 

                return (
                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                        
                        {/* Aura Effect (แสงด้านหลัง) */}
                        <div className={`absolute w-64 h-64 rounded-full blur-[60px] transition-all duration-500
                            ${animating ? 'bg-white/20 scale-125' : w.isBroken ? 'bg-red-900/10' : cfg.bg.replace('bg-', 'bg-')}/40`}
                        ></div>

                        {/* WEAPON IMAGE CONTAINER */}
                        <div className={`relative z-20 transition-all duration-300 ${animClass}`}>
                            {/* ถ้าแตก มีเอฟเฟกต์แตก */}
                            {w.isBroken && <div className="absolute inset-0 flex items-center justify-center z-30 text-6xl font-black text-red-600 drop-shadow-lg animate-in zoom-in">FAILED</div>}
                            
                            {/* รูปอาวุธ */}
                            <img 
                                src={weaponImageSrc} 
                                alt="Weapon" 
                                className={`w-48 h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] object-contain transition-all
                                    ${w.isBroken ? 'brightness-50 contrast-125' : 'brightness-110'}
                                `}
                            />
                            
                            {/* Level Badge (ลอยอยู่มุมขวาล่างของดาบ) */}
                            {!w.isBroken && (
                                <div className={`absolute -bottom-4 -right-4 px-4 py-1 rounded-xl border border-white/20 backdrop-blur-md shadow-xl z-30
                                    bg-gradient-to-r from-black/80 to-black/40 flex items-center gap-2
                                    ${animating ? 'scale-110 text-yellow-400 border-yellow-500' : 'text-white'}
                                `}>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Level</span>
                                    <span className={`text-2xl font-black font-tech ${cfg.color}`}>+{w.level}</span>
                                </div>
                            )}
                        </div>

                        {/* Particle/Dust Effects (Optional) */}
                         {!w.isBroken && !animating && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>}

                    </div>
                );
            })()
        ) : (
            // MULTIPLE SELECTION STATE (Grid View)
            <div className="grid grid-cols-4 gap-4 w-full max-w-lg p-4 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm">
                {selectedWeapons.map(w => {
                    const cfg = WEAPON_TIERS[w.tier];
                    return (
                        <div key={w.id} className={`aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-all hover:scale-105 bg-black/60 shadow-lg ${cfg.border} ${w.isBroken ? 'opacity-40 grayscale border-slate-700' : ''}`}>
                             <img src={getPlaceholderImage(w.tier)} className="w-10 h-10 object-contain mb-1" />
                             {!w.isBroken && <span className={`text-xs font-black ${cfg.color}`}>+{w.level}</span>}
                        </div>
                    )
                })}
            </div>
        )}
    </div>
</div>

                {/* RIGHT: Control Center */}
                <div className="flex flex-col gap-4">
                    {/* Scroll Selector */}
                    <div className="bg-[#15151a] p-4 rounded-3xl border border-white/10">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Select Scroll</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setScrollType('NORMAL')} className={`p-3 rounded-xl border flex flex-col items-center transition-all ${scrollType === 'NORMAL' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/40 border-white/10 text-slate-500'}`}><span className="font-bold text-xs">NORMAL</span><span className="text-[10px] opacity-70">Free</span></button>
                            <button onClick={() => setScrollType('BLESSED')} className={`p-3 rounded-xl border flex flex-col items-center transition-all ${scrollType === 'BLESSED' ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-black/40 border-white/10 text-slate-500'}`}><span className="font-bold text-xs">BLESSED</span><span className="text-[10px] opacity-70">70 💎</span></button>
                        </div>
                    </div>

                    {/* Action Deck */}
                    <div className="bg-[#15151a] p-4 rounded-3xl border border-white/10 flex-1 flex flex-col justify-center gap-4">
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auto Stop At Level</span>
                                <span className="text-[10px] text-purple-400 font-bold">Target: +{autoTarget}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                                {[6, 7, 8, 9, 10].map(lvl => (
                                    <button 
                                        key={lvl} 
                                        onClick={() => setAutoTarget(lvl)}
                                        disabled={isAutoEnchanting}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${autoTarget === lvl ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                    >+{lvl}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {isAutoEnchanting ? (<button onClick={() => setIsAutoEnchanting(false)} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg animate-pulse">⛔ STOP AUTO</button>) : (<><button onClick={handleEnchantManual} disabled={animating || selectedIds.length === 0} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 text-lg ${scrollType === 'BLESSED' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-black' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}>🔨 ENCHANT</button><button onClick={() => setIsAutoEnchanting(true)} disabled={animating || selectedIds.length === 0} className="w-full py-3 bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-purple-300 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all">⚡ START AUTO</button></>)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2"><button onClick={handleSellSelected} className="py-2 bg-green-900/30 hover:bg-green-800/50 text-green-400 border border-green-500/30 rounded-xl font-bold uppercase text-[10px]">Sell OE (+7^)</button><button onClick={handleTrash} className="py-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-500/30 rounded-xl font-bold uppercase text-[10px]">Trash Selected</button></div>
                    </div>

                    {/* Log Window */}
                    <div ref={logsContainerRef} className="bg-black/80 border border-white/10 rounded-2xl p-3 h-32 overflow-y-auto font-mono text-[10px] shadow-inner text-slate-300">
                        {history.length === 0 && <div className="text-center mt-10 opacity-30">System Logs...</div>}
                        {history.map((h, i) => <div key={i} dangerouslySetInnerHTML={{ __html: h }} className="border-b border-white/5 pb-0.5 mb-0.5 last:border-0 leading-tight" />)}
                    </div>
                </div>
            </div>

            {/* 3. INVENTORY & SHOP */}
            <div className="bg-[#0f0f13] border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4 mb-4 gap-4">
                    <div className="flex-1 overflow-x-auto pb-2 w-full"><div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Weapon Shop</div><div className="flex gap-2">{Object.entries(WEAPON_TIERS).map(([key, cfg]: any) => { if (cfg.isLegend) return null; return (<button key={key} onClick={() => setSelectedShopTier(key)} className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-bold uppercase transition-all whitespace-nowrap ${selectedShopTier === key ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-1 ring-offset-1 ring-offset-black` : 'border-white/10 text-slate-500 hover:bg-white/5'}`}>{cfg.name} <span className="opacity-60 text-[10px] ml-1">{cfg.price}💎</span></button>) })}</div></div>
                    <div className="flex gap-2 shrink-0"><button onClick={() => buyWeapon(1)} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white uppercase transition-all">Buy x1</button><button onClick={() => buyWeapon(10)} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white uppercase transition-all">Buy x10</button></div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory ({inventory.length})</h3><div className="flex gap-2"><button onClick={selectAll} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-slate-300 hover:text-white transition-all">Select All</button><button onClick={() => setSelectedIds([])} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-slate-300 hover:text-white transition-all">Clear</button></div></div>
                    <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">{inventory.map(w => { const cfg = WEAPON_TIERS[w.tier]; const isSel = selectedIds.includes(w.id); return (<button key={w.id} onClick={() => toggleSelection(w.id)} className={`relative aspect-square rounded-xl border flex items-center justify-center transition-all ${isSel ? 'ring-2 ring-purple-500 scale-95 z-10 bg-black' : 'hover:border-white/30 bg-black/40'} ${cfg.border} ${w.isBroken ? 'opacity-30 grayscale border-slate-800' : ''}`}><span className={`text-xl ${cfg.color}`}>{w.isBroken ? '💥' : '⚔️'}</span><span className={`absolute bottom-0 right-0 text-[9px] font-black px-1.5 py-0.5 bg-[#0f0f13] rounded-tl-lg border-t border-l border-white/10 ${cfg.color}`}>+{w.level}</span></button>) })}</div>
                </div>
            </div>
        </div>
    );
};
// --- 1. วางโค้ดส่วนนี้ไว้ "เหนือ" export default function MysticHub() ---

const MENU_ITEMS = [
  { id: 'LOUNGE',    label: 'Home',  icon: Castle,    mobileLabel: 'Home' },
  { id: 'BOSS_TIME', label: 'Boss', icon: Swords,    mobileLabel: 'Boss' },
  { id: 'INTEL',     label: 'Rank',icon: BarChart3, mobileLabel: 'Rank' },
  { id: 'TOI',       label: 'TOI',   icon: MapIcon,   mobileLabel: 'TOI' },
  { id: 'PROFILE',   label: 'Profile',    icon: User,      mobileLabel: 'Profile' },
  { id: 'ENCHANT',   label: 'Enchant',      icon: Hammer,    mobileLabel: 'Enchant' },
  { id: 'COMPARE',   label: 'Compare',     icon: Scale,     mobileLabel: 'Compare' },
  { id: 'ORACLE',    label: 'Invasion Oracle', icon: Eye,     mobileLabel: 'Oracle' },
  { id: 'WAR_ROOM', label: 'War Room', icon: MapIcon, mobileLabel: 'War' },
  //{ id: 'TERRITORY', label: 'Tactical Map', icon: Target,  mobileLabel: 'Map' },
];

const MysticNavigation = ({ activeTab, setActiveTab, user, ingameName, isGuest, onLogout }: any) => {
  return (
    <>
      {/* DESKTOP TOP BAR */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-[#020205]/80 backdrop-blur-xl border-b border-white/5 py-4 px-8 justify-between items-center transition-all">
        <div onClick={() => setActiveTab('LOUNGE')} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] font-tech text-2xl group-hover:scale-105 transition-transform">M</div>
          <div>
            <span className="font-bold italic uppercase text-white tracking-tighter text-xl block leading-none">Mystic<span className="text-purple-500">Hub</span></span>
            <span className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Guild Command</span>
          </div>
        </div>
        <div className="flex bg-white/[0.03] p-1.5 rounded-xl border border-white/5 gap-1">
          {MENU_ITEMS// ✅ แทรกตรงนี้: ถ้าเป็น ORACLE และไม่ใช่ Bluelabel ให้ดีดทิ้ง
  .filter(item => item.id !== 'ORACLE' || ingameName?.toUpperCase() === 'BLUELABEL') 
  .map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 relative overflow-hidden whitespace-nowrap font-tech flex items-center gap-2 ${activeTab === item.id ? 'text-white shadow-lg bg-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              {activeTab === item.id && <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-blue-600/80 -z-10"></div>}
              {/* ✅ แก้ตรงนี้: เรียกใช้ไอคอนแบบ Component */}
              <item.icon size={16} strokeWidth={2.5} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 group cursor-pointer" onClick={onLogout}>
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold text-white uppercase tracking-wider leading-none font-tech">{ingameName}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 group-hover:text-red-400 transition-colors tracking-widest">Logout</span>
          </div>
          <div className="relative">
            {isGuest ? <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-slate-800 flex items-center justify-center text-white font-bold">{ingameName?.charAt(0)}</div> : <img src={user?.user_metadata?.avatar_url} className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-red-500/50 transition-all" alt="av" />}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex justify-between items-center p-4 sticky top-0 z-40 bg-[#020205]/90 backdrop-blur-md border-b border-white/5">
         <div onClick={() => setActiveTab('LOUNGE')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center font-bold text-white text-lg font-tech">M</div>
            <span className="font-bold italic uppercase text-white tracking-tighter text-lg">Mystic</span>
         </div>
         <div onClick={onLogout} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{ingameName}</span>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
               {isGuest ? <div className="w-full h-full flex items-center justify-center text-xs">{ingameName?.charAt(0)}</div> : <img src={user?.user_metadata?.avatar_url} className="w-full h-full object-cover" />}
            </div>
         </div>
      </div>

      {/* MOBILE BOTTOM BAR (Classic Stable) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050508] border-t border-white/10 pb-safe pt-1 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center overflow-x-auto no-scrollbar px-2 pb-2">
          {MENU_ITEMS.map((item) => {
             const isActive = activeTab === item.id;
             return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                    flex-shrink-0 flex flex-col items-center justify-center 
                    w-[22%] min-w-[76px] py-3 rounded-xl transition-all duration-200
                    ${isActive ? 'bg-white/[0.08]' : 'active:bg-white/[0.02]'}
                `}
              >
                <div className={`mb-1 transition-all ${isActive ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-slate-500'}`}>
                  {/* ✅ แก้ตรงนี้: ไอคอนมือถือ */}
                  <item.icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-white' : 'text-slate-600'}`}>
                    {item.mobileLabel}
                </span>
                {isActive && (
                    <div className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-b-full shadow-[0_0_10px_#a855f7]"></div>
                )}
              </button>
             )
          })}
        </div>
      </nav>
      <div className="md:hidden h-24"></div> 
    </>
  );
};

// --- COMPONENT: TOI BOOKING SYSTEM (Manual Lock by Admin) ---
const ToiBookingSystem = ({ user, members, myStats, isAdmin }: any) => {
    const PER_ROUND_CAPACITY: any = {
        'normal_toi2': 4, 'normal_toi3': 4, 'normal_toi4': 2,
        'red_toi2': 1,    'red_toi3': 1,    'red_toi4': 1
    };

    // หมายเหตุ: LAUNCH_DATE ยังคงใช้สำหรับคำนวณ "รอบเวร (Cycle)" ว่าใครอยู่กะไหน
    // แต่ "การเปิด/ปิดให้กดจอง" จะใช้ปุ่ม Manual ของ Admin แทน

    const [queues, setQueues] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedFloorMap, setSelectedFloorMap] = useState(1);
    const [currentShift, setCurrentShift] = useState(0); 
    const [isPreLaunch, setIsPreLaunch] = useState(false);

    const currentUser = myStats?.ingame_name || user?.user_metadata?.full_name || 'Guest';
    const hasBooked = Object.values(queues).some((q: any) => q.includes(currentUser));

    // ✅ เช็คสถานะล็อคจาก Database (ใช้ zone_id พิเศษชื่อ 'SYSTEM_CONFIG')
    const isSystemLocked = queues['SYSTEM_CONFIG']?.includes('LOCKED') || false;

    useEffect(() => {
        const fetchBookings = async () => {
            const { data } = await supabase.from('toi_bookings').select('*');
            if (data) {
                const initialQueues: any = {};
                data.forEach((row: any) => { initialQueues[row.zone_id] = row.queue || []; });
                setQueues((prev: any) => (JSON.stringify(prev) === JSON.stringify(initialQueues) ? prev : initialQueues));
                setLoading(false);
            }
        };
        fetchBookings();

        const channel = supabase.channel('toi-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'toi_bookings' }, (payload) => {
                const newRecord = payload.new as any;
                if (newRecord && newRecord.zone_id) {
                    setQueues((prev: any) => ({ ...prev, [newRecord.zone_id]: newRecord.queue }));
                }
            })
            .subscribe((status) => { if (status === 'SUBSCRIBED') fetchBookings(); });
        
        const checkTime = () => {
            const now = new Date();
            const hour = now.getHours();
            setCurrentShift(hour < 12 ? 0 : 1);
            // ยังคงเช็ค PreLaunch เพื่อแสดงผล Cycle ให้ถูกต้อง
            setIsPreLaunch(now < LAUNCH_DATE); 
        };
        checkTime();
        const intervalId = setInterval(fetchBookings, 5000);
        const timerId = setInterval(checkTime, 10000); 

        return () => { supabase.removeChannel(channel); clearInterval(intervalId); clearInterval(timerId); };
    }, []);

    // ✅ ฟังก์ชันสำหรับ Admin กดล็อค/ปลดล็อค
    const toggleSystemLock = async () => {
        if (!isAdmin) return;
        const newStatus = isSystemLocked ? [] : ['LOCKED']; // สลับสถานะ
        
        // อัปเดต UI ทันที (Optimistic)
        setQueues((prev: any) => ({ ...prev, 'SYSTEM_CONFIG': newStatus }));

        // ส่งไป Database
        await supabase.from('toi_bookings').upsert({ 
            zone_id: 'SYSTEM_CONFIG', 
            queue: newStatus, 
            updated_at: new Date() 
        });
    };

    const getCP = (name: string) => {
        const mem = members.find((m: any) => m.ingame_name === name);
        return mem ? Number(mem.cp) : 0;
    };

    const getMyRank = () => {
        const sortedMembers = [...members].sort((a: any, b: any) => Number(b.cp) - Number(a.cp));
        const rank = sortedMembers.findIndex((m: any) => m.ingame_name === currentUser);
        return rank === -1 ? 999 : rank + 1;
    };

    const handleJoin = async (targetZone: string) => {
        // ✅ เช็ค Manual Lock: ถ้าล็อคอยู่ และไม่ใช่ Admin -> ห้ามจอง
        if (isSystemLocked && !isAdmin) {
            alert("⛔ SYSTEM PAUSED\n\nAdmin ได้ปิดรับการจองชั่วคราวครับ\nกรุณารอประกาศเปิดรอบใหม่");
            return;
        }

        if (hasBooked && !isAdmin) {
            alert("⚠️ You have already selected a spot.\nPlease contact Admin to change.");
            return;
        }
        if (targetZone.includes('toi4')) {
            const myRank = getMyRank();
            if (myRank > 3) {
                alert(`⛔ ACCESS DENIED\n\nTOI Floor 4 is reserved for Top 3 CP Players only.\nYour Current Rank: #${myRank}`);
                return;
            }
        }
        let currentQueue = [...(queues[targetZone] || [])];
        if (!currentQueue.includes(currentUser)) {
            currentQueue.push(currentUser);
            setQueues((prev: any) => ({ ...prev, [targetZone]: currentQueue }));
            await supabase.from('toi_bookings').upsert({ zone_id: targetZone, queue: currentQueue, updated_at: new Date() });
        }
    };

    const handleRemove = async (zoneKey: string, nameToRemove: string) => {
        if (!confirm(`Remove ${nameToRemove}?`)) return;
        let currentQueue = [...(queues[zoneKey] || [])];
        currentQueue = currentQueue.filter(n => n !== nameToRemove);
        setQueues((prev: any) => ({ ...prev, [zoneKey]: currentQueue }));
        await supabase.from('toi_bookings').upsert({ zone_id: zoneKey, queue: currentQueue, updated_at: new Date() });
    };

    const handleResetWeek = async () => {
        if (!confirm("⚠️ WARNING: CLEAR ALL BOOKINGS?")) return;
        // ล้างทุกห้อง ยกเว้นค่า Config
        const updates = Object.keys(queues)
            .filter(key => key !== 'SYSTEM_CONFIG') 
            .map(key => ({ zone_id: key, queue: [], updated_at: new Date() }));
            
        const { error } = await supabase.from('toi_bookings').upsert(updates);
        if (!error) alert("✅ Reset Complete!");
    };

    // Modal Map
    const MapModal = () => (
        <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f0f13] border border-white/10 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col relative shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-white font-bold uppercase tracking-widest font-tech flex items-center gap-2"><MapIcon className="text-purple-500" /> Tactical Maps</h3>
                    <button onClick={() => setShowMapModal(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"><X size={18} /></button>
                </div>
                <div className="flex gap-1 p-2 bg-black/40 border-b border-white/5 overflow-x-auto">{[1, 2, 3, 4].map(f => (<button key={f} onClick={() => setSelectedFloorMap(f)} className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedFloorMap === f ? 'bg-purple-600 text-white shadow-lg' : 'bg-[#15151a] text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>Floor {f}</button>))}</div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#050508] relative">
                    <img src={`/maps/toi_${selectedFloorMap}f.jpg`} alt={`TOI Floor ${selectedFloorMap}`} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5" />
                </div>
            </div>
        </div>
    );

    const ZoneCard = ({ title, zoneKey, colorClass, icon: Icon, floorMap }: any) => {
        const perRound = PER_ROUND_CAPACITY[zoneKey] || 1;
        const rawQueue = queues[zoneKey] || [];
        const sortedQueue = [...rawQueue].sort((a: string, b: string) => getCP(b) - getCP(a));
        const totalQueueLength = sortedQueue.length;

        const now = new Date();
        let dayDiff = 0;
        if (!isPreLaunch) {
            const diffTime = now.getTime() - LAUNCH_DATE.getTime();
            dayDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        
        const totalSlotsPerDay = perRound * 2;
        let startIndex = 0;
        if (totalQueueLength > 0) {
            startIndex = (dayDiff * totalSlotsPerDay) % totalQueueLength;
        }

        const morningShift = [];
        const nightShift = [];
        for (let i = 0; i < perRound; i++) {
            if (totalQueueLength > 0) {
                morningShift.push(sortedQueue[(startIndex + i) % totalQueueLength]);
                nightShift.push(sortedQueue[(startIndex + perRound + i) % totalQueueLength]);
            } else {
                morningShift.push(null);
                nightShift.push(null);
            }
        }

        const playingToday = [...morningShift, ...nightShift].filter(Boolean);
        const waitingRotation = sortedQueue.filter(p => !playingToday.includes(p));

        const isMyZone = rawQueue.includes(currentUser);
        const myRank = getMyRank();
        const isRestrictedZone = zoneKey.includes('toi4');
        const isLockedForMe = isRestrictedZone && myRank > 3;
        
        // ✅ Logic ปุ่มกด: ใช้สถานะ Manual Lock
        const isGlobalLocked = (hasBooked && !isMyZone) || (isSystemLocked && !isAdmin); 

        return (
            <div className={`bg-[#15151a] border rounded-2xl p-4 relative overflow-hidden transition-all ${isMyZone ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-white/5'}`}>
                <div className="flex justify-between items-start mb-4 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${colorClass} bg-opacity-20 relative`}>
                            <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
                            {isRestrictedZone && <div className="absolute -top-1 -right-1 bg-[#0f0f13] rounded-full p-0.5 border border-white/10"><Lock size={10} className="text-yellow-500" /></div>}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
                                {title}
                                {isRestrictedZone && <span className="text-[9px] font-black bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1 whitespace-nowrap translate-y-[-1px]"><Lock size={10} strokeWidth={3} /> TOP 3 ONLY</span>}
                            </h4>
                            <div className="text-[10px] text-slate-500 mt-1 flex gap-2 items-center">
                                <span>Cap: {perRound * 2}/day</span>
                                <span className="text-slate-600">•</span>
                                <button onClick={() => { setSelectedFloorMap(floorMap); setShowMapModal(true); }} className="flex items-center gap-1 hover:text-white transition-colors"><MapIcon size={10} /> View Map</button>
                            </div>
                        </div>
                    </div>
                    {/* ✅ ปุ่มกดแสดงสถานะตาม Manual Lock */}
                    <button 
                        onClick={() => handleJoin(zoneKey)} 
                        disabled={isMyZone || isLockedForMe || isGlobalLocked} 
                        className={`text-[10px] px-4 py-2 rounded-lg font-bold uppercase transition-all flex items-center gap-1 
                            ${isMyZone ? 'bg-green-500 text-black cursor-default' : 
                              isLockedForMe ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' : 
                              isSystemLocked && !isAdmin ? 'bg-red-900/20 border border-red-500/30 text-red-500 cursor-not-allowed' : 
                              isGlobalLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 
                              'bg-white/10 hover:bg-white/20 text-white shadow-lg'}`
                        }
                    >
                        {isMyZone ? 'Selected' : 
                         isLockedForMe ? <><Lock size={10}/> Locked</> : 
                         isSystemLocked && !isAdmin ? 'PAUSED' : 
                         isGlobalLocked ? 'Unavailable' : 'Select'}
                    </button>
                </div>

                <div className={`space-y-3 ${isLockedForMe ? 'opacity-50 grayscale' : ''}`}>
                    {/* ROUND 1 */}
                    <div className={`rounded-xl p-2 border transition-all duration-500 ${!isPreLaunch && currentShift === 0 ? 'bg-yellow-900/10 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'bg-black/20 border-white/5 opacity-60'}`}>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${!isPreLaunch && currentShift === 0 ? 'text-yellow-400 animate-pulse' : 'text-slate-500'}`}>
                                ☀️ 00:00 - 12:00 {isPreLaunch ? <span className="bg-slate-700 text-white px-1.5 rounded text-[8px]">STARTS TONIGHT</span> : currentShift === 0 && <span className="bg-yellow-500 text-black px-1.5 rounded text-[8px]">ACTIVE NOW</span>}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {morningShift.map((player: any, i: number) => (
                                <div key={i} className={`flex justify-between items-center px-2 py-1.5 rounded-lg text-xs font-bold border ${player ? (player === currentUser ? 'bg-purple-900/40 border-purple-500 text-white' : 'bg-[#0f0f13] border-white/5 text-slate-300') : 'bg-transparent border-dashed border-white/10 text-slate-700'}`}>
                                    <div className="flex items-center gap-2"><span className="text-[9px] w-3 text-center text-yellow-500">#{i + 1}</span><span>{player || '- Empty -'}</span></div>
                                    <div className="flex items-center gap-2">
                                        {player && <span className="text-[9px] font-mono text-slate-500">{getCP(player).toFixed(0)}%</span>}
                                        {isAdmin && player && <button onClick={(e) => {e.stopPropagation(); handleRemove(zoneKey, player)}} className="text-red-500 hover:text-red-400 px-1">✕</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ROUND 2 */}
                    <div className={`rounded-xl p-2 border transition-all duration-500 ${!isPreLaunch && currentShift === 1 ? 'bg-blue-900/10 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-black/20 border-white/5 opacity-60'}`}>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${!isPreLaunch && currentShift === 1 ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`}>
                                🌙 12:00 - 00:00 {isPreLaunch ? <span className="bg-slate-700 text-white px-1.5 rounded text-[8px]">STARTS TONIGHT</span> : currentShift === 1 && <span className="bg-blue-500 text-white px-1.5 rounded text-[8px]">ACTIVE NOW</span>}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {nightShift.map((player: any, i: number) => (
                                <div key={i} className={`flex justify-between items-center px-2 py-1.5 rounded-lg text-xs font-bold border ${player ? (player === currentUser ? 'bg-purple-900/40 border-purple-500 text-white' : 'bg-[#0f0f13] border-white/5 text-slate-300') : 'bg-transparent border-dashed border-white/10 text-slate-700'}`}>
                                    <div className="flex items-center gap-2"><span className="text-[9px] w-3 text-center text-blue-500">#{perRound + i + 1}</span><span>{player || '- Empty -'}</span></div>
                                    <div className="flex items-center gap-2">
                                        {player && <span className="text-[9px] font-mono text-slate-500">{getCP(player).toFixed(0)}%</span>}
                                        {isAdmin && player && <button onClick={(e) => {e.stopPropagation(); handleRemove(zoneKey, player)}} className="text-red-500 hover:text-red-400 px-1">✕</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2 px-2">
                        <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Next in Queue (Playing Later)</div>
                        <div className="flex flex-wrap gap-1 min-h-[24px] bg-black/20 rounded-lg p-1 border border-dashed border-white/10">
                            {waitingRotation.length > 0 ? waitingRotation.map((p: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400 flex items-center gap-1">
                                    {p}
                                    {isAdmin && <button onClick={(e) => {e.stopPropagation(); handleRemove(zoneKey, p)}} className="text-red-500 hover:text-red-400 font-bold ml-1 text-[8px]">✕</button>}
                                </span>
                            )) : <span className="text-[9px] text-slate-700 italic px-2 self-center">No queue</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse text-xs uppercase tracking-widest">Loading Satellite Data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in pb-12">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white italic uppercase tracking-tighter mb-2 flex items-center gap-2"><Target className="text-purple-500" /> Weekly Circular Queue</h2>
                    <div className="text-xs text-slate-400 space-y-1 pl-1">
                        {/* ✅ โชว์สถานะระบบว่า ล็อค หรือ เปิดอยู่ */}
                        {isSystemLocked ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                                <p className="text-red-400 font-bold">SYSTEM PAUSED - BOOKING LOCKED</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <p className="text-green-400 font-bold">SYSTEM ACTIVE - BOOKING OPEN</p>
                            </div>
                        )}
                        <p>• <span className="text-white font-bold">Loop:</span> คิวหมุนวนอัตโนมัติตามวัน</p>
                        <p>• <span className="text-yellow-400 font-bold">Status:</span> ควบคุมการเปิด/ปิดโดย Admin</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* ✅ ปุ่มควบคุมสำหรับ Admin */}
                    {isAdmin && (
                        <>
                            <button 
                                onClick={toggleSystemLock} 
                                className={`px-4 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all shadow-lg ${isSystemLocked ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                            >
                                {isSystemLocked ? '🔓 UNLOCK SYSTEM' : '🔒 LOCK SYSTEM'}
                            </button>
                            <button onClick={handleResetWeek} className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all">
                                ⚠️ RESET WEEK
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowMapModal(true)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all"><MapIcon size={14}/> All Maps</button>
                </div>
            </div>

            <div>
                <h3 className="text-green-400 font-bold font-tech text-lg uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-green-500/20 pb-2"><span>🟢</span> Normal Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ZoneCard title="TOI Floor 2" zoneKey="normal_toi2" colorClass="bg-green-500 text-green-400" icon={Users} floorMap={2} />
                    <ZoneCard title="TOI Floor 3" zoneKey="normal_toi3" colorClass="bg-green-500 text-green-400" icon={Users} floorMap={3} />
                    <ZoneCard title="TOI Floor 4 (Top 3 Only)" zoneKey="normal_toi4" colorClass="bg-green-500 text-green-400" icon={Users} floorMap={4} />
                </div>
            </div>

            <div>
                <h3 className="text-red-500 font-bold font-tech text-lg uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-red-500/20 pb-2"><span>🔴</span> Red Room Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ZoneCard title="TOI Floor 2 (Red)" zoneKey="red_toi2" colorClass="bg-red-500 text-red-400" icon={Swords} floorMap={2} />
                    <ZoneCard title="TOI Floor 3 (Red)" zoneKey="red_toi3" colorClass="bg-red-500 text-red-400" icon={Swords} floorMap={3} />
                    <ZoneCard title="TOI Floor 4 (Red | Top 3 Only)" zoneKey="red_toi4" colorClass="bg-red-500 text-red-400" icon={Swords} floorMap={4} />
                </div>
            </div>

            {showMapModal && <MapModal />}
        </div>
    );
};
// --- COMPONENT: TACTICAL WAR ROOM (Super Smooth Pan & Zoom) ---
const TacticalWarRoom = ({ members = [] }: any) => {
    // 🗺️ รายชื่อแผนที่
    const BATTLE_MAPS = [
        { id: 'f1', name: '🏰 Floor 1 (F1)', img: '/warmaps/f1.png' },
        { id: 'f2', name: '🏰 Floor 2 (F2)', img: '/warmaps/f2.png' },
        { id: 'secret', name: '🔥 SECRET ROOM', img: '/warmaps/secret.png' },
        { id: 'f3', name: '🏰 Floor 3 (F3)', img: '/warmaps/f3.png' },
    ];
    
    const UNITS = [
        { id: 'U1', name: 'ALPHA (Main)', color: 'bg-red-600', text: 'text-red-400', pts: [1, 2, 3] },
        { id: 'U2', name: 'BRAVO (Flank)', color: 'bg-blue-600', text: 'text-blue-400', pts: [4, 5, 6] },
        { id: 'U3', name: 'CHARLIE (Support)', color: 'bg-green-600', text: 'text-green-400', pts: [7, 8, 9] },
        { id: 'U4', name: 'DELTA (Special)', color: 'bg-yellow-500', text: 'text-yellow-400', pts: [10, 11, 12, 13] },
    ];

    const getUnitByPt = (ptNum: number) => UNITS.find(u => u.pts.includes(ptNum));

    // 🎬 --- SLIDES STATE ---
    const [slides, setSlides] = useState<any[]>([
        { id: 'slide-1', title: 'STEP 1', map: BATTLE_MAPS[0], customMapUrl: null, markers: [], lines: [] }
    ]);
    const [activeSlideIdx, setActiveSlideIdx] = useState(0);
    const [isSwitching, setIsSwitching] = useState(false);

    // 🎨 --- ACTIVE CANVAS & ZOOM/PAN STATE ---
    const [currentMap, setCurrentMap] = useState(BATTLE_MAPS[0]);
    const [customMapUrl, setCustomMapUrl] = useState<string | null>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [lines, setLines] = useState<{points: {x:number, y:number}[], color: string}[]>([]);
    const [zoom, setZoom] = useState(1);
    
    // ✅ ระบบลากแผนที่แบบลื่นไหล (ใช้ useRef เพื่อไม่ให้กระตุก)
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [isPanningUI, setIsPanningUI] = useState(false); // สำหรับเปลี่ยนรูปเมาส์
    const isPanning = useRef(false);
    const lastPanPos = useRef({ x: 0, y: 0 });
    const hasPanned = useRef(false);
    
    // UI Tools
    const [roster, setRoster] = useState<Record<string, number>>({});
    const [selectedTool, setSelectedTool] = useState<string | null>(null); 
    const [showRoster, setShowRoster] = useState(true);
    const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);
    const [currentLine, setCurrentLine] = useState<{x:number, y:number}[] | null>(null);
    const [drawColor, setDrawColor] = useState('#ef4444');

    useEffect(() => {
        if (members && members.length > 0) {
            setRoster(prev => {
                const nextRoster = { ...prev };
                Object.keys(nextRoster).forEach(k => { if (k.startsWith('Member ')) delete nextRoster[k]; });
                const sorted = [...members].sort((a: any, b: any) => Number(b.final_cp) - Number(a.final_cp));
                sorted.forEach((m: any) => { 
                    if (nextRoster[m.ingame_name] === undefined) nextRoster[m.ingame_name] = Number(m.default_pt) || 0; 
                });
                return nextRoster;
            });
        }
    }, [members]);

    useEffect(() => {
        if (isSwitching) return;
        setSlides(prev => {
            const newSlides = [...prev];
            newSlides[activeSlideIdx] = { ...newSlides[activeSlideIdx], map: currentMap, customMapUrl, markers, lines };
            return newSlides;
        });
    }, [markers, lines, currentMap, customMapUrl]);

    const goToSlide = (idx: number) => {
        setIsSwitching(true);
        setActiveSlideIdx(idx);
        const s = slides[idx];
        setCurrentMap(s.map); setCustomMapUrl(s.customMapUrl); setMarkers(s.markers); setLines(s.lines);
        setTimeout(() => setIsSwitching(false), 50);
    };

    const addSlide = () => {
        const newSlide = { id: `slide-${Date.now()}`, title: `STEP ${slides.length + 1}`, map: currentMap, customMapUrl, markers: [...markers], lines: [...lines] };
        setSlides([...slides, newSlide]);
        goToSlide(slides.length);
    };

    const deleteSlide = () => {
        if (slides.length <= 1) return;
        if(confirm('ลบแผนสเตปนี้หรือไม่?')) {
            const newSlides = slides.filter((_, i) => i !== activeSlideIdx);
            setSlides(newSlides);
            goToSlide(Math.max(0, activeSlideIdx - 1));
        }
    };

    const handleFileUpload = (e: any) => { if (e.target.files?.[0]) { setCustomMapUrl(URL.createObjectURL(e.target.files[0])); } };

    // 🖱️ --- MOUSE EVENTS ---
    const handleMapPointerDown = (e: any) => {
        const cX = e.touches ? e.touches[0].clientX : e.clientX;
        const cY = e.touches ? e.touches[0].clientY : e.clientY;
        hasPanned.current = false;

        if (selectedTool === '✏️') {
            const rect = e.currentTarget.getBoundingClientRect();
            setCurrentLine([{ x: ((cX - rect.left) / rect.width) * 100, y: ((cY - rect.top) / rect.height) * 100 }]);
        } else if (!selectedTool && !draggingMarkerId) {
            // ✅ เริ่มลากแผนที่
            isPanning.current = true;
            setIsPanningUI(true);
            lastPanPos.current = { x: cX, y: cY };
        }
    };

    const handleMapMouseMove = (e: any) => {
        let cX = e.touches ? e.touches[0].clientX : e.clientX;
        let cY = e.touches ? e.touches[0].clientY : e.clientY;

        // ✅ กระบวนการลากแผนที่ (เร็วและไม่กระตุก)
        if (isPanning.current && mapContainerRef.current) {
            hasPanned.current = true;
            const dx = cX - lastPanPos.current.x;
            const dy = cY - lastPanPos.current.y;
            mapContainerRef.current.scrollLeft -= dx;
            mapContainerRef.current.scrollTop -= dy;
            lastPanPos.current = { x: cX, y: cY };
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        let x = Math.max(0, Math.min(100, ((cX - rect.left) / rect.width) * 100));
        let y = Math.max(0, Math.min(100, ((cY - rect.top) / rect.height) * 100));

        if (selectedTool === '✏️' && currentLine) { setCurrentLine(prev => prev ? [...prev, { x, y }] : [{ x, y }]); return; }
        if (!draggingMarkerId) return;
        
        hasPanned.current = true;
        setMarkers(prev => prev.map(m => m.id === draggingMarkerId ? { ...m, x, y } : m));
    };

    const handleMapMouseUp = () => {
        isPanning.current = false;
        setIsPanningUI(false);
        if (selectedTool === '✏️' && currentLine) { setLines(prev => [...prev, { points: currentLine, color: drawColor }]); setCurrentLine(null); return; }
        setDraggingMarkerId(null);
    };

    const handleMapClick = (e: any) => {
        if (hasPanned.current) return; // กันการวางไอคอนซ้อนตอนปล่อยเมาส์จากการลาก
        if (!selectedTool || draggingMarkerId || selectedTool === '✏️') return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        if (selectedTool === '📝') {
            const text = prompt("📝 พิมพ์ข้อความอธิบาย:");
            if (text && text.trim() !== '') {
                setMarkers([...markers, { id: `text-${Date.now()}`, x, y, type: 'TEXT', text, color: drawColor }]);
            }
            setSelectedTool(null); 
            return;
        }

        if (selectedTool.startsWith('PT-')) {
            const ptNum = parseInt(selectedTool.replace('PT-', ''));
            setMarkers([...markers.filter(m => m.id !== selectedTool), { id: selectedTool, x, y, type: 'UNIT', ptNum }]);
            setSelectedTool(null); 
        } else {
            setMarkers([...markers, { id: `icon-${Date.now()}`, icon: selectedTool, x, y, type: 'ICON' }]);
        }
    };

    const undoLine = () => setLines(prev => prev.slice(0, -1));

    const getCursorClass = () => {
        if (selectedTool === '✏️' || selectedTool === '📝') return 'cursor-crosshair';
        if (selectedTool) return 'cursor-crosshair';
        if (isPanningUI) return 'cursor-grabbing';
        return 'cursor-grab';
    };

    return (
        <div className="min-h-screen animate-in fade-in pb-20 select-none">
            {/* Header + Dropdown */}
            <div className="bg-[#0f0f13] p-4 rounded-3xl border border-white/10 mb-4 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-50 shadow-2xl">
                <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2"><MapIcon className="text-purple-500" /> WAR ROOM</h2>
                    <select 
                        className="bg-[#15151a] border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer outline-none ring-0 focus:border-purple-500 transition-colors"
                        value={currentMap.id}
                        onChange={(e) => {
                            const selected = BATTLE_MAPS.find(map => map.id === e.target.value);
                            if (selected) { setCurrentMap(selected); setCustomMapUrl(null); }
                        }}
                    >
                        {BATTLE_MAPS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-lg"><input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />📷 Upload Custom</label>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowRoster(!showRoster)} className="px-4 py-2 rounded-lg text-xs font-bold uppercase border bg-purple-600 text-white border-purple-500">Toggle Roster</button>
                    <button onClick={() => {if(confirm('Clear Everything?')){setMarkers([]); setLines([]);}}} className="p-2 bg-red-900/30 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-900/50"><X size={18}/></button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 h-[85vh]">
                
                {/* 🗺️ --- MAP CANVAS WRAPPER --- */}
                <div className="flex-1 flex flex-col gap-2 relative">
                    <div className="flex-1 relative bg-[#050508] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        
                        {/* 🔍 Zoom Controls */}
                        <div className="absolute top-4 right-4 z-50 flex flex-col bg-[#0a0a0e]/90 border border-white/20 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
                            <button onClick={() => setZoom(z => Math.min(z + 0.5, 3))} className="p-2 hover:bg-white/10 text-white font-bold transition-colors">➕</button>
                            <div className="px-1 py-1 text-[10px] text-center font-tech text-purple-300 bg-black/50 border-y border-white/10">{Math.round(zoom * 100)}%</div>
                            <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-2 hover:bg-white/10 text-white font-bold transition-colors">➖</button>
                        </div>

                        {/* ✅ เอา scroll-smooth ออกแล้ว ลากเนียนกริ๊บ */}
                        <div ref={mapContainerRef} className="w-full h-full overflow-auto hide-scrollbar relative">
                            <div 
                                className={`relative touch-none ${getCursorClass()}`} 
                                style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, minWidth: '100%', minHeight: '100%' }}
                                onMouseDown={handleMapPointerDown} onTouchStart={handleMapPointerDown}
                                onMouseMove={handleMapMouseMove} onTouchMove={handleMapMouseMove} 
                                onMouseUp={handleMapMouseUp} onTouchEnd={handleMapMouseUp} onMouseLeave={handleMapMouseUp}
                                onClick={handleMapClick}
                            >
                                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: `url(${customMapUrl || currentMap.img})`, opacity: 0.8 }}></div>
                                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                                
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-15">
                                    {lines.map((line, idx) => <polyline key={idx} points={line.points.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={line.color} strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />)}
                                    {currentLine && <polyline points={currentLine.map((p:any) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={drawColor} strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />}
                                </svg>

                                {markers.map((m, idx) => (
                                    <div key={idx} className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing ${m.id === draggingMarkerId ? 'z-50 scale-110' : 'z-20'}`} style={{ left: `${m.x}%`, top: `${m.y}%` }} onMouseDown={(e) => { e.stopPropagation(); setDraggingMarkerId(m.id); }} onTouchStart={(e) => { e.stopPropagation(); setDraggingMarkerId(m.id); }} onClick={e => e.stopPropagation()}>
                                        {m.type === 'UNIT' ? (
                                            <div className={`w-10 h-10 ${getUnitByPt(m.ptNum)?.color || 'bg-slate-700'} border-2 border-white rounded-lg flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] relative group`}>
                                                {m.ptNum}
                                                <button className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 z-50 transition-opacity" onClick={(e) => { e.stopPropagation(); setMarkers(markers.filter(mk => mk.id !== m.id)); }}>✕</button>
                                            </div>
                                        ) : m.type === 'TEXT' ? (
                                            <div className="relative group whitespace-nowrap text-lg md:text-xl font-black tracking-widest px-2 py-1 rounded bg-black/40 backdrop-blur-sm border border-white/10" style={{ color: m.color || '#fff', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                                                {m.text}
                                                <button className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 z-50 transition-opacity" onClick={(e) => { e.stopPropagation(); setMarkers(markers.filter(mk => mk.id !== m.id)); }}>✕</button>
                                            </div>
                                        ) : (
                                            <div className="text-4xl drop-shadow-md relative group">
                                                {m.icon}
                                                <button className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 z-50 transition-opacity" onClick={(e) => { e.stopPropagation(); setMarkers(markers.filter((_, i) => i !== idx)); }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 🎬 SLIDE CONTROLLER */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0a0a0e]/95 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 pointer-events-auto">
                            <button onClick={() => goToSlide(Math.max(0, activeSlideIdx - 1))} disabled={activeSlideIdx === 0} className="hover:text-purple-400 disabled:opacity-30 font-bold text-xs uppercase tracking-widest text-white flex items-center gap-1 transition-colors">◀ Prev</button>
                            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-widest uppercase font-tech">STEP {activeSlideIdx + 1} / {slides.length}</span>
                            <button onClick={() => goToSlide(Math.min(slides.length - 1, activeSlideIdx + 1))} disabled={activeSlideIdx === slides.length - 1} className="hover:text-purple-400 disabled:opacity-30 font-bold text-xs uppercase tracking-widest text-white flex items-center gap-1 transition-colors">Next ▶</button>
                            <div className="w-[1px] h-5 bg-white/20"></div>
                            <button onClick={addSlide} className="text-green-400 hover:text-green-300 text-xs font-bold flex items-center gap-1 uppercase tracking-widest transition-colors"><Plus size={16}/> Add Step</button>
                            <button onClick={deleteSlide} className="text-red-500 hover:text-red-400 text-xs font-bold disabled:opacity-30 flex items-center gap-1 uppercase tracking-widest transition-colors" disabled={slides.length === 1}><Trash2 size={16}/> Del</button>
                        </div>
                    </div>

                    {/* 🧰 TOOLBAR */}
                    <div className="h-16 bg-[#0a0a0e] border border-white/10 rounded-2xl flex items-center px-4 gap-2 overflow-x-auto hide-scrollbar">
                        <button onClick={() => setSelectedTool(null)} className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl ${selectedTool === null ? 'bg-blue-500/20 text-white ring-2 ring-blue-500' : 'bg-white/5 text-slate-500'}`}>👆</button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1 shrink-0"></div>
                        <button onClick={() => setSelectedTool('✏️')} className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl ${selectedTool === '✏️' ? 'bg-purple-500/20 ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>✏️</button>
                        <button onClick={() => setSelectedTool('📝')} className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl ${selectedTool === '📝' ? 'bg-purple-500/20 ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>📝</button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1 shrink-0"></div>
                        {['⚔️', '🛡️', '🚩', '💀', '⚠️'].map(icon => <button key={icon} onClick={() => setSelectedTool(icon)} className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl ${selectedTool === icon ? 'bg-purple-500/20 ring-2 ring-purple-500' : 'bg-white/5'}`}>{icon}</button>)}
                        
                        {(selectedTool === '✏️' || selectedTool === '📝') && (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10 shrink-0 animate-in slide-in-from-left-4">
                                {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ffffff'].map(color => (
                                    <button key={color} onClick={() => setDrawColor(color)} className={`w-6 h-6 rounded-full transition-transform ${drawColor === color ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0e] ring-white scale-110 shadow-[0_0_10px_currentColor]' : 'opacity-50 hover:opacity-100'}`} style={{ backgroundColor: color, color: color }}></button>
                                ))}
                                {selectedTool === '✏️' && (
                                    <>
                                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                                        <button onClick={undoLine} className="text-[10px] font-bold text-slate-400 hover:text-white px-2 uppercase tracking-widest bg-white/5 py-2 rounded-lg">↩️ Undo Line</button>
                                        <button onClick={() => {if(confirm('ลบเส้นทั้งหมดในสไลด์นี้?')) setLines([]);}} className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2 uppercase tracking-widest bg-white/5 py-2 rounded-lg ml-1">🗑️ Clear Lines</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 📋 --- ROSTER --- */}
                {showRoster && (
                    <div className="w-full lg:w-[450px] bg-[#0a0a0e] border-l border-white/10 flex flex-col h-full overflow-hidden">
                        <div className="h-1/3 p-4 border-b border-white/10 flex flex-col bg-[#050508]">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Reserve Pool ({Object.values(roster).filter(pt => pt === 0).length})</h3>
                            <div className="flex-1 overflow-y-auto p-2 border border-white/5 rounded-xl bg-black/40 grid grid-cols-2 gap-2 content-start" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const n = e.dataTransfer.getData("text/member"); if(n) setRoster(prev => ({...prev, [n]: 0})); }}>
                                {Object.entries(roster).filter(([_, pt]) => pt === 0).map(([name]) => (
                                    <div key={name} draggable onDragStart={e => e.dataTransfer.setData("text/member", name)} className="bg-[#15151a] p-2 rounded-lg border border-white/10 text-[10px] text-slate-300 cursor-grab truncate">{name}</div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
                            {UNITS.map(unit => (
                                <div key={unit.id} className="space-y-2">
                                    <div className={`text-[10px] font-black uppercase ${unit.text}`}>{unit.name}</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {unit.pts.map(ptNum => {
                                            const membersInPt = Object.entries(roster).filter(([_, pt]) => pt === ptNum).map(([n]) => n);
                                            return (
                                                <div key={ptNum} className="flex gap-2">
                                                    <button onClick={() => setSelectedTool(`PT-${ptNum}`)} className={`w-14 h-auto rounded-l-xl flex flex-col items-center justify-center border-y border-l border-white/10 ${selectedTool === `PT-${ptNum}` ? `${unit.color} text-white` : 'bg-[#15151a] text-slate-500'}`}><span className="text-[9px]">PT</span><span className="text-xl font-black">{ptNum}</span></button>
                                                    <div className="flex-1 bg-[#0f0f13] border border-white/10 rounded-r-xl p-2 min-h-[64px]" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const n = e.dataTransfer.getData("text/member"); if(n && membersInPt.length < 4) setRoster(prev => ({...prev, [n]: ptNum})); }}>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {membersInPt.map(m => <div key={m} draggable onDragStart={e => e.dataTransfer.setData("text/member", m)} className="bg-white/5 px-2 py-1 rounded text-[9px] text-white truncate cursor-grab border border-white/5">{m}</div>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
// ... บรรทัดต่อจากนี้จะเป็น export default function MysticHub() ...
// --- MAIN COMPONENT ---
export default function MysticHub() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'LOUNGE' | 'PROFILE' | 'INTEL' | 'BOSS_TIME' | 'COMPARE' | 'TOI' | 'ORACLE' | 'ENCHANT' | 'WAR_ROOM'>('LOUNGE');  // ✅ เพิ่มชุดนี้เข้าไปต่อท้าย State เดิมครับ
  const [isGuest, setIsGuest] = useState(false);
  const [guestCode, setGuestCode] = useState('');
  const [guestNameInput, setGuestNameInput] = useState('');
  const [showGuestLogin, setShowGuestLogin] = useState(false);
  const GUILD_ACCESS_CODE = "MYSTIC777"; // 🔑 ตั้งรหัสผ่านกิลด์ตรงนี้
  // ✅ เพิ่มบรรทัดนี้ครับ: State สำหรับเปิด/ปิดแผนที่
  const [showMap, setShowMap] = useState(false);
  // ✅ FIX: Added bosses state to MysticHub to pass down to WelcomeLounge
  const [bosses, setBosses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [versusMember, setVersusMember] = useState<any>(null);
  const [inspectingMember, setInspectingMember] = useState<any>(null);
  const [ingameName, setIngameName] = useState('');
  const [needsMapping, setNeedsMapping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  
  // ✅ วางก้อนนี้เพิ่มเข้าไปครับ
// ✅✅ แก้ไข: แยก Logic เช็คสิทธิ์เป็น 2 ส่วน
  const isGlobalAdmin = useMemo(() => {
    if (!ingameName) return false; 
    return GLOBAL_ADMINS.some(admin => admin.toUpperCase() === ingameName.toUpperCase());
  }, [ingameName]);

  const isToiAdmin = useMemo(() => {
    if (!ingameName) return false; 
    // เช็คเฉพาะรายชื่อ TOI_ADMINS เท่านั้น
    return TOI_ADMINS.some(admin => admin.toUpperCase() === ingameName.toUpperCase());
  }, [ingameName]);

  // Ranking Mode State (เปลี่ยนค่าเริ่มต้นเป็น TOTAL)
  const [rankingMode, setRankingMode] = useState<'TOTAL' | 'CP' | 'ACTIVE'>('TOTAL');
// ✅ 1. เพิ่ม Logic กรองเมนู: ถ้าไม่ใช่ BLUELABEL จะไม่เห็นปุ่ม ORACLE
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      if (item.id === 'ORACLE') {
        return ingameName?.toUpperCase() === 'BLUELABEL';
      }
      // ✅ กฎที่ 2: WAR ROOM -> เฉพาะ HIGHBALL เท่านั้น
      if (item.id === 'WAR_ROOM') {
        return ingameName?.toUpperCase() === 'SLANE, BLUELABEL, HIGHBALL';
      }
      return true; // เมนูอื่นแสดงปกติ
    });
  }, [ingameName]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = ev;
      containerRef.current.style.setProperty('--x', `${clientX}px`);
      containerRef.current.style.setProperty('--y', `${clientY}px`);
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.reload(); };
  const handleRegister = async () => {
    if (!ingameName.trim() || !user) return alert("กรุณากรอกชื่อตัวละคร");
    setLoading(true);
    const name = ingameName.trim().toUpperCase();
    const url = `${MYSTIC_API_URL}?action=register&discordId=${user.id}&ingameName=${encodeURIComponent(name)}&discordName=${encodeURIComponent(user.user_metadata.full_name)}&avatar=${encodeURIComponent(user.user_metadata.avatar_url)}`;
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      localStorage.setItem('mystic_user', name);
      setIngameName(name);
      setNeedsMapping(false);
      alert("ลงทะเบียนสำเร็จ!");
      window.location.reload();
    } catch (e) { alert("เกิดข้อผิดพลาดในการเชื่อมต่อ"); } 
    finally { setLoading(false); }
  };
// ✅ เพิ่มชุดนี้เข้าไปครับ
  const handleGuestLogin = () => {
    if (guestCode !== GUILD_ACCESS_CODE) return alert("❌ รหัสกิลด์ไม่ถูกต้อง!");
    if (!guestNameInput.trim()) return alert("❌ กรุณากรอกชื่อตัวละคร");
    setIngameName(guestNameInput.trim().toUpperCase());
    setIsGuest(true);
    setNeedsMapping(false);
    setLoading(false);
    localStorage.setItem('mystic_guest_user', guestNameInput.trim().toUpperCase());
  };

  const handleGuestLogout = () => {
    localStorage.removeItem('mystic_guest_user');
    setIsGuest(false);
    setIngameName('');
    window.location.reload();
  };

  // ✅ เพิ่ม useEffect นี้เพื่อเช็คคนเคยล็อกอิน
  useEffect(() => {
    const guestUser = localStorage.getItem('mystic_guest_user');
    if (guestUser && !user) {
        setIngameName(guestUser);
        setIsGuest(true);
        setNeedsMapping(false);
        setLoading(false);
    }
  }, [user]);
  const handleViewMember = (targetMember: any) => { setInspectingMember(targetMember); };
  const handleCloseInspection = () => { setInspectingMember(null); };

  const handlePrevMember = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inspectingMember || members.length === 0) return;
    const sortedMembers = [...members].sort((a, b) => Number(b.cp) - Number(a.cp));
    const currentIndex = sortedMembers.findIndex(m => m.ingame_name === inspectingMember.ingame_name);
    const prevIndex = (currentIndex - 1 + sortedMembers.length) % sortedMembers.length;
    setInspectingMember(sortedMembers[prevIndex]);
  };

  const handleNextMember = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inspectingMember || members.length === 0) return;
    const sortedMembers = [...members].sort((a, b) => Number(b.cp) - Number(a.cp));
    const currentIndex = sortedMembers.findIndex(m => m.ingame_name === inspectingMember.ingame_name);
    const nextIndex = (currentIndex + 1) % sortedMembers.length;
    setInspectingMember(sortedMembers[nextIndex]);
  };

  const handleJumpToCompare = (target: any) => { setVersusMember(target); setActiveTab('COMPARE'); setInspectingMember(null); };

  // ✅ Add: Fetch Bosses for Lounge (Simple Polling)
  useEffect(() => {
    const fetchBosses = async () => {
        try {
            const res = await fetch(BOSS_API_URL);
            const data = await res.json();
            if (Array.isArray(data)) setBosses(data);
        } catch (e) { console.error("Boss fetch error", e); } 
    };
    fetchBosses();
    const interval = setInterval(fetchBosses, 30000); // Fetch every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (activeTab === 'TOI') setIframeLoading(true); }, [activeTab]);

 useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }
        setUser(session.user);
        
        const mappingRes = await fetch(`${MYSTIC_API_URL}?action=checkMapping&discordId=${session.user.id}`);
        const mappingData = await mappingRes.json();
        
        if (mappingData.found) { 
            setIngameName(mappingData.ingame_name); 
            setNeedsMapping(false); 
        } else {
          const cachedName = localStorage.getItem('mystic_user');
          if (cachedName) { 
              setIngameName(cachedName); 
              setNeedsMapping(false); 
          } else { 
              setNeedsMapping(true); 
          }
        }
        
        // 📥 ดึงข้อมูลและแปลงชื่อคอลัมน์จาก Sheet (Stats 20 Feb)
        const res = await fetch(`${MYSTIC_API_URL}?action=getStats`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
            const enrichedMembers = data.map(m => {
                // ดึงค่าคะแนนตามชื่อคอลัมน์เป๊ะๆ
                const totalScore = Math.round(Number(m['Final ∑ CP+ACTIVE'] || m.final_cp || 0));
                const cpScore = Math.round(Number(m.base_cp || 0));
                const activeScore = Math.round(Number(m['CP ACTIVE'] || m.cp_active || 0));
                
                // ดึงค่าอาชีพ
                const mainClass = m['Main Class (NEW)'] || m.char_class || '-';
                const subClass = m['Sub Class (NEW)'] || m.sub_class || '';

                return {
                    ...m,
                    final_cp: totalScore,
                    base_cp: cpScore,
                    cp_active: activeScore,
                    char_class: mainClass,
                    sub_class: subClass
                };
            });
            setMembers(enrichedMembers);
        }
      } catch (err) { 
          console.error("Init error:", err); 
      } finally { 
          setLoading(false); 
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (ingameName && members.length > 0) {
      const match = members.find((m: any) => m.ingame_name.toUpperCase() === ingameName.toUpperCase());
      if (match) setMyStats(match);
      const enemy = members.find(m => m.ingame_name !== ingameName); 
      if (enemy && !versusMember) setVersusMember(enemy);
    }
  }, [ingameName, members]);

  const classData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
        const cls = m.char_class && m.char_class.trim() !== '' ? m.char_class : 'Novice';
        counts[cls] = (counts[cls] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).sort((a, b) => b.value - a.value); 
  }, [members]);

  const renderCharacterProfile = (data: any, isInspectionMode: boolean = false) => {
    if (!data) return null;
    const s = data.stats || {};
    const getGlobalMax = (key: string) => Math.max(...members.map(m => Number(m.stats?.[key] || 0)).filter(v => !isNaN(v)), 1);

// 🧮 ฟังก์ชันคำนวณหา % ของสเตตัสเทียบกับอันดับ 1 ในกิลด์
    const getStatPct = (key: string, val: any) => {
        const max = getGlobalMax(key);
        return max > 0 ? (Number(val || 0) / max) * 100 : 0;
    };

    // 🧮 ฟังก์ชันหาค่าเฉลี่ยของกลุ่ม (Image 1 - 6)
    const getAvgScore = (keys: string[], statsObj: any) => {
        if (!keys.length) return 0;
        const totalPct = keys.reduce((sum, key) => sum + getStatPct(key, statsObj[key]), 0);
        return totalPct / keys.length;
    };

    // 🕸️ อัปเดต Radar Chart ดึงจากค่าเฉลี่ย 6 กลุ่ม (Image 1-6)
    const radarData = [
      { 
        subject: 'OFFENSE', // Image 1
        A: getAvgScore(['damage', 'accuracy', 'crit_hit', 'weapon_dmg', 'extra_dmg', 'extra_crit_dmg', 'double_chance', 'triple_chance', 'w_block'], s), 
        fullMark: 100 
      },
      { 
        subject: 'DEFENSE', // Image 2
        A: getAvgScore(['m_dr', 'r_dr', 'mg_dr', 'defense', 'm_evasion', 'r_evasion', 'mg_evasion', 'skill_res', 'max_hp'], s), 
        fullMark: 100 
      },
      { 
        subject: 'BOOSTS', // Image 3
        A: getAvgScore(['weapon_dmg_boost', 'w_def', 'skill_dmg_boost', 's_def', 'crit_red', 'm_crit_res', 'r_crit_res', 'mg_crit_res', 'double_res'], s), 
        fullMark: 100 
      },
      { 
        subject: 'UTILITY', // Image 4
        A: getAvgScore(['triple_res', 'block_pen', 'ignore_dr', 'stun_acc', 'stun_res', 'hold_acc', 'hold_res', 'silence_res', 'cc_acc'], s), 
        fullMark: 100 
      },
      { 
        subject: 'PVP ATK', // Image 5
        A: getAvgScore(['cc_res', 'heal_boost', 'pvp_extra_dmg', 'pvp_accuracy', 'pvp_crit_hit', 'pvp_m_evasion', 'pvp_r_evasion', 'pvp_mg_evasion', 'pvp_m_dr'], s), 
        fullMark: 100 
      },
      { 
        subject: 'PVP DEF', // Image 6
        A: getAvgScore(['pvp_r_dr', 'pvp_mg_dr', 'pvp_s_def', 'pvp_w_def', 'pvp_double_res', 'pvp_crit_res'], s), 
        fullMark: 100 
      },
    ];

    const myClass = data.char_class;
    const sameClassMembers = members.filter(m => m.char_class === myClass).sort((a, b) => Number(b.final_cp) - Number(a.final_cp));
    const rank = sameClassMembers.findIndex(m => m.ingame_name === data.ingame_name) + 1;
    const allSorted = [...members].sort((a, b) => Number(b.final_cp) - Number(a.final_cp));
    const globalRank = allSorted.findIndex(m => m.ingame_name === data.ingame_name) + 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-2">
            {/* Header Profile */}
            <div className="bg-[#0f0f13]/60 backdrop-blur-xl rounded-[40px] border border-white/[0.08] p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700"></div>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 px-8 md:px-12">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 lg:w-1/3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[32px] blur opacity-40"></div>
                            {!isInspectionMode && user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} className="relative w-32 h-32 md:w-40 md:h-40 rounded-[32px] object-cover border-4 border-[#0a0a0e] shadow-2xl z-10" alt="p" />
                            ) : (
                                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[32px] border-4 border-[#0a0a0e] shadow-2xl z-10 bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
                                    <span className="text-6xl font-bold text-white/20 font-tech">{data.ingame_name.charAt(0)}</span>
                                </div>
                            )}
                            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border border-white/10 shadow-xl z-20 flex items-center gap-2 ${!isInspectionMode ? 'bg-[#0a0a0e]' : 'bg-blue-900/80'}`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${!isInspectionMode ? 'bg-green-500' : 'bg-blue-400'}`}></div>
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider font-tech">{!isInspectionMode ? 'Online' : 'Viewing'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-6xl font-bold text-white italic uppercase leading-none tracking-tighter drop-shadow-lg">{data.ingame_name}</h2>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-bold text-purple-400 uppercase tracking-widest font-tech">{data.char_class} {data.sub_class && `/ ${data.sub_class}`}</span>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-slate-800/50 rounded-lg border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest font-tech">Guild Rank #{globalRank}</span>
                                    <span className="px-3 py-1 bg-blue-900/40 rounded-lg border border-white/10 text-[10px] font-bold text-blue-300 uppercase tracking-widest font-tech">Class Rank #{rank}</span>
                                </div>
                            </div>
                            {isInspectionMode && (
                              <button onClick={() => handleJumpToCompare(data)} className="mt-3 px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold text-white text-sm tracking-widest hover:scale-105 transition-transform shadow-lg shadow-red-600/30 flex items-center gap-2 mx-auto lg:mx-0 font-tech"><span>⚔️</span> COMPARE</button>
                            )}
                        </div>
                    </div>
                    <div className="w-full lg:w-1/3 h-[280px] md:h-[340px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <PolarGrid stroke="#ffffff15" strokeWidth={1} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <RechartsRadar name="Stats" dataKey="A" stroke="#a855f7" strokeWidth={3} fill="#a855f7" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="lg:w-1/3 flex flex-col items-center lg:items-end justify-center">
                        <div className="text-right">
                            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-1 block font-tech">Final ∑ CP+ACTIVE</span>
                            <div className="text-5xl md:text-7xl font-bold italic text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600 leading-none filter drop-shadow-2xl font-tech">
                                <CountUp value={Number(data.final_cp)} formatter={(v) => Math.round(v).toLocaleString()} />
                            </div>
                            <div className="flex flex-col items-end gap-1 mt-3">
                                <div className="text-purple-400 font-bold text-[10px] tracking-widest bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-500/30">
                                    BASE CP: <span className="text-white">{Number(data.base_cp || 0).toLocaleString()}</span>
                                </div>
                                <div className="text-orange-400 font-bold text-[10px] tracking-widest bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-500/30">
                                    ACTIVE SCORE: <span className="text-white">{Number(data.cp_active || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ GRID 6 กลุ่มตามที่ตกลงกันไว้ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 relative z-10 pb-10">
                
                {/* 🖼️ IMAGE 1: Base Offense */}
                <StatGroup members={members} title="Offense & Proc" colorClass="text-red-500" items={[
                  { label: 'Damage', val: s.damage, key: 'damage' }, 
                  { label: 'Accuracy', val: s.accuracy, key: 'accuracy' },
                  { label: 'Crit Hit', val: s.crit_hit, key: 'crit_hit' }, 
                  { label: 'Weapon Dmg', val: s.weapon_dmg, key: 'weapon_dmg' }, 
                  { label: 'Extra Dmg', val: s.extra_dmg, key: 'extra_dmg' },
                  { label: 'Extra Dmg (Crit)', val: s.extra_crit_dmg, key: 'extra_crit_dmg' }, 
                  { label: 'Double Chance', val: s.double_chance, key: 'double_chance' }, 
                  { label: 'Triple Chance', val: s.triple_chance, key: 'triple_chance' },
                  { label: 'Weapon Block', val: s.w_block, key: 'w_block' },
                ]} />

                {/* 🖼️ IMAGE 2: Base Defense & Evasion */}
                <StatGroup members={members} title="Defense & Evasion" colorClass="text-blue-500" items={[
                  { label: 'Melee DR', val: s.m_dr, key: 'm_dr' }, 
                  { label: 'Ranged DR', val: s.r_dr, key: 'r_dr' },
                  { label: 'Magic DR', val: s.mg_dr, key: 'mg_dr' }, 
                  { label: 'Defense', val: s.defense, key: 'defense' }, 
                  { label: 'Melee Evasion', val: s.m_evasion, key: 'm_evasion' },
                  { label: 'Ranged Evasion', val: s.r_evasion, key: 'r_evasion' }, 
                  { label: 'Magic Evasion', val: s.mg_evasion, key: 'mg_evasion' }, 
                  { label: 'Skill Res', val: s.skill_res, key: 'skill_res' },
                  { label: 'Max HP', val: s.max_hp, key: 'max_hp' },
                ]} />

                {/* 🖼️ IMAGE 3: Boosts & Critical Resistance */}
                <StatGroup members={members} title="Boosts & Crit Res" colorClass="text-amber-500" items={[
                  { label: 'W-Dmg Boost', val: s.weapon_dmg_boost, key: 'weapon_dmg_boost' }, 
                  { label: 'W-Defense', val: s.w_def, key: 'w_def' },
                  { label: 'Skill Dmg Boost', val: s.skill_dmg_boost, key: 'skill_dmg_boost' }, 
                  { label: 'Skill Defense', val: s.s_def, key: 's_def' }, 
                  { label: 'Crit Reduction', val: s.crit_red, key: 'crit_red' },
                  { label: 'Melee Crit Res', val: s.m_crit_res, key: 'm_crit_res' }, 
                  { label: 'Ranged Crit Res', val: s.r_crit_res, key: 'r_crit_res' }, 
                  { label: 'Magic Crit Res', val: s.mg_crit_res, key: 'mg_crit_res' },
                  { label: 'Double Res', val: s.double_res, key: 'double_res' },
                ]} />

                {/* 🖼️ IMAGE 4: CC & Penetration */}
                <StatGroup members={members} title="CC & Penetration" colorClass="text-emerald-500" items={[
                  { label: 'Triple Res', val: s.triple_res, key: 'triple_res' }, 
                  { label: 'Block Pen', val: s.block_pen, key: 'block_pen' },
                  { label: 'Ignore DR', val: s.ignore_dr, key: 'ignore_dr' }, 
                  { label: 'Stun Acc', val: s.stun_acc, key: 'stun_acc' }, 
                  { label: 'Stun Res', val: s.stun_res, key: 'stun_res' },
                  { label: 'Hold Acc', val: s.hold_acc, key: 'hold_acc' }, 
                  { label: 'Hold Res', val: s.hold_res, key: 'hold_res' }, 
                  { label: 'Silence Res', val: s.silence_res, key: 'silence_res' },
                  { label: 'CC Acc', val: s.cc_acc, key: 'cc_acc' },
                ]} />

                {/* 🖼️ IMAGE 5: PVP Offense & CC Res */}
                <StatGroup members={members} title="PVP Offense & Utility" colorClass="text-purple-500" items={[
                  { label: 'CC Res', val: s.cc_res, key: 'cc_res' }, 
                  { label: 'Heal Boost', val: s.heal_boost, key: 'heal_boost' },
                  { label: 'PVP Extra Dmg', val: s.pvp_extra_dmg, key: 'pvp_extra_dmg' }, 
                  { label: 'PVP Accuracy', val: s.pvp_accuracy, key: 'pvp_accuracy' }, 
                  { label: 'PVP Crit Hit', val: s.pvp_crit_hit, key: 'pvp_crit_hit' },
                  { label: 'PVP Melee Eva', val: s.pvp_m_evasion, key: 'pvp_m_evasion' }, 
                  { label: 'PVP Ranged Eva', val: s.pvp_r_evasion, key: 'pvp_r_evasion' }, 
                  { label: 'PVP Magic Eva', val: s.pvp_mg_evasion, key: 'pvp_mg_evasion' },
                  { label: 'PVP Melee DR', val: s.pvp_m_dr, key: 'pvp_m_dr' },
                ]} />

                {/* 🖼️ IMAGE 6 & SPECIAL: PVP Defense & Special */}
                <StatGroup members={members} title="PVP Defense & SS" colorClass="text-indigo-500" items={[
                  { label: 'PVP Ranged DR', val: s.pvp_r_dr, key: 'pvp_r_dr' }, 
                  { label: 'PVP Magic DR', val: s.pvp_mg_dr, key: 'pvp_mg_dr' },
                  { label: 'PVP Skill Def', val: s.pvp_s_def, key: 'pvp_s_def' }, 
                  { label: 'PVP Weapon Def', val: s.pvp_w_def, key: 'pvp_w_def' }, 
                  { label: 'PVP Double Res', val: s.pvp_double_res, key: 'pvp_double_res' },
                  { label: 'PVP Crit Res', val: s.pvp_crit_res, key: 'pvp_crit_res' }, 
                  { label: 'SS Weapon Dmg', val: s.ss_weapon_dmg, key: 'ss_weapon_dmg' }, 
                  { label: 'SS Accuracy', val: s.ss_accuracy, key: 'ss_accuracy' },
                  { label: 'Salvation', val: s.salvation, key: 'salvation' }, // ✅ จะโชว์เป็น มี/ไม่มี แน่นอน
                ]} />
            </div>
        </div>
    );
  };

  const renderCompareMode = () => {
    if (!myStats || !versusMember) return null;
    const getGlobalMax = (key: string) => Math.max(...members.map(m => Number(m.stats?.[key] || 0)).filter(v => !isNaN(v)), 1);
    const normalizeSkill = (val: any) => { const n = Number(val || 0); return (n > 0 && n <= 5) ? n * 100 : n; };
    const getSkl = (v: any) => normalizeSkill(v);
    const maxSkl = Math.max(...members.map(m => getSkl(m.stats?.skill_dmg_boost)), 1);

    const radarData = [
       { subject: 'ATK', A: (Number(myStats.stats.atk)/getGlobalMax('atk'))*100, B: (Number(versusMember.stats.atk)/getGlobalMax('atk'))*100 },
       { subject: 'ACC', A: (Number(myStats.stats.acc)/getGlobalMax('acc'))*100, B: (Number(versusMember.stats.acc)/getGlobalMax('acc'))*100 },
       { subject: 'DEF', A: (Number(myStats.stats.def)/getGlobalMax('def'))*100, B: (Number(versusMember.stats.def)/getGlobalMax('def'))*100 },
       { subject: 'DR', A: (Number(myStats.stats.dr_base)/getGlobalMax('dr_base'))*100, B: (Number(versusMember.stats.dr_base)/getGlobalMax('dr_base'))*100 },
       { subject: 'EVA', A: (Number(myStats.stats.evasion_melee)/getGlobalMax('evasion_melee'))*100, B: (Number(versusMember.stats.evasion_melee)/getGlobalMax('evasion_melee'))*100 },
       { subject: 'SKL', A: (getSkl(myStats.stats.skill_dmg_boost)/maxSkl)*100, B: (getSkl(versusMember.stats.skill_dmg_boost)/maxSkl)*100 },
    ];

    const allStatsConfig = [
        { title: 'Offense', items: [{ key: 'atk', label: 'ATK' }, { key: 'pvp_atk', label: 'PVP ATK' }, { key: 'acc', label: 'ACC' }, { key: 'pvp_acc', label: 'PVP ACC' }, { key: 'skill_dmg_boost', label: 'Skill Boost', isPct: true }, { key: 'cc_acc', label: 'CC ACC', isPct: true }, { key: 'stun_acc', label: 'Stun ACC', isPct: true }]},
        { title: 'Defense', items: [{ key: 'def', label: 'DEF' }, { key: 'hp', label: 'HP' }, { key: 'sr', label: 'Skill Res' }, { key: 'cc_resistance', label: 'CC Res', isPct: true }, { key: 'stun_resistance', label: 'Stun Res', isPct: true }, { key: 'hold_resistance', label: 'Hold Res', isPct: true }]},
        { title: 'Damage Reduction', items: [{ key: 'dr_base', label: 'Base DR' }, { key: 'def_melee_red', label: 'Mel DR' }, { key: 'def_ranged_red', label: 'Ran DR' }, { key: 'def_magic_red', label: 'Mag DR' }, { key: 'pvp_def_melee_red', label: 'PVP Mel DR' }, { key: 'pvp_def_ranged_red', label: 'PVP Ran DR' }, { key: 'pvp_def_magic_red', label: 'PVP Mag DR' }]},
        { title: 'Evasion', items: [{ key: 'evasion_melee', label: 'Mel Eva' }, { key: 'evasion_ranged', label: 'Ran Eva' }, { key: 'evasion_magic', label: 'Mag Eva' }, { key: 'pvp_evasion_melee', label: 'PVP Mel Eva' }, { key: 'pvp_evasion_ranged', label: 'PVP Ran Eva' }, { key: 'pvp_evasion_magic', label: 'PVP Mag Eva' }]},
        { title: 'Critical & Misc', items: [{ key: 'crit_res_melee', label: 'Mel Crit Res', isPct: true }, { key: 'crit_res_ranged', label: 'Ran Crit Res', isPct: true }, { key: 'crit_res_magic', label: 'Mag Crit Res', isPct: true }, { key: 'spirit', label: 'Spirit' }, { key: 'heal', label: 'Heal', isPct: true }]}
    ];

    const StatComparisonRow = ({ label, myVal, enemyVal, isPct = false }: any) => {
        const normalize = (v: any) => { let val = Number(v || 0); if (isPct && val > 0 && val <= 5) val = val * 100; return val; }
        const v1 = normalize(myVal); const v2 = normalize(enemyVal); const diff = v1 - v2; const isBetter = diff > 0; const isWorse = diff < 0;
        return (
            <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                <div className={`w-1/4 text-right font-bold font-tech text-sm md:text-base ${isBetter ? 'text-green-400' : 'text-slate-400'}`}>{v1.toLocaleString()}{isPct ? '%' : ''}{isBetter && <span className="ml-1 text-[10px] text-green-500/80">▲</span>}</div>
                <div className="w-2/4 text-center px-2 flex flex-col items-center"><span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest truncate max-w-full">{label}</span>{diff !== 0 && (<span className={`text-[9px] px-1.5 rounded-full font-bold mt-0.5 ${isBetter ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{diff > 0 ? '+' : ''}{diff.toFixed(isPct ? 1 : 0)}{isPct ? '%' : ''}</span>)}</div>
                <div className={`w-1/4 text-left font-bold font-tech text-sm md:text-base ${isWorse ? 'text-green-400' : 'text-slate-400'}`}><span className={`${v2 > v1 ? 'text-red-400' : 'text-slate-400'}`}>{v2.toLocaleString()}{isPct ? '%' : ''}</span>{v2 > v1 && <span className="ml-1 text-[10px] text-red-500/80">▲</span>}</div>
            </div>
        )
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-[#0f0f13]/60 backdrop-blur-xl rounded-3xl p-6 border border-white/[0.08] shadow-2xl mb-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex flex-col items-center w-full md:w-1/3">
                         <div className="relative mb-2"><img src={user?.user_metadata?.avatar_url} className="w-20 h-20 rounded-2xl border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]" alt="Me" /><div className="absolute -bottom-2 bg-purple-600 text-white text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">YOU</div></div>
                         <h3 className="text-xl font-bold text-white italic uppercase">{myStats.ingame_name}</h3><p className="text-xs text-slate-400">CP: {Number(myStats.cp).toFixed(1)}%</p>
                    </div>
                    <div className="relative py-6 px-10 flex justify-center"><h1 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 tracking-tighter drop-shadow-lg leading-tight pr-6" style={{ animation: 'pulse-red 2s infinite' }}>VS</h1></div>
                    <div className="flex flex-col items-center w-full md:w-1/3">
                         <div className="relative mb-2 w-full max-w-[200px]">
                             <select className="w-full bg-[#0a0a0e] border border-white/20 rounded-xl p-2 text-white text-center text-sm font-bold focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer" value={versusMember.ingame_name} onChange={(e) => { const selected = members.find(m => m.ingame_name === e.target.value); if(selected) setVersusMember(selected); }}>
                                {members.filter(m => m.ingame_name !== myStats.ingame_name).sort((a,b) => b.cp - a.cp).map(m => (<option key={m.ingame_name} value={m.ingame_name}>{m.ingame_name} (CP: {Number(m.cp).toFixed(0)}%)</option>))}
                             </select>
                         </div>
                         <div className="relative"><div className="w-20 h-20 rounded-2xl border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-red-900/20 flex items-center justify-center"><span className="text-2xl font-bold text-red-500">{versusMember.ingame_name.charAt(0)}</span></div><div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap">OPPONENT</div></div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2 bg-[#0f0f13]/60 rounded-3xl border border-white/[0.08] p-6 h-[400px] relative">
                    <h4 className="text-center text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Stat Comparison Radar</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#ffffff15" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <RechartsRadar name="You" dataKey="A" stroke="#a855f7" strokeWidth={3} fill="#a855f7" fillOpacity={0.5} />
                            <RechartsRadar name="Opponent" dataKey="B" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" fill="#ef4444" fillOpacity={0.1} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-4 left-0 w-full flex justify-center gap-6">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="text-xs text-white font-bold">YOU</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full border border-red-300"></div><span className="text-xs text-white font-bold">OPPONENT</span></div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    <div className="bg-[#0a0a0e]/80 p-5 rounded-2xl border border-white/10 relative overflow-hidden h-[400px] overflow-y-auto">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex justify-between sticky top-0 bg-[#0a0a0e] z-10 pt-2"><span>Full Stat Breakdown</span><span className="text-slate-500">Diff</span></h4>
                        <div className="space-y-4">{allStatsConfig.map((group, idx) => (<div key={idx}><h5 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 mt-4 first:mt-0">{group.title}</h5><div className="space-y-1">{group.items.map((stat) => (<StatComparisonRow key={stat.key} label={stat.label} myVal={myStats.stats[stat.key]} enemyVal={versusMember.stats[stat.key]} isPct={stat.isPct} />))}</div></div>))}</div>
                    </div>
                    <div className="bg-gradient-to-r from-slate-900 to-black p-6 rounded-2xl border border-white/10 text-center">
                        <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Total Power Gap (CP)</span>
                        <div className="text-3xl font-bold italic text-white mt-1 font-tech">{Number(myStats.cp) >= Number(versusMember.cp) ? <span className="text-green-400">+{ (Number(myStats.cp) - Number(versusMember.cp)).toFixed(1) }%</span> : <span className="text-red-400">{ (Number(myStats.cp) - Number(versusMember.cp)).toFixed(1) }%</span>}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{Number(myStats.cp) >= Number(versusMember.cp) ? "You are leading" : "Opponent is leading"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // --- RENDER LOGIC ---
  if (loading) return (
    <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-6 relative overflow-hidden font-tech">
      <FontSystem />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#020205] to-[#020205]"></div>
      <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin z-10 shadow-[0_0_30px_rgba(168,85,247,0.3)]"></div>
      <div className="text-purple-400 font-bold tracking-[0.3em] text-xs animate-pulse uppercase z-10">System Initializing...</div>
    </div>
  );

if (!user && !isGuest) return ( 
    <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <FontSystem />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[5000ms]"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07] brightness-100 contrast-150 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl animate-in fade-in zoom-in duration-1000">
        <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 italic uppercase mb-2 tracking-tighter drop-shadow-2xl leading-tight py-4 px-4 pr-8 pb-4">
          MYSTIC
        </h1>
        <div className="h-[1px] w-24 md:w-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-10 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
        <p className="text-slate-400 font-bold tracking-[0.4em] md:tracking-[0.8em] mb-12 text-[10px] md:text-xs uppercase border border-white/5 px-6 py-2 rounded-full backdrop-blur-sm font-tech">
          Guild Command Center
        </p>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ 
    provider: 'discord', 
    options: { 
        redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
        scopes: 'identify email'
    } 
})}
          className="group relative bg-white text-black px-6 py-3 md:px-10 md:py-4 rounded-full font-bold text-[10px] md:text-sm hover:bg-purple-600 hover:text-white transition-all duration-500 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] overflow-hidden flex items-center gap-3 md:gap-4 mt-2 font-tech"
        >
          <div className="relative">
             <div className="absolute inset-0 bg-purple-400 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-rotate-12 relative z-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 3.903 3.903 0 0 0-.64 1.252 18.066 18.066 0 0 0-5.424 0 4.154 4.154 0 0 0-.641-1.252.077.077 0 0 0-.078-.037A19.736 19.736 0 0 0 3.679 4.37a.068.068 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>
          </div>
          ACCESS WITH DISCORD
        </button>
        {/* ✅ เพิ่มปุ่ม Guest และ Modal ต่อท้ายปุ่ม Discord ตรงนี้ครับ */}
        <button 
            onClick={() => setShowGuestLogin(true)}
            className="mt-4 text-slate-500 text-xs hover:text-white transition-colors underline underline-offset-4 cursor-pointer z-50"
        >
            Member Login (No Discord)
        </button>
        {showGuestLogin && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#0a0a0e] border border-white/10 p-8 rounded-3xl w-full max-w-sm relative shadow-2xl animate-in zoom-in-95">
                    <button onClick={() => setShowGuestLogin(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                    <h3 className="text-xl font-bold text-white mb-6 text-center uppercase font-tech">Member Access</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold ml-1">Ingame Name</label>
                            <input type="text" value={guestNameInput} onChange={(e) => setGuestNameInput(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" placeholder="ชื่อตัวละคร" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold ml-1">Guild Code</label>
                            <input type="password" value={guestCode} onChange={(e) => setGuestCode(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" placeholder="รหัสลับกิลด์" />
                        </div>
                        <button onClick={handleGuestLogin} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg mt-2">Enter System</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
 
  if (needsMapping) return (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6 relative font-tech">
      <FontSystem />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-[#020205] to-[#020205]"></div>
      <div className="bg-[#0a0a0e]/80 backdrop-blur-2xl p-8 md:p-12 rounded-[32px] border border-white/10 max-w-md w-full space-y-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        <div>
            <h2 className="text-3xl font-bold text-white italic uppercase tracking-tighter">Identity Check</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Sync your In-game Profile</p>
        </div>
        <div className="relative group">
            <input type="text" value={ingameName} onChange={e => setIngameName(e.target.value)} className="w-full bg-black/50 p-6 rounded-2xl text-white text-center border border-white/10 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none text-xl font-bold placeholder:text-slate-700 uppercase" placeholder="Character Name" />
        </div>
        <button onClick={handleRegister} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1">Confirm Identity</button>
      </div>
    </div>
  );

return (
    <div className="min-h-screen bg-[#020205] text-slate-200 pb-24 font-sans selection:bg-purple-500/30 selection:text-white overflow-x-hidden relative" ref={containerRef}>
      <FontSystem />
      
      {/* Global Elements */}
      <GuildRadio />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-full tactical-grid z-0 opacity-40"></div>
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full mix-blend-screen"></div>
         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full mix-blend-screen"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

 {/* ✅ ใส่ Nav ใหม่ตรงนี้แทนของเดิม */}
      <MysticNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        ingameName={ingameName} 
        isGuest={isGuest}
        onLogout={isGuest ? handleGuestLogout : handleLogout}
      />

      {/* FIXED NAVIGATION BUTTONS (INSPECTION MODE) */}
      {inspectingMember && (
        <div className="fixed inset-0 z-[101] pointer-events-none">
            <button 
                onClick={handleCloseInspection} 
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors font-bold text-xl bg-black/40 p-2 rounded-full w-10 h-10 flex items-center justify-center border border-white/10 backdrop-blur-md pointer-events-auto"
            >
              ✕
            </button>
            <button 
                onClick={handlePrevMember} 
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-purple-600/80 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 shadow-lg pointer-events-auto"
            >
              <span className="text-xl md:text-2xl pb-1">❮</span>
            </button>
            <button 
                onClick={handleNextMember} 
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-purple-600/80 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 shadow-lg pointer-events-auto"
            >
              <span className="text-xl md:text-2xl pb-1">❯</span>
            </button>
        </div>
      )}

      {/* INSPECTION OVERLAY (MODAL) */}
      {inspectingMember && (
        <div className="fixed inset-0 z-[100] bg-[#020205]/95 backdrop-blur-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-20 relative">
               {renderCharacterProfile(inspectingMember, true)}
            </div>
        </div>
      )}


        <main className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        
        {/* --- LOUNGE TAB --- */}
        {activeTab === 'LOUNGE' && (
             <WelcomeLounge 
                user={user} 
                myStats={myStats} 
                bosses={bosses}
                members={members} 
                onNavigate={setActiveTab} 
             />
        )}
        {activeTab === 'WAR_ROOM' && <TacticalWarRoom members={members} />}     
        {activeTab === 'ORACLE' && <InvasionOracle currentUser={ingameName} />}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'PROFILE' && (
          myStats ? renderCharacterProfile(myStats, false) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-xs animate-pulse text-center gap-4">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
              Syncing Neural Link...
            </div>
          )
        )}

        {/* --- BOSS TIME TAB --- */}
        {activeTab === 'BOSS_TIME' && <BossTimeView currentUser={ingameName} isAdmin={isGlobalAdmin} />}

        {/* --- COMPARE TAB --- */}
        {activeTab === 'COMPARE' && (
          myStats ? renderCompareMode() : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-xs animate-pulse text-center gap-4">
               Waiting for Battle Data...
            </div>
          )
        )}

        {/* --- INTEL TAB --- */}
        {activeTab === 'INTEL' && (
          <div className="animate-in fade-in duration-700 space-y-8">
            
            {/* Hall of Honor */}
            <div className="bg-[#0f0f13]/60 p-6 md:p-8 rounded-[40px] border border-white/[0.08] shadow-2xl relative">
              <h3 className="text-2xl font-bold italic uppercase mb-8 text-white tracking-widest flex items-center gap-4 border-b border-white/[0.08] pb-4 font-tech">
                 <Trophy size={32} className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
                 Hall of Honor
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 {[
                   { label: 'The Destroyer', sub: 'Damage', key: 'damage', icon: Swords, color: 'from-orange-500 to-amber-600' },
                   { label: 'Sniper', sub: 'Accuracy', key: 'accuracy', icon: Crosshair, color: 'from-red-500 to-rose-600' },
                   // ✅ แก้ key ให้ตรงกับฐานข้อมูล: crit_hit, weapon_dmg, w_block
                   { label: 'Assassin', sub: 'Critical Hit', key: 'crit_hit', icon: Zap, color: 'from-fuchsia-500 to-purple-600' },
                   { label: 'Weapon Master', sub: 'Weapon Damage', key: 'weapon_dmg', icon: ShieldAlert, color: 'from-blue-500 to-cyan-600' },
                   { label: 'Combo King', sub: 'Triple Chance', key: 'triple_chance', icon: Layers, color: 'from-cyan-400 to-blue-500' },
                   { label: 'The Wall', sub: 'Defense', key: 'defense', icon: Shield, color: 'from-slate-500 to-slate-700' },
                   { label: 'Block Master', sub: 'Weapon Block', key: 'w_block', icon: Wind, color: 'from-teal-500 to-emerald-600' },
                   { label: 'War Lord', sub: 'Final CP', key: 'final_cp', icon: Crown, color: 'from-red-700 to-black', isSpecial: true },
                 ].map((ach, i) => {
                    let top = [...members].sort((a, b) => {
                        let valA = ach.key === 'final_cp' ? Number(a.final_cp) : Number(a.stats?.[ach.key]) || 0;
                        let valB = ach.key === 'final_cp' ? Number(b.final_cp) : Number(b.stats?.[ach.key]) || 0;
                        return valB - valA;
                    })[0];
                    const isM = top?.ingame_name === ingameName;
                    let v = ach.key === 'final_cp' ? Number(top?.final_cp) : Number(top?.stats?.[ach.key]) || 0;
                    return (
                        <div key={i} onClick={() => top && handleViewMember(top)} className={`group relative cursor-pointer ${ach.isSpecial ? 'col-span-2 md:col-span-1 lg:col-span-1' : 'col-span-1'}`}>
                            <div className={`h-full bg-[#1a1a20]/80 backdrop-blur-md rounded-[20px] p-1 relative overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-transparent group-hover:border-white/20 ${ach.isSpecial ? 'ring-1 ring-red-500/50' : ''}`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${ach.color} opacity-10 group-hover:opacity-30 transition-opacity`}></div>
                                <div className="relative bg-[#0a0a0e] h-full rounded-[18px] p-4 flex flex-col items-center text-center z-10 overflow-hidden">
                                    <div className={`w-16 h-16 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b ${ach.color} blur-[30px] opacity-40 group-hover:opacity-70 transition-opacity`}></div>
                                    <div className="relative z-10 mb-2 transform group-hover:scale-110 transition-transform duration-300">
                                        <ach.icon size={28} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                                    </div>
                                    <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-0.5 font-tech">{ach.label}</h4>
                                    <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mb-3 opacity-60">{ach.sub}</p>
                                    {top ? (
                                        <div className="mt-auto w-full pt-2 border-t border-white/5">
                                            <div className={`text-2xl font-bold font-tech leading-none mb-1 text-white`}>
                                                <CountUp value={v} formatter={(val) => val.toLocaleString()} />
                                            </div>
                                            <div className={`text-[10px] font-bold truncate ${isM ? 'text-purple-400' : 'text-slate-500'}`}>
                                                {top.ingame_name}
                                            </div>
                                        </div>
                                    ) : <div className="mt-auto text-[10px] text-slate-700 animate-pulse">Scanning...</div>}
                                </div>
                            </div>
                        </div>
                    );
                 })}
              </div>
            </div>

{/* Vanguard Ranking Table */}
            <div className="bg-[#0f0f13]/60 rounded-[40px] border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-md relative">
                <div className="p-6 md:p-8 border-b border-white/[0.08] bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20 backdrop-blur-xl">
                    <h3 className="text-xl font-bold italic uppercase text-white tracking-tighter font-tech">Vanguard Ranking</h3>
                    {/* ✅ ปุ่มเลือกโหมด (เปลี่ยนชื่อเป็น TOTAL, CP, ACTIVE) */}
                    <div className="flex gap-2">
                        <button onClick={() => setRankingMode('TOTAL')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${rankingMode === 'TOTAL' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>TOTAL</button>
                        <button onClick={() => setRankingMode('CP')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${rankingMode === 'CP' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>CP</button>
                        <button onClick={() => setRankingMode('ACTIVE')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${rankingMode === 'ACTIVE' ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>ACTIVE</button>
                    </div>
                </div>
                
                {/* 📱 Mobile Table Code */}
                <div className="md:hidden p-4 space-y-3">
                  {[...members].sort((a, b) => {
                      // ✅ ดึงค่าให้ถูกต้องและป้องกัน NaN
                      if (rankingMode === 'TOTAL') return (Number(b.final_cp) || 0) - (Number(a.final_cp) || 0);
                      if (rankingMode === 'CP') return (Number(b.calculated_cp || b.base_cp || b.cp) || 0) - (Number(a.calculated_cp || a.base_cp || a.cp) || 0);
                      return (Number(b.cp_active) || 0) - (Number(a.cp_active) || 0);
                  }).map((m, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleViewMember(m)} 
                      className={`relative p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer ${m.ingame_name === ingameName ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-[#15151a] border-white/5 hover:border-white/20'}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center">
                                  {idx === 0 ? <Crown size={24} className="text-yellow-400 fill-yellow-400/20 animate-pulse" /> : 
                                   idx === 1 ? <Trophy size={20} className="text-slate-300 fill-slate-300/20" /> : 
                                   idx === 2 ? <Trophy size={20} className="text-amber-600 fill-amber-600/20" /> : 
                                   <span className="text-slate-500 font-bold font-tech text-sm">#{idx + 1}</span>}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-white uppercase italic tracking-wider flex items-center gap-2">
                                      {m.ingame_name} {m.ingame_name === ingameName && <span className="bg-purple-600 text-[8px] px-1.5 rounded-full text-white shadow-sm">ME</span>}
                                  </div>
                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{m.char_class || '-'}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              {/* ✅ แสดงคะแนน พร้อมดักจับ NaN ให้เป็น 0 */}
                              <div className={`text-xl font-bold italic font-tech leading-none ${rankingMode === 'TOTAL' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500' : rankingMode === 'CP' ? 'text-blue-400' : 'text-orange-400'}`}>
                                  {rankingMode === 'TOTAL' ? (Number(m.final_cp) || 0).toLocaleString() : 
                                   rankingMode === 'CP' ? (Number(m.calculated_cp || m.base_cp || m.cp) || 0).toLocaleString() : 
                                   (Number(m.cp_active) || 0).toLocaleString()}
                              </div>
                              <div className="text-[9px] text-slate-600 uppercase font-bold tracking-wider">{rankingMode} SCORE</div>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 💻 Desktop Table Code */}
                <div className="hidden md:block overflow-x-auto no-scrollbar relative">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/[0.05] bg-black/40 font-tech">
                        <th className="p-6 text-center w-24">Rank</th>
                        <th className="p-6">Member</th>
                        <th className="p-6">Class</th>
                        <th className="p-6 text-right">{rankingMode} SCORE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {[...members].sort((a, b) => {
                          // ✅ ดึงค่าให้ถูกต้องและป้องกัน NaN
                          if (rankingMode === 'TOTAL') return (Number(b.final_cp) || 0) - (Number(a.final_cp) || 0);
                          if (rankingMode === 'CP') return (Number(b.calculated_cp || b.base_cp || b.cp) || 0) - (Number(a.calculated_cp || a.base_cp || a.cp) || 0);
                          return (Number(b.cp_active) || 0) - (Number(a.cp_active) || 0);
                      }).map((m, idx) => (
                        <tr key={idx} onClick={() => handleViewMember(m)} className={`group transition-colors cursor-pointer ${m.ingame_name === ingameName ? 'bg-purple-900/10' : 'hover:bg-white/[0.02]'}`}>
                          <td className="p-6 text-center">
                              <div className="flex justify-center items-center">
                                  {idx === 0 ? <Crown size={28} className="text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" /> : 
                                   idx === 1 ? <Trophy size={24} className="text-slate-300 fill-slate-300/20" /> : 
                                   idx === 2 ? <Trophy size={24} className="text-amber-600 fill-amber-600/20" /> : 
                                   <span className="text-slate-600 font-bold font-tech text-sm">#{idx + 1}</span>}
                              </div>
                          </td>
                          <td className="p-6 font-bold text-white uppercase italic tracking-tight text-sm">
                            {m.ingame_name} {m.ingame_name === ingameName && <span className="ml-2 bg-purple-600 text-[8px] px-1.5 py-0.5 rounded-full shadow-lg">You</span>}
                          </td>
                          <td className="p-6"><span className="text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg uppercase tracking-wider font-tech">{m.char_class || '-'}</span></td>
                          <td className="p-6 text-right">
                              {/* ✅ แสดงคะแนน พร้อมดักจับ NaN ให้เป็น 0 */}
                              <div className={`font-bold italic text-xl tracking-tighter font-tech ${rankingMode === 'TOTAL' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600' : rankingMode === 'CP' ? 'text-blue-400' : 'text-orange-400'}`}>
                                  {rankingMode === 'TOTAL' ? (Number(m.final_cp) || 0).toLocaleString() : 
                                   rankingMode === 'CP' ? (Number(m.calculated_cp || m.base_cp || m.cp) || 0).toLocaleString() : 
                                   (Number(m.cp_active) || 0).toLocaleString()}
                              </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
            
          </div>
        )}

        {/* --- TOI BOOKING SYSTEM --- */}
        {activeTab === 'TOI' && (
             <ToiBookingSystem 
                 user={user} 
                 members={members} 
                 myStats={myStats}
                 isAdmin={isToiAdmin} 
             />
        )}

        {/* --- ENCHANT SIMULATOR TAB --- */}
        {activeTab === 'ENCHANT' && (
            <div className="max-w-3xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-500">
                <EnchantSimulator />
            </div>
        )}
      </main>
    </div>
  );
}
// --- COMPONENT: INVASION ORACLE (Time-Locked Edition) ---
const InvasionOracle = ({ currentUser }: { currentUser: string }) => {
    const [isRevealing, setIsRevealing] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);
    const [animationText, setAnimationText] = useState("AWAITING PROPHECY...");
    
    // 🔒 1. Check User Permission
    const ORACLES = ['BLUELABEL']; 
    const isOracle = ORACLES.some(name => name.toUpperCase() === currentUser.toUpperCase());

    // ⏳ 2. Check Day of Week (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
    const today = new Date().getDay();
    // อนุญาตเฉพาะวันอังคาร (2) และ พฤหัส (4)
    const isInvasionDay = today === 0 || today === 2 || today === 4;

    // Admin Bypass (เผื่อคุณอยากเทสวันอื่น ให้แก้เป็น true)
    const DEV_BYPASS = true; 
    
    const canPredict = (isOracle && isInvasionDay) || (isOracle && DEV_BYPASS);

    // 🌍 Server Data (เหมือนเดิม)
    const WORLDS = ['Bartz', 'Kain', 'Teon', 'Leona'];
    const ALL_SERVERS = useMemo(() => {
        let servers = [];
        for (let w of WORLDS) {
            for (let i = 1; i <= 10; i++) {
                const name = `${w} ${i}`;
                if (name === 'Teon 7') continue;
                let threat = 'NEUTRAL';
                if (name === 'Kain 7') threat = 'EXTREME';
                else if (w === 'Bartz') threat = 'HIGH';
                servers.push({ name, world: w, number: i, threat });
            }
        }
        return servers;
    }, []);

    const castProphecy = () => {
        if (!canPredict) return;
        setIsRevealing(true);
        setPrediction(null);

        let interval = setInterval(() => {
            const randomServer = ALL_SERVERS[Math.floor(Math.random() * ALL_SERVERS.length)];
            setAnimationText(randomServer.name);
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            const fate = ALL_SERVERS[Math.floor(Math.random() * ALL_SERVERS.length)];
            setPrediction(fate);
            setIsRevealing(false);
        }, 3000);
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-in fade-in">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0f0f13] to-[#0f0f13] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md text-center space-y-8">
                
                {/* Header */}
                <div>
                    <Sparkles className={`mx-auto mb-4 ${canPredict ? 'text-purple-400 animate-pulse' : 'text-slate-600'}`} size={48} />
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-900 font-tech uppercase tracking-[0.3em]">
                        Invasion Oracle
                    </h2>
                    <p className="text-xs text-purple-400/60 mt-2 uppercase tracking-widest">
                        {canPredict ? 'System Online: Class S Clearance' : 'System Offline: Awaiting Alignment'}
                    </p>
                </div>

                {/* Display Area */}
                <div className={`
                    relative aspect-square rounded-full border-4 flex items-center justify-center overflow-hidden transition-all duration-1000
                    ${prediction?.threat === 'EXTREME' ? 'border-red-600 bg-red-900/20 shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 
                      prediction?.threat === 'HIGH' ? 'border-orange-500 bg-orange-900/20 shadow-[0_0_50px_rgba(249,115,22,0.3)]' :
                      canPredict ? 'border-purple-500/30 bg-purple-900/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]' :
                      'border-slate-800 bg-black/50 grayscale'}
                `}>
                    {isRevealing ? (
                        <div className="text-4xl font-black text-white/50 font-tech animate-pulse">{animationText}</div>
                    ) : prediction ? (
                        <div className="animate-in zoom-in duration-500 flex flex-col items-center">
                            {prediction.threat === 'EXTREME' && <Skull size={64} className="text-red-500 mb-4 animate-bounce" />}
                            {/* ... (Show Result Logic เหมือนเดิม) ... */}
                            <div className={`text-5xl font-black font-tech uppercase mb-2 ${prediction.threat === 'EXTREME' ? 'text-red-500' : 'text-white'}`}>{prediction.name}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Threat Level: {prediction.threat}</div>
                        </div>
                    ) : (
                        <div className={`${canPredict ? 'text-purple-500/30' : 'text-slate-800'} text-6xl font-tech`}>?</div>
                    )}
                </div>

                {/* Controls (Button Logic Updated) */}
                <div className="h-16">
                    {/* กรณี 1: เป็นวัน Invasion + เป็นหัวกิลด์ -> กดได้ */}
                    {canPredict ? (
                        <button 
                            onClick={castProphecy}
                            disabled={isRevealing}
                            className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-[0.2em] transition-all ${isRevealing ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95'}`}
                        >
                            {isRevealing ? 'Aligning Stars...' : 'Open The Gate'}
                        </button>
                    ) : (
                        // กรณี 2: ปุ่มปิด (แบ่งเป็น 2 สาเหตุ)
                        <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-center gap-3 text-slate-500">
                            <Lock size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {!isOracle 
                                    ? "Access Denied: Guild Master Only" 
                                    : "Portal Closed (Opens Tue & Thu)"} {/* ถ้าเป็นหัวกิลด์แต่วันผิด จะขึ้นอันนี้ */}
                            </span>
                        </div>
                    )}
                </div>
                
                {/* บอกวันปัจจุบันให้ user รู้ */}
                {!canPredict && isOracle && (
                   <div className="text-[10px] text-red-400/50 uppercase tracking-widest">
                       Current Planetary Alignment: {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][today]}
                   </div>
                )}

            </div>
        </div>
    );
};
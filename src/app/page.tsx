/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// ============================================================================
// [1] 데이터 및 상수 (기능 보존을 위해 포맷만 압축)
// ============================================================================
const DRAGON_TYPES = ["체", "공", "방", "체공", "체방", "공방", "(진각)체", "(진각)공", "(진각)방", "(진각)체공", "(진각)체방", "(진각)공방"];
const GRADES = ["7.0", "8.0", "9.0"];
const GEM_VALUES = [40, 39, 38, 37, 36, 35, 34];
const GEM_STATS = ["체", "공", "방"];
const SPIRIT_STATS = ["체력", "공격력", "방어력"];
const SPIRIT_MODES = ["%", "+"];
const SPIRIT_FLAT_TBL = [null, [216, 54, 54], [240, 60, 60], [264, 66, 66], [480, 120, 120]];
const SPIRIT_PCT_TBL = [null, [0.24, 0.24, 0.24], [0.28, 0.28, 0.28], [0.32, 0.32, 0.32], [0.40, 0.40, 0.40]];
const GEM_DISTS = [[5,0,0],[0,5,0],[0,0,5],[4,1,0],[4,0,1],[1,4,0],[1,0,4],[0,4,1],[0,1,4],[3,2,0],[3,0,2],[2,3,0],[2,0,3],[0,3,2],[0,2,3],[3,1,1],[1,3,1],[1,1,3],[2,2,1],[2,1,2],[1,2,2],[0,0,0]];
const TAR_DENOM = { "체|HP40%": 1078990080, "체|ATK40%": 990919800, "체|DEF40%": 990919800, "체|HP+ATK20%": 1016249274, "체|HP+DEF20%": 1020765286, "체|ATK+DEF20%": 965302272, "공|HP40%": 1011946650, "공|ATK40%": 1081981530, "공|DEF40%": 979086020, "공|HP+ATK20%": 1031112576, "공|HP+DEF20%": 975532896, "공|ATK+DEF20%": 1012677120, "방|HP40%": 1000230768, "방|ATK40%": 995980440, "방|DEF40%": 1081449600, "방|HP+ATK20%": 977294739, "방|HP+DEF20%": 1022795024, "방|ATK+DEF20%": 1013784800, "체공|HP40%": 1070406320, "체공|ATK40%": 1067050400, "체공|DEF40%": 952919044, "체공|HP+ATK20%": 1017420620, "체공|HP+DEF20%": 987639480, "체공|ATK+DEF20%": 983461784, "체방|HP40%": 1070406320, "체방|ATK40%": 952919044, "체방|DEF40%": 1067050400, "체방|HP+ATK20%": 986229088, "체방|HP+DEF20%": 1018647388, "체방|ATK+DEF20%": 981528492, "공방|HP40%": 990080000, "공방|ATK40%": 1051711596, "공방|DEF40%": 1054944000, "공방|HP+ATK20%": 992142605, "공방|HP+DEF20%": 993209700, "공방|ATK+DEF20%": 1011069696 };
const TAR_BUFFS = ["HP40%", "ATK40%", "DEF40%", "HP+ATK20%", "HP+DEF20%", "ATK+DEF20%"];
const BUFFS_DB = { '0벞': { hp: 0, atk: 0, def: 0 }, 'HP20%': { hp: 0.2, atk: 0, def: 0 }, 'ATK20%': { hp: 0, atk: 0.2, def: 0 }, 'DEF20%': { hp: 0, atk: 0, def: 0.2 }, 'HP40%': { hp: 0.4, atk: 0, def: 0 }, 'ATK40%': { hp: 0, atk: 0.4, def: 0 }, 'DEF40%': { hp: 0, atk: 0, def: 0.4 }, 'HP+ATK20%': { hp: 0.2, atk: 0.2, def: 0 }, 'HP+DEF20%': { hp: 0.2, atk: 0, def: 0.2 }, 'ATK+DEF20%': { hp: 0, atk: 0.2, def: 0.2 } };
const NERFS_DB = { '너프 없음': { hp: 0, atk: 0, def: 0 }, 'HP20%': { hp: 0.2, atk: 0, def: 0 }, 'ATK20%': { hp: 0, atk: 0.2, def: 0 }, 'DEF20%': { hp: 0, atk: 0, def: 0.2 }, 'HP40%': { hp: 0.4, atk: 0, def: 0 }, 'ATK40%': { hp: 0, atk: 0.4, def: 0 }, 'DEF40%': { hp: 0, atk: 0, def: 0.4 }, 'HP+ATK20%': { hp: 0.2, atk: 0.2, def: 0 }, 'HP+DEF20%': { hp: 0.2, atk: 0, def: 0.2 }, 'ATK+DEF20%': { hp: 0, atk: 0.2, def: 0.2 } };
const ALL_NERFS = Object.keys(NERFS_DB);
const BASE_STATS = { "체": { hp: 1252, atk: 176, def: 176 }, "공": { hp: 876, atk: 285, def: 161 }, "방": { hp: 788, atk: 185, def: 283 }, "체공": { hp: 1080, atk: 262, def: 133 }, "체방": { hp: 1080, atk: 133, def: 262 }, "공방": { hp: 720, atk: 242, def: 243 }, "(진각)체": { hp: 1113, atk: 156, def: 156 }, "(진각)공": { hp: 793, atk: 243, def: 149 }, "(진각)방": { hp: 685, atk: 156, def: 263 }, "(진각)체공": { hp: 977, atk: 235, def: 111 }, "(진각)체방": { hp: 977, atk: 111, def: 235 }, "(진각)공방": { hp: 641, atk: 216, def: 214 } };
const AWAKENING_STATS = { "(진각)체": { hp: 144, atk: 12, def: 12 }, "(진각)공": { hp: 72, atk: 30, def: 12 }, "(진각)방": { hp: 96, atk: 24, def: 12 }, "(진각)체공": { hp: 96, atk: 18, def: 18 }, "(진각)체방": { hp: 96, atk: 12, def: 24 }, "(진각)공방": { hp: 72, atk: 24, def: 18 } };
const GRADE_BONUS = { "체": { hp: 80, atk: 0, def: 0 }, "공": { hp: 0, atk: 20, def: 0 }, "방": { hp: 0, atk: 0, def: 20 }, "체공": { hp: 40, atk: 10, def: 0 }, "체방": { hp: 40, atk: 0, def: 10 }, "공방": { hp: 0, atk: 10, def: 10 } };
const RAW_ACCESSORY_DATA = [["크발",0,0,0,0],["빛뿔공",5,0,5,0],["빛뿔공",8,0,8,0],["악보",16,16,0,0],["황보",16,0,16,0],["여보",16,0,0,16],["대뿔(방/체)",16,6,0,10],["대뿔(방/공)",16,0,6,10],["물뿔(체/공)",16,10,6,0],["물뿔(체/방)",16,10,0,6],["불뿔(공/방)",16,0,10,6],["불뿔(공/체)",16,6,10,0],["바뿔(공/체)",16,8,8,0],["바뿔(체/방)",16,8,0,8],["바뿔(공/방)",16,0,8,8],["악보",17,17,0,0],["황보",17,0,17,0],["여보",17,0,0,17],["대뿔(방/체)",17,6,0,11],["대뿔(방/공)",17,0,6,11],["물뿔(체/공)",17,11,6,0],["물뿔(체/방)",17,11,0,6],["불뿔(공/방)",17,0,11,6],["불뿔(공/체)",17,6,11,0],["바뿔(공/체)",17,9,8,0],["바뿔(체/방)",17,9,0,8],["바뿔(공/방)",17,0,9,8],["악보",18,18,0,0],["황보",18,0,18,0],["여보",18,0,0,18],["대뿔(방/체)",18,6,0,12],["대뿔(방/공)",18,0,6,12],["물뿔(체/공)",18,12,6,0],["물뿔(체/방)",18,12,0,6],["불뿔(공/방)",18,0,12,6],["불뿔(공/체)",18,6,12,0],["바뿔(공/체)",18,9,9,0],["바뿔(체/방)",18,9,0,9],["바뿔(공/방)",18,0,9,9],["악보",19,19,0,0],["황보",19,0,19,0],["여보",19,0,0,19],["대뿔(방/체)",19,6,0,13],["대뿔(방/공)",19,0,6,13],["물뿔(체/공)",19,13,6,0],["물뿔(체/방)",19,13,0,6],["불뿔(공/방)",19,0,13,6],["불뿔(공/체)",19,6,13,0],["바뿔(공/체)",19,9,10,0],["바뿔(체/방)",19,10,0,9],["바뿔(공/방)",19,0,10,9],["악보",20,20,0,0],["황보",20,0,20,0],["여보",20,0,0,20],["바뿔(체/공)",20,10,10,0],["바뿔(체/방)",20,10,0,10],["바뿔(공/방)",20,0,10,10]];
const RAW_ACCESSORY_DB = RAW_ACCESSORY_DATA.map(d => ({ name: d[0], lv: d[1], hp: d[2] / 100, atk: d[3] / 100, def: d[4] / 100 })).sort((a, b) => b.lv - a.lv);
const ACCESSORY_DB_EXPANDED = [];
RAW_ACCESSORY_DB.forEach((acc) => { for (let k = 1; k <= 3; k++) ACCESSORY_DB_EXPANDED.push({ ...acc, id: `acc_${acc.name}_${acc.lv}_${k}`, instanceNum: k, use: false, enchants: { hp: true, atk: true, def: true } }); });
const POTION_DB = { "기본(크/회/자)": { hp: 24, atk: 6, def: 6 } };
for (let i = 1; i <= 8; i++) { POTION_DB[`체력 ${i}단계`] = { hp: 24 + (12 * i), atk: 6, def: 6 }; POTION_DB[`공격력 ${i}단계`] = { hp: 24, atk: 6 + (3 * i), def: 6 }; POTION_DB[`방어력 ${i}단계`] = { hp: 24, atk: 6, def: 6 + (3 * i) }; }
const POTION_KEYS = Object.keys(POTION_DB);

// ============================================================================
// [2] 계산 로직 (GemPool & Calculator)
// ============================================================================
function safeFmt(val) { return (val || 0).toLocaleString(); }
function formatGemString(gems) { return gems?.map(g => `${g.stat}${g.val}`).join(" ") || "젬 없음"; }
function getBuffWeight(buffName) { return (buffName?.includes("40%") || buffName?.includes("+")) ? 2 : (buffName === "0벞" ? 0 : 1); }

function convertSpiritToStats(inputs) {
    const pct = { hp: 0, atk: 0, def: 0 }; const flat = { hp: 0, atk: 0, def: 0 }; const sub = { hp: 0, atk: 0, def: 0 };
    if (!inputs) return { pct, flat, sub };
    inputs.forEach((row, i) => {
        if (!row || !row.stat) return;
        const k = row.stat === "체력" ? 0 : row.stat === "공격력" ? 1 : 2;
        const key = k === 0 ? 'hp' : k === 1 ? 'atk' : 'def';
        if (i < 4) {
            if (row.type === '+') flat[key] += (SPIRIT_FLAT_TBL[i+1] ? SPIRIT_FLAT_TBL[i+1][k] : 0);
            else pct[key] += (SPIRIT_PCT_TBL[i+1] ? SPIRIT_PCT_TBL[i+1][k] : 0);
        } else {
            if (row.stat.includes("체력")) sub.hp += 40; else sub[key] += 10;
        }
    });
    return { pct, flat, sub };
}

function calculateStats(config, gems, activeEnchantType = null) {
    try {
        const typeKey = config.typ || "체";
        const baseKey = typeKey.includes("(진각)") ? typeKey : typeKey.replace("(진각)", "");
        let base = { ...(BASE_STATS[baseKey] || { hp: 1252, atk: 176, def: 176 }) };
        
        const gradeVal = parseFloat(config.grade || "9.0");
        const diff = Math.max(0, gradeVal - 7.0);
        const bonusKey = baseKey.replace("(진각)", "");
        base.hp += Math.round((GRADE_BONUS[bonusKey]?.hp || 0) * diff);
        base.atk += Math.round((GRADE_BONUS[bonusKey]?.atk || 0) * diff);
        base.def += Math.round((GRADE_BONUS[bonusKey]?.def || 0) * diff);

        const awk = AWAKENING_STATS[typeKey] || { hp: 0, atk: 0, def: 0 };
        const gemSum = { hp: 0, atk: 0, def: 0 };
        gems?.forEach(g => {
            if (g.stat === '체') gemSum.hp += Number(g.val) * 4;
            if (g.stat === '공') gemSum.atk += Number(g.val);
            if (g.stat === '방') gemSum.def += Number(g.val);
        });

        const pot = config.potion || { hp: 24, atk: 6, def: 6 };
        const acc = config.accPct || { hp: 0, atk: 0, def: 0 };
        const enchantVal = 0.21;
        const accTotal = { 
            hp: acc.hp + (activeEnchantType === 'hp' ? enchantVal : 0),
            atk: acc.atk + (activeEnchantType === 'atk' ? enchantVal : 0),
            def: acc.def + (activeEnchantType === 'def' ? enchantVal : 0)
        };

        const sp = config.spiritStats || { pct: { hp: 0, atk: 0, def: 0 }, flat: { hp: 0, atk: 0, def: 0 }, sub: { hp: 0, atk: 0, def: 0 } };
        const pd = config.pendantPct || { hp: 0, atk: 0, def: 0 };
        const col = config.collection || { hp: 240, atk: 60, def: 60 };
        const nerf = NERFS_DB[config.nerfKey] || { hp: 0, atk: 0, def: 0 };
        const buff = BUFFS_DB[config.buff] || { hp: 0, atk: 0, def: 0 };

        const final = { hp: 0, atk: 0, def: 0 };
        const buffValues = { hp: 0, atk: 0, def: 0 };
        ['hp', 'atk', 'def'].forEach(k => {
            const v1 = base[k] + awk[k] + gemSum[k] + pot[k];
            const v2 = Math.floor(v1 * (1 + accTotal[k]));
            const v3 = Math.floor((v2 + sp.flat[k]) * (1 + sp.pct[k]));
            const v4 = Math.floor(v3 * (1 + pd[k]));
            const v5 = v4 + col[k] + sp.sub[k];
            const bVal = Math.floor(base[k] * buff[k]);
            buffValues[k] = bVal;
            final[k] = v5 + bVal - Math.floor(base[k] * nerf[k]);
        });
        return { final, score: final.hp * final.atk * final.def, buffValues };
    } catch (e) { return { final: { hp: 0, atk: 0, def: 0 }, score: 0, buffValues: { hp: 0, atk: 0, def: 0 } }; }
}

class GemPool {
    constructor(gemData) {
        this.counts = [[0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0]];
        Object.entries(gemData || {}).forEach(([k, v]) => {
            const [s, val] = k.split('_');
            const sIdx = s === '체' ? 0 : s === '공' ? 1 : 2;
            const vIdx = 40 - Number(val);
            if (sIdx >= 0 && vIdx >= 0) this.counts[sIdx][vIdx] = Number(v);
        });
    }
    clone() { const cp = new GemPool(); cp.counts = this.counts.map(a => [...a]); return cp; }
    allocate(dist) {
        const picked = []; const rollback = [];
        for (let sIdx = 0; sIdx < 3; sIdx++) {
            let need = dist[sIdx];
            for (let vIdx = 0; vIdx <= 6 && need > 0; vIdx++) {
                if (this.counts[sIdx][vIdx] > 0) {
                    const take = Math.min(need, this.counts[sIdx][vIdx]);
                    this.counts[sIdx][vIdx] -= take; need -= take;
                    rollback.push([sIdx, vIdx, take]);
                    for (let k = 0; k < take; k++) picked.push({ stat: sIdx === 0 ? "체" : sIdx === 1 ? "공" : "방", val: 40 - vIdx });
                }
            }
            if (need > 0) { this.restore(rollback); return null; }
        }
        return { gems: picked, rollback };
    }
    restore(info) { info.forEach(([s, v, c]) => this.counts[s][v] += c); }
}

// ============================================================================
// [3] 메인 컴포넌트
// ============================================================================
export default function Home() {
    const [gems, setGems] = useState({});
    const [dragons, setDragons] = useState(Array(3).fill(null).map((_, i) => ({ 
        id: i, typ: "체", grade: "9.0", buff: "HP40%", nerfKey: "너프 없음", potionName: "기본(크/회/자)", 
        potion: { hp: 24, atk: 6, def: 6 }, use: true, 
        boundSpirit: { use: false, input: Array(5).fill(null).map((_, ri) => ({ stat: ri < 3 ? (ri===0?"체력":ri===1?"공격력":"방어력") : "방어력", type: ri < 4 ? "%" : "+" })) } 
    })));
    const [spirits, setSpirits] = useState([{ id: 101, input: Array(5).fill(null).map((_, ri) => ({ stat: ri < 3 ? (ri===0?"체력":ri===1?"공격력":"방어력") : "방어력", type: ri < 4 ? "%" : "+" })), use: true }]);
    const [pendants, setPendants] = useState([{ id: 201, pct: { hp: 0, atk: 0, def: 0 }, use: true }]);
    const [accInv, setAccInv] = useState(ACCESSORY_DB_EXPANDED);
    const [tarSettings, setTarSettings] = useState({ collection: { hp: 240, atk: 60, def: 60 } });
    
    const [result, setResult] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showRankModal, setShowRankModal] = useState(false);
    const [selectedRankDetail, setSelectedRankDetail] = useState(null);
    const [currentSlot, setCurrentSlot] = useState(1);
    const [calcMode, setCalcMode] = useState("avg");
    const [precMode, setPrecMode] = useState(3000);
    const [showNoBuff, setShowNoBuff] = useState(false);

    useEffect(() => {
        const s = localStorage.getItem('my_gems'); if(s) setGems(JSON.parse(s));
        fetch('/api/rank').then(r => r.json()).then(setRankings).catch(() => {});
    }, []);

    const groupedAccs = useMemo(() => {
        const g = {}; accInv.forEach(a => { if(!g[a.lv]) g[a.lv] = []; g[a.lv].push(a); });
        return Object.entries(g).sort((a,b) => Number(b[0]) - Number(a[0]));
    }, [accInv]);

    const handleCalc = async () => {
        setIsCalculating(true);
        setResult(null);
        await new Promise(r => setTimeout(r, 100));

        const poolMaster = new GemPool(gems);
        const activeDragons = dragons.filter(d => d.use);
        const activeAccs = accInv.filter(a => a.use);
        const activeSpirits = spirits.filter(s => s.use);
        const activePendants = pendants.filter(p => p.use);

        let bestTotal = -1;
        let bestSelection = null;

        for (let loop = 0; loop < 200; loop++) {
            const pool = poolMaster.clone();
            const currentComb = [];
            let currentTotal = 0;
            const usedIds = new Set();

            for (const d of activeDragons) {
                let dBest = { score: -1 };
                const possibleAccs = [...activeAccs.filter(a => !usedIds.has(a.id)), { id: 'none', hp:0, atk:0, def:0, name: "없음" }];
                const acc = possibleAccs[Math.floor(Math.random() * possibleAccs.length)] || { id: 'none', hp:0, atk:0, def:0, name: "없음" };
                const sp = activeSpirits.length ? activeSpirits[Math.floor(Math.random() * activeSpirits.length)] : { input: [] };
                const pd = activePendants.length ? activePendants[Math.floor(Math.random() * activePendants.length)] : { pct: { hp:0, atk:0, def:0 } };
                
                for (const dist of GEM_DISTS) {
                    const alloc = pool.allocate(dist);
                    if (!alloc) continue;
                    const res = calculateStats({ ...d, accPct: acc, spiritStats: convertSpiritToStats(sp.input), pendantPct: pd.pct, collection: tarSettings.collection }, alloc.gems);
                    if (res.score > dBest.score) { dBest = { ...res, acc, sp, pd, gems: alloc.gems, dist }; }
                    pool.restore(alloc.rollback);
                }
                if (dBest.score > 0) {
                    pool.allocate(dBest.dist);
                    if (dBest.acc.id !== 'none') usedIds.add(dBest.acc.id);
                    currentComb.push(dBest);
                    currentTotal += dBest.score;
                }
            }
            if (currentTotal > bestTotal) { bestTotal = currentTotal; bestSelection = currentComb; }
        }

        if (bestSelection) {
            setResult({
                totalScore: bestTotal,
                combination: bestSelection.map(res => ({
                    ...res,
                    gemString: formatGemString(res.gems),
                    accName: res.acc.name + (res.acc.lv ? ` ${res.acc.lv}` : ""),
                    spString: res.sp.input ? res.sp.input.slice(0,4).map(i=>`${i.stat[0]}${i.type}`).join(" ") : "-",
                    pndString: res.pd.pct ? `${Math.round(res.pd.pct.hp*100)}/${Math.round(res.pd.pct.atk*100)}/${Math.round(res.pd.pct.def*100)}` : "0/0/0",
                    tar: (res.score / (TAR_DENOM[`${res.dragon.typ}|${res.dragon.buff}`] || 1000000000)) * 100
                }))
            });
        }
        setIsCalculating(false);
    };

    const exportResult = () => {
        if(!result) return;
        const name = prompt("순위표 닉네임 입력");
        if(!name) return;
        const newRank = { 
            nickname: name, 
            totalScore: result.totalScore, 
            avgTar: result.combination.reduce((a,b)=>a+b.tar,0)/result.combination.length,
            totalBuffs: result.combination.reduce((sum, item) => sum + getBuffWeight(item.dragon.buff), 0),
            combination: result.combination,
            date: new Date().toLocaleString() 
        };
        const next = [newRank, ...rankings].sort((a,b) => b.totalScore - a.totalScore).slice(0, 50);
        setRankings(next);
        fetch('/api/rank', { method: 'POST', body: JSON.stringify(next) });
        alert("순위표에 등록되었습니다!");
    };

    const savePreset = (slot) => { if(confirm(`${slot} Save?`)) { const data = { dragons, spirits, pendants, accInv, tarSettings }; localStorage.setItem(`gw_preset_${slot}`, JSON.stringify(data)); alert("Saved."); } };
    const loadPreset = (slot) => { if(confirm(`${slot} Load?`)) { const d = localStorage.getItem(`gw_preset_${slot}`); if(d) { const p = JSON.parse(d); if(p.dragons) setDragons(p.dragons); if(p.spirits) setSpirits(p.spirits); if(p.pendants) setPendants(p.pendants); if(p.accInv) setAccInv(p.accInv); if(p.tarSettings) setTarSettings(p.tarSettings); } else { alert("No Data."); } } };
    const resetAllData = () => { if (confirm("초기화?")) { localStorage.clear(); window.location.reload(); } };

    return (
        <main className="min-h-screen bg-[#0b0f19] text-slate-100 p-2 font-sans select-none pb-20">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm bg-slate-800 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition inline-block mb-2">← 메인으로</Link>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">⚔️ GUILD WAR CALCULATOR</h1>
                    <button onClick={()=>setShowRankModal(true)} className="bg-amber-600 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-amber-500 transition shadow-lg">🏆 RANKING</button>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-1 items-center bg-[#1b1f2b] p-2 rounded-lg border border-slate-700 max-w-[300px] justify-center">{[1,2,3,4,5,6,7,8,9,10].map(num => (<button key={num} onClick={() => setCurrentSlot(num)} className={`w-6 h-6 rounded text-xs font-bold ${currentSlot === num ? 'bg-indigo-500 text-white' : 'bg-[#111827] text-slate-500'}`}>{num}</button>))}<div className="w-full h-1"></div><button onClick={() => savePreset(currentSlot)} className="text-xs bg-green-600 px-2 py-1 rounded text-white">Save</button><button onClick={() => loadPreset(currentSlot)} className="text-xs bg-slate-600 px-2 py-1 rounded text-white">Load</button><button onClick={resetAllData} className="text-xs bg-red-600 px-2 py-1 rounded text-white ml-1">Reset</button></div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-3 space-y-3">
                    <div className="bg-[#1b1f2b] p-3 rounded-xl border border-slate-700">
                        <div className="text-[10px] font-black text-yellow-500 mb-2 uppercase">Collection Bonus</div>
                        <div className="grid grid-cols-3 gap-2">
                            {['hp', 'atk', 'def'].map(k => (
                                <div key={k} className="bg-[#111827] p-2 rounded-lg border border-slate-800">
                                    <div className="text-[8px] text-slate-500 uppercase mb-1">{k}</div>
                                    <input type="number" className="bg-transparent w-full text-xs font-bold outline-none" value={tarSettings.collection[k]} onChange={e=>setTarSettings({...tarSettings, collection:{...tarSettings.collection, [k]:Number(e.target.value)}})}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    {dragons.map((d, i) => (
                        <div key={i} className={`bg-[#1b1f2b] p-4 rounded-xl border-2 transition-all ${d.use ? 'border-indigo-500/50' : 'border-slate-800 opacity-50'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-black text-indigo-400 text-xs italic tracking-widest">DRAGON #0{i+1}</span>
                                <input type="checkbox" className="w-4 h-4 accent-indigo-500 cursor-pointer" checked={d.use} onChange={e=>{const n=[...dragons]; n[i].use=e.target.checked; setDragons(n)}}/>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select className="bg-[#111827] p-2 rounded-lg text-[10px] font-bold outline-none" value={d.typ} onChange={e=>{const n=[...dragons]; n[i].typ=e.target.value; setDragons(n)}}>{DRAGON_TYPES.map(t=><option key={t}>{t}</option>)}</select>
                                <select className="bg-[#111827] p-2 rounded-lg text-[10px] font-bold outline-none" value={d.grade} onChange={e=>{const n=[...dragons]; n[i].grade=e.target.value; setDragons(n)}}>{GRADES.map(g=><option key={g}>{g}</option>)}</select>
                                <select className="bg-[#111827] p-2 rounded-lg text-[10px] font-bold text-green-400 outline-none" value={d.buff} onChange={e=>{const n=[...dragons]; n[i].buff=e.target.value; setDragons(n)}}>{TAR_BUFFS.map(b=><option key={b}>{b}</option>)}</select>
                                <select className="bg-[#111827] p-2 rounded-lg text-[10px] font-bold text-red-400 outline-none" value={d.nerfKey} onChange={e=>{const n=[...dragons]; n[i].nerfKey=e.target.value; setDragons(n)}}>{ALL_NERFS.map(n=><option key={n}>{n}</option>)}</select>
                            </div>
                            <select className="bg-[#111827] w-full mt-2 p-2 rounded-lg text-[10px] font-bold text-pink-400 outline-none" value={d.potionName} onChange={e=>{const n=[...dragons]; n[i].potionName=e.target.value; n[i].potion=POTION_DB[e.target.value]; setDragons(n)}}>{POTION_KEYS.map(k=><option key={k}>{k}</option>)}</select>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-[#1b1f2b] p-4 rounded-2xl border border-slate-700">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">💎 Gem Inventory</span>
                        <div className="grid grid-cols-7 gap-2">
                            {GEM_VALUES.map(v => (
                                <div key={v} className="flex flex-col gap-1">
                                    <div className="text-[9px] text-center font-mono text-slate-600 mb-1">{v}</div>
                                    {GEM_STATS.map(s => (
                                        <input key={s} type="number" className="bg-[#111827] w-full text-center text-xs p-1 rounded-lg border border-slate-800" 
                                               value={gems[`${s}_${v}`] || ''} onChange={e=>{const n={...gems,[`${s}_${v}`]:Number(e.target.value)}; setGems(n); localStorage.setItem('my_gems',JSON.stringify(n))}}/>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[#1b1f2b] p-4 rounded-2xl border border-slate-700 h-64 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-green-400 uppercase tracking-widest">Ghost Spirits</span>
                            <button onClick={()=>setSpirits([...spirits,{id:Date.now(),input:Array(5).fill(null).map((_, ri) => ({ stat: "체력", type: ri < 4 ? "%" : "+" })),use:true}])} className="bg-slate-700 px-2 py-1 rounded text-[10px]">+</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {spirits.map((s, idx) => (
                                <div key={s.id} className="grid grid-cols-6 gap-1 bg-[#111827] p-1.5 rounded-xl border border-slate-800 items-center">
                                    <span className="text-[10px] text-center font-bold text-slate-600">#{idx+1}</span>
                                    {s.input.map((row, ri) => (
                                        <select key={ri} className="bg-[#1b1f2b] text-[9px] p-1 rounded outline-none" value={row.stat} onChange={e=>{const n=[...spirits]; n[idx].input[ri].stat=e.target.value; setSpirits(n)}}>
                                            {ri<4?SPIRIT_STATS.map(t=><option key={t}>{t}</option>):["체력40","공격력10","방어력10"].map(t=><option key={t}>{t}</option>)}
                                        </select>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[#1b1f2b] p-4 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-pink-400 uppercase tracking-widest">Magic Pendants</span>
                            <button onClick={()=>setPendants([...pendants,{id:Date.now(),pct:{hp:0,atk:0,def:0},use:true}])} className="bg-slate-700 px-2 py-1 rounded text-[10px]">+</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {pendants.map((p, idx) => (
                                <div key={p.id} className="grid grid-cols-4 gap-2 items-center bg-[#111827] p-2 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-600 text-center">PND {idx+1}</span>
                                    {['hp','atk','def'].map(k => (
                                        <input key={k} type="number" className="bg-[#1b1f2b] w-full text-center text-[10px] p-1 rounded border border-slate-800 outline-none" placeholder={k.toUpperCase()} value={p.pct[k]*100} onChange={e=>{const n=[...pendants]; n[idx].pct[k]=Number(e.target.value)/100; setPendants(n)}}/>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-[#1b1f2b] p-4 rounded-2xl border border-slate-700 h-[380px] flex flex-col">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">💍 Accessory Stock</span>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {groupedAccs.map(([lv, list]) => (
                                <details key={lv} className="group bg-[#111827] rounded-xl border border-slate-800 overflow-hidden">
                                    <summary className="p-3 text-[10px] font-bold cursor-pointer hover:bg-slate-800 flex justify-between items-center transition-colors">
                                        <span className="text-indigo-300">Level {lv} ({list.length})</span>
                                        <div className="flex gap-2">
                                            <button onClick={(e)=>{e.preventDefault(); setAccInv(accInv.map(a=>a.lv===Number(lv)?{...a,use:true}:a))}} className="text-[8px] bg-indigo-900 px-1 rounded">ALL</button>
                                            <button onClick={(e)=>{e.preventDefault(); setAccInv(accInv.map(a=>a.lv===Number(lv)?{...a,use:false}:a))}} className="text-[8px] bg-slate-800 px-1 rounded">OFF</button>
                                        </div>
                                    </summary>
                                    <div className="p-2 grid grid-cols-1 gap-1">
                                        {list.map(acc => (
                                            <div key={acc.id} onClick={()=>setAccInv(accInv.map(a=>a.id===acc.id?{...a,use:!a.use}:a))}
                                                className={`flex justify-between items-center p-2 rounded-lg text-[10px] cursor-pointer border transition-all ${acc.use ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.2)]' : 'bg-[#1b1f2b] border-slate-800 opacity-40'}`}>
                                                <span className="font-bold">{acc.name} <span className="text-slate-600">#{acc.instanceNum}</span></span>
                                                <div className="flex gap-1">
                                                    {['hp','atk','def'].map(s => <div key={s} className={`w-4 h-4 flex items-center justify-center rounded-sm text-[8px] font-bold ${acc.enchants[s] ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-700'}`}>{s[0].toUpperCase()}</div>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleCalc} disabled={isCalculating} className={`w-full py-5 rounded-2xl font-black text-sm transition-all shadow-2xl ${isCalculating ? 'bg-slate-700 cursor-wait text-slate-400' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.01] active:scale-95 shadow-indigo-500/30'}`}>
                        {isCalculating ? "CALCULATING..." : "🚀 RUN OPTIMIZATION"}
                    </button>

                    <div className="bg-[#1b1f2b] p-5 rounded-2xl border border-slate-700 min-h-[350px]">
                        {result ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-800 pb-4">
                                    <div><div className="text-[9px] text-slate-500 font-bold mb-1">TOTAL</div><div className="text-base font-black text-orange-400">{safeFmt(result.totalScore)}</div></div>
                                    <div><div className="text-[9px] text-slate-500 font-bold mb-1">AVG</div><div className="text-base font-black text-indigo-400">{safeFmt(Math.round(result.totalScore/result.combination.length))}</div></div>
                                    <div><div className="text-[9px] text-slate-500 font-bold mb-1">TAR</div><div className="text-base font-black text-cyan-400">{(result.combination.reduce((a,b)=>a+b.tar,0)/result.combination.length).toFixed(2)}%</div></div>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {result.combination.map((res, i) => (
                                        <div key={i} className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 border-l-4 border-l-indigo-500">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[9px] font-black text-indigo-300">#0{i+1} {res.dragon.typ}</span>
                                                <span className="text-xs font-black text-yellow-400">{res.tar.toFixed(2)}%</span>
                                            </div>
                                            <div className="text-xl font-black text-white mb-2">{safeFmt(res.score)}</div>
                                            <div className="grid grid-cols-3 gap-1 text-center text-[10px] text-slate-400 mb-2 font-mono">
                                                <div className="bg-[#1e293b] py-1 rounded">H {safeFmt(res.final.hp)}</div>
                                                <div className="bg-[#1e293b] py-1 rounded">A {safeFmt(res.final.atk)}</div>
                                                <div className="bg-[#1e293b] py-1 rounded">D {safeFmt(res.final.def)}</div>
                                            </div>
                                            <div className="text-[9px] text-slate-500 border-t border-slate-800 pt-2 space-y-1">
                                                <div className="text-cyan-400 font-bold">💎 {res.gemString}</div>
                                                <div className="truncate">💍 {res.accName} | 👻 {res.spString}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <div className="h-[300px] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest italic">Ready</div>}
                    </div>
                </div>
            </div>

            {showRankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <div className="bg-[#1b1f2b] w-full max-w-3xl max-h-[80vh] rounded-3xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#111827]/50">
                            <h2 className="text-2xl font-black text-amber-400 italic tracking-tighter">🏆 GLOBAL RANKINGS</h2>
                            <button onClick={()=>setShowRankModal(false)} className="text-slate-500 hover:text-white text-3xl">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {rankings.map((r, idx) => (
                                <div key={idx} onDoubleClick={()=>setSelectedRankDetail(r)} 
                                    className="grid grid-cols-12 items-center bg-[#111827] p-4 rounded-2xl border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer">
                                    <div className="col-span-1 font-black text-slate-600">{idx+1}</div>
                                    <div className="col-span-4 font-black text-slate-200 truncate">{r.nickname}</div>
                                    <div className="col-span-3 font-black text-orange-400">{safeFmt(r.totalScore)}</div>
                                    <div className="col-span-2 font-bold text-cyan-400 text-center">{r.avgTar?.toFixed(2)}%</div>
                                    <div className="col-span-2 text-right text-[10px] text-slate-600 font-mono">{r.date?.split(',')[0]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

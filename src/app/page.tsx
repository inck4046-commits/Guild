/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

// ============================================================================
// [1] 데이터 및 상수 (오타 및 포맷 완벽 정리)
// ============================================================================
const DRAGON_TYPES = ["체", "공", "방", "체공", "체방", "공방", "(진각)체", "(진각)공", "(진각)방", "(진각)체공", "(진각)체방", "(진각)공방"];
const GRADES = ["7.0", "8.0", "9.0"];
const GEM_VALUES = [40, 39, 38, 37, 36, 35, 34];
const GEM_STATS = ["체", "공", "방"];
const SPIRIT_STATS = ["체력", "공격력", "방어력"];
const SPIRIT_MODES = ["%", "+"];

const SPIRIT_FLAT_TBL = [null, [216, 54, 54], [240, 60, 60], [264, 66, 66], [480, 120, 120]];
const SPIRIT_PCT_TBL = [null, [0.24, 0.24, 0.24], [0.28, 0.28, 0.28], [0.32, 0.32, 0.32], [0.40, 0.40, 0.40]];

const GEM_DISTS = [
    [5,0,0],[0,5,0],[0,0,5],[4,1,0],[4,0,1],[1,4,0],[1,0,4],[0,4,1],[0,1,4],[3,2,0],[3,0,2],[2,3,0],[2,0,3],[0,3,2],[0,2,3],[3,1,1],[1,3,1],[1,1,3],[2,2,1],[2,1,2],[1,2,2],[0,0,0]
];

const TAR_DENOM = {
    "체|HP40%": 1078990080, "체|ATK40%": 990919800, "체|DEF40%": 990919800, "체|HP+ATK20%": 1016249274, "체|HP+DEF20%": 1020765286, "체|ATK+DEF20%": 965302272,
    "공|HP40%": 1011946650, "공|ATK40%": 1081981530, "공|DEF40%": 979086020, "공|HP+ATK20%": 1031112576, "공|HP+DEF20%": 975532896, "공|ATK+DEF20%": 1012677120,
    "방|HP40%": 1000230768, "방|ATK40%": 995980440, "방|DEF40%": 1081449600, "방|HP+ATK20%": 977294739, "방|HP+DEF20%": 1022795024, "방|ATK+DEF20%": 1013784800,
    "체공|HP40%": 1070406320, "체공|ATK40%": 1067050400, "체공|DEF40%": 952919044, "체공|HP+ATK20%": 1017420620, "체공|HP+DEF20%": 987639480, "체공|ATK+DEF20%": 983461784,
    "체방|HP40%": 1070406320, "체방|ATK40%": 952919044, "체방|DEF40%": 1067050400, "체방|HP+ATK20%": 986229088, "체방|HP+DEF20%": 1018647388, "체방|ATK+DEF20%": 981528492,
    "공방|HP40%": 990080000, "공방|ATK40%": 1051711596, "공방|DEF40%": 1054944000, "공방|HP+ATK20%": 992142605, "공방|HP+DEF20%": 993209700, "공방|ATK+DEF20%": 1011069696
};
const TAR_BUFFS = ["HP40%", "ATK40%", "DEF40%", "HP+ATK20%", "HP+DEF20%", "ATK+DEF20%"];

const BUFFS_DB = { '0벞': { hp: 0, atk: 0, def: 0 }, 'HP20%': { hp: 0.2, atk: 0, def: 0 }, 'ATK20%': { hp: 0, atk: 0.2, def: 0 }, 'DEF20%': { hp: 0, atk: 0, def: 0.2 }, 'HP40%': { hp: 0.4, atk: 0, def: 0 }, 'ATK40%': { hp: 0, atk: 0.4, def: 0 }, 'DEF40%': { hp: 0, atk: 0, def: 0.4 }, 'HP+ATK20%': { hp: 0.2, atk: 0.2, def: 0 }, 'HP+DEF20%': { hp: 0.2, atk: 0, def: 0.2 }, 'ATK+DEF20%': { hp: 0, atk: 0.2, def: 0.2 } };
const NERFS_DB = { '너프 없음': { hp: 0, atk: 0, def: 0 }, 'HP20%': { hp: 0.2, atk: 0, def: 0 }, 'ATK20%': { hp: 0, atk: 0.2, def: 0 }, 'DEF20%': { hp: 0, atk: 0, def: 0.2 }, 'HP40%': { hp: 0.4, atk: 0, def: 0 }, 'ATK40%': { hp: 0, atk: 0.4, def: 0 }, 'DEF40%': { hp: 0, atk: 0, def: 0.4 }, 'HP+ATK20%': { hp: 0.2, atk: 0.2, def: 0 }, 'HP+DEF20%': { hp: 0.2, atk: 0, def: 0.2 }, 'ATK+DEF20%': { hp: 0, atk: 0.2, def: 0.2 } };
const ALL_NERFS = Object.keys(NERFS_DB);

const BASE_STATS = {
    "체": { hp: 1252, atk: 176, def: 176 }, "공": { hp: 876, atk: 285, def: 161 }, "방": { hp: 788, atk: 185, def: 283 }, "체공": { hp: 1080, atk: 262, def: 133 }, "체방": { hp: 1080, atk: 133, def: 262 }, "공방": { hp: 720, atk: 242, def: 243 },
    "(진각)체": { hp: 1113, atk: 156, def: 156 }, "(진각)공": { hp: 793, atk: 243, def: 149 }, "(진각)방": { hp: 685, atk: 156, def: 263 }, "(진각)체공": { hp: 977, atk: 235, def: 111 }, "(진각)체방": { hp: 977, atk: 111, def: 235 }, "(진각)공방": { hp: 641, atk: 216, def: 214 }
};
const AWAKENING_STATS = {
    "(진각)체": { hp: 144, atk: 12, def: 12 }, "(진각)공": { hp: 72, atk: 30, def: 12 }, "(진각)방": { hp: 96, atk: 24, def: 12 }, "(진각)체공": { hp: 96, atk: 18, def: 18 }, "(진각)체방": { hp: 96, atk: 12, def: 24 }, "(진각)공방": { hp: 72, atk: 24, def: 18 }
};
const GRADE_BONUS = { "체": { hp: 80, atk: 0, def: 0 }, "공": { hp: 0, atk: 20, def: 0 }, "방": { hp: 0, atk: 0, def: 20 }, "체공": { hp: 40, atk: 10, def: 0 }, "체방": { hp: 40, atk: 0, def: 10 }, "공방": { hp: 0, atk: 10, def: 10 } };

const RAW_ACCESSORY_DATA = [
    ["크발", 0, 0, 0, 0], ["빛뿔공", 5, 0, 5, 0], ["빛뿔공", 8, 0, 8, 0], ["악보", 16, 16, 0, 0], ["황보", 16, 0, 16, 0], ["여보", 16, 0, 0, 16], ["대뿔(방/체)", 16, 6, 0, 10], ["대뿔(방/공)", 16, 0, 6, 10], ["물뿔(체/공)", 16, 10, 6, 0], ["물뿔(체/방)", 16, 10, 0, 6], ["불뿔(공/방)", 16, 0, 10, 6], ["불뿔(공/체)", 16, 6, 10, 0], ["바뿔(공/체)", 16, 8, 8, 0], ["바뿔(체/방)", 16, 8, 0, 8], ["바뿔(공/방)", 16, 0, 8, 8],
    ["악보", 17, 17, 0, 0], ["황보", 17, 0, 17, 0], ["여보", 17, 0, 0, 17], ["대뿔(방/체)", 17, 6, 0, 11], ["대뿔(방/공)", 17, 0, 6, 11], ["물뿔(체/공)", 17, 11, 6, 0], ["물뿔(체/방)", 17, 11, 0, 6], ["불뿔(공/방)", 17, 0, 11, 6], ["불뿔(공/체)", 17, 6, 11, 0], ["바뿔(공/체)", 17, 9, 8, 0], ["바뿔(체/방)", 17, 9, 0, 8], ["바뿔(공/방)", 17, 0, 9, 8],
    ["악보", 18, 18, 0, 0], ["황보", 18, 0, 18, 0], ["여보", 18, 0, 0, 18], ["대뿔(방/체)", 18, 6, 0, 12], ["대뿔(방/공)", 18, 0, 6, 12], ["물뿔(체/공)", 18, 12, 6, 0], ["물뿔(체/방)", 18, 12, 0, 6], ["불뿔(공/방)", 18, 0, 12, 6], ["불뿔(공/체)", 18, 6, 12, 0], ["바뿔(공/체)", 18, 9, 9, 0], ["바뿔(체/방)", 18, 9, 0, 9], ["바뿔(공/방)", 18, 0, 9, 9],
    ["악보", 19, 19, 0, 0], ["황보", 19, 0, 19, 0], ["여보", 19, 0, 0, 19], ["대뿔(방/체)", 19, 6, 0, 13], ["대뿔(방/공)", 19, 0, 6, 13], ["물뿔(체/공)", 19, 13, 6, 0], ["물뿔(체/방)", 19, 13, 0, 6], ["불뿔(공/방)", 19, 0, 13, 6], ["불뿔(공/체)", 19, 6, 13, 0], ["바뿔(공/체)", 19, 9, 10, 0], ["바뿔(체/방)", 19, 10, 0, 9], ["바뿔(공/방)", 19, 0, 10, 9],
    ["악보", 20, 20, 0, 0], ["황보", 20, 0, 20, 0], ["여보", 20, 0, 0, 20], ["바뿔(체/공)", 20, 10, 10, 0], ["바뿔(체/방)", 20, 10, 0, 10], ["바뿔(공/방)", 20, 0, 10, 10]
];
const RAW_ACCESSORY_DB = RAW_ACCESSORY_DATA.map(d => ({ name: d[0], lv: d[1], hp: d[2] / 100, atk: d[3] / 100, def: d[4] / 100 })).sort((a, b) => b.lv - a.lv);
const ACCESSORY_DB_EXPANDED = [];
RAW_ACCESSORY_DB.forEach((acc) => { for (let k = 1; k <= 3; k++) ACCESSORY_DB_EXPANDED.push({ ...acc, id: `acc_${acc.name}_${acc.lv}_${k}`, instanceNum: k, use: false, enchants: { hp: true, atk: true, def: true } }); });

const POTION_DB = { "기본(크/회/자)": { hp: 24, atk: 6, def: 6 } };
for (let i = 1; i <= 8; i++) { POTION_DB[`체력 ${i}단계`] = { hp: 24 + (12 * i), atk: 6, def: 6 }; POTION_DB[`공격력 ${i}단계`] = { hp: 24, atk: 6 + (3 * i), def: 6 }; POTION_DB[`방어력 ${i}단계`] = { hp: 24, atk: 6, def: 6 + (3 * i) }; }
const POTION_KEYS = ["기본(크/회/자)", ...Object.keys(POTION_DB).filter(k => k !== "기본(크/회/자)")];

// ============================================================================
// [2] 헬퍼 함수
// ============================================================================
function safeFmt(val) { return (val || 0).toLocaleString(); }
function normalizeNerf(n) { return (!n || n === "No Nerf") ? "너프 없음" : n; }
function normalizeType(t) { return (t || "체").replace("HP", "체").replace("ATK", "공").replace("DEF", "방").replace("H/A", "체공").replace("H/D", "체방").replace("A/D", "공방"); }
function getBuffWeight(buffName) { return (buffName?.includes("40%") || buffName?.includes("+")) ? 2 : (buffName === "0벞" ? 0 : 1); }
function formatGemString(gems) { return gems?.map(g => `${g.stat}${g.val}`).join(" ") || "젬 없음"; }
function translateAcc(name, lang) {
    if (lang !== 'en') return name;
    let out = name || "";
    out = out.replace("악보", "Nightmare Orb").replace("여보", "Dawn Orb").replace("황보", "Twilight Orb").replace("크발", "Critical Claw").replace("빛뿔공", "Light Horn (ATK)").replace("빛뿔", "Light Horn").replace("바뿔", "Wind Horn ").replace("불뿔", "Fire Horn ").replace("물뿔", "Water Horn ").replace("대뿔", "Earth Horn ");
    out = out.replace("(체/공)", "(H/A)").replace("(공/체)", "(A/H)").replace("(체/방)", "(H/D)").replace("(방/체)", "(D/H)").replace("(방/공)", "(D/A)").replace("(공/방)", "(A/D)");
    return out;
}

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

function formatSpirit(inputs) {
    if (!inputs || inputs.length === 0) return "-";
    return inputs.slice(0, 4).map(i => `${i.stat[0]}${i.type}`).join(" ") + " " + (inputs[4]?.stat[0] || "");
}

function calculateTar(score, denom) {
    if (!denom) return 0;
    const r = score / denom;
    return r <= 1.0 ? Math.max(0, 200 * r - 100) : 100 * r;
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

function calculateStats(config, gems, activeEnchantType = null) {
    try {
        const typeKey = normalizeType(config.typ);
        const baseKey = typeKey.includes("(진각)") ? typeKey : typeKey.replace("(진각)", "");
        let base = { ...(BASE_STATS[baseKey] || { hp: 1252, atk: 176, def: 176 }) };
        
        const gradeVal = parseFloat(config.grade || "9.0");
        const diff = Math.max(0, gradeVal - 7.0);
        const bonusKey = baseKey.replace("(진각)","");
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

function getCombinations(arr, k) {
    const results = [];
    function backtrack(start, combo) {
        if (combo.length === k) { results.push([...combo]); return; }
        for (let i = start; i < arr.length; i++) {
            combo.push(arr[i]); backtrack(i + 1, combo); combo.pop();
        }
    }
    backtrack(0, []);
    return results;
}

// [핵심] 최적화 엔진
async function optimizeFocusMode(dragons, gemData, inv, tarSettings, limit = 3000, lang = 'ko') {
    let currentPool = new GemPool(gemData);
    let currentAccs = [...inv.accessories];
    let currentSpirits = [...inv.spirits];
    let currentPendants = [...inv.pendants];

    const emptyAcc = { hp: 0, atk: 0, def: 0, name: "없음", lv: 0, id: "none", enchants: { hp: false, atk: false, def: false } };
    const emptySpirit = { input: [], id: "none" };
    const emptyPendant = { pct: { hp: 0, atk: 0, def: 0 }, id: "none" };

    let activeIndices = dragons.map((d, i) => d.use ? i : -1).filter(i => i !== -1);
    const finalComb = [null, null, null];
    let filledCount = 0;
    let totalScore = 0;

    while (activeIndices.length > 0 && filledCount < 3) {
        let globalMaxScore = -1;
        let bestDragonIdx = -1;
        let bestDragonRes = null;
        let bestDist = [0,0,0];

        for (const idx of activeIndices) {
            const dragon = dragons[idx];
            let accsToTry = [...currentAccs.filter(a => a.use), emptyAcc];
            let spiritsToUse = [...currentSpirits.filter(s=>s.use)];
            if (dragon.boundSpirit && dragon.boundSpirit.use) spiritsToUse.unshift(dragon.boundSpirit);
            spiritsToUse.push(emptySpirit);
            let pendantsToUse = [...currentPendants.filter(p=>p.use)];
            pendantsToUse.push(emptyPendant);

            const cands = [];
            let loopCnt = 0;

            for (const acc of accsToTry) {
                const enchs = acc.id === 'none' ? [null] : (Object.keys(acc.enchants).filter(k => acc.enchants[k]) || [null]);
                for (const sp of spiritsToUse) {
                    for (const pd of pendantsToUse) {
                        for (const ench of enchs) {
                            if (++loopCnt % 2000 === 0) await new Promise(r => setTimeout(r, 0));
                            const spInput = sp && sp.input ? sp.input : [];
                            const pdPct = pd && pd.pct ? pd.pct : { hp: 0, atk: 0, def: 0 };
                            const stats = calculateStats({ ...dragon, accPct: acc, spiritStats: convertSpiritToStats(spInput), pendantPct: pdPct, collection: tarSettings.collection, potion: dragon.potion, nerfKey: dragon.nerfKey }, [{ stat: '체', val: 40 }, { stat: '체', val: 40 }, { stat: '공', val: 40 }, { stat: '공', val: 40 }, { stat: '방', val: 40 }], ench);
                            cands.push({ dragon, acc, sp, pd, ench, approxScore: stats.score, spStats: convertSpiritToStats(spInput) });
                        }
                    }
                }
            }
            cands.sort((a, b) => b.approxScore - a.approxScore);
            const topCands = cands.slice(0, limit);

            for (const cand of topCands) {
                for (const dist of GEM_DISTS) {
                    const alloc = currentPool.allocate(dist);
                    if (alloc) {
                        const r = calculateStats({ ...dragon, accPct: cand.acc, spiritStats: cand.spStats, pendantPct: cand.pd.pct, collection: tarSettings.collection, potion: dragon.potion, nerfKey: dragon.nerfKey }, alloc.gems, cand.ench);
                        if (r.score > globalMaxScore) {
                            globalMaxScore = r.score;
                            bestDragonIdx = idx;
                            bestDragonRes = { ...r, dragonIdx: idx, dragon: dragon, acc: cand.acc, sp: cand.sp, pd: cand.pd, gems: alloc.gems, enchName: cand.ench ? (cand.ench === 'hp' ? '(체)' : cand.ench === 'atk' ? '(공)' : '(방)') : '' };
                            bestDist = dist;
                        }
                        currentPool.restore(alloc.rollback);
                    }
                }
            }
        }

        if (bestDragonRes) {
            totalScore += globalMaxScore;
            const dKey = `${normalizeType(bestDragonRes.dragon.typ)}|${bestDragonRes.dragon.buff}`;
            const denom = TAR_DENOM[dKey] || 1000000000;
            const safeSpInput = (bestDragonRes.sp && bestDragonRes.sp.input) ? bestDragonRes.sp.input : [];
            const safePdPct = (bestDragonRes.pd && bestDragonRes.pd.pct) ? bestDragonRes.pd.pct : { hp: 0, atk: 0, def: 0 };

            finalComb[filledCount] = {
                ...bestDragonRes,
                dist: bestDist,
                tar: calculateTar(bestDragonRes.score, denom),
                gemString: formatGemString(bestDragonRes.gems, lang),
                accName: bestDragonRes.acc.id === 'none' ? (lang === 'en' ? 'None' : '없음') : `${translateAcc(bestDragonRes.acc.name, lang)} ${bestDragonRes.acc.lv}`,
                spString: formatSpirit(safeSpInput, lang),
                pndString: `${Math.round(safePdPct.hp * 100)}/${Math.round(safePdPct.atk * 100)}/${Math.round(safePdPct.def * 100)}`
            };
            filledCount++;
            bestDragonRes.gems.forEach(g => {
                const sIdx = g.stat === '체' ? 0 : g.stat === '공' ? 1 : 2;
                currentPool.counts[sIdx][40 - g.val]--;
            });
            if (bestDragonRes.acc.id !== 'none') currentAccs = currentAccs.filter(a => a.id !== bestDragonRes.acc.id);
            if (bestDragonRes.sp.id !== 'none') currentSpirits = currentSpirits.filter(s => s.id !== bestDragonRes.sp.id);
            if (bestDragonRes.pd.id !== 'none') currentPendants = currentPendants.filter(p => p.id !== bestDragonRes.pd.id);
            activeIndices = activeIndices.filter(idx => idx !== bestDragonIdx);
        } else { break; }
    }
    return { totalScore, combination: finalComb };
}

async function* optimizeAverageMode(dragons, gemData, inv, tarSettings, limit = 3000, lang = 'ko') {
    const gemPoolMaster = new GemPool(gemData);
    const activeIndices = dragons.map((d, i) => d.use ? i : -1).filter(i => i !== -1);
    if (activeIndices.length === 0) { yield { totalScore: 0, combination: [], warning: "No dragon" }; return; }

    let targetGroups = activeIndices.length > 3 ? getCombinations(activeIndices, 3) : [activeIndices];
    let globalBestScore = -1; let globalBestSelection = null;

    const availableAccs = (inv.accessories && inv.accessories.length > 0) ? inv.accessories.filter(a => a.use) : [];
    const availableSpirits = (inv.spirits && inv.spirits.length > 0) ? inv.spirits.filter(s=>s.use) : [];
    const availablePendants = (inv.pendants && inv.pendants.length > 0) ? inv.pendants.filter(p=>p.use) : [];
    const emptyAcc = { hp: 0, atk: 0, def: 0, name: "없음", lv: 0, id: "none", enchants: { hp: false, atk: false, def: false } };
    const emptySpirit = { input: [], id: "none" };
    const emptyPendant = { pct: { hp: 0, atk: 0, def: 0 }, id: "none" };
    const accsToTry = [...availableAccs, emptyAcc];

    for (const groupIndices of targetGroups) {
        const candidatesPerSlot = [];
        for (const idx of groupIndices) {
            const dragon = dragons[idx];
            const cands = [];
            let spiritsToUse = [...availableSpirits];
            if (dragon.boundSpirit && dragon.boundSpirit.use) spiritsToUse.unshift(dragon.boundSpirit);
            spiritsToUse.push(emptySpirit);
            let pendantsToUse = [...availablePendants];
            pendantsToUse.push(emptyPendant);

            let loopCnt = 0;
            for (const acc of accsToTry) {
                const enchs = acc.id === 'none' ? [null] : (Object.keys(acc.enchants).filter(k => acc.enchants[k]) || [null]);
                for (const sp of spiritsToUse) {
                    for (const pd of pendantsToUse) {
                        for (const ench of enchs) {
                            if (++loopCnt % 2000 === 0) await new Promise(r => setTimeout(r, 0));
                            const spInput = sp && sp.input ? sp.input : [];
                            const pdPct = pd && pd.pct ? pd.pct : { hp: 0, atk: 0, def: 0 };
                            const stats = calculateStats({ ...dragon, accPct: acc, spiritStats: convertSpiritToStats(spInput), pendantPct: pdPct, collection: tarSettings.collection, potion: dragon.potion, nerfKey: dragon.nerfKey }, [{ stat: '체', val: 40 }, { stat: '체', val: 40 }, { stat: '공', val: 40 }, { stat: '공', val: 40 }, { stat: '방', val: 40 }], ench);
                            cands.push({ dragon, acc, sp, pd, ench, approxScore: stats.score, spStats: convertSpiritToStats(spInput) });
                        }
                    }
                }
            }
            cands.sort((a, b) => b.approxScore - a.approxScore);
            const topCands = limit === Infinity ? cands : cands.slice(0, limit);
            if (limit !== Infinity) {
                const fallback = cands.find(c => c.pd.id === 'none');
                if (fallback && !topCands.includes(fallback)) topCands.push(fallback);
            }
            candidatesPerSlot.push(topCands);
        }

        let groupBestScore = -1; let groupBestRes = null;
        let stack = [{ slotIdx: 0, usedIds: new Set(), currentPool: gemPoolMaster.clone(), currentRes: [] }];
        let stackIter = 0;
        let timeLimit = limit === 1000 ? 60000 : 180000;
        const stackStartTime = Date.now();

        while (stack.length > 0) {
            if (++stackIter % 500 === 0) await new Promise(r => setTimeout(r, 0));
            if (Date.now() - stackStartTime > timeLimit) break;

            const { slotIdx, usedIds, currentPool, currentRes } = stack.pop();
            if (slotIdx === groupIndices.length) {
                const total = currentRes.reduce((s, r) => s + r.score, 0);
                if (total > groupBestScore) { groupBestScore = total; groupBestRes = [...currentRes]; }
                continue;
            }
            const candidates = candidatesPerSlot[slotIdx];
            for (let i = candidates.length - 1; i >= 0; i--) {
                const cand = candidates[i];
                if ((cand.acc.id !== 'none' && usedIds.has(cand.acc.id)) || (cand.sp.id !== 'none' && usedIds.has(cand.sp.id)) || (cand.pd.id !== 'none' && usedIds.has(cand.pd.id))) continue;

                let bestDist = [0, 0, 0]; let bestS = -1; let bestAlloc = null;
                for (const dist of GEM_DISTS) {
                    const alloc = currentPool.allocate(dist);
                    if (alloc) {
                        const r = calculateStats({ ...cand.dragon, accPct: cand.acc, spiritStats: cand.spStats, pendantPct: cand.pd.pct, collection: tarSettings.collection, potion: cand.dragon.potion, nerfKey: cand.dragon.nerfKey }, alloc.gems, cand.ench);
                        if (r.score > bestS) { bestS = r.score; bestDist = dist; bestAlloc = alloc; }
                        currentPool.restore(alloc.rollback);
                    }
                }

                if (bestAlloc) {
                    const nextUsed = new Set(usedIds);
                    if (cand.acc.id !== 'none') nextUsed.add(cand.acc.id);
                    if (cand.sp.id !== 'none') nextUsed.add(cand.sp.id);
                    if (cand.pd.id !== 'none') nextUsed.add(cand.pd.id);
                    const nextPool = currentPool.clone();
                    nextPool.allocate(bestDist);
                    stack.push({ slotIdx: slotIdx + 1, usedIds: nextUsed, currentPool: nextPool, currentRes: [...currentRes, { ...calculateStats({ ...cand.dragon, accPct: cand.acc, spiritStats: cand.spStats, pendantPct: cand.pd.pct, collection: tarSettings.collection, potion: cand.dragon.potion, nerfKey: cand.dragon.nerfKey }, bestAlloc.gems, cand.ench), dragonIdx: groupIndices[slotIdx], dragon: cand.dragon, acc: cand.acc, sp: cand.sp, pd: cand.pd, gems: bestAlloc.gems, dist: bestDist, enchName: cand.ench ? (cand.ench === 'hp' ? '(체)' : cand.ench === 'atk' ? '(공)' : '(방)') : '' }] });
                }
            }
        }
        if (groupBestScore > globalBestScore) { globalBestScore = groupBestScore; globalBestSelection = groupBestRes; }
    }

    if (!globalBestSelection) { yield { combination: [], warning: "Combination failed" }; return; }

    const finalComb = [null, null, null];
    globalBestSelection.forEach((item, idx) => {
        if (idx >= 3) return;
        const dKey = `${normalizeType(item.dragon.typ)}|${item.dragon.buff}`;
        const denom = TAR_DENOM[dKey] || 1000000000;
        const safeSpInput = (item.sp && item.sp.input) ? item.sp.input : [];
        const safePdPct = (item.pd && item.pd.pct) ? item.pd.pct : { hp: 0, atk: 0, def: 0 };

        finalComb[idx] = {
            ...item,
            dist: item.dist,
            tar: calculateTar(item.score, denom),
            gemString: formatGemString(item.gems, lang),
            accName: item.acc.id === 'none' ? (lang === 'en' ? 'None' : '없음') : `${translateAcc(item.acc.name, lang)} ${item.acc.lv}`,
            spString: formatSpirit(safeSpInput, lang),
            pndString: `${Math.round(safePdPct.hp * 100)}/${Math.round(safePdPct.atk * 100)}/${Math.round(safePdPct.def * 100)}`
        };
    });
    yield { totalScore: globalBestScore, avgScore: globalBestScore / 3, avgTar: finalComb.reduce((a, b) => a + (b ? b.tar : 0), 0) / 3, combination: finalComb };
}

function createDefaultDragon(id) { return { id, typ: "체", grade: "9.0", buff: "HP40%", use: true, nerfKey: "너프 없음", potion: { hp: 24, atk: 6, def: 6 }, potionName: "기본(크/회/자)", boundSpirit: { use: false, id: `bound_sp_${id}`, input: [{ stat: "체력", type: "%" }, { stat: "공격력", type: "%" }, { stat: "방어력", type: "%" }, { stat: "방어력", type: "+" }, { stat: "체력", type: "+" }] } }; }
function createDefaultSpirit(id) { return { id: `sp_${id}_${Math.random()}`, input: [{ stat: "체력", type: "%" }, { stat: "공격력", type: "%" }, { stat: "방어력", type: "%" }, { stat: "방어력", type: "+" }, { stat: "체력", type: "+" }], use: true }; }
function createDefaultPendant(id) { return { id: `pd_${id}_${Math.random()}`, pct: { hp: 0, atk: 0, def: 0 }, use: true }; }

export default function Home() {
    const [gems, setGems] = useState({});
    const [lang, setLang] = useState("ko");
    const [dragons, setDragons] = useState(Array(3).fill(null).map((_, i) => createDefaultDragon(i)));
    const [spirits, setSpirits] = useState(() => [createDefaultSpirit(0), createDefaultSpirit(1), createDefaultSpirit(2)]);
    const [pendants, setPendants] = useState(() => [createDefaultPendant(0), createDefaultPendant(1), createDefaultPendant(2)]);
    const [accInv, setAccInv] = useState(ACCESSORY_DB_EXPANDED);
    const [tarSettings, setTarSettings] = useState({ collection: { hp: 240, atk: 60, def: 60 } });
    
    const [currentSlot, setCurrentSlot] = useState(1);
    const [calcMode, setCalcMode] = useState("avg");
    const [precMode, setPrecMode] = useState(3000);
    const [showNoBuff, setShowNoBuff] = useState(false);

    const [result, setResult] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    const [rankings, setRankings] = useState([]);
    const [showRankModal, setShowRankModal] = useState(false);
    const [selectedRankDetail, setSelectedRankDetail] = useState(null);

    useEffect(() => {
        try { const s = localStorage.getItem('my_gems'); if(s) setGems(JSON.parse(s)); } catch(e){}
        fetch('/api/rank').then(r=>r.json()).then(setRankings).catch(()=>{});
    }, []);
    
    const groupedAccs = useMemo(() => {
        const g = {}; accInv.forEach(a => { if(!g[a.lv]) g[a.lv] = []; g[a.lv].push(a); });
        return Object.entries(g).sort((a,b)=>Number(b[0])-Number(a[0])); 
    }, [accInv]);

    const gemCounts = useMemo(() => {
        const c = { 체:0, 공:0, 방:0 };
        Object.entries(gems).forEach(([k, v]) => { const parts = k.split('_'); if(parts.length < 2) return; let type = parts[0]; if(type==='HP') type='체'; if(type==='ATK') type='공'; if(type==='DEF') type='방'; if(c[type] !== undefined) c[type] += Number(v); });
        return c;
    }, [gems]);

    const t = (k) => {
        const dict = {
            ko: { title: "⚔️ 길드전 셋팅 계산기 v21.3", env: "📅 환경 설정", col: "컬렉션", gem: "💎 젬 인벤토리", sp: "👻 공용 정령", pd: "🔮 펜던트", acc: "💍 장신구 인벤토리", calc: "🚀 통합 최적화 시작", loading: "⏳ 계산 중...", save: "저장", load: "불러오기", add: "+ 추가", reset: "초기화", total: "총합 비벨", avg: "평균 비벨", tar: "평균 TAR", bound: "🔒 귀속 정령", potion: "물약", nerf: "너프", all: "전체", off: "해제", lv: "레벨", toggle_buff: "버프 제외 수치 보기", reset_all: "⚠️ 데이터 초기화",
            mode_avg: "⚖️ 평균 모드", mode_focus: "👑 몰아주기", prec_sfast: "🚀 초신속(1천)", prec_fast: "⚡ 신속(3천)", prec_mid: "⚖️ 중간(5천)", prec_high: "🎯 정확(5만)", prec_all: "♾️ 전수(무제한)" },
            en: { title: "⚔️ Guild War Calculator v21.3", env: "📅 Settings", col: "Collection", gem: "💎 Gems", sp: "👻 Spirits", pd: "🔮 Pendants", acc: "💍 Accessories", calc: "🚀 Optimize", loading: "⏳ Calculating...", save: "Save", load: "Load", add: "+ Add", reset: "Reset", total: "Total Score", avg: "Avg Score", tar: "Avg TAR", bound: "🔒 Bound Spirit", potion: "Potion", nerf: "Nerf", all: "All", off: "Off", lv: "Lv", toggle_buff: "View Stats without Buffs", reset_all: "⚠️ Reset Data",
            mode_avg: "⚖️ Average", mode_focus: "👑 Focus", prec_sfast: "🚀 S-Fast", prec_fast: "⚡ Fast", prec_mid: "⚖️ Mid", prec_high: "🎯 High", prec_all: "♾️ All" }
        };
        return dict[lang][k];
    };
    
    const handleCalc = async () => {
        setIsCalculating(true); setResult(null); setTimer(0);
        const timerId = setInterval(() => setTimer(t => t + 0.1), 100);
        try {
            if (calcMode === 'focus') {
                const res = await optimizeFocusMode(dragons, gems, { accessories: accInv, spirits, pendants }, tarSettings, precMode, lang);
                setResult(res);
            } else {
                const gen = optimizeAverageMode(dragons, gems, { accessories: accInv, spirits, pendants }, tarSettings, precMode, 'ko');
                for await (const res of gen) { setResult(res); }
            }
        } catch (e) { console.error(e); alert("Error: " + e.message); } finally { 
            clearInterval(timerId); setIsCalculating(false); 
        }
    };

    const updateServer = (newRankings) => {
        setRankings(newRankings);
        fetch('/api/rank', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newRankings)
        }).catch(()=>{});
    };

const exportResult = async () => {
        if(!result) return;
        const nickname = prompt("해당 결과를 내보내시겠습니까?\n닉네임을 입력해주세요.");
        if(!nickname) return;

        const avgScore = Math.round(result.totalScore / 3);
        const avgTar = result.combination.reduce((a, b) => a + b.tar, 0) / 3;
        const totalBuffs = result.combination.reduce((sum, item) => sum + getBuffWeight(item.dragon.buff), 0);

        const newRank = { 
            nickname, 
            totalScore: result.totalScore, 
            avgScore, 
            avgTar, 
            totalBuffs,
            combination: result.combination, 
            date: new Date().toLocaleString() 
        };
        
        try {
            // [핵심 변경] 저장하기 직전에 서버에서 가장 최신 데이터를 다시 불러옵니다!
            const res = await fetch('/api/rank');
            const latestRankings = await res.json();
            
            // 불러온 최신 데이터에 내 기록을 추가합니다.
            let nextRanks = [...(Array.isArray(latestRankings) ? latestRankings : [])];
            const existingIndex = nextRanks.findIndex(r => r.nickname === nickname);
            
            if (existingIndex !== -1) {
                if(!confirm("이미 등록된 닉네임입니다. 덮어씌우시겠습니까?")) return;
                nextRanks[existingIndex] = newRank; // 기존 닉네임 업데이트
            } else {
                nextRanks.push(newRank); // 새 닉네임 추가
            }
            
            // 점수 순으로 정렬
            nextRanks.sort((a,b) => b.totalScore - a.totalScore);
            
            // 화면과 서버에 동시에 업데이트
            setRankings(nextRanks);
            await fetch('/api/rank', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(nextRanks)
            });
            
            alert("순위표에 안전하게 등록되었습니다.");
        } catch (error) {
            alert("순위표 등록 중 오류가 발생했습니다.");
        }
    };

    const openRankings = () => {
        const pw = prompt("비밀번호를 입력하세요.");
        if(pw === "5454") setShowRankModal(true);
        else alert("비밀번호가 틀렸습니다.");
    };

    const deleteRanking = (index) => {
        if(!confirm("이 기록을 삭제하시겠습니까?")) return;
        const nextRanks = rankings.filter((_, i) => i !== index);
        updateServer(nextRanks);
    };

    const clearRankings = () => {
        if(!confirm("정말로 모든 순위표 데이터를 삭제하시겠습니까?")) return;
        updateServer([]);
    };

    const savePreset = (slot) => { if(confirm(`${slot} Save?`)) { const data = { dragons, spirits, pendants, accInv, tarSettings }; localStorage.setItem(`gw_preset_${slot}`, JSON.stringify(data)); alert("Saved."); } };
    const loadPreset = (slot) => { if(confirm(`${slot} Load?`)) { const d = localStorage.getItem(`gw_preset_${slot}`); if(d) { const p = JSON.parse(d); if(p.dragons) setDragons(p.dragons); if(p.spirits) setSpirits(p.spirits); if(p.pendants) setPendants(p.pendants); if(p.accInv) setAccInv(p.accInv); if(p.tarSettings) setTarSettings(p.tarSettings); } else { alert("No Data."); } } };

    const resetAllData = () => {
        if (confirm("정말로 모든 데이터를 초기화하시겠습니까? (저장된 프리셋 포함)")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const onGemChange = (s, v, c) => {
        const next = { ...gems, [`${s}_${v}`]: Number(c) };
        setGems(next); localStorage.setItem('my_gems', JSON.stringify(next));
    };

    const updateDragon = (idx, field, val) => { const n = [...dragons]; n[idx][field] = val; if(field==='potionName') n[idx].potion = POTION_DB[val]; setDragons(n); };
    const toggleAcc = (id) => setAccInv(accInv.map(a => a.id === id ? { ...a, use: !a.use } : a));
    const toggleEnchant = (id, type) => setAccInv(accInv.map(a => a.id === id ? { ...a, enchants: { ...a.enchants, [type]: !a.enchants[type] } } : a));
    const toggleLevel = (lv, use) => setAccInv(accInv.map(a => a.lv === Number(lv) ? { ...a, use } : a));
    const addDragon = () => setDragons([...dragons, createDefaultDragon(dragons.length)]);
    const removeDragon = (idx) => setDragons(dragons.filter((_, i) => i !== idx));

    return (
        <main className="min-h-screen bg-[#0b0f19] text-slate-100 p-2 font-sans select-none pb-20">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm bg-slate-800 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition inline-block mb-2">
                        ← 메인으로
                    </Link>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('title')}</h1>
                    <button onClick={openRankings} className="bg-amber-600 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-amber-500 transition shadow-lg">🏆 비벨 순위표 보기</button>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button onClick={()=>setLang(lang==='ko'?'en':'ko')} className="text-xs bg-slate-700 px-2 py-1 rounded text-white hover:bg-slate-600">{lang==='ko'?'🇺🇸 English':'🇰🇷 한국어'}</button>
                    <div className="flex flex-wrap gap-1 items-center bg-[#1b1f2b] p-2 rounded-lg border border-slate-700 max-w-[300px] justify-center">{[1,2,3,4,5,6,7,8,9,10].map(num => (<button key={num} onClick={() => setCurrentSlot(num)} className={`w-6 h-6 rounded text-xs font-bold ${currentSlot === num ? 'bg-indigo-500 text-white' : 'bg-[#111827] text-slate-500'}`}>{num}</button>))}<div className="w-full h-1"></div><button onClick={() => savePreset(currentSlot)} className="text-xs bg-green-600 px-2 py-1 rounded text-white">{t('save')}</button><button onClick={() => loadPreset(currentSlot)} className="text-xs bg-slate-600 px-2 py-1 rounded text-white">{t('load')}</button><button onClick={resetAllData} className="text-xs bg-red-600 px-2 py-1 rounded text-white ml-1">{t('reset_all')}</button></div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto bg-[#1b1f2b] p-3 rounded-xl border border-slate-700 mb-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4"><div className="text-sm font-bold text-yellow-400">{t('env')}</div><select className="bg-[#111827] text-white text-sm p-1 rounded" value={tarSettings.type} onChange={e=>setTarSettings({...tarSettings, type:e.target.value})}>{DRAGON_TYPES.map(t=><option key={t}>{lang==='en'?t.replace('체','HP').replace('공','ATK').replace('방','DEF').replace('H/A','H/A').replace('H/D','H/D').replace('A/D','A/D'):t}</option>)}</select><select className="bg-[#111827] text-white text-sm p-1 rounded" value={tarSettings.buff} onChange={e=>setTarSettings({...tarSettings, buff:e.target.value})}>{TAR_BUFFS.map(b=><option key={b}>{b}</option>)}</select></div>
                <div className="flex items-center gap-2 bg-[#111827] px-2 py-1 rounded border border-slate-600"><span className="text-[10px] text-gray-400">{t('col')}</span><div className="flex items-center gap-1"><span className="text-[10px] text-red-400">HP</span><input type="number" className="w-10 bg-transparent text-white text-[10px] text-right" value={tarSettings.collection.hp} onChange={e=>setTarSettings({...tarSettings, collection:{...tarSettings.collection, hp:Number(e.target.value)}})} /></div><div className="flex items-center gap-1"><span className="text-[10px] text-blue-400">ATK</span><input type="number" className="w-8 bg-transparent text-white text-[10px] text-right" value={tarSettings.collection.atk} onChange={e=>setTarSettings({...tarSettings, collection:{...tarSettings.collection, atk:Number(e.target.value)}})} /></div><div className="flex items-center gap-1"><span className="text-[10px] text-green-400">DEF</span><input type="number" className="w-8 bg-transparent text-white text-[10px] text-right" value={tarSettings.collection.def} onChange={e=>setTarSettings({...tarSettings, collection:{...tarSettings.collection, def:Number(e.target.value)}})} /></div></div>
                <button onClick={addDragon} className="text-xs bg-blue-600 px-3 py-1.5 rounded text-white font-bold">{t('add')} Dragon</button>
            </div>

            <div className="max-w-[1600px] mx-auto bg-[#1b1f2b] p-3 rounded-xl border border-slate-700 mb-4 flex flex-wrap gap-4 items-center justify-center">
                <div className="flex gap-2">
                    <button onClick={()=>setCalcMode('focus')} className={`px-4 py-2 rounded text-sm font-bold ${calcMode==='focus'?'bg-yellow-600 text-white':'bg-slate-700 text-slate-400'}`}>{t('mode_focus')}</button>
                    <button onClick={()=>setCalcMode('avg')} className={`px-4 py-2 rounded text-sm font-bold ${calcMode==='avg'?'bg-indigo-600 text-white':'bg-slate-700 text-slate-400'}`}>{t('mode_avg')}</button>
                </div>
                <div className="w-[1px] h-8 bg-slate-600"></div>
                <div className="flex gap-1">
                    <button onClick={()=>setPrecMode(1000)} className={`px-2 py-1 rounded text-xs ${precMode===1000?'bg-cyan-600 text-white':'bg-slate-700 text-slate-400'}`}>{t('prec_sfast')}</button>
                    <button onClick={()=>setPrecMode(3000)} className={`px-2 py-1 rounded text-xs ${precMode===3000?'bg-green-600 text-white':'bg-slate-700 text-slate-400'}`}>{t('prec_fast')}</button>
                    <button onClick={()=>setPrecMode(5000)} className={`px-2 py-1 rounded text-xs ${precMode===5000?'bg-blue-600 text-white':'bg-slate-700 text-slate-400'}`}>{t('prec_mid')}</button>
                    <button onClick={()=>setPrecMode(50000)} className={`px-2 py-1 rounded text-xs ${precMode===50000?'bg-purple-600 text-white':'bg-slate-700 text-slate-400'}`}>{t('prec_high')}</button>
                    <button onClick={()=>setPrecMode(Infinity)} className={`px-2 py-1 rounded text-xs ${precMode===Infinity?'bg-red-600 text-white':'bg-slate-700 text-slate-400'}`}>{t('prec_all')}</button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-3 space-y-3">
                    {dragons.map((d, i) => (
                        <div key={i} className="bg-[#1b1f2b] p-3 rounded-xl border border-slate-700 relative"><button onClick={()=>removeDragon(i)} className="absolute top-2 right-2 text-red-500 text-[10px]">🗑️</button><div className="flex justify-between mb-2 font-bold text-indigo-400 text-sm">{t('dragon')} {i+1}<input type="checkbox" checked={d.use} onChange={e=>{const n=[...dragons];n[i].use=e.target.checked;setDragons(n)}} className="ml-2"/></div><div className="space-y-1 mb-2"><div className="flex gap-1 mb-1"><select className="bg-[#111827] text-xs p-1 rounded w-full" value={d.typ} onChange={e=>updateDragon(i, 'typ', e.target.value)}>{DRAGON_TYPES.map(t=><option key={t}>{lang==='en'?t.replace('체','HP').replace('공','ATK').replace('방','DEF').replace('H/A','H/A').replace('H/D','H/D').replace('A/D','A/D'):t}</option>)}</select><select className="bg-[#111827] text-xs p-1 rounded w-full" value={d.grade} onChange={e=>updateDragon(i, 'grade', e.target.value)} disabled={d.typ.includes("(진각)")}>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div><div className="flex gap-1 mb-1"><select className="bg-[#111827] text-xs p-1 rounded w-full text-green-400" value={d.buff} onChange={e=>updateDragon(i, 'buff', e.target.value)}>{Object.keys(BUFFS_DB).map(b=><option key={b}>{b}</option>)}</select><select className="bg-[#111827] text-xs p-1 rounded w-full text-red-400" value={d.nerfKey} onChange={e=>updateDragon(i, 'nerfKey', e.target.value)}>{ALL_NERFS.map(n=><option key={n} value={n}>{n==='너프 없음'&&lang==='en'?'No Nerf':n}</option>)}</select></div><select className="bg-[#111827] text-xs p-1 rounded w-full text-pink-300" value={d.potionName} onChange={e=>updateDragon(i, 'potionName', e.target.value)}>{POTION_KEYS.map(p=><option key={p} value={p}>{lang==='en'?p.replace('기본(크/회/자)', 'Crit/Eva/Tonic').replace('단계','Lv').replace('체력','HP').replace('공격력','ATK').replace('방어력','DEF'):p}</option>)}</select></div><div className="bg-[#111827] p-2 rounded mt-2"><div className="flex justify-between items-center mb-1"><span className="text-[10px] text-pink-400 font-bold">{t('bound')}</span><input type="checkbox" checked={d.boundSpirit.use} onChange={()=>{const n=[...dragons];n[i].boundSpirit.use=!n[i].boundSpirit.use;setDragons(n)}} /></div>{d.boundSpirit.use && <div className="space-y-0.5">{d.boundSpirit.input.map((r, ri) => (<div key={ri} className="flex gap-1"><select className="bg-[#252a37] text-[8px] p-0.5 rounded flex-1" value={r?.stat || '체력'} onChange={e=>{const n=[...dragons];if(n[i].boundSpirit.input[ri]) n[i].boundSpirit.input[ri].stat=e.target.value;setDragons(n)}}>{ri<4?SPIRIT_STATS.map(t=><option key={t}>{lang==='en'?t.replace('체력','HP').replace('공격력','ATK').replace('방어력','DEF'):t}</option>):["체력40","공격력10","방어력10"].map(t=><option key={t}>{t}</option>)}</select>{ri < 4 && <select className="bg-[#252a37] text-[8px] p-0.5 rounded w-8" value={r?.type || '%'} onChange={e=>{const n=[...dragons];if(n[i].boundSpirit.input[ri]) n[i].boundSpirit.input[ri].type=e.target.value;setDragons(n)}}>{SPIRIT_MODES.map(t=><option key={t}>{t}</option>)}</select>}</div>))}</div>}</div></div>
                    ))}
                </div>

                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-[#1b1f2b] p-3 rounded-xl border border-slate-700"><div className="flex justify-between items-center mb-2"><div className="text-xs font-bold text-slate-400">{t('gem')}</div><div className="flex gap-3 text-[10px]"><span className={gemCounts.체 > 15 ? "text-red-500" : "text-indigo-400"}>HP {gemCounts.체}/15</span><span className={gemCounts.공 > 15 ? "text-red-500" : "text-indigo-400"}>ATK {gemCounts.공}/15</span><span className={gemCounts.방 > 15 ? "text-red-500" : "text-indigo-400"}>DEF {gemCounts.방}/15</span></div></div><div className="grid grid-cols-7 gap-1">{GEM_VALUES.map(v => (<div key={v} className="flex flex-col gap-1"><span className="text-[9px] text-center text-slate-600">{v}</span>{GEM_STATS.map(s => (<input key={s} type="number" className="bg-[#111827] text-center text-[9px] p-1 rounded outline-none" placeholder={lang==='en'?(s==='체'?'HP':s==='공'?'ATK':'DEF'):s} value={gems[`${s==='HP'||s==='체'?'체':s==='ATK'||s==='공'?'공':'방'}_${v}`]||''} onChange={e=>onGemChange(s,v,e.target.value)}/>))}</div>))}</div></div>
                    
                    {/* 정령 UI */}
                    <div className="bg-[#1b1f2b] p-3 rounded-xl border border-slate-700"><div className="flex justify-between mb-2"><span className="text-xs font-bold text-green-400">{t('sp')}</span><button onClick={()=>setSpirits([...spirits, createDefaultSpirit(Date.now())])} className="text-[10px] bg-slate-700 px-2 rounded">{t('add')}</button></div><div className="h-40 overflow-y-auto space-y-1 custom-scrollbar">{spirits.map((s, i) => (<div key={s.id} className="bg-[#252a37] p-1 rounded flex gap-0.5 items-center"><span className="text-[9px] w-3">{i+1}</span>{s.input.map((r, ri) => (<div key={ri} className="flex-1"><select className={`w-full bg-[#111827] text-[8px] p-0.5 rounded ${ri===4?'text-yellow-500':''}`} value={r?.stat || '체력'} onChange={e=>{const n=[...spirits];if(n[i].input[ri]) n[i].input[ri].stat=e.target.value;setSpirits(n)}}>{ri<4?SPIRIT_STATS.map(t=><option key={t}>{lang==='en'?t.replace('체력','HP').replace('공격력','ATK').replace('방어력','DEF'):t}</option>):["체력40","공격력10","방어력10"].map(t=><option key={t}>{t}</option>)}</select>{ri < 4 && <select className="w-full bg-[#111827] text-[8px] p-0.5 rounded text-center mt-0.5" value={r?.type || '%'} onChange={e=>{const n=[...spirits];if(n[i].input[ri]) n[i].input[ri].type=e.target.value;setSpirits(n)}}>{SPIRIT_MODES.map(t=><option key={t}>{t}</option>)}</select>}</div>))}<button onClick={()=>setSpirits(spirits.filter((_,x)=>x!==i))} className="text-red-500 text-[10px] px-1">x</button></div>))}</div></div>
                    
                    {/* 펜던트 UI */}
                    <div className="bg-[#1b1f2b] p-3 rounded-xl border border-slate-700"><div className="flex justify-between mb-2"><span className="text-xs font-bold text-pink-400">{t('pd')}</span><button onClick={()=>setPendants([...pendants, createDefaultPendant(Date.now())])} className="text-[10px] bg-slate-700 px-2 rounded">{t('add')}</button></div><div className="h-32 overflow-y-auto space-y-1 custom-scrollbar">{pendants.map((p, i) => (<div key={p.id} className="bg-[#252a37] p-1 rounded flex gap-1 items-center"><span className="text-[9px] w-3">{i+1}</span>{['hp','atk','def'].map(k => (<div key={k} className="flex-1 flex items-center bg-[#111827] rounded px-1"><span className={`text-[8px] mr-1 ${k==='hp'?'text-red-400':k==='atk'?'text-blue-400':'text-green-400'}`}>{k.toUpperCase()}</span><input type="number" className="w-full bg-transparent text-[10px] text-right outline-none" value={p.pct[k]*100} onChange={e=>{const n=[...pendants];n[i].pct[k]=Number(e.target.value)/100;setPendants(n)}}/></div>))}<button onClick={()=>setPendants(pendants.filter((_,x)=>x!==i))} className="text-red-500 text-[10px] px-1">x</button></div>))}</div></div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    {/* 장신구 UI */}
                    <div className="bg-[#1b1f2b] p-3 rounded-xl border border-slate-700 h-[400px] flex flex-col"><div className="text-xs font-bold text-slate-300 mb-2">{t('acc')}</div><div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">{groupedAccs.map(([lv, list]) => (<details key={lv} className="group bg-[#111827] rounded border border-slate-800"><summary className="flex justify-between items-center p-2 bg-[#1e2532] cursor-pointer select-none"><span className="text-[10px] font-bold">{lv} {t('lv')} ({list.length})</span><div className="flex gap-1" onClick={e=>e.preventDefault()}><button onClick={()=>toggleLevel(lv, true)} className="text-[8px] bg-indigo-600 px-1 rounded text-white">{t('all')}</button><button onClick={()=>toggleLevel(lv, false)} className="text-[8px] bg-slate-600 px-1 rounded text-white">{t('off')}</button></div></summary><div className="p-1 space-y-1">{list.map(acc => (<div key={acc.id} className={`p-1 rounded text-[9px] border flex justify-between items-center ${acc.use ? 'bg-indigo-900/50 border-indigo-500' : 'bg-[#1b1f2b] border-slate-700'}`}><div className="flex items-center gap-2 cursor-pointer flex-1" onClick={()=>toggleAcc(acc.id)}><span className={acc.use ? 'text-white' : 'text-slate-500'}>{translateAcc(acc.name, lang)}</span><span className="text-slate-600">#{acc.instanceNum}</span></div><div className="flex gap-1" onClick={e=>e.stopPropagation()}>{['hp','atk','def'].map(s => (<label key={s} className={`flex items-center justify-center w-4 h-4 cursor-pointer rounded ${acc.enchants[s] ? 'bg-slate-600 text-white' : 'bg-slate-900 text-slate-600'}`}><input type="checkbox" className="hidden" checked={acc.enchants[s]} onChange={()=>toggleEnchant(acc.id, s)}/>{s.toUpperCase()[0]}</label>))}</div></div>))}</div></details>))}</div></div>
                    
                    <button onClick={handleCalc} disabled={isCalculating} className={`w-full py-4 rounded-xl shadow-lg font-bold transition-all flex justify-center items-center gap-2 ${isCalculating ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90'}`}>{isCalculating ? (<><span className="animate-spin text-xl">⏳</span><span>{t('loading')} {timer.toFixed(1)}s</span></>) : t('calc')}</button>
                    <div className="bg-[#1b1f2b] p-4 rounded-xl border border-slate-700 min-h-[300px]">
                        {result && (
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex gap-1">
                                    <button onClick={exportResult} className="text-[10px] bg-emerald-600 px-3 py-1 rounded text-white font-bold hover:bg-emerald-500 transition">📤 결과 내보내기</button>
                                </div>
                                <button onClick={() => setShowNoBuff(!showNoBuff)} className={`text-[10px] px-2 py-1 rounded border ${showNoBuff ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-700 border-slate-500 text-slate-300'}`}>{t('toggle_buff')}</button>
                            </div>
                        )}
                        {result && (<><div className="grid grid-cols-3 gap-2 mb-4 border-b border-slate-700 pb-2"><div className="text-center"><div className="text-[10px] text-slate-400">{t('total')}</div><div className="text-sm font-bold text-orange-400">{safeFmt(result.totalScore)}</div></div><div className="text-center"><div className="text-[10px] text-slate-400">{t('avg')}</div><div className="text-sm font-bold text-indigo-400">{safeFmt(Math.round(result.totalScore / (result.combination.filter(x=>x).length||1)))}</div></div><div className="text-center"><div className="text-[10px] text-slate-400">{t('tar')}</div><div className="text-sm font-bold text-cyan-400">{safeFmt((result.combination.reduce((a,b)=>a+(b?b.tar:0),0)/(result.combination.filter(x=>x).length||1)).toFixed(2))}%</div></div></div><div className="space-y-2 h-auto flex flex-col">{result.combination.map((res, i) => res ? (<div key={i} className="bg-[#0f172a] p-3 rounded-lg border border-slate-800"><div className="flex justify-between text-xs font-bold text-indigo-400 mb-1"><span>{t('dragon')} {i+1}</span><span className="text-yellow-400">TAR {safeFmt(res.tar.toFixed(2))}%</span></div><div className="text-lg font-bold text-white mb-1">{safeFmt(res.score)}</div><div className="text-[10px] text-slate-500 mb-2">{res.dragon.typ} / {res.dragon.grade} / {res.dragon.buff}</div><div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono text-slate-300 mb-2"><div className="bg-[#1e293b] rounded">HP {safeFmt(showNoBuff ? (res.final.hp - (res.buffValues?.hp||0)) : res.final.hp)}</div><div className="bg-[#1e293b] rounded">ATK {safeFmt(showNoBuff ? (res.final.atk - (res.buffValues?.atk||0)) : res.final.atk)}</div><div className="bg-[#1e293b] rounded">DEF {safeFmt(showNoBuff ? (res.final.def - (res.buffValues?.def||0)) : res.final.def)}</div></div><div className="text-[9px] text-slate-500 border-t border-slate-800 pt-1 space-y-0.5"><div className="text-cyan-400">💎 <span className="text-white font-bold mr-1">{res.dist ? res.dist.join('/') : ''}</span>{res.gemString}</div><div>💍 {res.accName} <span className="text-indigo-400">{res.enchName}</span></div><div>👻 {res.spString}</div><div>🔮 {res.pndString}</div></div></div>) : null)}</div></>)}</div>
                </div>
            </div>

            {/* 순위표 모달 */}
            {showRankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1b1f2b] w-full max-w-5xl max-h-[80vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-black text-amber-400">🏆 비벨 순위표 (TOP)</h2>
                            <button onClick={()=>setShowRankModal(false)} className="text-slate-500 hover:text-white text-2xl">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <div className="grid grid-cols-12 text-[10px] text-slate-500 font-bold px-4 mb-2 uppercase text-center">
                                <div className="col-span-1">순위</div>
                                <div className="col-span-2 text-left">닉네임</div>
                                <div className="col-span-2">총합 비벨</div>
                                <div className="col-span-2">평균 비벨</div>
                                <div className="col-span-1">평균 TAR</div>
                                <div className="col-span-1">총 벞</div>
                                <div className="col-span-2 text-right">등록일</div>
                                <div className="col-span-1 text-center">삭제</div>
                            </div>
                            {rankings.map((r, idx) => (
                                <div key={idx} onDoubleClick={()=>setSelectedRankDetail(r)} 
                                     className="grid grid-cols-12 items-center bg-[#111827] p-3 rounded-xl border border-slate-800 hover:border-indigo-500 transition cursor-pointer group text-center text-xs">
                                    <div className="col-span-1 font-mono font-bold text-slate-500 group-hover:text-white">{idx+1}</div>
                                    <div className="col-span-2 font-bold text-slate-200 text-left truncate">{r.nickname}</div>
                                    <div className="col-span-2 font-black text-orange-400">{safeFmt(r.totalScore)}</div>
                                    <div className="col-span-2 font-bold text-indigo-400">{safeFmt(r.avgScore)}</div>
                                    <div className="col-span-1 font-bold text-cyan-400">{r.avgTar ? r.avgTar.toFixed(2) : '0.00'}%</div>
                                    <div className="col-span-1 font-bold text-green-400">{r.totalBuffs || 0}벞</div>
                                    <div className="col-span-2 text-right text-[10px] text-slate-600">{r.date}</div>
                                    <div className="col-span-1 text-center">
                                        <button onClick={()=>deleteRanking(idx)} className="text-red-800 hover:text-red-500 font-bold">×</button>
                                    </div>
                                </div>
                            ))}
                            {rankings.length === 0 && <div className="text-center py-10 text-slate-600 font-bold">등록된 데이터가 없습니다.</div>}
                        </div>
                        <div className="p-3 bg-[#111827] rounded-b-2xl border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-600 italic">항목을 더블클릭하면 상세 셋팅을 볼 수 있습니다.</span>
                            <button onClick={clearRankings} className="text-xs text-red-500 hover:text-red-300 font-bold">전체 삭제 🗑️</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 순위표 상세 보기 모달 */}
            {selectedRankDetail && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
                    <div className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-indigo-500/50 shadow-indigo-500/20 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white">{selectedRankDetail.nickname}님의 세팅</h3>
                                <div className="flex gap-3 text-xs mt-1">
                                    <span className="text-orange-400 font-bold">Total: {safeFmt(selectedRankDetail.totalScore)}</span>
                                    <span className="text-green-400 font-bold">Buffs: {selectedRankDetail.totalBuffs || 0}</span>
                                </div>
                            </div>
                            <button onClick={()=>setSelectedRankDetail(null)} className="bg-slate-800 w-8 h-8 rounded-full text-white">×</button>
                        </div>
                        <div className="space-y-4">
                            {selectedRankDetail.combination.map((res, i) => (
                                <div key={i} className="bg-[#1b1f2b] p-4 rounded-xl border border-slate-800">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-indigo-400">#{i+1} {res.dragon.typ} ({res.dragon.buff})</span>
                                        <span className="text-yellow-500">TAR {res.tar.toFixed(2)}%</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-3">
                                        <div className="bg-red-900/20 p-1 rounded text-red-300">H {safeFmt(res.final.hp)}</div>
                                        <div className="bg-blue-900/20 p-1 rounded text-blue-300">A {safeFmt(res.final.atk)}</div>
                                        <div className="bg-green-900/20 p-1 rounded text-green-300">D {safeFmt(res.final.def)}</div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 leading-relaxed">
                                        <div className="text-cyan-400 mb-1">💎 <span className="text-white font-bold">{res.dist ? res.dist.join('/') : ''}</span> {res.gemString}</div>
                                        <div>💍 {res.accName} {res.enchName}</div>
                                        <div>👻 {res.spString}</div>
                                        <div className="text-pink-400">🔮 {res.pndString}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

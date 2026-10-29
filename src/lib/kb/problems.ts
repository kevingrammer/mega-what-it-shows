// Which problems a merged ticket holds. causes.ts sorts by tenant and channel; that misses the
// one-day moves the desk reads in the body (desk-notes.json), which no tenant or channel explains.
// They are their own problem. Like readAs in causes.ts, they stay counted where they are filed and
// are counted again under `shift`, so the desk's numbers keep matching its own view.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'shift'];


export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  // How many of these intake tagged as something else than the problem they belong to.
  mistagged: number;
  // How many of these are also one-day moves, counted again under `shift`.
  shifted: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { total: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  const add = (p: ProblemGroup['problem'], r: Report) => by.set(p, [...(by.get(p) ?? []), r]);
  for (const r of merged) {
    add(causeOf(r, tenantOf(r)) ?? 'unplaced', r);
    if (oneDayMove.includes(r.id)) add('shift', r);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        mistagged: rs.filter((r) => r.meta.intakeTag !== problem).length,
        shifted: problem === 'shift' ? 0 : rs.filter((r) => oneDayMove.includes(r.id)).length,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { total: merged.length, groups };
}

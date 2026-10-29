<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitTicket } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // tickets: problem → link to the ticket that now owns it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.total}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>intake tagged otherwise</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.mistagged}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{tickets[g.problem].split('/').slice(-3).join('/').replace('/issues/', '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.groups as g (g.problem)}
  {#if g.shifted}
    <p class="note">{g.shifted} of the <code>{g.problem}</code> reports are one-day moves: filed under <code>{g.problem}</code> by tenant, counted again under <code>shift</code>.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>

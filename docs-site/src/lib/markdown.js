// ─────────────────────────────────────────────────────────────────
//  "Download this page" — turns whatever is on screen into Markdown.
//
//  Built from the same content modules the page renders, so the file
//  can never drift from the site. For Make it run the export follows
//  the visitor's current selection, then appends the full
//  compatibility table so the file is still useful on its own.
// ─────────────────────────────────────────────────────────────────

import { BRAND_LINKS, WHAT_IT_IS, HOW_IT_WORKS, GUIDE_MAP, FAQ } from '../content/brand.js';
import { LINKS } from './links.js';
import { BOOTH_STEPS, BOOTH_OPERATOR_NOTES } from '../content/boothFlow.js';
import { CRM_STEPS, CRM_ROLE_NOTES } from '../content/crmFlow.js';
import { CAMERA_BRANDS, PRINTER_BRANDS, LEVELS } from '../content/hardware.js';

const HEADER = `> From the HappyPix Field Guide · ${LINKS.docs}\n`;

function list(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function compatibilityTable() {
  const rows = ['| Brand | Model | Status | Sizes / path | Notes |', '| --- | --- | --- | --- | --- |'];
  for (const brand of [...CAMERA_BRANDS, ...PRINTER_BRANDS]) {
    for (const model of brand.models) {
      rows.push(
        `| ${brand.brand} | ${model.model} | ${LEVELS[model.level].label} | ${model.sizes || '—'} | ${model.note.replace(/\|/g, '/')} |`,
      );
    }
  }
  return rows.join('\n');
}

export function pageToMarkdown({ page, setupGuide = null, memberPage = null }) {
  const title = page?.title || memberPage?.title || 'HappyPix Field Guide';
  const out = [`# ${title}`, '', page?.description || memberPage?.description || '', HEADER];

  if (memberPage) {
    out.push(memberPage.overview || memberPage.planningIntro || '', '');
    if (memberPage.modules?.length) {
      out.push('## Middleware, services and utilities', '');
      for (const item of memberPage.modules) {
        out.push(
          `### ${item.name} (${item.kind})`,
          '',
          item.purpose,
          '',
          `- **Sender:** ${item.sender}`,
          `- **Receiver:** ${item.receiver}`,
          '',
        );
      }
    }
    if (memberPage.routes?.length) {
      const esc = (value) => String(value ?? '—').replace(/\|/g, '/');
      const main = memberPage.routes.filter((route) => route.backend !== 'website');
      const website = memberPage.routes.filter((route) => route.backend === 'website');

      out.push(`## API contract (${memberPage.routes.length} endpoints)`, '');
      out.push(
        `${main.length} in the main API, ${website.length} in the website API. ` +
          'Request and response fields are read from the handlers; no source line numbers are included.',
        '',
      );

      const table = (title, routes) => {
        if (!routes.length) return;
        out.push(`### ${title}`, '');
        out.push(
          '| Group | Method | Path | Purpose | Access | Request | Response | Tools |',
          '| --- | --- | --- | --- | --- | --- | --- | --- |',
        );
        // A field is rendered as `name: type` with `!` when the handler
        // rejects the call without it, so the table stays readable while
        // still being a specification rather than a name list.
        const field = (entry) => `${entry.field}: ${entry.type || 'any'}${entry.required ? '!' : ''}`;
        for (const route of routes) {
          const primary = route.response?.payloads?.[0] || {
            status: route.response?.status || 200,
            fields: route.response?.fields || [],
          };
          const request = [
            ...(route.request?.body || []).map((entry) => field(entry)),
            ...(route.request?.query || []).map((entry) => field(entry)),
            ...(route.request?.params || []).map((entry) => `${entry.field}: path`),
          ];
          out.push(
            `| ${esc(route.group)} | ${route.method} | \`${route.path}\` | ${esc(route.purpose)} | ${esc(
              route.permission || (route.guards?.length ? route.guards.join(', ') : 'session'),
            )} | ${request.length ? esc(request.join(', ')) : '—'} | ${esc(
              primary.fields.length
                ? `${primary.status}: ${primary.fields.map((entry) => field(entry)).join(', ')}`
                : '—',
            )} | ${esc((route.tools || []).map((tool) => tool.name).join(', ') || '—')} |`,
          );
        }
        out.push('');
      };

      table('Main API', main);
      table('Website API', website);
    }

    if (memberPage.screens?.length) {
      out.push(`## Platform CRM (${memberPage.screens.length} pages)`, '');
      for (const screen of memberPage.screens) {
        out.push(
          `### ${screen.label} · \`${screen.path}\``,
          '',
          screen.what,
          '',
          `- **Who can open it:** ${
            screen.roles.length
              ? screen.roles
                  .map((role) => `${role}${screen.readOnlyFor?.includes(role) ? ' (read-only)' : ''}`)
                  .join(', ')
              : 'nobody'
          }`,
          `- **Permission:** \`${screen.permission}\``,
          '',
          'How to work with it:',
          ...screen.use.map((line) => `- ${line}`),
          '',
          `What it will not do: ${screen.cant}`,
          '',
          screen.api?.length ? `Backed by: ${screen.api.map((route) => `\`${route}\``).join(', ')}` : '',
          '',
        );
      }
    }

    if (memberPage.entries?.length) {
      out.push(`## Audit log (${memberPage.entries.length} recent entries)`, '');
      out.push(
        '| When | Actor | Action | Entity | Severity | Summary |',
        '| --- | --- | --- | --- | --- | --- |',
      );
      for (const entry of memberPage.entries) {
        const esc = (value) => String(value ?? '—').replace(/\|/g, '/');
        out.push(
          `| ${esc(entry.at)} | ${esc(entry.actorName)} | \`${entry.action}\` | ${esc(
            entry.entity,
          )} | ${esc(entry.severity)} | ${esc(entry.summary)} |`,
        );
      }
      out.push('');
    }

    if (memberPage.models?.length) {
      const fields = memberPage.models.reduce((sum, model) => sum + model.fields.length, 0);
      out.push(`## Models (${memberPage.models.length}, ${fields} fields)`, '');
      for (const model of memberPage.models) {
        out.push(
          `### ${model.name}`,
          '',
          model.summary || '',
          '',
          `- Collection: \`${model.collection || 'default'}\``,
          `- Fields: ${model.fields.length} · indexed: ${model.indexedFields}`,
          model.refs?.length ? `- References: ${model.refs.map((ref) => `\`${ref}\``).join(', ')}` : '',
          '',
          '| Field | Type | Rules | Ref |',
          '| --- | --- | --- | --- |',
        );
        for (const field of model.fields) {
          const esc = (value) => String(value ?? '—').replace(/\|/g, '/');
          const rules = [
            field.required ? 'required' : null,
            field.unique ? 'unique' : null,
            field.indexed ? 'indexed' : null,
            field.enum ? `enum: ${field.enum.join(' \| ')}` : null,
            field.default !== null && field.default !== undefined ? `default: ${field.default}` : null,
            field.min !== null && field.min !== undefined ? `min: ${field.min}` : null,
            field.max !== null && field.max !== undefined ? `max: ${field.max}` : null,
          ]
            .filter(Boolean)
            .join(', ');
          out.push(
            `| \`${field.field}\` | ${esc(field.type)} | ${rules || 'optional'} | ${
              field.ref ? `\`${field.ref}\`` : '—'
            } |`,
          );
        }
        out.push('');
      }
    }
    if (memberPage.tiers?.length) {
      out.push('## Growth stages', '');
      for (const tier of memberPage.tiers) {
        out.push(
          `### ${tier.clients} organisations · ${tier.booths} booths — ${tier.statusLabel}`,
          '',
          tier.summary,
          '',
          `- Cloud + vendors: ${tier.cloudCost}`,
          `- Staffed operations: ${tier.opsCost}`,
          `- One-time onboarding: ${tier.onboarding}`,
          `- Team: ${tier.staff}`,
          `- Trigger: ${tier.trigger}`,
          '',
        );
      }
    }
    if (memberPage.nodes?.length) {
      out.push('## Components', '');
      for (const node of memberPage.nodes) {
        out.push(
          `### ${node.label} (${node.type})`,
          '',
          node.detail,
          '',
          node.fields ? `Fields: ${node.fields.map((f) => `\`${f}\``).join(', ')}` : '',
          '',
        );
      }
    }
    return out.filter(Boolean).join('\n');
  }

  switch (page?.view) {
    case 'brand':
      out.push('## What HappyPix is', '', WHAT_IT_IS.lede, '', ...WHAT_IT_IS.paragraphs, '');
      out.push('## How it works', '');
      for (const item of HOW_IT_WORKS) out.push(`**${item.n} · ${item.title}** — ${item.body}`, '');
      out.push('## Where to go next', '');
      for (const item of GUIDE_MAP) out.push(`- **${item.title}** — ${item.body} _(${item.readThisIf})_`);
      out.push('', '## Frequent questions', '');
      for (const item of FAQ) out.push(`**${item.q}**`, '', item.a, '');
      out.push(
        '## Links',
        '',
        list([
          `Plans — ${BRAND_LINKS.pricing}`,
          `CRM — ${BRAND_LINKS.crm}`,
          `Booth apps — ${BRAND_LINKS.software}`,
        ]),
      );
      break;

    case 'booth':
      out.push('Each screen below is in the order guests meet it.', '');
      BOOTH_STEPS.forEach((step, index) => {
        out.push(
          `## ${index + 1}. ${step.title}`,
          '',
          `_${step.screen} screen · ${step.who === 'operator' ? 'operator' : 'guest'}-facing_`,
          '',
          `**What this is for.** ${step.what}`,
          '',
          step.guests ? `**What guests see.** ${step.guests}\n` : null,
          `**What you control.** ${step.you}`,
          '',
          step.tip ? `> ${step.tip}\n` : null,
        );
      });
      out.push('## Quick fixes', '');
      for (const note of BOOTH_OPERATOR_NOTES) out.push(`**${note.title}**`, '', note.body, '');
      break;

    case 'crm':
      CRM_STEPS.forEach((step, index) => {
        out.push(
          `## ${index + 1}. ${step.title}`,
          '',
          step.nav ? `_${step.nav}_` : '_Sign in_',
          '',
          `**What this is for.** ${step.what}`,
          '',
          `**What you control.** ${step.you}`,
          '',
          step.tip ? `> ${step.tip}\n` : null,
        );
      });
      out.push('## Roles', '');
      for (const role of CRM_ROLE_NOTES)
        out.push(`**${role.role}** — ${role.can} _Give it to: ${role.give}_`, '');
      break;

    case 'setup':
      if (setupGuide) {
        out.push('## Your setup', '');
        out.push(list(setupGuide.chips.map((chip) => `**${chip.label}:** ${chip.value}`)), '');
        if (setupGuide.warnings.length) {
          out.push('### Before you start', '');
          out.push(list(setupGuide.warnings), '');
        }
        setupGuide.sections.forEach((section, index) => {
          out.push(`## ${index + 1}. ${section.title}`, '', section.lede, '');
          section.steps.forEach((step, stepIndex) => {
            out.push(`${stepIndex + 1}. **${step.title}** — ${step.body}`);
          });
          if (section.facts?.length) {
            out.push('', list(section.facts.map(([label, value]) => `**${label}:** ${value}`)));
          }
          out.push('');
        });
      }
      out.push('## Camera and printer compatibility', '', compatibilityTable(), '');
      out.push(
        '**How we label these.** Tested: runs today. Compatible: uses a path we support — confirm on your own unit. Coming soon: being built, do not buy for it yet.',
      );
      break;

    default:
      break;
  }

  return out
    .filter((line) => line !== null && line !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export function slugForDownload(title) {
  return `happypix-${String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.md`;
}

/** Trigger a browser download. Returns false in non-browser contexts. */
export function downloadTextFile(filename, text, type = 'text/markdown;charset=utf-8') {
  if (typeof document === 'undefined' || typeof URL?.createObjectURL !== 'function') return false;
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the click a tick to register before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

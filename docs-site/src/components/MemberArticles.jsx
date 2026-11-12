// ─────────────────────────────────────────────────────────────────
//  Platform-member article renderers.
//
//  Unchanged behaviour — moved out of App.jsx so the shell stays
//  readable. The content itself is delivered by the backend at
//  /api/docs/private and never reaches a public visitor.
// ─────────────────────────────────────────────────────────────────

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Badge, Callout, Section } from './ui.jsx';
import ExcaliCanvas from './ExcaliCanvas.jsx';

export default function MemberArticle({ page }) {
  if (!page) return null;
  if (page.view === 'graph') return <GraphArticle page={page} />;
  if (page.view === 'backrooms') return <BackroomsArticle page={page} />;
  if (page.view === 'schemas') return <SchemaArticle page={page} />;
  if (page.view === 'crm-guide') return <CrmGuideArticle page={page} />;
  if (page.view === 'audit') return <AuditArticle page={page} />;
  if (page.view === 'calculator') return <ScalingArticle page={page} />;
  return <div className="body-copy">{page.description}</div>;
}

function GraphArticle({ page }) {
  const [selected, setSelected] = useState(page.nodes?.[0]?.id);

  useEffect(() => setSelected(page.nodes?.[0]?.id), [page.id]);

  const active = page.nodes?.find((node) => node.id === selected);
  const linked = useMemo(() => {
    if (!active || !page.edges) return [];
    return page.edges
      .filter(([from, to]) => from === active.id || to === active.id)
      .map(([from, to, text]) => ({
        text,
        other: page.nodes.find((node) => node.id === (from === active.id ? to : from)),
      }))
      .filter((edge) => edge.other);
  }, [active, page.edges, page.nodes]);

  return (
    <>
      <div className="graph-head">
        <div>
          <Badge tone="green">INTERACTIVE MAP</Badge>
          <h2>{page.graphHeading}</h2>
          <p>{page.graphHelp}</p>
        </div>
        <div className="graph-legend">
          <span>
            <i className="legend-dot client" /> App
          </span>
          <span>
            <i className="legend-dot service" /> Service
          </span>
          <span>
            <i className="legend-dot data" /> Data
          </span>
        </div>
      </div>

      <ExcaliCanvas
        nodes={page.nodes || []}
        edges={page.edges || []}
        selected={selected}
        onSelect={setSelected}
        label={page.graphHeading}
      />

      {active && (
        <div className="node-detail">
          <div className="node-detail-head">
            <span className="node-bubble">{active.icon || '◈'}</span>
            <div>
              <span className="eyebrow">
                {active.type} · SELECTED · {(page.nodes || []).length} in this map
              </span>
              <h3>{active.label}</h3>
            </div>
          </div>

          <p className="node-detail-body">{active.detail}</p>

          <div className="node-facets">
            {active.owns && (
              <div>
                <span className="eyebrow">WHAT IT OWNS</span>
                <ul>
                  {active.owns.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {active.talks && (
              <div>
                <span className="eyebrow">TALKS TO</span>
                <ul>
                  {active.talks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {active.fails && (
              <div className="node-fails">
                <span className="eyebrow">WHERE IT BREAKS</span>
                <p>{active.fails}</p>
              </div>
            )}
          </div>

          {active.fields && (
            <div className="field-pills">
              {active.fields.map((field) => (
                <code key={field}>{field}</code>
              ))}
            </div>
          )}

          {linked.length > 0 && (
            <div className="node-links">
              <span className="eyebrow">CONNECTIONS</span>
              <div>
                {linked.map((edge) => (
                  <button
                    type="button"
                    key={`${edge.other.id}-${edge.text}`}
                    onClick={() => setSelected(edge.other.id)}
                  >
                    <b>{edge.other.label}</b>
                    <small>{edge.text}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {page.seams && (
        <Section title="The seams that matter" id="seams">
          <p className="body-copy">
            Six decisions shape this system more than any others. Each one is a place where a change is easy
            to make and hard to undo.
          </p>
          <div className="seam-grid">
            {page.seams.map((seam) => (
              <article key={seam.title}>
                <h3>{seam.title}</h3>
                <p>{seam.body}</p>
              </article>
            ))}
          </div>
        </Section>
      )}

      {page.footnote && <p className="fine-print">{page.footnote}</p>}

      {/* On the DB Schema page the canvas is the overview and the
          atlas underneath is the field-level detail, so they are one
          page rather than two. */}
      {page.models && <SchemaArticle page={page} />}
    </>
  );
}

/**
 * Schema atlas — every Mongoose model with its real field metadata,
 * read from the live mongoose schemas by the generator. Types,
 * references, enums, defaults, required/unique/index flags and
 * min/max all come from the schema itself, so this cannot drift.
 */
function SchemaArticle({ page }) {
  const models = page.models || [];
  const [open, setOpen] = useState(models[0]?.name);
  const [query, setQuery] = useState('');

  useEffect(() => setOpen(models[0]?.name), [page.id]);

  const totalFields = models.reduce((sum, model) => sum + model.fields.length, 0);
  const active = models.find((model) => model.name === open);

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? models.filter(
        (model) =>
          model.name.toLowerCase().includes(needle) ||
          model.fields.some((field) => field.field.toLowerCase().includes(needle)),
      )
    : models;

  return (
    <Section
      id="schema-atlas"
      eyebrow="EVERY MODEL IN THE DATABASE"
      title="Schema atlas"
      aside={
        <Badge tone="green">
          {models.length} models · {totalFields} fields
        </Badge>
      }
    >
      <p className="body-copy">{page.description}</p>

      <input
        className="atlas-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a model or a field…"
        aria-label="Filter models and fields"
      />

      <div className="schema-layout">
        <ul className="schema-list">
          {shown.map((model) => (
            <li key={model.name}>
              <button
                type="button"
                className={open === model.name ? 'on' : ''}
                onClick={() => setOpen(model.name)}
                aria-current={open === model.name}
              >
                <b>{model.name}</b>
                <small>
                  {model.fields.length} fields
                  {model.refs.length ? ` · → ${model.refs.join(', ')}` : ''}
                </small>
              </button>
            </li>
          ))}
          {!shown.length && <li className="schema-empty">No model or field matches “{query}”.</li>}
        </ul>

        {active && (
          <div className="schema-detail">
            <div className="schema-head">
              <h3>{active.name}</h3>
              {active.collection && <code>{active.collection}</code>}
              <span className="schema-meta">
                {active.fields.length} fields · {active.indexedFields} indexed
              </span>
            </div>
            {active.summary && <p className="body-copy">{active.summary}</p>}

            <table className="schema-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Rules</th>
                  <th>References</th>
                </tr>
              </thead>
              <tbody>
                {active.fields.map((field) => (
                  <tr key={field.field}>
                    <td>
                      <code>{field.field}</code>
                    </td>
                    <td className="schema-type">{field.type || '—'}</td>
                    <td>
                      <span className="schema-rules">
                        {field.required && <span className="schema-flag req">required</span>}
                        {field.unique && <span className="schema-flag uniq">unique</span>}
                        {field.indexed && <span className="schema-flag idx">indexed</span>}
                        {field.enum && (
                          <span className="schema-enum" title={field.enum.join(' · ')}>
                            {field.enum.slice(0, 3).join(' | ')}
                            {field.enum.length > 3 ? ' …' : ''}
                          </span>
                        )}
                        {field.default !== null && field.default !== undefined && (
                          <span className="schema-default">= {field.default}</span>
                        )}
                        {(field.min !== null || field.max !== null) && (
                          <span className="schema-default">
                            {field.min !== null ? `min ${field.min}` : ''}
                            {field.min !== null && field.max !== null ? ' · ' : ''}
                            {field.max !== null ? `max ${field.max}` : ''}
                          </span>
                        )}
                        {!field.required &&
                          !field.unique &&
                          !field.indexed &&
                          !field.enum &&
                          (field.default === null || field.default === undefined) &&
                          field.min === null &&
                          field.max === null && <span className="schema-none">optional</span>}
                      </span>
                    </td>
                    <td>{field.ref ? <code>{field.ref}</code> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Callout kind="tip">
        Generated by introspecting the live mongoose schemas, not by parsing the model files. If a field is
        missing here it is missing from the model — regenerate rather than editing this page.
      </Callout>
    </Section>
  );
}

/**
 * One request or response field, with the type the handler coerces it
 * to and whether it is required. A bare name list tells a reader
 * nothing about what to send; the type and the required flag are the
 * two things they cannot guess from the path.
 */
function FieldSpec({ fields, prefix = '', empty }) {
  if (!fields?.length) return <p className="contract-empty">{empty}</p>;
  return (
    <ul className="spec-list">
      {fields.map((field, index) => (
        <li className={`spec-row ${field.required ? 'spec-required' : ''}`} key={`${field.field}-${index}`}>
          <code className="spec-name">
            {prefix}
            {field.field}
          </code>
          <span className={`spec-type type-${field.type || 'any'}`}>{field.type || 'any'}</span>
          {field.required && <span className="spec-flag">required</span>}
          {field.default !== null && field.default !== undefined && (
            <span className="spec-default">default {field.default}</span>
          )}
          {field.note && <span className="spec-note">{field.note}</span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * Backend Backrooms — the narrative, then every API in both backends
 * with its contract. The API list is generated from the route files;
 * purpose, request fields and response keys are read out of the
 * handlers themselves.
 */
function BackroomsArticle({ page }) {
  const all = page.routes || [];
  const [backend, setBackend] = useState('all');
  const [group, setGroup] = useState('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const backends = [
    ['all', `Both backends (${all.length})`],
    ['main', `Main API (${all.filter((route) => route.backend === 'main').length})`],
    ['website', `Website API (${all.filter((route) => route.backend === 'website').length})`],
  ];

  const scoped = backend === 'all' ? all : all.filter((route) => route.backend === backend);
  const groups = ['All', ...new Set(scoped.map((route) => route.group))];
  const needle = query.trim().toLowerCase();

  const routes = scoped.filter((route) => {
    if (group !== 'All' && route.group !== group) return false;
    if (!needle) return true;
    return (
      route.path.toLowerCase().includes(needle) ||
      route.method.toLowerCase().includes(needle) ||
      route.purpose.toLowerCase().includes(needle) ||
      (route.permission || '').toLowerCase().includes(needle)
    );
  });

  const key = (route) => `${route.backend}:${route.method}:${route.path}`;

  return (
    <>
      <Section title={page.sectionTitles.flow}>
        <p className="body-copy">{page.overview}</p>
        <div className="flow-strip">
          {page.flow.map((item, index) => (
            <Fragment key={item}>
              {index > 0 && <b>→</b>}
              <span>{item}</span>
            </Fragment>
          ))}
        </div>
      </Section>

      <Section title={page.sectionTitles.modules}>
        <div className="module-grid">
          {page.modules.map((item) => (
            <article key={item.name}>
              <Badge>{item.kind}</Badge>
              <h3>{item.name}</h3>
              <p>{item.purpose}</p>
              <small>
                <b>Sender:</b> {item.sender}
                <br />
                <b>Receiver:</b> {item.receiver}
              </small>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="api-contract"
        title={page.sectionTitles.routes}
        aside={
          <Badge tone="green">
            {all.length} endpoints · {new Set(all.map((route) => route.group)).size} groups
          </Badge>
        }
      >
        <p className="body-copy">
          Both Express apps, every mounted handler. Sender and receiver are inferred from how the handler is
          wired — the guard on the route, the device or session it accepts, and the models it reads. Request
          fields are the ones the handler actually reads out of
          <code> req.body</code> and <code>req.query</code>; response fields are the keys it actually returns.
        </p>

        <div className="atlas-controls">
          <input
            className="atlas-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by path, method, purpose or permission…"
            aria-label="Filter endpoints"
          />
          <div className="segmented route-filter">
            {backends.map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={backend === id ? 'selected' : ''}
                onClick={() => {
                  setBackend(id);
                  setGroup('All');
                  setOpen(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="segmented route-filter">
            {groups.map((item) => (
              <button
                type="button"
                key={item}
                className={group === item ? 'selected' : ''}
                onClick={() => {
                  setGroup(item);
                  setOpen(null);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className="atlas-count">
          Showing {routes.length} of {all.length} endpoints
        </p>

        <div className="route-list">
          {routes.map((route) => {
            const isOpen = open === key(route);
            const { body = [], query: queryFields = [], params = [] } = route.request || {};
            const payloads = route.response?.payloads?.length
              ? route.response.payloads
              : [{ status: 200, fields: route.response?.fields || [] }];
            const errors = route.response?.errors || [];
            return (
              <article className={`route-card ${isOpen ? 'route-open' : ''}`} key={key(route)}>
                <button className="route-toggle" onClick={() => setOpen(isOpen ? null : key(route))}>
                  <span className={`method m-${route.method.toLowerCase()}`}>{route.method}</span>
                  <code>{route.path}</code>
                  <span className="route-group">
                    {route.backend === 'website' ? 'Website' : 'Main'} · {route.group}
                  </span>
                  <span className="route-arrow">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="route-details">
                    <p className="route-purpose">{route.purpose}</p>
                    {route.derived && (
                      <p className="route-derived">
                        Purpose derived from the verb and path — the handler has no comment of its own.
                      </p>
                    )}

                    <div className="contract-strip">
                      <span>
                        <b>Sender</b>
                        {senderOf(route)}
                      </span>
                      <span>
                        <b>Receiver</b>
                        {receiverOf(route)}
                      </span>
                      <span>
                        <b>Access</b>
                        {route.permission ? <code>{route.permission}</code> : 'session'}
                      </span>
                      {route.guards?.length > 0 && (
                        <span>
                          <b>Guards</b>
                          {route.guards.join(' · ')}
                        </span>
                      )}
                    </div>

                    <div className="request-grid">
                      <div>
                        <span className="eyebrow">REQUEST BODY</span>
                        {body.length ? (
                          <FieldSpec fields={body} />
                        ) : (
                          <p className="contract-empty">
                            {route.method === 'GET' || route.method === 'DELETE'
                              ? 'No body — reads from the path and query only.'
                              : 'No body fields read by the handler.'}
                          </p>
                        )}
                        {queryFields.length > 0 && (
                          <>
                            <span className="eyebrow">QUERY</span>
                            <FieldSpec fields={queryFields} />
                          </>
                        )}
                        {params.length > 0 && (
                          <>
                            <span className="eyebrow">PATH PARAMS</span>
                            <FieldSpec fields={params} prefix=":" />
                          </>
                        )}
                      </div>

                      <div>
                        <span className="eyebrow">
                          RESPONSE {payloads.length === 1 ? `· ${payloads[0].status}` : ''}
                        </span>
                        {payloads.map((payload, index) => (
                          <div className="payload-block" key={`${payload.status}-${index}`}>
                            {payloads.length > 1 && (
                              <span className="payload-status">
                                {payload.status} · {index === 0 ? 'the usual answer' : 'another branch'}
                              </span>
                            )}
                            <FieldSpec fields={payload.fields} empty="No payload — status only." />
                          </div>
                        ))}
                        {errors.length > 0 && (
                          <>
                            <span className="eyebrow">ERRORS</span>
                            <div className="error-list">
                              {errors.map((error, index) => (
                                <div className="error-row" key={`${error.code || error.status}-${index}`}>
                                  <code>{error.code || `HTTP ${error.status || 400}`}</code>
                                  <span>{error.message || 'Rejected before the handler ran.'}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {route.models?.length > 0 && (
                          <>
                            <span className="eyebrow">TOUCHES</span>
                            <div className="field-pills">
                              {route.models.map((model) => (
                                <code className="model-chip" key={model}>
                                  {model}
                                </code>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="tools-block">
                      <span className="eyebrow">EXTERNAL TOOLS</span>
                      {route.tools?.length ? (
                        <div className="tool-grid">
                          {route.tools.map((tool) => (
                            <div className={`tool-card tool-${tool.kind}`} key={tool.name}>
                              <b>{tool.name}</b>
                              <em>{tool.kind}</em>
                              <span>{tool.note}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="contract-empty">
                          Nothing outside this process — the work is done against its own database.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          {!routes.length && <p className="atlas-count">Nothing matches that filter.</p>}
        </div>
      </Section>

      <Callout kind="warn">{page.securityNote}</Callout>
    </>
  );
}

/** Who calls this endpoint, inferred from how it is wired. */
function senderOf(route) {
  if (route.guards?.includes('device auth')) return 'A paired booth device';
  if (route.backend === 'website') return 'The public website';
  if (route.path.includes('/platform')) return 'The platform CRM console';
  if (route.path.includes('/org')) return 'An organisation CRM workspace';
  if (route.path.includes('/docs')) return 'This documentation site';
  if (route.path.includes('/downloads') || route.path.includes('/share')) return 'A guest’s browser';
  if (route.path.includes('/booth') || route.path.includes('/payments')) return 'A booth session';
  return 'A signed-in CRM user';
}

/** What it acts on, from the models the handler reads. */
function receiverOf(route) {
  if (route.models?.length) return route.models.join(', ');
  if (route.backend === 'website') return 'The website API and shared collections';
  return 'The Express handler itself';
}

/**
 * Platform CRM — page by page. Roles come from the role matrix, so
 * the access column is the same check the app uses to draw the menu.
 */
function CrmGuideArticle({ page }) {
  const [section, setSection] = useState('All');
  const [role, setRole] = useState('All');

  const screens = page.screens || [];
  const sections = ['All', ...new Set(screens.map((screen) => screen.section))];
  const shown = screens.filter((screen) => {
    if (section !== 'All' && screen.section !== section) return false;
    if (role !== 'All' && !screen.roles.includes(role)) return false;
    return true;
  });

  return (
    <>
      <Section
        id="roles"
        eyebrow="WHO CAN GET IN"
        title="Five roles, two scopes"
        aside={<Badge tone="green">{screens.length} pages</Badge>}
      >
        <p className="body-copy">{page.description}</p>
        <div className="role-grid">
          {(page.roles || []).map((item) => (
            <article key={item.role}>
              <span className={`scope-chip ${item.scope}`}>{item.scope}</span>
              <h3>{item.label}</h3>
              <code>{item.role}</code>
              <p>
                Can open <b>{item.pages}</b> of {screens.length} pages.
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="screens" eyebrow="PAGE BY PAGE" title="What each page is for">
        <div className="segmented route-filter">
          {sections.map((item) => (
            <button
              type="button"
              key={item}
              className={section === item ? 'selected' : ''}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="segmented route-filter">
          <button type="button" className={role === 'All' ? 'selected' : ''} onClick={() => setRole('All')}>
            Every role
          </button>
          {(page.roles || []).map((item) => (
            <button
              type="button"
              key={item.role}
              className={role === item.role ? 'selected' : ''}
              onClick={() => setRole(item.role)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="crm-guide">
          {shown.map((screen) => (
            <article className="crm-page" key={screen.id}>
              <div className="crm-page-head">
                <div>
                  <span className="eyebrow">
                    {screen.section} · {screen.path}
                  </span>
                  <h3>{screen.label}</h3>
                </div>
                <div className="crm-access">
                  {screen.roles.map((item) => (
                    <span
                      key={item}
                      className={`role-chip ${screen.readOnlyFor?.includes(item) ? 'readonly' : ''}`}
                    >
                      {(page.roles.find((entry) => entry.role === item) || {}).label || item}
                      {screen.readOnlyFor?.includes(item) ? ' (read-only)' : ''}
                    </span>
                  ))}
                  {!screen.roles.length && <span className="role-chip noccess">nobody</span>}
                </div>
              </div>

              <p className="crm-what">{screen.what}</p>

              <div className="crm-columns">
                <div>
                  <span className="eyebrow">HOW TO WORK WITH IT</span>
                  <ul>
                    {screen.use.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="eyebrow">WHAT IT WILL NOT DO</span>
                  <p>{screen.cant}</p>
                  <span className="eyebrow">BACKED BY</span>
                  <div className="field-pills">
                    {(screen.api || []).map((route) => (
                      <code key={route}>{route}</code>
                    ))}
                  </div>
                </div>
              </div>

              <div className="crm-foot">
                <span>
                  Permission <code>{screen.permission}</code>
                </span>
              </div>
            </article>
          ))}
          {!shown.length && <p className="atlas-count">No page is open to that role in this section.</p>}
        </div>
      </Section>

      <Callout kind="warn">{page.securityNote}</Callout>
    </>
  );
}

/** Audit log — the most recent audited actions. */
function AuditArticle({ page }) {
  const entries = page.entries || [];

  return (
    <Section
      id="audit"
      eyebrow="WHO DID WHAT"
      title="Audit log"
      aside={<Badge tone="green">{entries.length} recent entries</Badge>}
    >
      <p className="body-copy">{page.description}</p>

      {entries.length ? (
        <div className="audit-table">
          <div className="audit-row audit-head">
            <span>When</span>
            <span>Actor</span>
            <span>Action</span>
            <span>Entity</span>
            <span>Summary</span>
          </div>
          {entries.map((entry, index) => (
            <div className={`audit-row sev-${entry.severity}`} key={`${entry.at}-${index}`}>
              <span className="audit-when">{formatWhen(entry.at)}</span>
              <span>
                {entry.actorName}
                {entry.actorRole && <small>{entry.actorRole}</small>}
              </span>
              <span>
                <code>{entry.action}</code>
                <small className={`sev-tag ${entry.severity}`}>{entry.severity}</small>
              </span>
              <span>
                {entry.entity || '—'}
                <small>{entry.scope}</small>
              </span>
              <span className="audit-summary">{entry.summary || '—'}</span>
            </div>
          ))}
        </div>
      ) : (
        <Callout kind="warn">
          No audit entries could be read. The endpoint still serves the rest of this page — an audit query
          that fails must not take the documentation down with it.
        </Callout>
      )}

      <Callout kind="warn">{page.securityNote}</Callout>
    </Section>
  );
}

/** Date-only and time-only, in the reader's locale. */
function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString(
    undefined,
    { hour: '2-digit', minute: '2-digit' },
  )}`;
}

function ScalingArticle({ page }) {
  const [scenario, setScenario] = useState('all');
  const filtered = page.tiers.filter((tier) => scenario === 'all' || tier.id === scenario);

  return (
    <>
      <Section title={page.sectionTitles.services}>
        <div className="service-grid">
          {page.services.map((service) => (
            <article key={service.name}>
              <span>{service.icon}</span>
              <div>
                <b>{service.name}</b>
                <p>{service.detail}</p>
              </div>
              <Badge>{service.kind}</Badge>
            </article>
          ))}
        </div>
      </Section>

      <Section title={page.sectionTitles.budgets}>
        <p className="body-copy">{page.planningIntro}</p>
        <div className="segmented tier-filter">
          {[
            ['all', 'All stages'],
            ['10-50', '10 clients · 50 booths'],
            ['100-500', '100 · 500'],
            ['500-5000', '500 · 5,000'],
            ['5000-50000', '5,000 · 50,000'],
          ].map(([id, title]) => (
            <button className={scenario === id ? 'selected' : ''} key={id} onClick={() => setScenario(id)}>
              {title}
            </button>
          ))}
        </div>

        <div className="tier-grid">
          {filtered.map((tier) => (
            <article className="tier-card" key={tier.id}>
              <div className="tier-top">
                <Badge tone={tier.status === 'now' ? 'green' : ''}>{tier.statusLabel}</Badge>
                <span>{tier.booths} booths</span>
              </div>
              <h3>
                {tier.clients} <small>organisations</small>
              </h3>
              <div className="tier-cost">
                {tier.cost}
                <small>estimated all-in monthly run rate</small>
              </div>
              <p>{tier.summary}</p>
              <div className="tier-breakdown">
                <span>
                  <b>Cloud + vendors / month</b>
                  {tier.cloudCost}
                </span>
                <span>
                  <b>Staffed operations / month</b>
                  {tier.opsCost}
                </span>
                <span>
                  <b>One-time onboarding</b>
                  {tier.onboarding}
                </span>
              </div>
              <div className="tier-bottom">
                <span>
                  <b>Team guide</b>
                  {tier.staff}
                </span>
                <span>
                  <b>Stage trigger</b>
                  {tier.trigger}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={page.sectionTitles.triggers}>
        <div className="trigger-list">
          {page.triggers.map((trigger) => (
            <article key={trigger.title}>
              <span>{trigger.when}</span>
              <div>
                <h3>{trigger.title}</h3>
                <p>{trigger.action}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={page.sectionTitles.operations}>
        <p className="body-copy">{page.staffingNote}</p>
        <div className="staffing-banner">
          <span>✳</span>
          <p>{page.operatingReminder}</p>
        </div>
      </Section>

      <Callout kind="warn">{page.warning}</Callout>
    </>
  );
}

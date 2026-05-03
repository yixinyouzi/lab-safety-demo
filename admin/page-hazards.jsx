/* ============================================================
   危险源台账（反馈 3a）
   ------------------------------------------------------------
   8 间实验室约 22 条结构化危险源，按 kind / severity 筛选
   - KPI 行：总数 / critical / 化学品 / 平均距上次检查天数
   - filter：HAZARD_KINDS_ORDER 自动渲染（单一真相源）
   - 表格 + 详情面板（PPE + 应急方案 + 关联实验室）
   - 点击行 → 滑出 panel（复用 .panel/.panel-ov/.panel-h）
   ============================================================ */

const TODAY_HAZARD = new Date(MOCK.today || '2026-04-21');
const FLAT_HAZARDS = MOCK.labs.flatMap(l =>
  (l.hazardSources || []).map(h => ({
    ...h,
    labId: l.id, labName: l.name, labDept: l.dept, labLead: l.lead, labStatus: l.status,
  }))
);

function HazardKindChip({ k }) {
  const m = HAZARD_KIND_META[k] || { label: k, icon: '·', color: 'var(--ink-2)' };
  return (
    <span className="chip" style={{ background: 'var(--bg)', color: m.color, borderColor: 'var(--line)' }}>
      {m.icon} {m.label}
    </span>
  );
}

function HazardSeverityChip({ s }) {
  if (s === 'critical') return <span className="chip chip-red">严重</span>;
  if (s === 'warning')  return <span className="chip chip-amber">关注</span>;
  return <span className="chip chip-gray">一般</span>;
}

function HazardsKpi() {
  const total = FLAT_HAZARDS.length;
  const critical = FLAT_HAZARDS.filter(h => h.severity === 'critical').length;
  const chemical = FLAT_HAZARDS.filter(h => h.kind === 'chemical').length;
  const avgDays = Math.round(
    FLAT_HAZARDS.reduce((s, h) => s + (TODAY_HAZARD - new Date(h.lastCheck)) / 86400000, 0) / Math.max(total, 1)
  );
  return (
    <div className="kpi-row">
      <div className="kpi">
        <div className="kpi-label">在册危险源</div>
        <div className="kpi-value">{total}</div>
        <div className="kpi-meta">覆盖 {MOCK.labs.filter(l => (l.hazardSources || []).length).length} 间实验室</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">严重等级</div>
        <div className="kpi-value" style={{ color: 'var(--red)' }}>{critical}</div>
        <div className="kpi-meta">需双锁 / 双人 / 应急预案</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">化学品类</div>
        <div className="kpi-value" style={{ color: 'var(--amber)' }}>{chemical}</div>
        <div className="kpi-meta">见危化品 · 资产 详情</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">平均距上次检查</div>
        <div className="kpi-value">{avgDays} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-3)' }}>天</span></div>
        <div className="kpi-meta">≤ 30 天为正常巡检节奏</div>
      </div>
    </div>
  );
}

function HazardPanel({ hz, onClose }) {
  if (!hz) return null;
  const m = HAZARD_KIND_META[hz.kind] || {};
  const days = Math.round((TODAY_HAZARD - new Date(hz.lastCheck)) / 86400000);
  return (
    <>
      <div className="panel-ov" onClick={onClose}></div>
      <div className="panel">
        <div className="panel-h">
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }} className="mono">
              {hz.id} · {m.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{hz.name}</div>
            <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
              <HazardKindChip k={hz.kind} />
              <HazardSeverityChip s={hz.severity} />
              <span className="chip chip-brand">{hz.labId}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: '18px 24px' }} className="stack-l">
          <div className="grid-2" style={{ gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 6 }}>
              <div className="meta" style={{ fontSize: 11 }}>存放位置</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{hz.location}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 6 }}>
              <div className="meta" style={{ fontSize: 11 }}>上次检查</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{hz.lastCheck}</div>
              <div className="meta" style={{ fontSize: 11, marginTop: 4 }}>{days} 天前</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              所需个人防护（PPE）
            </div>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {(hz.ppe || []).map(p => <span key={p} className="chip chip-gray">{p}</span>)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              应急处置
            </div>
            <div style={{ padding: 12, background: 'var(--red-soft, #fee2e2)', border: '1px solid #fdba74', borderRadius: 6, fontSize: 13, lineHeight: 1.6, color: 'var(--ink)' }}>
              ⚠ {hz.emergency}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              所属实验室
            </div>
            <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                <span className="mono">{hz.labId}</span> · {hz.labName}
              </div>
              <div className="meta" style={{ marginTop: 4 }}>{hz.labDept} · 管理员 {hz.labLead}</div>
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <button className="btn">导出条目</button>
            <button className="btn">登记复检</button>
            <button className="btn btn-primary">编辑 PPE / 应急</button>
          </div>
        </div>
      </div>
    </>
  );
}

function HazardsPage() {
  const [kind, setKind] = React.useState('all');
  const [sev, setSev] = React.useState('all');
  const [open, setOpen] = React.useState(null);

  const list = FLAT_HAZARDS.filter(h => {
    if (kind !== 'all' && h.kind !== kind) return false;
    if (sev !== 'all' && h.severity !== sev) return false;
    return true;
  });

  const countByKind = k => FLAT_HAZARDS.filter(h => h.kind === k).length;
  const countBySev = s => FLAT_HAZARDS.filter(h => h.severity === s).length;

  return (
    <div>
      <div className="page-h">
        <div>
          <div className="page-title">危险源台账</div>
          <div className="page-sub">
            按结构化条目登记每间实验室的具体危险源 · 含 PPE 配置、应急处置、上次检查 — 检查与门牌均从此处取数
          </div>
        </div>
        <div className="row">
          <button className="btn">导出 Excel</button>
          <button className="btn btn-primary">+ 新增危险源</button>
        </div>
      </div>

      <HazardsKpi />

      <div className="filters">
        <span className="muted" style={{ fontSize: 12 }}>类型</span>
        <button className={'pill ' + (kind === 'all' ? 'active' : '')} onClick={() => setKind('all')}>全部 · {FLAT_HAZARDS.length}</button>
        {HAZARD_KINDS_ORDER.map(k => {
          const m = HAZARD_KIND_META[k];
          const n = countByKind(k);
          if (n === 0) return null;
          return (
            <button key={k} className={'pill ' + (kind === k ? 'active' : '')} onClick={() => setKind(k)}>
              {m.icon} {m.label} · {n}
            </button>
          );
        })}
        <span style={{ width: 1, height: 18, background: 'var(--line)', margin: '0 4px' }}></span>
        <span className="muted" style={{ fontSize: 12 }}>严重度</span>
        {[
          { k: 'all',     l: '全部' },
          { k: 'critical', l: '严重 · ' + countBySev('critical') },
          { k: 'warning',  l: '关注 · ' + countBySev('warning') },
          { k: 'info',     l: '一般 · ' + countBySev('info') },
        ].map(f => (
          <button key={f.k} className={'pill ' + (sev === f.k ? 'active' : '')} onClick={() => setSev(f.k)}>{f.l}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-2)' }}>共 {list.length} 项</span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>名称 / 编号</th>
              <th>类型</th>
              <th>所属实验室</th>
              <th>位置</th>
              <th>严重度</th>
              <th>PPE</th>
              <th style={{ width: 100 }}>上次检查</th>
            </tr>
          </thead>
          <tbody>
            {list.map(h => (
              <tr key={h.id} onClick={() => setOpen(h)}>
                <td>
                  <strong>{h.name}</strong>
                  <div className="meta mono" style={{ fontSize: 11 }}>{h.id}</div>
                </td>
                <td><HazardKindChip k={h.kind} /></td>
                <td>
                  <span className="chip chip-brand">{h.labId}</span>
                  <div className="meta" style={{ fontSize: 11, marginTop: 2 }}>{h.labName}</div>
                </td>
                <td className="mono" style={{ fontSize: 12 }}>{h.location}</td>
                <td><HazardSeverityChip s={h.severity} /></td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                    {(h.ppe || []).slice(0, 2).map(p => <span key={p} className="chip chip-gray" style={{ fontSize: 10 }}>{p}</span>)}
                    {h.ppe && h.ppe.length > 2 && <span className="meta" style={{ fontSize: 10 }}>+{h.ppe.length - 2}</span>}
                  </div>
                </td>
                <td className="meta mono" style={{ fontSize: 11 }}>{h.lastCheck}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>暂无匹配的危险源</div>
        )}
      </div>

      {open && <HazardPanel hz={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

window.HazardsPage = HazardsPage;
window.HazardKindChip = HazardKindChip;
window.HazardSeverityChip = HazardSeverityChip;

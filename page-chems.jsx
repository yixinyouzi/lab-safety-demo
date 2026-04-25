/* ============================================================
   危化品 · 资产台账
   ------------------------------------------------------------
   HSE 管理员监控全院危化品 总账 + 告警 + 流水 + 三废
   - KPI 行: 总瓶数 / 库存告警 / 即将过期 / 本月领用次数
   - 3 tab:  库存清单 / 领用流水 / 三废处置
   - 行点击 → 滑出详情面板（PPE + 流水 + 操作）
   ============================================================ */

const CHEMS = [
  {
    id: 'c-001', name: '冰醋酸', cas: '64-19-7',
    hazards: ['腐蚀', '可燃'], danger: 'corrosive', sub: '醋酸 · Acetic acid',
    cabinet: 'A208 · 危化柜 #2', form: '液体 · 棕色玻璃瓶',
    total: 500, remain: 250, unit: 'ml', remainPct: 50,
    status: 'using', expire: '2027-08-15',
    lastUse: { who: '张一凡', when: '04-21 14:02', amount: '50 ml', purpose: '电极清洗' },
    note: '需远离明火，配护目镜+丁腈手套',
  },
  {
    id: 'c-002', name: '氢氟酸', cas: '7664-39-3',
    hazards: ['剧毒', '腐蚀'], danger: 'toxic', sub: '40% · Hydrofluoric acid',
    cabinet: 'A208 · 剧毒柜 (双锁)', form: '液体 · PE 塑料瓶',
    total: 500, remain: 0, unit: 'ml', remainPct: 0,
    status: 'warn', expire: '2026-12-30',
    lastUse: { who: '钱雨桐', when: '04-19 10:30', amount: '500 ml', purpose: '硅基底刻蚀' },
    note: '剧毒 · 双人双锁 · 需安全员王玉鸿审批',
    alertText: '已用尽 · 待补货',
  },
  {
    id: 'c-003', name: '异丙醇', cas: '67-63-0',
    hazards: ['可燃'], danger: 'flammable', sub: '99.5% · IPA',
    cabinet: 'A208 · 易燃柜 #1', form: '液体 · 棕色玻璃瓶',
    total: 1000, remain: 500, unit: 'ml', remainPct: 50,
    status: 'using', expire: '2028-03-22',
    lastUse: { who: '李思远', when: '04-21 14:15', amount: '100 ml', purpose: '清洗 SEM 样品' },
    note: '远离静电源 · 避免大量挥发',
  },
  {
    id: 'c-004', name: '浓硫酸', cas: '7664-93-9',
    hazards: ['腐蚀', '强氧化'], danger: 'corrosive', sub: '98% · Sulfuric acid',
    cabinet: '302 · 危化柜 #1', form: '液体 · 棕色玻璃瓶',
    total: 1000, remain: 920, unit: 'ml', remainPct: 92,
    status: 'stock', expire: '2028-11-08',
    lastUse: { who: '赵振华', when: '04-15 09:40', amount: '20 ml', purpose: '电化学预处理' },
    note: '禁与有机物/强还原剂混存 · 配一级洗眼器',
  },
  {
    id: 'c-005', name: '无水乙醇', cas: '64-17-5',
    hazards: ['可燃'], danger: 'flammable', sub: '99.7% · Anhydrous ethanol',
    cabinet: '多柜共存', form: '液体 · 棕色玻璃瓶',
    total: 2000, remain: 1200, unit: 'ml', remainPct: 60,
    status: 'stock', expire: '2027-09-12',
    lastUse: { who: '陈延松', when: '04-20 16:05', amount: '300 ml', purpose: '通用溶剂' },
    note: '通用溶剂 · 多实验室共用',
  },
  {
    id: 'c-006', name: '高氯酸', cas: '7601-90-3',
    hazards: ['强氧化', '爆炸'], danger: 'explosive', sub: '70% · Perchloric acid',
    cabinet: '302 · 强氧化柜 (限量)', form: '液体 · 棕色玻璃瓶',
    total: 250, remain: 5, unit: 'ml', remainPct: 2,
    status: 'warn', expire: '2026-05-15',
    lastUse: { who: '赵振华', when: '04-10 11:20', amount: '5 ml', purpose: '消解样品' },
    note: '严禁与有机物接触 · 余量极低 + 即将过期',
    alertText: '即将过期 (剩 20 天)',
  },
  {
    id: 'c-007', name: '苯酚', cas: '108-95-2',
    hazards: ['剧毒', '腐蚀'], danger: 'toxic', sub: '99% · Phenol',
    cabinet: 'B105 · 剧毒柜', form: '固体 · 棕色玻璃瓶',
    total: 500, remain: 100, unit: 'g', remainPct: 20,
    status: 'using', expire: '2027-06-10',
    lastUse: { who: '周明', when: '04-17 15:45', amount: '20 g', purpose: '生物样品制备' },
    note: '剧毒 · 双人双锁',
  },
  {
    id: 'c-008', name: '丙酮', cas: '67-64-1',
    hazards: ['可燃'], danger: 'flammable', sub: '99% · Acetone',
    cabinet: 'A208 · 易燃柜 #1', form: '液体 · 棕色玻璃瓶',
    total: 1000, remain: 800, unit: 'ml', remainPct: 80,
    status: 'stock', expire: '2027-12-01',
    lastUse: { who: '钱雨桐', when: '04-18 10:30', amount: '50 ml', purpose: '色谱柱清洗' },
    note: '通风良好处使用 · 禁明火',
  },
];

const USE_FLOW = [
  { t: '04-21 14:15', who: '李思远', chem: '异丙醇', amount: '100 ml', lab: 'A208', purpose: '清洗 SEM 样品' },
  { t: '04-21 14:02', who: '张一凡', chem: '冰醋酸', amount: '50 ml', lab: '302', purpose: '电极清洗' },
  { t: '04-20 16:05', who: '陈延松', chem: '无水乙醇', amount: '300 ml', lab: '302', purpose: '通用溶剂' },
  { t: '04-19 10:30', who: '钱雨桐', chem: '氢氟酸', amount: '500 ml', lab: 'A208', purpose: '硅基底刻蚀', flag: 'critical' },
  { t: '04-18 10:30', who: '钱雨桐', chem: '丙酮', amount: '50 ml', lab: 'A208', purpose: '色谱柱清洗' },
  { t: '04-17 15:45', who: '周明', chem: '苯酚', amount: '20 g', lab: 'B105', purpose: '生物样品制备', flag: 'critical' },
  { t: '04-15 09:40', who: '赵振华', chem: '浓硫酸', amount: '20 ml', lab: '302', purpose: '电化学预处理' },
  { t: '04-10 11:20', who: '赵振华', chem: '高氯酸', amount: '5 ml', lab: '302', purpose: '消解样品', flag: 'critical' },
];

const WASTE = [
  { id: 'w-2604-01', kind: '酸性废液', src: 'A208', vol: '5 L', recoveredAt: '04-15', vendor: '北京京环', status: 'done' },
  { id: 'w-2604-02', kind: '有机废液', src: '302 + A208', vol: '8 L', recoveredAt: '04-22 (待回收)', vendor: '北京京环', status: 'pending' },
  { id: 'w-2604-03', kind: '剧毒废液', src: 'A208 (氢氟酸)', vol: '0.5 L', recoveredAt: '04-25 (待回收)', vendor: '环保部直派', status: 'urgent', note: '需安全员现场签字' },
];

/* ===== chips ===== */
function HazChip({ h }) {
  const map = {
    剧毒: 'chip-red', 腐蚀: 'chip-amber', 可燃: 'chip-amber',
    强氧化: 'chip-amber', 爆炸: 'chip-red',
  };
  return <span className={'chip ' + (map[h] || 'chip-gray')}>{h}</span>;
}

function StatusChip({ s, alertText }) {
  if (s === 'stock')  return <span className="chip chip-green">在库</span>;
  if (s === 'using')  return <span className="chip chip-amber">在用</span>;
  if (s === 'warn')   return <span className="chip chip-red">{alertText || '告警'}</span>;
  return <span className="chip chip-gray">{s}</span>;
}

/* ===== KPI ===== */
function ChemKPI() {
  const total = CHEMS.length;
  const warnCount = CHEMS.filter(c => c.status === 'warn').length;
  const expSoon = CHEMS.filter(c => {
    const d = new Date(c.expire);
    const days = (d - new Date('2026-04-21')) / (1000 * 60 * 60 * 24);
    return days < 60 && days > 0;
  }).length;
  const useThisMonth = USE_FLOW.length;
  return (
    <div className="kpi-row">
      <div className="kpi">
        <div className="kpi-label">在管品种</div>
        <div className="kpi-value">{total}</div>
        <div className="kpi-meta">含剧毒 2 种 · 强氧化 2 种</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">库存告警</div>
        <div className="kpi-value" style={{ color: 'var(--red)' }}>{warnCount}</div>
        <div className="kpi-meta">余量耗尽 / 待补货</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">即将过期 (60 天内)</div>
        <div className="kpi-value" style={{ color: 'var(--amber)' }}>{expSoon}</div>
        <div className="kpi-meta">需提前申请处置</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">本月领用次数</div>
        <div className="kpi-value">{useThisMonth}</div>
        <div className="kpi-meta">含 3 项剧毒/强氧化领用</div>
      </div>
    </div>
  );
}

/* ===== 库存清单 tab ===== */
function StockTab({ onOpen }) {
  const [filter, setFilter] = React.useState('all');
  const list = CHEMS.filter(c => {
    if (filter === 'stock') return c.status === 'stock';
    if (filter === 'using') return c.status === 'using';
    if (filter === 'warn')  return c.status === 'warn';
    if (filter === 'toxic') return c.danger === 'toxic';
    if (filter === 'flammable') return c.danger === 'flammable';
    return true;
  });

  return (
    <>
      <div className="filters">
        {[
          { k: 'all', l: '全部', n: CHEMS.length },
          { k: 'stock', l: '🟢 在库', n: CHEMS.filter(c => c.status === 'stock').length },
          { k: 'using', l: '🟡 在用', n: CHEMS.filter(c => c.status === 'using').length },
          { k: 'warn', l: '🔴 告警', n: CHEMS.filter(c => c.status === 'warn').length },
          { k: 'toxic', l: '剧毒', n: CHEMS.filter(c => c.danger === 'toxic').length },
          { k: 'flammable', l: '易燃', n: CHEMS.filter(c => c.danger === 'flammable').length },
        ].map(x => (
          <button key={x.k} className={'pill ' + (filter === x.k ? 'active' : '')} onClick={() => setFilter(x.k)}>
            {x.l} · {x.n}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-2)' }}>共 {list.length} 项</span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>名称 / CAS</th>
              <th>危险类别</th>
              <th>存放</th>
              <th>余量</th>
              <th>状态</th>
              <th>最近领用</th>
              <th style={{ width: 80 }}>过期日</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id} onClick={() => onOpen(c)}>
                <td>
                  <strong>{c.name}</strong>
                  <div className="meta mono" style={{ fontSize: 11 }}>CAS {c.cas} · {c.sub}</div>
                </td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                    {c.hazards.map(h => <HazChip key={h} h={h} />)}
                  </div>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 12 }}>{c.cabinet}</span>
                  <div className="meta" style={{ fontSize: 11 }}>{c.form}</div>
                </td>
                <td style={{ minWidth: 160 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: c.remainPct + '%',
                        background: c.remainPct === 0 ? 'var(--red)' : c.remainPct < 20 ? 'var(--amber)' : 'var(--brand)',
                        borderRadius: 3,
                      }} />
                    </div>
                    <span className="num" style={{ fontSize: 12, fontWeight: 600 }}>{c.remain}</span>
                    <span className="meta" style={{ fontSize: 11 }}>/ {c.total} {c.unit}</span>
                  </div>
                </td>
                <td><StatusChip s={c.status} alertText={c.alertText} /></td>
                <td>
                  <strong style={{ fontSize: 12 }}>{c.lastUse.who}</strong>
                  <div className="meta mono" style={{ fontSize: 11 }}>{c.lastUse.when} · {c.lastUse.amount}</div>
                </td>
                <td className="meta mono" style={{ fontSize: 11 }}>{c.expire.slice(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ===== 领用流水 tab ===== */
function FlowTab() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 110 }}>时间</th>
            <th>领用人</th>
            <th>物品</th>
            <th>用量</th>
            <th>实验室</th>
            <th>用途</th>
            <th style={{ width: 100 }}>类型</th>
          </tr>
        </thead>
        <tbody>
          {USE_FLOW.map((u, i) => (
            <tr key={i}>
              <td className="mono" style={{ fontSize: 12 }}>{u.t}</td>
              <td><strong>{u.who}</strong></td>
              <td>{u.chem}</td>
              <td className="num" style={{ fontWeight: 600 }}>{u.amount}</td>
              <td><span className="chip chip-brand">{u.lab}</span></td>
              <td className="meta">{u.purpose}</td>
              <td>
                {u.flag === 'critical'
                  ? <span className="chip chip-red">剧毒/强氧化</span>
                  : <span className="chip chip-gray">常规</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== 三废处置 tab ===== */
function WasteTab() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>处置单号</th>
            <th>类型</th>
            <th>来源</th>
            <th>体积</th>
            <th>回收时间</th>
            <th>第三方</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {WASTE.map(w => (
            <tr key={w.id}>
              <td className="mono" style={{ fontSize: 12 }}>{w.id}</td>
              <td>
                <strong>{w.kind}</strong>
                {w.note && <div className="meta" style={{ fontSize: 11 }}>{w.note}</div>}
              </td>
              <td>{w.src}</td>
              <td className="num">{w.vol}</td>
              <td className="meta mono" style={{ fontSize: 12 }}>{w.recoveredAt}</td>
              <td>{w.vendor}</td>
              <td>
                {w.status === 'done' && <span className="chip chip-green">已回收</span>}
                {w.status === 'pending' && <span className="chip chip-amber">待回收</span>}
                {w.status === 'urgent' && <span className="chip chip-red">紧急</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== 详情面板 ===== */
function ChemPanel({ chem, onClose }) {
  if (!chem) return null;
  const recentUse = USE_FLOW.filter(u => u.chem === chem.name).slice(0, 5);
  return (
    <>
      <div className="panel-ov" onClick={onClose}></div>
      <div className="panel">
        <div className="panel-h">
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }} className="mono">CAS {chem.cas} · {chem.sub}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{chem.name}</div>
            <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
              {chem.hazards.map(h => <HazChip key={h} h={h} />)}
              <StatusChip s={chem.status} alertText={chem.alertText} />
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: '18px 24px' }} className="stack-l">
          {/* 余量 + 存放 */}
          <div className="grid-2" style={{ gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 6 }}>
              <div className="meta" style={{ fontSize: 11 }}>当前余量</div>
              <div className="row" style={{ gap: 8, alignItems: 'baseline', marginTop: 4 }}>
                <span className="num" style={{ fontSize: 24, fontWeight: 700, color: chem.remainPct < 20 ? 'var(--red)' : 'var(--ink)' }}>{chem.remain}</span>
                <span className="meta">/ {chem.total} {chem.unit}</span>
              </div>
              <div style={{ height: 5, background: 'var(--line-2)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: chem.remainPct + '%',
                  background: chem.remainPct === 0 ? 'var(--red)' : chem.remainPct < 20 ? 'var(--amber)' : 'var(--brand)',
                  borderRadius: 3,
                }} />
              </div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 6 }}>
              <div className="meta" style={{ fontSize: 11 }}>存放位置</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{chem.cabinet}</div>
              <div className="meta" style={{ fontSize: 11, marginTop: 4 }}>{chem.form} · 过期 {chem.expire}</div>
            </div>
          </div>

          {/* 安全提示 */}
          <div style={{ padding: 12, background: 'var(--amber-soft)', border: '1px solid #fde68a', borderRadius: 6, fontSize: 13 }}>
            ⚠ <strong>安全提示：</strong>{chem.note}
          </div>

          {/* 领用历史 */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              近期领用 · {recentUse.length} 条
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {recentUse.length === 0 ? (
                <div style={{ padding: 18, textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>暂无领用记录</div>
              ) : recentUse.map((u, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '90px 1fr auto auto',
                  gap: 10, padding: '10px 14px',
                  borderBottom: i < recentUse.length - 1 ? '1px solid var(--line-2)' : 'none',
                  alignItems: 'center', fontSize: 12,
                }}>
                  <span className="meta mono">{u.t}</span>
                  <span><strong>{u.who}</strong> <span className="meta">· {u.purpose}</span></span>
                  <span className="num" style={{ fontWeight: 600 }}>{u.amount}</span>
                  <span className="chip chip-brand">{u.lab}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 操作 */}
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <button className="btn">登记入库</button>
            <button className="btn">登记废液</button>
            <button className="btn btn-danger">申请补货</button>
            <button className="btn btn-primary">登记领用</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== Main ===== */
function ChemsPage() {
  const [tab, setTab] = React.useState('stock');
  const [open, setOpen] = React.useState(null);

  return (
    <div>
      <div className="page-h">
        <div>
          <div className="page-title">危化品 · 资产台账</div>
          <div className="page-sub">
            全院危化品的入库、领用、余量、处置记录 · 每瓶都有二维码溯源
          </div>
        </div>
        <div className="row">
          <button className="btn">导出台账</button>
          <button className="btn btn-primary">+ 入库登记</button>
        </div>
      </div>

      <ChemKPI />

      <div className="filters" style={{ marginBottom: 12 }}>
        {[
          { k: 'stock', l: '📦 库存清单', n: CHEMS.length },
          { k: 'flow',  l: '📋 领用流水', n: USE_FLOW.length },
          { k: 'waste', l: '♻ 三废处置', n: WASTE.length },
        ].map(x => (
          <button key={x.k} className={'pill ' + (tab === x.k ? 'active' : '')} onClick={() => setTab(x.k)}>
            {x.l} · {x.n}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-2)' }}>
          {tab === 'stock' && '点击行查看 PPE 要求 + 领用历史 + 入库/领用/废液登记'}
          {tab === 'flow'  && '近 30 天领用流水 · 含剧毒/强氧化标记'}
          {tab === 'waste' && '三废分类回收 · 第三方对接 · 全程可追溯'}
        </span>
      </div>

      {tab === 'stock' && <StockTab onOpen={setOpen} />}
      {tab === 'flow'  && <FlowTab />}
      {tab === 'waste' && <WasteTab />}

      {open && <ChemPanel chem={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

window.ChemsPage = ChemsPage;

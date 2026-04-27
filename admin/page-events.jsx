/* ② Events center — 6 类事件统一时间流（kind 元数据见 EVENT_KIND_META） */
function EventsPage({ onOpenEvent }) {
  const [kind, setKind] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const list = MOCK.events.filter(e => {
    if (kind !== 'all' && e.kind !== kind) return false;
    if (status === 'pending' && !(e.status === 'active' || e.status === 'pending')) return false;
    if (status === 'done' && !(e.status === 'done' || e.status === 'handled')) return false;
    return true;
  });
  const countOf = k => MOCK.events.filter(e => e.kind === k).length;

  return (
    <div>
      <div className="page-h">
        <div>
          <div className="page-title">事件中心</div>
          <div className="page-sub">实时告警 · 重大违规 · 检查扣分 · 巡查记录 · 整改跟进 · 无人值守 — 统一时间流，所有处理动作留痕。</div>
        </div>
        <div className="row">
          <button className="btn">批量导出</button>
          <button className="btn btn-primary">+ 登记违规</button>
        </div>
      </div>

      <div className="filters">
        <span className="muted" style={{ fontSize: 12 }}>类型</span>
        <button className={'pill ' + (kind === 'all' ? 'active' : '')} onClick={() => setKind('all')}>全部 · {MOCK.events.length}</button>
        {EVENT_KINDS_ORDER.map(k => (
          <button key={k} className={'pill ' + (kind === k ? 'active' : '')} onClick={() => setKind(k)}>
            {EVENT_KIND_META[k].label} · {countOf(k)}
          </button>
        ))}
        <span style={{ width: 1, height: 18, background: 'var(--line)', margin: '0 4px' }}></span>
        <span className="muted" style={{ fontSize: 12 }}>状态</span>
        {[
          { k: 'all', l: '全部' },
          { k: 'pending', l: '待处理' },
          { k: 'done', l: '已完结' },
        ].map(f => (
          <button key={f.k} className={'pill ' + (status === f.k ? 'active' : '')} onClick={() => setStatus(f.k)}>{f.l}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-2)' }}>共 {list.length} 条</span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {list.map(ev => <EventRow key={ev.id} ev={ev} onClick={onOpenEvent} />)}
        {list.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>暂无事件</div>}
      </div>
    </div>
  );
}

window.EventsPage = EventsPage;

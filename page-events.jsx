/* ② Events center — 违规 + 告警 + 整改 统一时间流 */
function EventsPage({ onOpenEvent }) {
  const [kind, setKind] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const list = MOCK.events.filter(e => {
    if (kind !== 'all' && e.kind !== kind) return false;
    if (status === 'pending' && !(e.status === 'active' || e.status === 'pending')) return false;
    if (status === 'done' && !(e.status === 'done' || e.status === 'handled')) return false;
    return true;
  });
  const counts = {
    all: MOCK.events.length,
    alert: MOCK.events.filter(e => e.kind === 'alert').length,
    violation: MOCK.events.filter(e => e.kind === 'violation').length,
    rectify: MOCK.events.filter(e => e.kind === 'rectify').length,
  };

  return (
    <div>
      <div className="page-h">
        <div>
          <div className="page-title">事件中心</div>
          <div className="page-sub">告警、违规、整改三类事件的统一时间流。所有处理动作都留痕。</div>
        </div>
        <div className="row">
          <button className="btn">批量导出</button>
          <button className="btn btn-primary">+ 登记违规</button>
        </div>
      </div>

      <div className="filters">
        <span className="muted" style={{ fontSize: 12 }}>类型</span>
        {[
          { k: 'all', l: '全部', c: counts.all },
          { k: 'alert', l: '🚨 实时告警', c: counts.alert },
          { k: 'violation', l: '⚖ 违规登记', c: counts.violation },
          { k: 'rectify', l: '🔧 整改跟进', c: counts.rectify },
        ].map(f => (
          <button key={f.k} className={'pill ' + (kind === f.k ? 'active' : '')} onClick={() => setKind(f.k)}>
            {f.l} · {f.c}
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

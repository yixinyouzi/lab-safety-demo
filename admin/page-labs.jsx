/* ③ Labs ledger */
function LabsPage({ onOpenLab }) {
  const [view, setView] = React.useState('tiles'); // tiles | list
  const [f, setF] = React.useState('all');
  const labs = MOCK.labs.filter(l => f === 'all' || l.status === f);

  return (
    <div>
      <div className="page-h">
        <div>
          <div className="page-title">实验室台账</div>
          <div className="page-sub">全院 {MOCK.labs.length} 间实验室 · 每间有完整的危险类别、设备、负责人与培训要求档案</div>
        </div>
        <div className="row">
          <button className="btn">导出 Excel</button>
          <button className="btn btn-primary">+ 新增实验室</button>
        </div>
      </div>

      <div className="filters">
        {[
          { k: 'all', l: '全部', n: MOCK.labs.length },
          { k: 'normal', l: '🟢 正常', n: MOCK.labs.filter(l => l.status === 'normal').length },
          { k: 'warning', l: '🟡 关注', n: MOCK.labs.filter(l => l.status === 'warning').length },
          { k: 'rectifying', l: '🔴 整改中', n: MOCK.labs.filter(l => l.status === 'rectifying').length },
        ].map(x => (
          <button key={x.k} className={'pill ' + (f === x.k ? 'active' : '')} onClick={() => setF(x.k)}>{x.l} · {x.n}</button>
        ))}
        <div style={{ marginLeft: 'auto' }} className="row">
          <button className={'pill ' + (view === 'tiles' ? 'active' : '')} onClick={() => setView('tiles')}>▦ 卡片</button>
          <button className={'pill ' + (view === 'list' ? 'active' : '')} onClick={() => setView('list')}>☰ 列表</button>
        </div>
      </div>

      {view === 'tiles' ? (
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {labs.map(l => (
            <div key={l.id} className="card" style={{ cursor: 'pointer', padding: 0 }} onClick={() => onOpenLab(l)}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
                    <span className="mono">{l.id}</span> · {l.name}
                  </div>
                  <div className="meta" style={{ marginTop: 2 }}>{l.dept} · 负责人 {l.lead}</div>
                </div>
                {statusChip(l.status)}
              </div>
              <div style={{ padding: '12px 16px' }}>
                <div className="row" style={{ gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {l.hazards.slice(0, 4).map(h => <span key={h} className="chip chip-gray">{h}</span>)}
                  {l.hazards.length > 4 && <span className="chip chip-gray">+{l.hazards.length - 4}</span>}
                </div>
                <div className="row" style={{ fontSize: 12, color: 'var(--ink-2)', justifyContent: 'space-between' }}>
                  <span>🌡 <span className="num">{l.temp}</span>°C · 💧 <span className="num">{l.humidity}</span>%</span>
                  <span>👥 在室 <strong className="num">{l.inRoom}</strong> · 今日 {l.today} 人次</span>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="meta">安全积分</span>
                  <span style={{ fontWeight: 700, color: l.score >= 85 ? 'var(--green)' : l.score >= 60 ? 'var(--amber)' : 'var(--red)' }}>
                    <span className="num">{l.score}</span> / 100
                  </span>
                </div>
                {l.note && <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--bg)', borderRadius: 4, fontSize: 11, color: 'var(--ink-2)' }}>💬 {l.note}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 80 }}>编号</th>
                <th>实验室</th>
                <th>负责人</th>
                <th>危险类别</th>
                <th>状态</th>
                <th>积分</th>
                <th>在室</th>
              </tr>
            </thead>
            <tbody>
              {labs.map(l => (
                <tr key={l.id} onClick={() => onOpenLab(l)}>
                  <td className="mono"><strong>{l.id}</strong></td>
                  <td><strong>{l.name}</strong><div className="meta">{l.dept}</div></td>
                  <td>{l.lead}</td>
                  <td><div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>{l.hazards.slice(0,3).map(h => <span key={h} className="chip chip-gray">{h}</span>)}</div></td>
                  <td>{statusChip(l.status)}</td>
                  <td className="num">{l.score}</td>
                  <td className="num">{l.inRoom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

window.LabsPage = LabsPage;

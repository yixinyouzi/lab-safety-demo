/* ① Inbox — 管理员每日首页，收件箱式 */
const { useState: useStateI } = React;

function statusChip(s) {
  if (s === 'normal') return <span className="chip chip-green">正常</span>;
  if (s === 'warning') return <span className="chip chip-amber">关注</span>;
  if (s === 'rectifying') return <span className="chip chip-red">整改中</span>;
  return <span className="chip chip-gray">{s}</span>;
}

function Kpi({ label, value, meta, color, trend }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      {meta && <div className="kpi-meta">{meta}</div>}
      {trend && (
        <div className="spark" style={{ marginTop: 10 }}>
          {trend.map((v, i) => (
            <div key={i} className="spark-bar" style={{ height: (v / 40) * 100 + '%' }} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({ ev, onClick }) {
  const sev = ev.severity;
  const meta = EVENT_KIND_META[ev.kind] || { label: ev.kind, color: 'var(--ink-2)' };
  return (
    <div className={`ev ev-${sev} ${ev.status === 'done' || ev.status === 'handled' ? 'ev-done' : ''}`} onClick={() => onClick && onClick(ev)}>
      <div className="ev-t-time">
        <div className="ev-t-kind" style={{ color: meta.color }}>{meta.label.split(' ')[0]}</div>
        <div>{ev.time}</div>
      </div>
      <div>
        <div className="ev-title">
          <span className="chip chip-gray" style={{ marginRight: 6 }}>{ev.lab}</span>
          {ev.title}
        </div>
        <div className="ev-detail">{ev.detail}</div>
        {ev.progress != null && (
          <div className="progress" style={{ marginTop: 8, maxWidth: 200 }}>
            <div className="progress-fill" style={{ width: ev.progress + '%' }} />
          </div>
        )}
      </div>
      <div className="stack-s" style={{ alignItems: 'flex-end' }}>
        {ev.counter && <div className="meta" style={{ fontSize: 11, fontFamily: 'var(--font-num)' }}>{ev.counter}</div>}
        {ev.status === 'active' && <button className="btn btn-sm btn-danger">立即处理</button>}
        {ev.status === 'pending' && <button className="btn btn-sm btn-primary">处理</button>}
        {(ev.status === 'done' || ev.status === 'handled') && <span className="chip chip-gray">已完结</span>}
      </div>
    </div>
  );
}

function InboxPage({ onOpenEvent, onOpenLab }) {
  const pending = MOCK.events.filter(e => e.status === 'active' || e.status === 'pending');
  const labs = MOCK.labs;
  const totalInRoom = labs.reduce((s, l) => s + l.inRoom, 0);
  const totalToday = labs.reduce((s, l) => s + l.today, 0);
  const criticalPending = pending.filter(e => e.severity === 'critical').length;
  const todayScoring = MOCK.events.filter(e => e.time.startsWith('今日') && EVENT_KIND_META[e.kind]?.scoring).length;
  const trend = MOCK.trend7d;
  const trendAvg = Math.round(trend.reduce((s, n) => s + n, 0) / trend.length);
  const trendToday = trend[trend.length - 1];
  const trendDelta = trendAvg ? Math.round((trendToday - trendAvg) / trendAvg * 100) : 0;
  const trendArrow = trendDelta > 0 ? '↑' : trendDelta < 0 ? '↓' : '→';

  return (
    <div>
      <div className="page-h">
        <div>
          <div className="page-title">早上好，雪茹 👋</div>
          <div className="page-sub">今天是 2026 年 4 月 21 日 · 你有 <strong style={{ color: 'var(--red)' }}>{pending.length} 件</strong> 事需要处理</div>
        </div>
        <div className="row">
          <button className="btn">导出日报</button>
          <button className="btn btn-primary">+ 新建巡查记录</button>
        </div>
      </div>

      <div className="kpi-row">
        <Kpi label="待处理事项" value={pending.length} meta={`其中 ${criticalPending} 件严重告警`} color="var(--red)" />
        <Kpi label="当前在实验室人数" value={totalInRoom} meta={`今日累计出入 ${totalToday} 人次`} />
        <Kpi label="今日扣分事件" value={todayScoring} meta="仅检查 + 重大违规计入" color="var(--amber)" />
        <Kpi label="近 7 日事件趋势" value={trendToday} meta={`日均 ${trendAvg} · 较均值 ${trendArrow}${Math.abs(trendDelta)}%`} trend={trend} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        {/* Left — pending list */}
        <div className="card">
          <div className="card-h">
            <h3>待我处理 <span className="chip chip-red" style={{ marginLeft: 6 }}>{pending.length}</span></h3>
            <div className="row">
              <button className="pill active">全部</button>
              <button className="pill">告警</button>
              <button className="pill">违规</button>
              <button className="pill">整改</button>
            </div>
          </div>
          <div>
            {pending.map(ev => <EventRow key={ev.id} ev={ev} onClick={onOpenEvent} />)}
          </div>
          <div style={{ padding: 10, textAlign: 'center' }}>
            <button className="btn btn-ghost btn-sm">查看全部事件 →</button>
          </div>
        </div>

        {/* Right — labs at-a-glance + activity */}
        <div className="stack-l">
          <div className="card">
            <div className="card-h">
              <h3>实验室状态 · 实时</h3>
              <span className="meta"><span className="dot-live"></span> 每 5 秒刷新</span>
            </div>
            <div className="card-body">
              <div className="lab-grid">
                {labs.slice(0, 8).map(l => (
                  <div key={l.id} className={`lab-tile lab-tile-${l.status}`} onClick={() => onOpenLab(l)}>
                    {l.status !== 'normal' && <span className="lab-tile-pulse"><span className="dot-live"></span></span>}
                    <div>
                      <div className="lab-tile-id">{l.id}</div>
                      <div className="lab-tile-name">{l.name}</div>
                    </div>
                    <div className="lab-tile-meta">
                      <span className="num">{l.inRoom}</span> 人在室 · {l.temp}°C
                    </div>
                  </div>
                ))}
              </div>
              <div className="row" style={{ justifyContent: 'center', gap: 16, marginTop: 14, fontSize: 11, color: 'var(--ink-2)' }}>
                <span>🟢 正常 {labs.filter(l => l.status === 'normal').length}</span>
                <span>🟡 关注 {labs.filter(l => l.status === 'warning').length}</span>
                <span>🔴 整改 {labs.filter(l => l.status === 'rectifying').length}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>最近出入记录</h3>
              <button className="btn btn-ghost btn-sm">查看全部</button>
            </div>
            <div>
              {MOCK.accessFlow.slice(0, 5).map((a, i) => (
                <div key={i} className="feed-item">
                  <span className="feed-time">{a.t}</span>
                  <span className="feed-ico">{a.action.startsWith('⚠') ? '⚠' : a.action === '进入' ? '→' : a.action.startsWith('拒') ? '✕' : '←'}</span>
                  <span className="feed-text"><strong>{a.who}</strong> {a.action} · {a.lab}</span>
                  <span className="feed-meta">{a.via}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.InboxPage = InboxPage;
window.EventRow = EventRow;
window.statusChip = statusChip;
window.Kpi = Kpi;

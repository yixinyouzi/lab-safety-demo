// ============================================================
// 巡查员端 · 任务 / 登记 / 记录 / 我的
// ============================================================

const PAT_TABS = [
  { key: 'p-tasks', icon: 'list', label: '任务', badge: 4 },
  { key: 'p-log', icon: 'pen', label: '登记' },
  { key: 'p-history', icon: 'clipboard', label: '记录' },
  { key: 'p-me', icon: 'user', label: '我的' },
];

// 任务列表
const PatTasksPage = ({ onNav }) => {
  const u = MP.patrol;
  return (
    <MiniProgram navTitle="巡查任务" navTransparent statusColored tabItems={PAT_TABS} activeTab="p-tasks" onTabChange={onNav}>
      <div className="patrol-head">
        <div className="home-user">
          <div className="home-avatar">{u.avatar}</div>
          <div className="home-user-meta">
            <div className="name">
              {u.name}
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 400 }}>{u.role}</span>
            </div>
            <div className="sub">{u.dept} · 在岗 {u.months} 个月</div>
          </div>
        </div>
      </div>

      <div className="patrol-stats">
        <div className="patrol-stat"><div className="n red">4</div><div className="lb">今日任务</div></div>
        <div className="patrol-stat"><div className="n">{u.thisMonth}</div><div className="lb">本月登记</div></div>
        <div className="patrol-stat"><div className="n green">#{u.rank}</div><div className="lb">巡查榜</div></div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">今日任务（3月10日）</div>
        <div className="wx-list">
          {MP.patrolTasks.map(t => (
            <div key={t.id} className="task-item" onClick={() => onNav('p-log')}>
              <div className={'task-num ' + (t.type === 'urgent' ? 'urgent' : t.type === 'routine' ? 'routine' : '')}>
                {t.time}
              </div>
              <div className="task-body">
                <div className="title">{t.title}</div>
                <div className="desc">{t.lab} · {t.desc}</div>
                <div className="tags">
                  {t.tags.map(tg => {
                    const cls = tg === '紧急' ? 'red' : tg === '复检' ? 'orange' : tg === '例行' ? 'gray' : 'blue';
                    return <span key={tg} className={'wx-tag ' + cls}>{tg}</span>;
                  })}
                </div>
              </div>
              <Icon name="chevron-right" size={16} color="#c7c7cc"/>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 12 }}/>
    </MiniProgram>
  );
};

// 现场登记
const PatLogPage = ({ onNav }) => {
  const [chips, setChips] = React.useState(new Set(['late-alone', 'unreported']));
  const [score, setScore] = React.useState(2);
  const [photos, setPhotos] = React.useState(2);
  const toggle = id => {
    const n = new Set(chips);
    n.has(id) ? n.delete(id) : n.add(id);
    setChips(n);
  };
  return (
    <MiniProgram navTitle="现场登记" tabItems={PAT_TABS} activeTab="p-log" onTabChange={onNav}>
      <div className="form-section">
        <div className="form-section-title">基本信息</div>
        <div className="form-row">
          <div className="form-label">实验室</div>
          <div className="form-ctrl">材料楼 303</div>
          <Icon name="qr" size={16} color="#003f88"/>
        </div>
        <div className="form-row">
          <div className="form-label">时间</div>
          <div className="form-ctrl readonly">2025-03-07 22:40（自动）</div>
        </div>
        <div className="form-row">
          <div className="form-label">当事人</div>
          <div className="form-ctrl">张一凡 · 研究生 · 材料工程</div>
          <div className="form-arrow"><Icon name="chevron-right" size={16}/></div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">违规类型（已选 {chips.size}）</div>
        <div className="chip-group">
          {MP.violationTypes.map(v => (
            <div key={v.id} className={'chip' + (chips.has(v.id) ? ' on' : '')} onClick={() => toggle(v.id)}>
              {v.label}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">现场照片</div>
        <div className="photo-grid" style={{ paddingTop: 4 }}>
          {Array.from({ length: photos }).map((_, i) => (
            <div key={i} className="photo-cell" style={{
              background: `linear-gradient(135deg, hsl(${20 + i*40}, 22%, 38%), hsl(${20 + i*40}, 28%, 22%))`,
              color: 'rgba(255,255,255,0.5)'
            }}>
              <Icon name="camera" size={24}/>
              <span className="ph-label">现场照片 {i+1}</span>
            </div>
          ))}
          {photos < 6 && (
            <div className="photo-cell placeholder" onClick={() => setPhotos(p => Math.min(6, p+1))}>
              <Icon name="plus" size={22}/>
              拍照
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">评定扣分</div>
        <div className="score-slider-wrap">
          <div className="score-slider-row">
            <div className="score-slider">
              <div className="score-slider-fill" style={{ width: (score / 6 * 100) + '%' }}/>
              <div className="score-slider-dot" style={{ left: (score / 6 * 100) + '%' }}/>
            </div>
            <div className="score-slider-val">-{score}</div>
          </div>
          <div className="score-slider-scale">
            {[0,1,2,3,4,5,6].map(n => (
              <span key={n} onClick={() => setScore(n)} style={{ cursor: 'pointer', color: n === score ? 'var(--wx-red)' : undefined, fontWeight: n === score ? 600 : 400 }}>{n}</span>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, padding: '8px 10px', background: '#faf1e0', borderRadius: 6 }}>
            <Icon name="info" size={12} color="#e6a700"/> &nbsp;
            按规则表：夜间单人作业 + 未报备 → 建议扣 2 分，挂黄牌。
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">巡查员备注</div>
        <div style={{ padding: '0 16px 16px' }}>
          <textarea
            placeholder="补充现场情况说明…"
            style={{ width: '100%', minHeight: 72, border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' }}
            defaultValue="22:40 到场，当事人独自在烧结炉前操作。口述 20:05 口头告知导师，但系统无报备记录。设备工况正常。"
          />
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('p-tasks')}>存草稿</button>
        <button className="wx-btn block" style={{ flex: 2 }} onClick={() => onNav('p-log-done')}>
          提交 · 自动通知当事人
        </button>
      </div>
    </MiniProgram>
  );
};

// 登记完成
const PatLogDonePage = ({ onNav }) => (
  <MiniProgram navTitle="登记完成" showBack onBack={() => onNav('p-tasks')} hideTabBar>
    <div className="scan-result-card" style={{ marginTop: 24 }}>
      <div className="scan-result-icon ok">
        <Icon name="check" size={30} stroke={3}/>
      </div>
      <div className="scan-result-title">违规登记成功</div>
      <div className="scan-result-sub">编号 V20250307-018 · 已入事件中心</div>
    </div>

    <div className="wx-card">
      <div className="wx-card-title">后续自动处理</div>
      <div className="timeline">
        <div className="tl-item done"><div className="tl-dot"><Icon name="check" size={10} color="#fff" stroke={3}/></div>
          <div className="tl-body"><div className="t1">扣分 / 挂黄牌</div><div className="t2">张一凡 -2 分 · 当前 78 分</div></div>
        </div>
        <div className="tl-item done"><div className="tl-dot"><Icon name="check" size={10} color="#fff" stroke={3}/></div>
          <div className="tl-body"><div className="t1">短信 + 小程序消息通知</div><div className="t2">已推送至张一凡与导师李建国</div></div>
        </div>
        <div className="tl-item done"><div className="tl-dot"><Icon name="check" size={10} color="#fff" stroke={3}/></div>
          <div className="tl-body"><div className="t1">门禁权限暂停</div><div className="t2">已同步至门禁系统</div></div>
        </div>
        <div className="tl-item current"><div className="tl-dot"/>
          <div className="tl-body"><div className="t1">等待当事人处理</div><div className="t2">申诉 / 整改 / 培训</div></div>
        </div>
      </div>
    </div>

    <div style={{ padding: '0 16px' }}>
      <button className="wx-btn block" onClick={() => onNav('p-tasks')}>返回任务</button>
    </div>
  </MiniProgram>
);

// 记录
const PatHistoryPage = ({ onNav }) => (
  <MiniProgram navTitle="巡查记录" tabItems={PAT_TABS} activeTab="p-history" onTabChange={onNav}>
    <div style={{ padding: '10px 16px', display: 'flex', gap: 8, background: '#fff', borderBottom: '0.5px solid var(--line)' }}>
      <span className="wx-tag green" style={{ padding: '4px 10px' }}>本月 · 12 条</span>
      <span className="wx-tag gray" style={{ padding: '4px 10px' }}>全部类型</span>
      <span className="wx-tag gray" style={{ padding: '4px 10px' }}>全部状态</span>
    </div>
    <div className="wx-card" style={{ marginTop: 8 }}>
      <div className="wx-list">
        {MP.patrolHistory.map(h => {
          const statusMap = {
            appealed: { cls: 'orange', label: '申诉中' },
            rectifying: { cls: 'blue', label: '整改中' },
            closed: { cls: 'green', label: '已结案' },
          };
          const st = statusMap[h.status];
          return (
            <div key={h.id} className="task-item" onClick={() => h.id === 'V20250307-018' ? onNav('violation') : alert('记录详情 · ' + h.title)}>
              <div className="task-num routine">{h.time}</div>
              <div className="task-body">
                <div className="title" style={{ fontSize: 14 }}>{h.title}</div>
                <div className="desc">{h.who !== '—' ? `${h.who} · ` : ''}{h.lab}</div>
                <div className="tags">
                  <span className={'wx-tag ' + st.cls}>{st.label}</span>
                  <span className="wx-tag red">{h.score} 分</span>
                </div>
              </div>
              <Icon name="chevron-right" size={16} color="#c7c7cc"/>
            </div>
          );
        })}
      </div>
    </div>
  </MiniProgram>
);

// 我的
const PatMePage = ({ onNav }) => {
  const u = MP.patrol;
  return (
    <MiniProgram navTitle="我的" tabItems={PAT_TABS} activeTab="p-me" onTabChange={onNav} navTransparent statusColored>
      <div className="me-hero" style={{ background: 'linear-gradient(165deg,#003f88 0%,#001f4d 100%)' }}>
        <div className="me-user">
          <div className="me-avatar">{u.avatar}</div>
          <div className="me-user-meta">
            <div className="name">
              {u.name}
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 400 }}>{u.role}</span>
            </div>
            <div className="sub">{u.dept} · 在岗 {u.months} 个月</div>
          </div>
        </div>
      </div>
      <div className="me-stats">
        <div className="me-stat"><div className="n">{u.totalLogs}</div><div className="lb">累计登记</div></div>
        <div className="me-stat"><div className="n">{u.thisMonth}</div><div className="lb">本月登记</div></div>
        <div className="me-stat"><div className="n" style={{ color: '#003f88' }}>#{u.rank}</div><div className="lb">巡查榜</div></div>
      </div>

      <div className="wx-card">
        <div className="wx-list">
          <div className="wx-cell" onClick={() => alert('本月排行榜 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="medal" size={18} color="#e6a700"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">本月排行榜</div></div>
            <div className="wx-cell-ft arrow">第 2 名</div>
          </div>
          <div className="wx-cell" onClick={() => alert('巡查清单模板 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="clipboard" size={18} color="#4a6fa5"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">巡查清单模板</div></div>
            <div className="wx-cell-ft arrow">12 项</div>
          </div>
          <div className="wx-cell" onClick={() => alert('应急处置卡 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="shield" size={18} color="#003f88"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">应急处置卡</div></div>
            <div className="wx-cell-ft arrow"/>
          </div>
          <div className="wx-cell" onClick={() => alert('设置 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="info" size={18} color="#8e8e93"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">设置</div></div>
            <div className="wx-cell-ft arrow"/>
          </div>
        </div>
      </div>

      <div className="me-logout" onClick={() => onNav('login')}>
        <Icon name="logout" size={14} color="#d4453a"/> &nbsp;退出登录
      </div>
    </MiniProgram>
  );
};

Object.assign(window, {
  PAT_TABS, PatTasksPage, PatLogPage, PatLogDonePage, PatHistoryPage, PatMePage,
});

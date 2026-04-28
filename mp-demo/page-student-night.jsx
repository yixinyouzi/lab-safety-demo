// ============================================================
// 学生端 · 过夜实验申请（反馈 10 · 工作日 4 级 / 周末节假日 3 级）
// 列表（含内嵌 timeline）/ 申请表单 / 提交成功 三页
// ============================================================

const NIGHT_STATUS_MP = {
  'advisor-review': { label: '导师审核中',     cls: 'orange' },
  'center-review':  { label: '实验中心复核中', cls: 'orange' },
  'dean-review':    { label: '学院终审中',     cls: 'orange' },
  approved:         { label: '已批准',         cls: 'blue' },
  'in-progress':    { label: '执行中',         cls: 'green' },
  closed:           { label: '已结案',         cls: 'gray' },
  rejected:         { label: '已驳回',         cls: 'red' },
};

const NIGHT_MODE_MP = {
  weekday: { label: '工作日 · 4 级审批', cls: 'red' },
  weekend: { label: '周末/节假日 · 3 级审批', cls: 'blue' },
};

const StuNightListPage = ({ onNav }) => {
  const list = MP.nightExperiments || [];
  const me = MP.student?.name;
  const mine = list.filter(n => n.applicant === me);

  return (
    <MiniProgram navTitle="我的过夜申请" showBack onBack={() => onNav('home')} hideTabBar>
      <div style={{ padding: '12px 16px 4px', background: '#fff' }}>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          过夜实验须经 <strong>四级审批</strong>（学生→导师→实验中心→副院长）；
          周末节假日 <strong>三级</strong>（学生→导师→实验中心）。所有过夜实验须双人在场。
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="wx-card">
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#999', fontSize: 13 }}>
            还没有过夜申请，点下方按钮新建
          </div>
        </div>
      ) : mine.map(n => {
        const stat = NIGHT_STATUS_MP[n.status] || { label: n.status, cls: 'gray' };
        const mode = NIGHT_MODE_MP[n.mode];
        return (
          <div key={n.id} className="wx-card">
            <div style={{ padding: '14px 16px 0' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className={'wx-tag ' + mode.cls}>{mode.label}</span>
                <span className={'wx-tag ' + stat.cls}>{stat.label}</span>
                <span className="wx-tag gray">阶段 {n.currentStep}/{n.timeline.length}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#000', lineHeight: 1.4 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                实验室 {n.lab} · 导师 {n.advisor}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                ⏱ {n.dateRange} · {n.timeRange}
              </div>
            </div>

            <div style={{ padding: '10px 16px 12px' }}>
              <div style={{ fontSize: 13, color: '#333', background: '#f7f7f7', padding: 10, borderRadius: 6, lineHeight: 1.6 }}>
                <strong style={{ fontSize: 12, color: '#666' }}>范围：</strong>{n.scope}
                <div style={{ marginTop: 4 }}>
                  <strong style={{ fontSize: 12, color: '#666' }}>SOP：</strong>{n.sop}
                </div>
                <div style={{ marginTop: 4 }}>
                  <strong style={{ fontSize: 12, color: '#666' }}>同行人：</strong>{n.accompanies.join('、')}
                </div>
                <div style={{ marginTop: 4 }}>
                  <strong style={{ fontSize: 12, color: '#666' }}>应急：</strong>{n.emergency}
                </div>
              </div>
            </div>

            <div style={{ padding: '0 16px 4px', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              审批 / 推进时间线
            </div>
            <div className="timeline" style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 14 }}>
              {n.timeline.map((t, i) => (
                <div key={i} className={'tl-item' + (t.done ? ' done' : '') + (t.current ? ' current' : '')}>
                  <div className="tl-dot">
                    {t.done && <Icon name="check" size={10} color="#fff" stroke={3}/>}
                  </div>
                  <div className="tl-body">
                    <div className="t1">{t.title}</div>
                    <div className="t2">{t.desc}</div>
                    <div className="t3">{t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mp-bottom-bar">
        <button className="wx-btn block" onClick={() => onNav('night-form')}>
          <Icon name="bell" size={16} color="#fff"/> &nbsp;+ 新建过夜申请
        </button>
      </div>
    </MiniProgram>
  );
};

const StuNightFormPage = ({ onNav }) => {
  const [labId, setLabId] = React.useState('302');
  const [mode, setMode] = React.useState('weekday');
  const [title, setTitle] = React.useState('');
  const [dateRange, setDateRange] = React.useState('');
  const [scope, setScope] = React.useState('');
  const [accompany, setAccompany] = React.useState('');
  const [emergency, setEmergency] = React.useState('');

  const lab = (MP.labs || []).find(l => l.id === labId);
  const advisor = lab?.lead || '—';

  const submit = () => {
    if (!title.trim()) return alert('请填写实验名');
    if (!dateRange.trim()) return alert('请填写起止时段');
    if (!scope.trim()) return alert('请填写实验范围');
    if (!accompany.trim()) return alert('过夜实验须双人在场，请至少填 1 位同行人');
    if (!emergency.trim()) return alert('请填写应急联系方式');
    onNav('night-sent');
  };

  return (
    <MiniProgram navTitle="新建过夜申请" showBack onBack={() => onNav('night')} hideTabBar>
      <div className="wx-card">
        <div className="wx-card-title">基本信息</div>
        <div className="wx-list">
          <div className="wx-cell">
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>实验名 *</div>
            <div className="wx-cell-bd">
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="如：高温烧结 800°C 过夜降温"
                style={{ width: '100%', border: 'none', fontSize: 14, outline: 'none', padding: '6px 0' }} />
            </div>
          </div>
          <div className="wx-cell">
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>实验室</div>
            <div className="wx-cell-bd">
              <select value={labId} onChange={e => setLabId(e.target.value)}
                style={{ width: '100%', border: 'none', fontSize: 14, outline: 'none', padding: '6px 0', background: 'transparent' }}>
                {(MP.labs || []).map(l => <option key={l.id} value={l.id}>{l.id} · {l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="wx-cell">
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>导师</div>
            <div className="wx-cell-bd" style={{ fontSize: 14, color: '#333' }}>
              {advisor} <span style={{ fontSize: 11, color: '#999' }}>（自动）</span>
            </div>
          </div>
          <div className="wx-cell">
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>起止时段 *</div>
            <div className="wx-cell-bd">
              <input value={dateRange} onChange={e => setDateRange(e.target.value)}
                placeholder="如 2026-05-02 19:00 → 05-03 07:30"
                style={{ width: '100%', border: 'none', fontSize: 14, outline: 'none', padding: '6px 0' }} />
            </div>
          </div>
          <div className="wx-cell">
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>类型</div>
            <div className="wx-cell-bd" style={{ display: 'flex', gap: 8 }}>
              {Object.entries(NIGHT_MODE_MP).map(([k, m]) => (
                <div key={k} onClick={() => setMode(k)}
                  style={{
                    padding: '6px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer',
                    background: mode === k ? '#003f88' : '#f5f5f7',
                    color: mode === k ? '#fff' : '#666',
                  }}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">实验范围 *</div>
        <div style={{ padding: '4px 16px 16px' }}>
          <textarea value={scope} onChange={e => setScope(e.target.value)}
            placeholder="说明过夜实验的科学必要性（如：样品需 6h 持续高温后自然降温）。"
            style={{ width: '100%', minHeight: 70, border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' }} />
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">同行人员 *（≥1 位）</div>
        <div style={{ padding: '4px 16px 16px' }}>
          <input value={accompany} onChange={e => setAccompany(e.target.value)}
            placeholder="如：李思远（同组博三）、陈延松（夜班巡查员）"
            style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 14, outline: 'none' }} />
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.6 }}>
            过夜实验严禁单人操作；如同行人为非同实验室，须先在巡查员处登记。
          </div>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">应急联系 *</div>
        <div style={{ padding: '4px 16px 16px' }}>
          <textarea value={emergency} onChange={e => setEmergency(e.target.value)}
            placeholder="如：炉温异常报警 → 立即联系导师赵振华（135-xxxx-6602）+ 王玉鸿（135-xxxx-6688）"
            style={{ width: '100%', minHeight: 70, border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' }} />
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('night')}>取消</button>
        <button className="wx-btn block" style={{ flex: 2 }} onClick={submit}>提交申请</button>
      </div>
    </MiniProgram>
  );
};

const StuNightSentPage = ({ onNav }) => (
  <TeaSubmittedView
    navTitle="提交成功"
    icon="check" iconBg="#ede9fe" iconColor="#5b21b6"
    title="过夜申请已提交"
    subtitle="进入分级审批流程"
    syncList={[
      '导师赵振华（小程序消息 · 24h 内审核）',
      '通过后推送实验中心王玉鸿现场核验',
      '工作日继续推送学院安全副院长终审',
    ]}
    footnote={<>过夜实验<strong>严禁单人操作</strong>；门牌将在批准后自动切「高风险作业」状态，未到时段或越期进入将被门禁拒绝。</>}
    onBack={() => onNav('night')}
    backText="查看我的申请"
  />
);

Object.assign(window, { StuNightListPage, StuNightFormPage, StuNightSentPage });

// ============================================================
// 实验室管理员端 · 任务 / 登记 / 记录 / 我的
// ============================================================

const PAT_TABS = [
  { key: 'p-tasks', icon: 'list', label: '任务', badge: 4 },
  { key: 'p-log', icon: 'pen', label: '登记' },
  { key: 'p-history', icon: 'clipboard', label: '记录' },
  { key: 'p-me', icon: 'user', label: '我的' },
];

// 任务列表 + 待审工作台
// 路由：appeal → p-appeal / rectify → p-rectify / waste → p-waste
const PAT_KIND_TO_PAGE = { appeal: 'p-appeal', rectify: 'p-rectify', waste: 'p-waste' };
const PatTasksPage = ({ onNav, goPending }) => {
  const u = MP.patrol;
  const pending = MP.patrolPending || [];
  const urgentPending = pending.filter(p => p.urgent);
  const handlePendingClick = (p) => {
    if (goPending) goPending(p);
    else onNav(PAT_KIND_TO_PAGE[p.kind] || 'p-tasks');
  };
  return (
    <MiniProgram navTitle="工作台" navTransparent statusColored tabItems={PAT_TABS} activeTab="p-tasks" onTabChange={onNav}>
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
        {/* 「待我审核」整块可点击 → 跳全量待审列表页 · cursor:pointer 暗示交互 */}
        <div className="patrol-stat" style={{ cursor: 'pointer' }} onClick={() => onNav('p-pending')}>
          <div className="n red">{pending.length}</div>
          <div className="lb">待我审核 ›</div>
        </div>
        <div className="patrol-stat"><div className="n">{u.thisMonth}</div><div className="lb">本月登记</div></div>
        <div className="patrol-stat"><div className="n green">#{u.rank}</div><div className="lb">管理榜</div></div>
      </div>

      {/* 紧急待办 banner · 申诉类优先 */}
      {urgentPending.length > 0 && (
        <div className="alert-banner" onClick={() => handlePendingClick(urgentPending[0])}
             style={{ background: 'linear-gradient(135deg,#fbe9e7 0%,#f8ddd9 100%)', borderColor: '#e8a69b', cursor: 'pointer' }}>
          <div className="alert-banner-icon" style={{ background: 'var(--wx-red)' }}>
            <Icon name="warn" size={20} color="#fff"/>
          </div>
          <div className="alert-banner-body">
            <div className="alert-banner-title" style={{ color: '#8a1f14' }}>
              {urgentPending.length} 条申诉待终审
            </div>
            <div style={{ fontSize: 12, color: '#5c4515', marginBottom: 6 }}>
              {urgentPending[0].title}
            </div>
            <button className="wx-btn mini" style={{ background: 'var(--wx-red)' }} onClick={() => handlePendingClick(urgentPending[0])}>
              立即终审 <Icon name="chevron-right" size={12} color="#fff"/>
            </button>
          </div>
        </div>
      )}

      {/* 待审工作台 · 三类下放事项：申诉复核 / 整改验收 / 废液接收
        * Home 仅显示前 3 条；点右上「全部」跳 PatPendingListPage 全量页 */}
      <div className="wx-card">
        <div className="wx-card-title">
          待审工作台
          <span className="more" onClick={() => onNav('p-pending')}>
            全部 {pending.length} 条 <Icon name="chevron-right" size={12}/>
          </span>
        </div>
        <div className="wx-list">
          {pending.slice(0, 3).map(p => {
            const meta = (typeof MP_PENDING_KIND_META !== 'undefined' && MP_PENDING_KIND_META[p.kind])
              || { bg: '#f5f5f7', color: 'var(--text-2)', icon: 'info' };
            return (
              <div key={p.id} className="wx-cell" onClick={() => handlePendingClick(p)}>
                <div className="wx-cell-hd">
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: meta.bg, color: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon name={meta.icon} size={18}/>
                  </div>
                </div>
                <div className="wx-cell-bd">
                  <div className="wx-cell-bd-title">
                    {p.title}
                    <span className={'wx-tag ' + p.tagCls}>{p.tag}</span>
                  </div>
                  <div className="wx-cell-bd-desc">{p.sub}</div>
                </div>
                <div className="wx-cell-ft" style={{ fontSize: 11 }}>{p.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 我管理的实验室 · 实时看板（视频 + 在室 + 温度 + 一键呼叫管理员/现场学生） */}
      <div style={{ padding: '8px 12px 4px', fontSize: 12, color: 'var(--text-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        MY ZONE · 实时看板（{(u.myLabIds || []).length}）
      </div>
      {(u.myLabIds || []).map(id => {
        const lab = (MP.labs || []).find(l => l.id === id);
        return lab ? <LabRealtimeCard key={id} lab={lab} /> : null;
      })}

      <div className="wx-card">
        <div className="wx-card-title">今日任务（4月21日）</div>
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

// 现场登记 · 按 PDF 5 大类挑规则 → 自动算分（不再 0-6 滑块自由调）
// 数据来自 SCORING.RULES（lib/scoring-rules.js），单一规则真相源
const PatLogPage = ({ onNav }) => {
  const [tab, setTab] = React.useState('hazard');                                  // 当前类目 tab
  const [picked, setPicked] = React.useState(new Set());                            // 已选规则 id（初始为空，管理员主动勾）
  const [multiplier, setMultiplier] = React.useState(false);                       // 情节加重 ×2（PDF 第九条：相同违规多处）
  const [waived, setWaived] = React.useState(false);                               // 情节轻微免予记分（PDF 第十四条 · raw 用户意图）
  const [photos, setPhotos] = React.useState(2);

  const toggle = (id) => {
    const n = new Set(picked);
    n.has(id) ? n.delete(id) : n.add(id);
    setPicked(n);
  };
  const selected = Array.from(picked).map(id => SCORING.RULE_INDEX[id]).filter(Boolean);
  // 任一选中规则不可豁免（30 分档），则强制禁用免予
  const anyNonWaivable = selected.some(r => r.waivable === false);
  // effectiveWaived = 用户意图 & 当前选中规则允许豁免（避免 raw waived state 与 UI disabled 不一致）
  const effectiveWaived = waived && !anyNonWaivable;
  const subtotalRaw = SCORING.tally([{ ruleIds: Array.from(picked) }]);
  const subtotal = effectiveWaived ? 0 : (multiplier ? subtotalRaw * 2 : subtotalRaw);
  // 当事人累积扣分预测（"如果这次不豁免会到几分"）· demo 默认假设登记对象是张一凡
  const subjectStudent = MP.student;
  const projected = SCORING.tally(subjectStudent.personalViolations) + subtotal;
  const projectedVerdict = SCORING.verdict(projected, 'person');

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
          <div className="form-ctrl readonly">2026-04-15 22:40（自动）</div>
        </div>
        <div className="form-row">
          <div className="form-label">当事人</div>
          <div className="form-ctrl">{subjectStudent.name} · {subjectStudent.grade}</div>
          <div className="form-arrow"><Icon name="chevron-right" size={16}/></div>
        </div>
      </div>

      {/* 违规规则 · 5 类 tab + 规则多选（取代 12 自由 chip + 0-6 滑块） */}
      <div className="form-section">
        <div className="form-section-title">违规规则（已选 {picked.size} 条 · 共 {SCORING.RULES.length}）</div>
        <div className="rule-tabs">
          {SCORING.CATEGORY_ORDER.map(k => {
            const c = SCORING.CATEGORIES[k];
            const cnt = SCORING.RULES.filter(r => r.cat === k).length;
            const sel = SCORING.RULES.filter(r => r.cat === k && picked.has(r.id)).length;
            return (
              <div key={k} className={'rule-tab ' + (tab === k ? 'on' : '')} onClick={() => setTab(k)}>
                <span className="ico">{c.icon}</span>
                <span>{c.short}</span>
                <span className="cnt">{sel > 0 ? sel + '/' + cnt : cnt}</span>
              </div>
            );
          })}
        </div>
        <div className="rule-list">
          {SCORING.RULES.filter(r => r.cat === tab).map(r => {
            const on = picked.has(r.id);
            return (
              <div key={r.id} className={'rule-row' + (on ? ' on' : '')} onClick={() => toggle(r.id)}>
                <div className="rule-check">
                  {on
                    ? <div className="rule-check-on"><Icon name="check" size={11} color="#fff" stroke={3}/></div>
                    : <div className="rule-check-off"/>}
                </div>
                <div className="rule-body">
                  <div className="rule-h">
                    <span className="rule-code mono">{r.code}</span>
                    {/* 单条严重度 · 不是累积档位（与 PERSON_THRESHOLDS 0/6/9/12 巧合一致） */}
                    <span className={'rule-pts ' + (r.points >= 12 ? 'red' : r.points >= 6 ? 'amber' : '')}>{r.points} 分</span>
                  </div>
                  <div className="rule-desc">{r.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 情节调整 · 加重×2 / 免予记分 */}
      <div className="form-section">
        <div className="form-section-title">情节调整</div>
        <div className="form-row" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="form-label">相同违规多处</div>
          <div className="form-ctrl" style={{ color: 'var(--text-2)' }}>按基准分 ×2 加成（第九条）</div>
          <div className={'wx-switch ' + (multiplier ? 'on' : '')} onClick={() => setMultiplier(!multiplier)}>
            <div className="wx-switch-knob"/>
          </div>
        </div>
        <div className="form-row">
          <div className="form-label">情节轻微</div>
          <div className="form-ctrl" style={{ color: anyNonWaivable ? 'var(--wx-red)' : 'var(--text-2)' }}>
            {anyNonWaivable ? '所选规则有 30 分档 · 不可豁免' : '仅警告，免予记分（第十四条）'}
          </div>
          <div className={'wx-switch ' + (effectiveWaived ? 'on' : '') + (anyNonWaivable ? ' disabled' : '')}
               onClick={() => !anyNonWaivable && setWaived(!waived)}>
            <div className="wx-switch-knob"/>
          </div>
        </div>
      </div>

      {/* 实时小计 */}
      <div className="form-section">
        <div className="form-section-title">本次扣分小计</div>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div className="rule-subtotal-num">
              {effectiveWaived
                ? <span style={{ color: 'var(--text-2)' }}>免予记分</span>
                : <><span className="num">{subtotal}</span><span style={{ fontSize: 14, color: 'var(--text-2)', marginLeft: 4 }}>分</span></>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
              {selected.length === 0 ? '未选规则' : selected.map(r => r.code).join(' · ')}
              {multiplier && !effectiveWaived && ' × 2'}
            </div>
          </div>
          {!effectiveWaived && subtotal > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>当事人累积</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: projectedVerdict.color, fontFamily: 'var(--font-num)' }}>
                {projected} / {SCORING.PERIOD_LIMITS.person}
              </div>
              <div style={{ fontSize: 11, color: projectedVerdict.color, marginTop: 2 }}>{projectedVerdict.label}</div>
            </div>
          )}
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
        <div className="form-section-title">管理员备注</div>
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
        <button className="wx-btn block" style={{ flex: 2 }} onClick={() => onNav('p-log-done')}
                disabled={selected.length === 0}>
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
      <div className="scan-result-sub">编号 {MP.violation.id} · 已入事件中心</div>
    </div>

    <div className="wx-card">
      <div className="wx-card-title">后续自动处理</div>
      <div className="timeline">
        <div className="tl-item done"><div className="tl-dot"><Icon name="check" size={10} color="#fff" stroke={3}/></div>
          <div className="tl-body">
            <div className="t1">扣分 / 挂牌</div>
            <div className="t2">{MP.student.name} -{SCORING.tally([MP.violation])} 分 · 累积 {SCORING.tally(MP.student.personalViolations)}/{SCORING.PERIOD_LIMITS.person} → {SCORING.verdict(SCORING.tally(MP.student.personalViolations), 'person').label}</div>
          </div>
        </div>
        <div className="tl-item done"><div className="tl-dot"><Icon name="check" size={10} color="#fff" stroke={3}/></div>
          <div className="tl-body"><div className="t1">短信 + 小程序消息通知</div><div className="t2">已推送至张一凡与导师赵振华</div></div>
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
  <MiniProgram navTitle="管理记录" tabItems={PAT_TABS} activeTab="p-history" onTabChange={onNav}>
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
          const onClick = () => {
            if (h.id !== MP.violation.id) return alert('记录详情 · ' + h.title);
            // 申诉中 → 管理员终审页；其它状态 → 仅查看
            return onNav(h.status === 'appealed' ? 'p-appeal' : 'violation');
          };
          return (
            <div key={h.id} className="task-item" onClick={onClick}>
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

// 申诉复核 · 终审（实验室管理员 · 反馈：教师不再参与，驳回权全在管理员）
// 反馈 8：驳回权归此页。教师不再参与违规流程任何环节，全部由实验室管理员裁定。
const PatAppealPage = ({ onNav }) => {
  const v = MP.violation;
  const [decision, setDecision] = React.useState(null);   // 'support' | 'reject'
  const [reason, setReason] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    const isSupport = decision === 'support';
    return (
      <TeaSubmittedView
        navTitle="终审完成"
        icon={isSupport ? 'check' : 'x'}
        iconBg={isSupport ? '#e5f5e9' : '#fbe9e7'}
        iconColor={isSupport ? 'var(--wx-success)' : 'var(--wx-red)'}
        title={isSupport ? '已支持申诉 · 撤销扣分' : '已驳回申诉 · 进入整改'}
        subtitle="实验中心终审结论已生成"
        syncList={[
          `学生张一凡（小程序消息 · ${isSupport ? '权限恢复' : '触发整改流程'}）`,
          '导师赵振华（结论已抄送）',
          '管理控制台事件中心',
        ]}
        onBack={() => onNav('p-history')}
        backText="返回记录"
      />
    );
  }

  return (
    <MiniProgram navTitle="申诉复核 · 终审" showBack onBack={() => onNav('p-history')} hideTabBar>
      <div style={{ padding: '10px 16px 0', background: '#fff' }}>
        <div className="wx-tag red" style={{ marginBottom: 8 }}>扣 {SCORING.tally([v])} 分 · 夜间单人作业</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#000' }}>{v.title.split(' · ')[0]} · 申诉终审</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
          违规编号 {v.id} · 申请人 张一凡 · 当前等待您裁定
        </div>
      </div>

      <div className="wx-card" style={{ marginTop: 8 }}>
        <div className="wx-card-title">违规事实</div>
        <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#333', lineHeight: 1.6 }}>
          {v.description}
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">学生申诉</div>
        <div style={{ padding: '4px 16px 14px' }}>
          <div style={{ padding: 12, background: '#f7f7f7', borderRadius: 8, fontSize: 13, lineHeight: 1.65, color: '#333' }}>
            {v.studentAppeal}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>提交于 4月16日 10:30</div>
        </div>
      </div>

      {/* 「导师事实补充」卡片已移除 · 教师不再参与违规流程 · 仅作结论抄送知情 */}

      <div className="wx-card">
        <div className="wx-card-title">终审决定</div>
        <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 10 }}>
          <div
            {...clickable(() => setDecision('support'), '支持申诉')}
            style={{
              flex: 1, textAlign: 'center', padding: '12px 0',
              border: '1.5px solid ' + (decision === 'support' ? 'var(--wx-success)' : 'var(--line)'),
              background: decision === 'support' ? '#e5f5e9' : '#fff',
              color: decision === 'support' ? 'var(--wx-success)' : '#333',
              borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>
            <Icon name="check-circle" size={18} color={decision === 'support' ? 'var(--wx-success)' : 'var(--text-3)'}/> 支持申诉
          </div>
          <div
            {...clickable(() => setDecision('reject'), '驳回申诉')}
            style={{
              flex: 1, textAlign: 'center', padding: '12px 0',
              border: '1.5px solid ' + (decision === 'reject' ? 'var(--wx-red)' : 'var(--line)'),
              background: decision === 'reject' ? '#fbe9e7' : '#fff',
              color: decision === 'reject' ? 'var(--wx-red)' : '#333',
              borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>
            <Icon name="x-circle" size={18} color={decision === 'reject' ? 'var(--wx-red)' : 'var(--text-3)'}/> 驳回申诉
          </div>
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="请简述终审理由（学生与导师都会看到，作为最终结论存档）..."
            style={{
              width: '100%', minHeight: 100, border: '1px solid var(--line)',
              borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'inherit',
              outline: 'none', resize: 'none',
            }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.6 }}>
            {decision === 'reject' && '驳回后学生需完成培训 + 考试 + 整改拍照，管理员复检通过后恢复权限。'}
            {decision === 'support' && '支持申诉将撤销本次扣分、恢复门禁权限，本案归档。'}
            {!decision && '本页是申诉的终审节点，提交后不可撤销。'}
          </div>
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('p-history')}>稍后再处理</button>
        <button
          className={'wx-btn ' + (decision === 'reject' ? 'danger' : '')}
          style={{ flex: 2 }}
          disabled={!decision || !reason.trim()}
          onClick={() => setSubmitted(true)}
        >
          提交终审结论
        </button>
      </div>
    </MiniProgram>
  );
};

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
        <div className="me-stat"><div className="n" style={{ color: 'var(--wx-green)' }}>#{u.rank}</div><div className="lb">管理榜</div></div>
      </div>

      <div className="wx-card">
        <div className="wx-list">
          <div className="wx-cell" onClick={() => alert('本月排行榜 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="medal" size={18} color="#e6a700"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">本月排行榜</div></div>
            <div className="wx-cell-ft arrow">第 2 名</div>
          </div>
          <div className="wx-cell" onClick={() => alert('管理清单模板 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="clipboard" size={18} color="#4a6fa5"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">管理清单模板</div></div>
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

// 待审工作台全量页 · 三类下放事项的完整列表（filter + 全量）
// 入口：PatTasksPage 顶部 stat「待我审核」点击 / 卡片右上「全部」点击
const PAT_PENDING_FILTERS = ['全部', '申诉复核', '整改验收', '废液接收'];
const PAT_KIND_TO_TAG = { appeal: '申诉复核', rectify: '整改验收', waste: '废液接收' };
const PatPendingListPage = ({ onNav, goPending }) => {
  const [f, setF] = React.useState('全部');
  const all = MP.patrolPending || [];
  const list = f === '全部' ? all : all.filter(p => PAT_KIND_TO_TAG[p.kind] === f);
  const handleClick = (p) => {
    if (goPending) goPending(p);
    else onNav(PAT_KIND_TO_PAGE[p.kind] || 'p-tasks');
  };
  return (
    <MiniProgram navTitle="待我审核" showBack onBack={() => onNav('p-tasks')} hideTabBar>
      <div className="filters-bar" style={{ display: 'flex', gap: 8, padding: '10px 16px', background: '#fff', borderBottom: '0.5px solid var(--line)', overflow: 'auto' }}>
        {PAT_PENDING_FILTERS.map(k => {
          const cnt = k === '全部' ? all.length : all.filter(p => PAT_KIND_TO_TAG[p.kind] === k).length;
          return (
            <span key={k} className={'wx-tag ' + (f === k ? 'green' : 'gray')}
                  style={{ padding: '6px 12px', flexShrink: 0, fontSize: 12, cursor: 'pointer' }}
                  onClick={() => setF(k)}>
              {k} {cnt > 0 && <span style={{ marginLeft: 4, opacity: 0.8 }}>{cnt}</span>}
            </span>
          );
        })}
      </div>
      <div className="wx-list" style={{ marginTop: 8 }}>
        {list.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            ✓ 当前 {f} 类无待审事项
          </div>
        ) : list.map(p => {
          const meta = (typeof MP_PENDING_KIND_META !== 'undefined' && MP_PENDING_KIND_META[p.kind])
            || { bg: '#f5f5f7', color: 'var(--text-2)', icon: 'info' };
          return (
            <div key={p.id} className="wx-cell" onClick={() => handleClick(p)}>
              <div className="wx-cell-hd">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: meta.bg, color: meta.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name={meta.icon} size={18}/>
                </div>
              </div>
              <div className="wx-cell-bd">
                <div className="wx-cell-bd-title">
                  {p.title}
                  <span className={'wx-tag ' + p.tagCls}>{p.tag}</span>
                </div>
                <div className="wx-cell-bd-desc">{p.sub}</div>
              </div>
              <div className="wx-cell-ft arrow" style={{ fontSize: 11 }}>{p.time}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
        — 共 {all.length} 条 · 申诉(appeal) / 整改(rectify) / 废液(waste) 三类 —
      </div>
    </MiniProgram>
  );
};

// 整改验收 · 简版（管理员现场签字 / 拍照对比 / 通过-恢复门禁 或 驳回-继续整改）
const PatRectifyPage = ({ onNav, item }) => {
  const [decision, setDecision] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const subject = item?.title || '王磊 · 废液标签整改复核';
  if (submitted) {
    return (
      <TeaSubmittedView
        navTitle="验收完成"
        icon={decision === 'pass' ? 'check' : 'x'}
        iconBg={decision === 'pass' ? '#e5f5e9' : '#fbe9e7'}
        iconColor={decision === 'pass' ? 'var(--wx-success)' : 'var(--wx-red)'}
        title={decision === 'pass' ? '已通过验收 · 恢复门禁' : '驳回 · 继续整改'}
        subtitle="结论已抄送学生 + 指导教师"
        syncList={['学生王磊（小程序消息）', '导师赵振华（结论抄送）', '管理控制台事件中心']}
        onBack={() => onNav('p-tasks')}
        backText="返回工作台"
      />
    );
  }
  return (
    <MiniProgram navTitle="整改验收" showBack onBack={() => onNav('p-tasks')} hideTabBar>
      <div style={{ padding: '10px 16px 0', background: '#fff' }}>
        <span className="wx-tag gold" style={{ marginBottom: 8 }}>整改验收</span>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#000' }}>{subject}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>原违规：3 月 5 日登记 · 危险源管控 四-4 · 扣 6 分</div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">学生上传整改证据 · 4 张</div>
        <div className="photo-grid" style={{ paddingTop: 4 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="photo-cell" style={{
              background: `linear-gradient(135deg, hsl(${150 + i*30}, 25%, 45%), hsl(${150 + i*30}, 28%, 30%))`,
              color: 'rgba(255,255,255,0.5)'
            }}>
              <Icon name="camera" size={22}/>
              <span className="ph-label">整改照片 {i+1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">现场验收</div>
        <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 10 }}>
          <div {...clickable(() => setDecision('pass'), '通过')}
               style={{ flex: 1, textAlign: 'center', padding: '12px 0',
                        border: '1.5px solid ' + (decision === 'pass' ? 'var(--wx-success)' : 'var(--line)'),
                        background: decision === 'pass' ? '#e5f5e9' : '#fff',
                        color: decision === 'pass' ? 'var(--wx-success)' : '#333',
                        borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Icon name="check-circle" size={18} color={decision === 'pass' ? 'var(--wx-success)' : 'var(--text-3)'}/> 通过 · 恢复门禁
          </div>
          <div {...clickable(() => setDecision('fail'), '驳回')}
               style={{ flex: 1, textAlign: 'center', padding: '12px 0',
                        border: '1.5px solid ' + (decision === 'fail' ? 'var(--wx-red)' : 'var(--line)'),
                        background: decision === 'fail' ? '#fbe9e7' : '#fff',
                        color: decision === 'fail' ? 'var(--wx-red)' : '#333',
                        borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Icon name="x-circle" size={18} color={decision === 'fail' ? 'var(--wx-red)' : 'var(--text-3)'}/> 驳回 · 继续整改
          </div>
        </div>
        <div style={{ padding: '8px 16px 16px', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
          {decision === 'pass'  && '通过后学生门禁权限自动恢复、本案归档。'}
          {decision === 'fail' && '驳回后学生需重新整改并上传，复检通过前不解封门禁。'}
          {!decision && '请根据现场拍照核实是否符合整改要求。'}
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('p-tasks')}>稍后再处理</button>
        <button className={'wx-btn ' + (decision === 'fail' ? 'danger' : '')} style={{ flex: 2 }}
                disabled={!decision} onClick={() => setSubmitted(true)}>
          提交验收结论
        </button>
      </div>
    </MiniProgram>
  );
};

Object.assign(window, {
  PAT_TABS, PAT_KIND_TO_PAGE,
  PatTasksPage, PatPendingListPage, PatLogPage, PatLogDonePage, PatHistoryPage,
  PatAppealPage, PatRectifyPage, PatMePage,
});

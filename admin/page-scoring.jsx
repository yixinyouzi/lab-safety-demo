/* ⑨ Scoring · 扣分细则
 * 数据来自 window.SCORING（lib/scoring-rules.js）·  唯一规则真相源
 *
 * 区块顺序（由上至下）：
 *   1. 当前周期 banner — 让人 3 秒内看清记分窗口
 *   2. 处置阈值卡 — 个人 / 实验室 两栏对照
 *   3. 规则字典表 — 5 类 N 条，类目筛选 + 编辑
 *
 * 编辑能力：管理员可对规则做增/删/改 · 持久化到 localStorage（SCORING.applyCustomRules）
 *   · 修订仅本机有效，离场即同步给三端共享 lib，实际生产应走"学院 HSE 工作领导小组"审议链
 */

function ScoringPage() {
  const [cat, setCat] = React.useState('all');
  // tick 是 forceUpdate · 编辑后自增，让 SCORING.RULES 原地变更被 React 感知
  const [, setTick] = React.useState(0);
  // 编辑面板状态：null = 未打开；{} = 新增；{id, ...} = 编辑现有
  const [editing, setEditing] = React.useState(null);
  // 删除二次确认 · null = 未触发；{id, refCount} = 待确认（refCount 为引用计数，>0 时给警告）
  const [pendingDelete, setPendingDelete] = React.useState(null);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const period = SCORING.currentPeriod(MOCK.today);
  const totalRules = SCORING.RULES.length;
  const isCustomized = SCORING.hasCustom();

  const filtered = cat === 'all' ? SCORING.RULES : SCORING.RULES.filter(r => r.cat === cat);

  // 类目计数 · 用于筛选 pill 上的「· N」
  const catCount = SCORING.CATEGORY_ORDER.reduce((m, k) => {
    m[k] = SCORING.RULES.filter(r => r.cat === k).length;
    return m;
  }, {});

  // commit · 三连：原地改 + 持久化 + force re-render
  const commit = (next) => {
    SCORING.applyCustomRules(next);
    SCORING.saveCustom(next);
    setTick(t => t + 1);
  };

  // 计算规则被引用次数（events / people.personalViolations / labs.labViolations）
  // > 0 表示删除会导致历史扣分静默归零
  const countRefs = (id) => {
    let n = 0;
    const has = (v) => v && v.ruleIds && v.ruleIds.includes(id);
    n += MOCK.events.filter(has).length;
    MOCK.people.forEach(p => { n += (p.personalViolations || []).filter(has).length; });
    MOCK.labs.forEach(l => { n += (l.labViolations || []).filter(has).length; });
    return n;
  };

  const submitEdit = (rule) => {
    const next = SCORING.RULES.slice();
    const idx = next.findIndex(r => r.id === rule.id);
    if (idx >= 0) next[idx] = rule; else next.push(rule);
    commit(next);
    setEditing(null);
  };
  const askDelete = (rule) => setPendingDelete({ rule, refCount: countRefs(rule.id) });
  const confirmDelete = () => {
    commit(SCORING.RULES.filter(r => r.id !== pendingDelete.rule.id));
    setPendingDelete(null);
  };
  const reset = () => {
    SCORING.resetToDefault();
    setConfirmReset(false);
    setTick(t => t + 1);
  };

  // 新规则 id 用类目内顺序号（mgmt-1..10 → 自定义 mgmt-11）；可读性优于随机
  const nextIdInCat = (catKey) => {
    const used = SCORING.RULES.filter(r => r.cat === catKey)
      .map(r => parseInt(r.id.split('-')[1], 10))
      .filter(n => !isNaN(n));
    return catKey + '-' + ((used.length ? Math.max(...used) : 0) + 1);
  };

  // PDF 钦定的 6 档基准分 · 反推自 DEFAULT_RULES，避免 hardcode 数组与 PDF 漂移
  const pointsScale = [...new Set(SCORING.DEFAULT_RULES.map(r => r.points))].sort((a, b) => a - b);

  return (
    <div>
      <div className="page-h">
        <div>
          <div className="page-title">扣分细则</div>
          <div className="page-sub">
            《材料学院实验室违规扣分细则及处理办法（试行）》· 2022-09 起施行 · 5 类 {totalRules} 条
            {isCustomized && <span className="chip chip-amber" style={{ marginLeft: 8 }}>已修订</span>}
          </div>
        </div>
        <div className="row">
          {isCustomized && (
            <button className="btn" onClick={() => setConfirmReset(true)}>↺ 重置默认</button>
          )}
          <button className="btn">导出周期报表</button>
          <button className="btn btn-primary" onClick={() => setEditing({ cat: 'mgmt', code: '', desc: '', points: 3, waivable: true, doubleable: true })}>
            + 新增规则
          </button>
        </div>
      </div>

      {/* 修订须知 · 第一次进入 / 已自定义时常驻提醒 */}
      {isCustomized && (
        <div className="card card-pad" style={{
          marginBottom: 12, background: 'var(--amber-soft)', borderColor: '#fde68a',
          fontSize: 12, lineHeight: 1.6, color: '#7a4a00',
        }}>
          ⚠ <strong>本细则当前为修订版（仅本机生效）</strong>·
          实际修订须经材料学院 HSE 安全工作领导小组审议、备案、公示后方可生效；
          请勿绕过流程直接调整学生实际扣分。
        </div>
      )}

      {/* 1. 当前周期 banner */}
      <div className="card card-pad" style={{
        marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        background: 'linear-gradient(180deg, #fff 0%, var(--bg) 100%)',
      }}>
        <div className="row" style={{ gap: 16 }}>
          <div>
            <div className="meta" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
              SCORING PERIOD · 当前记分周期
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }} className="num">
              {period.label}
            </div>
            <div className="meta" style={{ fontSize: 12, marginTop: 2 }}>
              {period.start} → {period.end} · 共 6 个月 · 周期满或经考试合格后清零
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="meta" style={{ fontSize: 11 }}>个人满分</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--red)' }}>
              {SCORING.PERIOD_LIMITS.person} <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>分</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="meta" style={{ fontSize: 11 }}>实验室满分</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--red)' }}>
              {SCORING.PERIOD_LIMITS.lab} <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>分</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 处置阈值（个人 + 实验室） */}
      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        <ThresholdCard
          title="个人累积分 · 处置阶梯"
          sub="PDF 第十 / 第十一 / 第十二条"
          thresholds={SCORING.PERSON_THRESHOLDS}
          unit="分"
        />
        <ThresholdCard
          title="实验室累积分 · 处置阶梯"
          sub="PDF 第十一 / 第十二条 · 全部准入者连带"
          thresholds={SCORING.LAB_THRESHOLDS}
          unit="分"
        />
      </div>

      {/* 3. 规则字典表 */}
      <div className="filters">
        <button className={'pill ' + (cat === 'all' ? 'active' : '')} onClick={() => setCat('all')}>
          全部 · {totalRules}
        </button>
        {SCORING.CATEGORY_ORDER.map(k => {
          const c = SCORING.CATEGORIES[k];
          return (
            <button key={k} className={'pill ' + (cat === k ? 'active' : '')} onClick={() => setCat(k)}>
              <span style={{ marginRight: 4 }}>{c.icon}</span>{c.label} · {catCount[k]}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>
          基准分按 PDF 附件 1 · 同一违规多处可按 2× 加成（第九条）· 情节轻微免予记分（第十四条）
        </span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 70 }}>编号</th>
              <th style={{ width: 110 }}>类目</th>
              <th>违规情形</th>
              <th style={{ width: 70, textAlign: 'right' }}>基准分</th>
              <th style={{ width: 130 }}>豁免 / 加倍</th>
              <th style={{ width: 100, textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const c = SCORING.CATEGORIES[r.cat];
              return (
                <tr key={r.id} style={{ cursor: 'default' }}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r.code}</td>
                  <td>
                    <span className="chip chip-gray" style={{ borderColor: 'transparent' }}>
                      <span style={{ marginRight: 3 }}>{c.icon}</span>{c.short}
                    </span>
                  </td>
                  <td style={{ lineHeight: 1.5 }}>{r.desc}</td>
                  <td className="num" style={{ textAlign: 'right', fontWeight: 700, fontSize: 15,
                                                color: r.points >= 12 ? 'var(--red)' : r.points >= 6 ? 'var(--amber)' : 'var(--ink)' }}>
                    {r.points}
                  </td>
                  <td>
                    {r.waivable
                      ? <span className="meta" style={{ fontSize: 11 }}>可豁免</span>
                      : <span className="chip chip-red" style={{ fontSize: 10 }}>不可豁免</span>}
                    {r.doubleable && <span className="meta" style={{ fontSize: 11, marginLeft: 6 }}>· 多处 ×2</span>}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditing({ ...r })}>编辑</button>
                    <button className="btn btn-sm btn-danger"
                            style={{ marginLeft: 6, padding: '4px 9px', fontSize: 14, lineHeight: 1 }}
                            onClick={() => askDelete(r)} title="删除">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="meta" style={{ fontSize: 11, marginTop: 12, lineHeight: 1.6 }}>
        ⓘ 本细则仅约束实验参与者（学生、教师、外协人员）· 实验室记分由该室所有违规累积，与实验室管理员直接挂钩 ·
        清零条件：累积分未达 12（个人）/ 60（实验室）即周期满自动清零；达到则须经考试合格 / 整改验收方可清零并发还准入证。
        当前周期扣分排行 → <strong style={{ color: 'var(--brand)' }}>统计与报表</strong> 页查看。
      </div>

      {editing && <RuleEditor rule={editing} pointsScale={pointsScale} nextIdInCat={nextIdInCat} onSubmit={submitEdit} onCancel={() => setEditing(null)} />}
      {confirmReset && (
        <ConfirmDialog
          title="重置为 PDF 默认"
          desc="所有自定义规则将被清除，恢复 5 类 40 条 PDF 原版细则。该操作仅影响本机 localStorage。"
          onConfirm={reset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog
          title={'删除规则 · ' + pendingDelete.rule.code}
          danger={pendingDelete.refCount > 0}
          desc={
            pendingDelete.refCount > 0
              ? '⚠ 该规则在 ' + pendingDelete.refCount + ' 条历史违规中被引用 · 删除后这些违规将静默归零（处置档位可能倒退）。仍要删除？建议先解除引用或仅"编辑"调整文案。'
              : '该规则当前无历史违规引用，可安全删除。该操作仅影响本机 localStorage。'
          }
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

/* === RuleEditor · 规则编辑 modal ============================================
 * cat（5 类下拉）/ code（PDF 编号）/ desc / points（数字）/ waivable / doubleable
 * 新规则 id 自动生成 <cat>-custom-<random>，避免冲突 PDF 默认 id
 * ============================================================================ */
function RuleEditor({ rule, pointsScale, nextIdInCat, onSubmit, onCancel }) {
  const isNew = !rule.id;
  const [form, setForm] = React.useState({
    id: rule.id || '',
    cat: rule.cat || 'mgmt',
    code: rule.code || '',
    desc: rule.desc || '',
    points: rule.points ?? 3,
    waivable: rule.waivable !== false,
    doubleable: rule.doubleable !== false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.desc.trim()) { alert('违规情形不能为空'); return; }
    if (form.points < 1) { alert('基准分至少为 1'); return; }
    const id = form.id || nextIdInCat(form.cat);
    const code = form.code || (SCORING.CATEGORIES[form.cat].short + '·自定义');
    onSubmit({ ...form, id, code, points: Number(form.points) });
  };
  return (
    <>
      <div className="panel-ov" onClick={onCancel} />
      <div className="panel" style={{ width: 480 }}>
        <div className="panel-h">
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{isNew ? '新增规则' : '编辑规则 · ' + form.code}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
              {isNew ? '添加新违规条款' : '修订违规条款'}
            </div>
          </div>
          <button className="icon-btn" onClick={onCancel} style={{ fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: '18px 24px' }} className="stack-l">
          <div>
            <div className="meta" style={{ fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>类目</div>
            <select value={form.cat} onChange={e => set('cat', e.target.value)}
                    style={{ width: '100%', padding: 8, border: '1px solid var(--line)', borderRadius: 6, fontSize: 14 }}>
              {SCORING.CATEGORY_ORDER.map(k => (
                <option key={k} value={k}>{SCORING.CATEGORIES[k].icon} {SCORING.CATEGORIES[k].label}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="meta" style={{ fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>条款编号 <span style={{ color: 'var(--ink-3)' }}>（如 一-1，留空自动）</span></div>
            <input type="text" value={form.code} onChange={e => set('code', e.target.value)}
                   placeholder="一-11"
                   style={{ width: '100%', padding: 8, border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, fontFamily: 'var(--font-num)' }} />
          </div>
          <div>
            <div className="meta" style={{ fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>违规情形</div>
            <textarea value={form.desc} onChange={e => set('desc', e.target.value)}
                      placeholder="例：实验过程中对同伴使用不当言语 · 影响实验秩序"
                      style={{ width: '100%', minHeight: 70, padding: 10, border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div>
              <div className="meta" style={{ fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>基准分</div>
              <select value={form.points} onChange={e => set('points', Number(e.target.value))}
                      style={{ width: '100%', padding: 8, border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, fontFamily: 'var(--font-num)' }}>
                {pointsScale.map(n => <option key={n} value={n}>{n} 分</option>)}
              </select>
              <div className="meta" style={{ fontSize: 10, marginTop: 4 }}>PDF 钦定 {pointsScale.length} 档：{pointsScale.join(' / ')}</div>
            </div>
            <div>
              <div className="meta" style={{ fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>属性</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 0' }}>
                <input type="checkbox" checked={form.waivable} onChange={e => set('waivable', e.target.checked)} />
                可情节轻微免予记分
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input type="checkbox" checked={form.doubleable} onChange={e => set('doubleable', e.target.checked)} />
                多处可 ×2 加成
              </label>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: 'var(--amber-soft)', borderRadius: 6, fontSize: 11, color: '#7a4a00', lineHeight: 1.6 }}>
            ⚠ 修订仅本机生效；正式修订须经学院 HSE 安全工作领导小组审议、备案、公示。
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <button className="btn" onClick={onCancel}>取消</button>
            <button className="btn btn-primary" onClick={submit}>{isNew ? '添加' : '保存'}</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* === ConfirmDialog · 二次确认 · danger=true 时顶部红色警示带 ============= */
function ConfirmDialog({ title, desc, danger, onConfirm, onCancel }) {
  return (
    <>
      <div className="panel-ov" onClick={onCancel} />
      <div className="panel" style={{ width: 420 }}>
        <div className="panel-h" style={danger ? { background: 'var(--red-soft)', borderColor: '#fdba74' } : {}}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: danger ? 'var(--red)' : 'var(--ink)' }}>{title}</div>
          </div>
          <button className="icon-btn" onClick={onCancel} style={{ fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: '18px 24px' }}>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>{desc}</div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, paddingTop: 18 }}>
            <button className="btn" onClick={onCancel}>取消</button>
            <button className="btn btn-danger" onClick={onConfirm}>{danger ? '仍要删除' : '确认'}</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* 扣分排行单卡 · 表格行 = 排名 + 主体 + 累积分进度条 + 处置档位
 * 0 violations 不上榜（filter 在调用方做）· 由 ReportsPage 调用 */
function RankCard({ title, sub, rows, ceiling, subjectKey }) {
  return (
    <div className="card">
      <div className="card-h">
        <div>
          <h3>{title}</h3>
          <div className="meta" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
          ✓ 当前周期无{subjectKey}扣分
        </div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 36, textAlign: 'center' }}>#</th>
              <th>{subjectKey}</th>
              <th style={{ width: 130 }}>累积扣分</th>
              <th style={{ width: 80 }}>档位</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ cursor: 'default' }}>
                <td className="mono" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--ink-2)' }}>{i + 1}</td>
                <td>
                  <strong>{r.name}</strong>
                  <div className="meta" style={{ fontSize: 11 }}>{r.role} · {r.dept}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: Math.min(100, (r.points / ceiling) * 100) + '%',
                        background: r.verdict.color,
                      }} />
                    </div>
                    <span className="num" style={{ minWidth: 50, textAlign: 'right', fontWeight: 700, color: r.verdict.color }}>
                      {r.points} / {ceiling}
                    </span>
                  </div>
                </td>
                <td>{statusChip(r.verdict.tier)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* 阈值阶梯卡 — 复用于个人 / 实验室
 * 每行：分值阈值 · 处置档位 chip · 处置内容
 * 直接读 SCORING.PERSON_THRESHOLDS / LAB_THRESHOLDS，0 hardcode。
 */
function ThresholdCard({ title, sub, thresholds, unit }) {
  return (
    <div className="card">
      <div className="card-h">
        <div>
          <h3>{title}</h3>
          <div className="meta" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <div style={{ padding: '4px 0' }}>
        {thresholds.map((t, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '60px 76px 1fr', gap: 12, alignItems: 'center',
            padding: '12px 16px',
            borderBottom: i < thresholds.length - 1 ? '1px solid var(--line-2)' : 'none',
          }}>
            <div className="num" style={{
              fontSize: 20, fontWeight: 700,
              color: t.color, textAlign: 'right',
            }}>
              {i === 0 ? '0' : '≥' + t.at}
              <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 2 }}>{unit}</span>
            </div>
            <div>{statusChip(t.tier)}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--ink)' }}>{t.label}</strong> · {t.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ScoringPage = ScoringPage;
window.RankCard = RankCard;   // ReportsPage 使用

// ============================================================
// 学生端 · 危化品采购申请（反馈 12 · 学生→导师→学院 三级审批）
// 列表（含内嵌 timeline）/ 申请表单 / 提交成功 三页
// ============================================================

const PURCHASE_STATUS_MP = {
  'advisor-review': { label: '导师审核中',     cls: 'orange' },
  'college-review': { label: '学院终审中',     cls: 'orange' },
  approved:         { label: '已批准 · 待下单', cls: 'blue' },
  delivered:        { label: '已到货',         cls: 'green' },
  rejected:         { label: '已驳回',         cls: 'red' },
};

const StuPurchaseListPage = ({ onNav }) => {
  const list = MP.purchaseRequests || [];
  const me = MP.student?.name;
  const mine = list.filter(p => p.applicant === me);

  return (
    <MiniProgram navTitle="我的危化品采购" showBack onBack={() => onNav('home')} hideTabBar>
      <div style={{ padding: '12px 16px 4px', background: '#fff' }}>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          危化品采购走 <strong>学生→导师→学院</strong> 三级审批；
          剧毒/强氧化品 ≥ 100g 须学院安全负责人现场核验。
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="wx-card">
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#999', fontSize: 13 }}>
            还没有采购申请，点下方按钮新建
          </div>
        </div>
      ) : mine.map(p => {
        const stat = PURCHASE_STATUS_MP[p.status] || { label: p.status, cls: 'gray' };
        return (
          <div key={p.id} className="wx-card">
            <div style={{ padding: '14px 16px 0' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className={'wx-tag ' + stat.cls}>{stat.label}</span>
                <span className="wx-tag gray">阶段 {p.currentStep}/{p.timeline.length}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#000', lineHeight: 1.4 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                实验室 {p.lab} · 导师 {p.advisor}
              </div>
            </div>

            <div style={{ padding: '10px 16px 12px' }}>
              <div style={{ fontSize: 13, color: '#333', background: '#f7f7f7', padding: 10, borderRadius: 6, lineHeight: 1.6 }}>
                <strong style={{ fontSize: 12, color: '#666' }}>用途：</strong>{p.purpose}
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  {p.items.map((it, i) => (
                    <div key={i} style={{ marginTop: 2 }}>
                      · {it.name} <span className="mono" style={{ color: '#999' }}>(CAS {it.cas})</span> · {it.qty} {it.unit}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '0 16px 4px', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              审批 / 推进时间线
            </div>
            <div className="timeline" style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 14 }}>
              {p.timeline.map((t, i) => (
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
        <button className="wx-btn block" onClick={() => onNav('purchase-form')}>
          <Icon name="flask" size={16} color="#fff"/> &nbsp;+ 新建采购申请
        </button>
      </div>
    </MiniProgram>
  );
};

const StuPurchaseFormPage = ({ onNav }) => {
  const [labId, setLabId] = React.useState('302');
  const [items, setItems] = React.useState([{ name: '', cas: '', qty: '', unit: 'L' }]);
  const [purpose, setPurpose] = React.useState('');

  const addItem = () => setItems([...items, { name: '', cas: '', qty: '', unit: 'L' }]);
  const updateItem = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!purpose.trim()) return alert('请填写采购用途');
    if (items.some(it => !it.name.trim() || !it.qty)) return alert('请完整填写每个物品的名称和数量');
    onNav('purchase-sent');
  };

  return (
    <MiniProgram navTitle="新建采购申请" showBack onBack={() => onNav('purchase')} hideTabBar>
      <div className="wx-card">
        <div className="wx-card-title">基本信息</div>
        <div className="wx-list">
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
              {(MP.labs || []).find(l => l.id === labId)?.lead || '—'}
              <span style={{ fontSize: 11, color: '#999', marginLeft: 6 }}>（自动）</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">采购物品 *</div>
        <div className="wx-list">
          {items.map((it, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--line-weak)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#999' }}>#{i + 1}</span>
                {items.length > 1 && (
                  <button className="wx-btn mini" style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 11, background: '#fbe9e7', color: '#d4453a', border: 'none' }}
                    onClick={() => removeItem(i)}>删除</button>
                )}
              </div>
              <input value={it.name} onChange={e => updateItem(i, 'name', e.target.value)}
                placeholder="名称（如：浓硫酸）"
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 10px', fontSize: 13, marginBottom: 6, outline: 'none' }} />
              <input value={it.cas} onChange={e => updateItem(i, 'cas', e.target.value)}
                placeholder="CAS（如：7664-93-9）"
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 10px', fontSize: 13, marginBottom: 6, outline: 'none', fontFamily: 'JetBrains Mono, monospace' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={it.qty} onChange={e => updateItem(i, 'qty', e.target.value)}
                  placeholder="数量" type="number"
                  style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none' }} />
                <select value={it.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                  style={{ width: 70, border: '1px solid var(--line)', borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none', background: '#fff' }}>
                  <option>L</option><option>mL</option><option>kg</option><option>g</option><option>瓶</option>
                </select>
              </div>
            </div>
          ))}
          <div style={{ padding: '12px 16px' }}>
            <button className="wx-btn ghost block" onClick={addItem} style={{ borderStyle: 'dashed', color: '#003f88' }}>
              + 添加一项
            </button>
          </div>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">采购用途 *</div>
        <div style={{ padding: '4px 16px 16px' }}>
          <textarea value={purpose} onChange={e => setPurpose(e.target.value)}
            placeholder="说明本次采购的实验项目 / 用途 / 剩余存量。剧毒品须说明应急预案。"
            style={{ width: '100%', minHeight: 80, border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' }} />
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('purchase')}>取消</button>
        <button className="wx-btn block" style={{ flex: 2 }} onClick={submit}>提交申请</button>
      </div>
    </MiniProgram>
  );
};

const StuPurchaseSentPage = ({ onNav }) => (
  <TeaSubmittedView
    navTitle="提交成功"
    icon="check" iconBg="#e5f5e9" iconColor="#2e7d32"
    title="采购申请已提交"
    subtitle="进入三级审批流程"
    syncList={[
      '导师赵振华（小程序消息 · 24h 内审核）',
      '通过后推送至 学院安全负责人 终审',
      '管理控制台危化品 · 采购队列',
    ]}
    footnote={<>剧毒 / 强氧化品（≥ 100g 或 ≥ 0.5L）<strong>必须由学院安全负责人现场核验</strong>，请准备好实验中心 SOP。</>}
    onBack={() => onNav('purchase')}
    backText="查看我的申请"
  />
);

Object.assign(window, { StuPurchaseListPage, StuPurchaseFormPage, StuPurchaseSentPage });

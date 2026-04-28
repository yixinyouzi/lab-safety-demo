// ============================================================
// 学生端 · 废液固废报备（反馈 13）
// 列表（含内嵌 timeline）/ 报备表单 / 提交成功 三页
// timeline schema 与 violation / project 同（time/title/desc/done?/current?）
// ============================================================

const WASTE_STATUS_MP = {
  pending:    { label: '待 HSE 接收', cls: 'orange' },
  collecting: { label: '回收安排中',   cls: 'blue' },
  closed:     { label: '已归档',       cls: 'gray' },
};

const WASTE_KINDS = [
  '酸性废液', '碱性废液', '有机废液', '剧毒废液 (含氟)',
  '生物废液', '固体废弃物', '过期试剂',
];

const StuWasteListPage = ({ onNav }) => {
  const list = MP.wasteReports || [];
  const me = MP.student?.name;
  const mine = list.filter(w => w.submittedBy === me);

  return (
    <MiniProgram navTitle="我的废液报备" showBack onBack={() => onNav('home')} hideTabBar>
      <div style={{ padding: '12px 16px 4px', background: '#fff' }}>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          所有废液 / 固废需在产生当日提交报备 · 剧毒废液必须双人交接 ·
          学院 HSE 统一对接第三方回收公司。
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="wx-card">
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#999', fontSize: 13 }}>
            还没有废液报备，点下方按钮新建
          </div>
        </div>
      ) : mine.map(w => {
        const stat = WASTE_STATUS_MP[w.status] || { label: w.status, cls: 'gray' };
        return (
          <div key={w.id} className="wx-card">
            <div style={{ padding: '14px 16px 0' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className="wx-tag red">{w.kind}</span>
                <span className={'wx-tag ' + stat.cls}>{stat.label}</span>
                <span className="wx-tag gray">{w.vol}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#000', lineHeight: 1.4 }}>
                {w.source}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                实验室 {w.lab} · 提交于 {w.submittedAt}
              </div>
            </div>

            {w.note && (
              <div style={{ padding: '10px 16px 12px' }}>
                <div style={{ fontSize: 13, color: '#333', background: '#f7f7f7', padding: 10, borderRadius: 6, lineHeight: 1.6 }}>
                  <strong style={{ fontSize: 12, color: '#666' }}>备注：</strong>{w.note}
                </div>
              </div>
            )}

            <div style={{ padding: '0 16px 4px', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              处理时间线
            </div>
            <div className="timeline" style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 14 }}>
              {w.timeline.map((t, i) => (
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
        <button className="wx-btn block" onClick={() => onNav('waste-form')}>
          <Icon name="shield" size={16} color="#fff"/> &nbsp;+ 新建废液报备
        </button>
      </div>
    </MiniProgram>
  );
};

const StuWasteFormPage = ({ onNav }) => {
  const [labId, setLabId] = React.useState('302');
  const [kind, setKind] = React.useState(WASTE_KINDS[0]);
  const [vol, setVol] = React.useState('');
  const [source, setSource] = React.useState('');
  const [note, setNote] = React.useState('');
  const [photos, setPhotos] = React.useState(0);

  const submit = () => {
    if (!vol.trim()) return alert('请填写体积');
    if (!source.trim()) return alert('请填写来源（实验项目/课程）');
    if (photos === 0) return alert('请至少上传 1 张现场照片');
    onNav('waste-sent');
  };

  return (
    <MiniProgram navTitle="新建废液报备" showBack onBack={() => onNav('waste')} hideTabBar>
      <div className="wx-card">
        <div className="wx-card-title">基本信息</div>
        <div className="wx-list">
          <div className="wx-cell">
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>类型 *</div>
            <div className="wx-cell-bd">
              <select value={kind} onChange={e => setKind(e.target.value)}
                style={{ width: '100%', border: 'none', fontSize: 14, outline: 'none', padding: '6px 0', background: 'transparent' }}>
                {WASTE_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div className="wx-cell">
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>体积 *</div>
            <div className="wx-cell-bd">
              <input value={vol} onChange={e => setVol(e.target.value)}
                placeholder="如 5 L / 200 g"
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
            <div className="wx-cell-hd" style={{ width: 70, fontSize: 13, color: '#666' }}>来源 *</div>
            <div className="wx-cell-bd">
              <input value={source} onChange={e => setSource(e.target.value)}
                placeholder="如「电化学合成实验」「项目 proj-2026-01」"
                style={{ width: '100%', border: 'none', fontSize: 14, outline: 'none', padding: '6px 0' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">现场照片 *（≥1 张）</div>
        <div className="photo-grid" style={{ paddingTop: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="photo-cell" onClick={() => setPhotos(p => Math.min(3, p + 1))}
              style={{ cursor: 'pointer', background: i < photos ? 'linear-gradient(135deg,#003f88,#001f4d)' : '#f5f5f7', color: i < photos ? '#fff' : '#999' }}>
              <Icon name="camera" size={22} />
              <div className="ph-label">{i < photos ? '已拍' : '点击拍照'}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 16px 12px', fontSize: 11, color: '#999' }}>
          已拍 {photos} 张（demo · 点击模拟拍照）
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">备注（选填）</div>
        <div style={{ padding: '4px 16px 16px' }}>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="如「双人封装」「需安全员现场签字」「与其它废液不可混存」"
            style={{ width: '100%', minHeight: 70, border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' }} />
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('waste')}>取消</button>
        <button className="wx-btn block" style={{ flex: 2 }} onClick={submit}>提交报备</button>
      </div>
    </MiniProgram>
  );
};

const StuWasteSentPage = ({ onNav }) => (
  <TeaSubmittedView
    navTitle="提交成功"
    icon="check" iconBg="#e5f5e9" iconColor="#2e7d32"
    title="废液报备已提交"
    subtitle="HSE 将在 24h 内安排回收"
    syncList={[
      'HSE 王玉鸿（小程序消息 · 待接收）',
      '剧毒类自动加塞实验中心主任',
      '管理控制台危化品 · 三废处置 队列',
    ]}
    footnote={<>剧毒废液（含氟/氰化物等）须 <strong>双人交接 + 安全员现场签字</strong>，请等待 HSE 上门确认。</>}
    onBack={() => onNav('waste')}
    backText="查看我的报备"
  />
);

Object.assign(window, { StuWasteListPage, StuWasteFormPage, StuWasteSentPage });

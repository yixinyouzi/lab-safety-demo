// ============================================================
// 学生端 · 违规详情 / 申诉 / 整改拍照 / 培训 / 我的
// ============================================================

// 违规详情
const StuViolationPage = ({ onNav }) => {
  const v = MP.violation;
  return (
    <MiniProgram
      navTitle="违规详情"
      showBack
      onBack={() => onNav('home')}
      hideTabBar
    >
      <div className="detail-head">
        <div className="detail-badge-row">
          <span className="wx-tag red">中等违规</span>
          <span className="wx-tag orange">扣 2 分</span>
          <span className="wx-tag yellow">挂黄牌</span>
        </div>
        <div className="detail-title">{v.title}</div>
        <dl className="detail-meta">
          <dt>编号</dt><dd style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v.id}</dd>
          <dt>时间</dt><dd>{v.time}</dd>
          <dt>地点</dt><dd>{v.lab}</dd>
          <dt>登记人</dt><dd>{v.inspector} · 巡查员</dd>
        </dl>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">违规描述</div>
        <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#333', lineHeight: 1.7 }}>
          {v.description}
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">现场证据</div>
        <div className="photo-grid">
          {v.photos.map((p, i) => (
            <div key={i} className="photo-cell" style={{
              background: `linear-gradient(135deg, hsl(${210 + i*20}, 18%, 35%), hsl(${210 + i*20}, 22%, 22%))`,
              color: 'rgba(255,255,255,0.4)'
            }}>
              <Icon name="camera" size={28} />
              <span className="ph-label">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">处理进度</div>
        <div className="timeline">
          {v.timeline.map((t, i) => (
            <div key={i} className={
              'tl-item' +
              (t.done ? ' done' : '') +
              (t.current ? ' current' : '')
            }>
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

      <div className="mp-bottom-bar">
        <button className="wx-btn ghost" style={{ flex: 1 }} onClick={() => onNav('appeal')}>
          我要申诉
        </button>
        <button className="wx-btn block" style={{ flex: 1 }} onClick={() => onNav('rectify')}>
          <Icon name="camera" size={16} color="#fff"/>
          上传整改
        </button>
      </div>
    </MiniProgram>
  );
};

// 申诉
const StuAppealPage = ({ onNav }) => {
  const [reason, setReason] = React.useState('当天晚上在 20:05 已口头告知王老师会加班至 23:00，只是未在系统中留痕。烧结炉的加热阶段无法中途离开，存在客观困难。')
;
  return (
    <MiniProgram navTitle="违规申诉" showBack onBack={() => onNav('violation')} hideTabBar>
      <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, background: '#fbf4e0' }}>
        <Icon name="info" size={14} color="#e6a700"/> &nbsp;
        申诉将由指导老师 <b style={{ color: '#000' }}>李建国</b> 和学院安全办共同复核，48 小时内给出结果。
      </div>

      <div className="appeal-form">
        <label>申诉事由</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={500} />
        <div className="char-count">{reason.length} / 500</div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">补充证据（可选）</div>
        <div className="photo-grid" style={{ paddingTop: 0 }}>
          <div className="photo-cell placeholder">
            <Icon name="camera" size={24}/>
            添加图片
          </div>
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('violation')}>取消</button>
        <button className="wx-btn block" style={{ flex: 2 }} onClick={() => onNav('appeal-sent')}>
          提交申诉
        </button>
      </div>
    </MiniProgram>
  );
};

// 申诉已提交 / 结果页
const StuAppealSentPage = ({ onNav }) => {
  return (
    <MiniProgram navTitle="申诉结果" showBack onBack={() => onNav('violation')} hideTabBar>
      <div className="scan-result-card" style={{ marginTop: 24 }}>
        <div className="scan-result-icon" style={{ background: '#faf1e0', color: '#e8882b' }}>
          <Icon name="info" size={30}/>
        </div>
        <div className="scan-result-title">申诉被驳回</div>
        <div className="scan-result-sub">李建国 老师 · 03-09 10:22 回复</div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">教师意见</div>
        <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#333', lineHeight: 1.7 }}>
          收到你的说明。夜间单人作业的风险并非只看"是否告知"，而是"是否有第二人在场"。本次违规事实成立；
          但考虑到加热工艺的客观限制，本次不再加重处理。<br/>
          <b>请按流程完成培训 + 整改，后续夜间实验请至少两人同行。</b>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <button className="wx-btn block" onClick={() => onNav('rectify')}>
          前往完成整改
        </button>
      </div>
    </MiniProgram>
  );
};

// 整改（拍照上传）
const StuRectifyPage = ({ onNav }) => {
  const [photos, setPhotos] = React.useState(1);
  const [note, setNote] = React.useState('已学习夜间作业规范，今后实验前 24 小时提交报备，并保证至少 2 人同行。附上刚整理好的工位照片和值班同学签字。');
  return (
    <MiniProgram navTitle="整改上传" showBack onBack={() => onNav('violation')} hideTabBar>
      <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, background: '#e5ecf5' }}>
        <Icon name="info" size={14} color="#4a6fa5"/> &nbsp;
        请按整改要求拍照并上传，由巡查员复核通过后恢复权限。
      </div>

      <div className="wx-card">
        <div className="wx-card-title">整改要求</div>
        <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#333', lineHeight: 1.7 }}>
          ① 自行清理工位、恢复设备默认状态<br/>
          ② 拍摄整改后现场照片（至少 2 张）<br/>
          ③ 获取值班同学 / 导师签字照片 1 张<br/>
          ④ 填写整改说明
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">整改现场（{photos}/3）</div>
        <div className="photo-grid" style={{ paddingTop: 0 }}>
          {Array.from({ length: photos }).map((_, i) => (
            <div key={i} className="photo-cell" style={{
              background: `linear-gradient(135deg, hsl(${150 + i*30}, 25%, 45%), hsl(${150 + i*30}, 28%, 30%))`,
              color: 'rgba(255,255,255,0.5)'
            }}>
              <Icon name="camera" size={24} />
              <span className="ph-label">整改照片 {i+1}</span>
            </div>
          ))}
          {photos < 3 && (
            <div className="photo-cell placeholder" onClick={() => setPhotos(p => Math.min(3, p+1))}>
              <Icon name="plus" size={22}/>
              拍照上传
            </div>
          )}
        </div>
      </div>

      <div className="appeal-form">
        <label>整改说明</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={500} />
        <div className="char-count">{note.length} / 500</div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('violation')}>取消</button>
        <button className="wx-btn block" style={{ flex: 2 }} onClick={() => onNav('rectify-done')}>
          提交整改 · 等待复检
        </button>
      </div>
    </MiniProgram>
  );
};

// 整改已提交
const StuRectifyDonePage = ({ onNav }) => {
  return (
    <MiniProgram navTitle="整改结果" showBack onBack={() => onNav('home')} hideTabBar>
      <div className="scan-result-card" style={{ marginTop: 24 }}>
        <div className="scan-result-icon ok">
          <Icon name="check" size={30} stroke={3}/>
        </div>
        <div className="scan-result-title">整改已提交</div>
        <div className="scan-result-sub">等待巡查员 王玉鸿 复检 · 预计 24h 内</div>
      </div>

      <div className="banner-pass">
        <div className="ic"><Icon name="check" size={18} color="#fff" stroke={3}/></div>
        <div className="bd">
          <div className="t1">完成培训与考试 · 100%</div>
          <div className="t2">《实验室基础安全》 · 得分 92</div>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">权限恢复进度</div>
        <div className="timeline">
          <div className="tl-item done"><div className="tl-dot"><Icon name="check" size={10} color="#fff" stroke={3}/></div>
            <div className="tl-body"><div className="t1">完成安全培训</div><div className="t2">基础安全 · 6/6 章节</div><div className="t3">03-09 11:30</div></div>
          </div>
          <div className="tl-item done"><div className="tl-dot"><Icon name="check" size={10} color="#fff" stroke={3}/></div>
            <div className="tl-body"><div className="t1">通过课后考试</div><div className="t2">10/10 题 · 得分 92</div><div className="t3">03-09 11:48</div></div>
          </div>
          <div className="tl-item current"><div className="tl-dot"/>
            <div className="tl-body"><div className="t1">整改拍照上传</div><div className="t2">3 张现场照片 · 等待巡查员复检</div><div className="t3">刚刚</div></div>
          </div>
          <div className="tl-item"><div className="tl-dot"/>
            <div className="tl-body"><div className="t1">复检通过 · 自动恢复权限</div><div className="t2">复检通过后 1 分钟内生效</div></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <button className="wx-btn block" onClick={() => onNav('home')}>返回首页</button>
      </div>
    </MiniProgram>
  );
};

// ============================================================
// 培训中心列表
// ============================================================
const StuTrainPage = ({ onNav }) => {
  const iconMap = {
    C101: 'shield', C102: 'flask', C103: 'fire', C104: 'bolt', C105: 'bio',
  };
  const current = MP.courses.find(c => c.id === 'C101');
  return (
    <MiniProgram navTitle="安全培训" tabItems={STU_TABS} activeTab="train" onTabChange={onNav}>
      <div className="course-hero" onClick={() => onNav('course-detail')}>
        <div className="label">继续学习</div>
        <div className="title">{current.title}</div>
        <div className="meta">
          <span><Icon name="book" size={12}/> {current.lessons} 章节</span>
          <span>第 3 章 · 夜间作业规范</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: current.progress + '%' }} />
        </div>
        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85 }}>已完成 {current.progress}%</div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">
          强制培训
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--wx-red)' }}>
            剩 3 天 · 未完成将持续限制权限
          </span>
        </div>
        <div className="wx-list">
          {MP.courses.filter(c => c.required).map(c => (
            <div key={c.id} className="course-item" onClick={() => onNav('course-detail')}>
              <div className={'course-thumb ' + c.thumb}>
                <Icon name={iconMap[c.id]} size={26} color="#fff"/>
              </div>
              <div className="course-meta">
                <div className="title">
                  {c.title}
                  {c.required && <span className="wx-tag red" style={{ fontSize: 10, padding: '1px 6px' }}>必修</span>}
                </div>
                <div className="desc">{c.desc}</div>
                <div className="stat">
                  <span>{c.lessons} 章节 · {c.duration} 分钟</span>
                </div>
              </div>
              <div className="course-ft">
                {c.progress === 0 && <div className="wx-tag gray" style={{ fontSize: 10 }}>未开始</div>}
                {c.progress > 0 && c.progress < 100 && <div className="course-pct">{c.progress}%</div>}
                {c.progress === 100 && <div className="wx-tag green" style={{ fontSize: 10 }}>已完成</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">推荐学习</div>
        <div className="wx-list">
          {MP.courses.filter(c => !c.required).map(c => (
            <div key={c.id} className="course-item" onClick={() => onNav('course-detail')}>
              <div className={'course-thumb ' + c.thumb}>
                <Icon name={iconMap[c.id]} size={26} color="#fff"/>
              </div>
              <div className="course-meta">
                <div className="title">{c.title}</div>
                <div className="desc">{c.desc}</div>
                <div className="stat">
                  <span>{c.lessons} 章节 · {c.duration} 分钟</span>
                </div>
              </div>
              <div className="course-ft">
                {c.progress === 100 && <div className="wx-tag green" style={{ fontSize: 10 }}>已完成</div>}
                {c.progress === 0 && <Icon name="chevron-right" size={16} color="#c7c7cc"/>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 12 }} />
    </MiniProgram>
  );
};

// 课程详情
const StuCourseDetailPage = ({ onNav }) => {
  const c = MP.currentCourse;
  return (
    <MiniProgram navTitle="实验室基础安全" showBack onBack={() => onNav('train')} hideTabBar>
      <div className="video-holder">
        <div className="play"><Icon name="flash" size={20} color="#fff"/></div>
        <div className="meta">
          <span>第 3 章 · 夜间与节假日作业规范</span>
          <span>07:05</span>
        </div>
      </div>

      <div style={{ padding: '14px 16px', background: '#fff' }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#000' }}>
          实验室基础安全
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6 }}>
          共 {c.totalLessons} 章节 · 已完成 {c.completed} 章 · 预计还需 25 分钟
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: (c.completed / c.totalLessons * 100) + '%', height: '100%', background: 'var(--wx-green)' }}/>
          </div>
          <span style={{ fontSize: 12, color: 'var(--wx-green)', fontWeight: 500 }}>
            {Math.round(c.completed / c.totalLessons * 100)}%
          </span>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-card-title">章节列表</div>
        <div className="wx-list">
          {c.lessons.map(l => (
            <div key={l.n} className={
              'lesson-row' + (l.done ? ' done' : '') + (l.current ? ' current' : '')
            } onClick={() => l.quiz && onNav('quiz')}>
              <div className="lesson-num">
                {l.done ? <Icon name="check" size={14} color="#fff" stroke={3}/> : l.n}
              </div>
              <div className="lesson-body">
                <div className="title">{l.title}</div>
                <div className="desc">
                  {l.quiz ? '课程最终考试 · 80 分通过' : `${l.duration} 视频`}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {l.done && <span className="wx-tag green" style={{ fontSize: 10 }}>已学</span>}
                {l.current && <span className="wx-tag blue" style={{ fontSize: 10 }}>继续</span>}
                {!l.done && !l.current && <Icon name="chevron-right" size={16} color="#c7c7cc"/>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mp-bottom-bar">
        <button className="wx-btn block" onClick={() => onNav('quiz')}>
          继续学习（第 3 章）
        </button>
      </div>
    </MiniProgram>
  );
};

// 考试题
const StuQuizPage = ({ onNav }) => {
  const [selected, setSelected] = React.useState(1);
  const [submitted, setSubmitted] = React.useState(false);
  const q = MP.quiz[0];
  return (
    <MiniProgram navTitle="课后测验 3/10" showBack onBack={() => onNav('course-detail')} hideTabBar>
      <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between' }}>
        <span>单选题 · 必答</span>
        <span>剩 12:38</span>
      </div>

      <div className="quiz-card">
        <span className="quiz-num">Q3</span>
        <div className="quiz-q">{q.q}</div>
        <div className="quiz-opts">
          {q.options.map((o, i) => {
            let cls = 'quiz-opt';
            if (submitted) {
              if (i === q.correct) cls += ' correct';
              else if (i === selected) cls += ' wrong';
            } else if (i === selected) cls += ' selected';
            return (
              <div key={i} className={cls} onClick={() => !submitted && setSelected(i)}>
                <div className="quiz-opt-letter">{String.fromCharCode(65 + i)}</div>
                <div>{o}</div>
              </div>
            );
          })}
        </div>

        {submitted && (
          <div style={{ marginTop: 14, padding: 12, background: '#e5ecf5', borderRadius: 8, fontSize: 12, color: '#003f88', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              <Icon name="check" size={12} stroke={3}/> 回答正确
            </div>
            任何人发现违规行为都应当及时劝阻并报告；独自作业存在重大安全隐患，
            必须杜绝"帮一把"的侥幸心理。
          </div>
        )}
      </div>

      <div className="mp-bottom-bar">
        {!submitted ? (
          <>
            <button className="wx-btn gray" style={{ flex: 1 }} onClick={() => onNav('course-detail')}>上一题</button>
            <button className="wx-btn block" style={{ flex: 2 }} onClick={() => setSubmitted(true)}>提交答案</button>
          </>
        ) : (
          <button className="wx-btn block" onClick={() => onNav('train')}>
            完成课程
          </button>
        )}
      </div>
    </MiniProgram>
  );
};

// 我的
const StuMePage = ({ onNav }) => {
  const u = MP.student;
  return (
    <MiniProgram navTitle="我的" tabItems={STU_TABS} activeTab="me" onTabChange={onNav} navTransparent statusColored>
      <div className="me-hero" style={{ background: 'linear-gradient(165deg,#e8882b 0%,#b8661a 100%)' }}>
        <div className="me-user">
          <div className="me-avatar">{u.avatar}</div>
          <div className="me-user-meta">
            <div className="name">
              {u.name}
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 400 }}>
                {u.role}
              </span>
            </div>
            <div className="sub">{u.dept} · {u.grade} · 导师 {u.advisor}</div>
          </div>
        </div>
      </div>

      <div className="me-stats">
        <div className="me-stat"><div className="n" style={{ color: '#e8882b' }}>{u.score}</div><div className="lb">安全分</div></div>
        <div className="me-stat"><div className="n">32</div><div className="lb">历史预约</div></div>
        <div className="me-stat"><div className="n">4</div><div className="lb">已修课程</div></div>
      </div>

      <div className="wx-card">
        <div className="wx-list">
          <div className="wx-cell" onClick={() => onNav('violation')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="warn" size={18} color="#d4453a"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">我的违规</div></div>
            <div className="wx-cell-ft arrow">1 条未处理</div>
          </div>
          <div className="wx-cell" onClick={() => alert('积分明细 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="medal" size={18} color="#e6a700"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">积分明细</div></div>
            <div className="wx-cell-ft arrow"/>
          </div>
          <div className="wx-cell" onClick={() => onNav('train')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="book" size={18} color="#c9a961"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">培训记录与证书</div></div>
            <div className="wx-cell-ft arrow">4 本</div>
          </div>
          <div className="wx-cell" onClick={() => alert('我的实验室 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="users" size={18} color="#4a6fa5"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">我的实验室</div></div>
            <div className="wx-cell-ft arrow">303 / 305</div>
          </div>
        </div>
      </div>

      <div className="wx-card">
        <div className="wx-list">
          <div className="wx-cell" onClick={() => alert('应急处置卡 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="shield" size={18} color="#003f88"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">应急处置卡</div></div>
            <div className="wx-cell-ft arrow"/>
          </div>
          <div className="wx-cell" onClick={() => alert('设置与隐私 · 功能开发中')}>
            <div className="wx-cell-hd" style={{ width: 32 }}><Icon name="info" size={18} color="#8e8e93"/></div>
            <div className="wx-cell-bd"><div className="wx-cell-bd-title">设置与隐私</div></div>
            <div className="wx-cell-ft arrow"/>
          </div>
        </div>
      </div>

      <div className="me-logout" onClick={() => onNav('login')}>
        <Icon name="logout" size={14} color="#d4453a"/> &nbsp;退出登录
      </div>
      <div style={{ height: 12 }}/>
    </MiniProgram>
  );
};

Object.assign(window, {
  StuViolationPage, StuAppealPage, StuAppealSentPage,
  StuRectifyPage, StuRectifyDonePage,
  StuTrainPage, StuCourseDetailPage, StuQuizPage,
  StuMePage,
});

// ============================================================
// 页面 · 登录 / 身份选择（3 角色：学生 / 教师 / 实验室管理员）
// ============================================================

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = React.useState('student');
  const go = () => {
    if (onLogin) onLogin(role);
    else if (window.__mpGoto) window.__mpGoto(role);
  };

  const cards = [
    {
      k: 'student',
      icon: 'user',
      iconCls: 'blue',
      title: '学生',
      desc: '实验预约 · 扫码进门 · 安全培训 · 违规申诉',
    },
    {
      k: 'teacher',
      icon: 'mentor',
      iconCls: 'gold',
      title: '教师',
      desc: '自己做实验 + 学生违规复核 · 整改签字 · 预约审批',
    },
    {
      k: 'patrol',
      icon: 'clipboard',
      iconCls: 'orange',
      title: '实验室管理员',
      desc: '登记违规 · 申诉复核 · 整改验收 · 学院 HSE',
    },
  ];

  return (
    <MiniProgram hideNav hideTabBar statusColored bodyBg="#fff">
      <div className="login-hero">
        <div className="login-logo">
          <Icon name="shield" size={26} color="#fff" stroke={2} />
        </div>
        <div className="login-title">实验室安全</div>
        <div className="login-sub">中国地质大学（北京）· 材料学院 · 智慧安全管理平台</div>
      </div>

      <div className="login-body">
        <div className="login-section-title">请选择你的身份</div>

        {cards.map(c => (
          <div
            key={c.k}
            className={'role-card' + (role === c.k ? ' selected' : '')}
            onClick={() => setRole(c.k)}
          >
            <div className={'role-card-icon ' + c.iconCls}>
              <Icon name={c.icon} size={22} />
            </div>
            <div className="role-card-body">
              <div className="role-card-title">{c.title}</div>
              <div className="role-card-desc">{c.desc}</div>
            </div>
            <div className="role-card-arrow"><Icon name="chevron-right" size={18} /></div>
          </div>
        ))}

        <button className="login-wx-btn" onClick={go}>
          <Icon name="check" size={16} color="#fff" />
          微信授权登录
        </button>

        <div className="login-foot">
          首次使用需完成实名认证<br/>
          登录即代表同意《用户协议》和《隐私政策》
        </div>
      </div>
    </MiniProgram>
  );
};

Object.assign(window, { LoginPage });

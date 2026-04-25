// ============================================================
// 微信小程序 demo · 模拟数据
// 围绕主线故事：张一凡 · 材料楼 303 · 单人超时违规
// ============================================================

window.MP = {
  // 当前用户（学生视角）
  student: {
    id: 'S2021013',
    name: '张一凡',
    avatar: '张',
    role: '学生',
    dept: '材料学院',
    grade: '研究生 · 材料工程',
    advisor: '李建国',
    score: 78,
    scoreTrend: -2,
    yellowCard: true, // 挂黄牌中
    permLimited: true,
    trainingPending: 1,
    pendingSteps: [
      { id: 'study', label: '完成安全培训', done: false },
      { id: 'quiz', label: '通过考试', done: false },
      { id: 'rectify', label: '整改拍照上传', done: false },
    ],
  },

  teacher: {
    id: 'T2018001',
    name: '李建国',
    avatar: '李',
    role: '教师',
    dept: '材料学院',
    title: '副教授 · 博士生导师',
    labs: 3,
    students: 12,
    score: 92,
    pending: 1,
  },

  patrol: {
    id: 'P2020007',
    name: '王玉鸿',
    avatar: '王',
    role: '巡查员',
    dept: '材料学院 · 安全办',
    months: 18,
    totalLogs: 142,
    thisMonth: 12,
    rank: 2,
  },

  // 今日预约 / 课表
  todayBookings: [
    {
      id: 'BK20250310-001',
      start: '14:00',
      end: '17:00',
      lab: '材料楼 303 · 高温烧结实验室',
      topic: '陶瓷基复合材料烧结',
      status: 'approved',
      canEnter: false, // 因为挂黄牌，不能进入
    },
  ],

  // 通知 / 消息
  messages: [
    {
      id: 'MSG001',
      type: 'violation',
      title: '违规通知',
      preview: '您于 3月7日 22:40 在材料楼 303 被登记违规，扣 2 分。请查看详情并根据指引完成整改。',
      time: '3月8日 09:12',
      unread: true,
      icon: 'warn',
      iconColor: '#d4453a',
      iconBg: '#fbe9e7',
    },
    {
      id: 'MSG002',
      type: 'training',
      title: '安全培训提醒',
      preview: '您的账号已触发培训要求：请在 3 天内完成《实验室基础安全》课程并通过考试，未完成将持续暂停门禁权限。',
      time: '3月8日 09:13',
      unread: true,
      icon: 'book',
      iconColor: '#c9a961',
      iconBg: '#fbf4e0',
    },
    {
      id: 'MSG003',
      type: 'system',
      title: '系统通知',
      preview: '您的门禁权限已暂停。完成培训 + 考试 + 整改拍照后自动恢复。',
      time: '3月8日 09:13',
      unread: false,
      icon: 'info',
      iconColor: '#4a6fa5',
      iconBg: '#e5ecf5',
    },
    {
      id: 'MSG004',
      type: 'lab',
      title: '李建国 老师',
      preview: '[预约审核] 你的 3月10日 高温烧结实验预约已通过审核，请按时到达。',
      time: '3月6日 16:40',
      unread: false,
      icon: 'mentor',
      iconColor: '#003f88',
      iconBg: '#e5ecf5',
    },
  ],

  // 当前违规详情
  violation: {
    id: 'V20250307-018',
    title: '夜间单人作业超时 · 未报备',
    type: '人员行为',
    severity: '中',
    lab: '材料楼 303 · 高温烧结实验室',
    time: '2025-03-07 22:40',
    inspector: '王玉鸿',
    deducted: 2,
    description:
      '2025-03-07 22:40，管道内人脸识别超出 20:00 单人作业上限，且未提交夜间加班报备。现场照片显示 1 人独自操作烧结炉，违反《实验室夜间作业管理规定》第 4.2 条。',
    photos: [
      { label: '现场 · 单人作业' },
      { label: '门禁日志截图' },
      { label: '设备状态照片' },
    ],
    timeline: [
      { time: '03-07 22:40', title: '系统告警', desc: '门禁识别：单人作业超时 2h40min', done: true },
      { time: '03-07 22:55', title: '巡查员到场', desc: '王玉鸿 现场核实、拍照取证', done: true },
      { time: '03-08 09:12', title: '违规登记', desc: '评定扣 2 分 · 挂黄牌 · 暂停门禁权限', done: true },
      { time: '—', title: '待申诉 / 接受', desc: '请在 48 小时内处理；未处理视为接受', current: true },
      { time: '—', title: '导师核实', desc: '李建国 老师 · 复核申诉或签字归档' },
      { time: '—', title: '完成整改 + 培训', desc: '触发权限恢复' },
    ],
  },

  // 培训课程
  courses: [
    {
      id: 'C101',
      title: '实验室基础安全',
      desc: '面向所有进入实验室的师生 · 必修',
      duration: 42,
      lessons: 6,
      progress: 33,
      required: true,
      badge: '强制',
      thumb: 'purple',
      icon: 'shield',
    },
    {
      id: 'C102',
      title: '危化品安全操作',
      desc: '涉及试剂使用、废液处置',
      duration: 35,
      lessons: 5,
      progress: 0,
      required: true,
      badge: '强制',
      thumb: 'orange',
      icon: 'flask',
    },
    {
      id: 'C103',
      title: '高压气瓶与高温设备',
      desc: '适合材料 / 化工类实验室',
      duration: 28,
      lessons: 4,
      progress: 100,
      thumb: 'blue',
      icon: 'fire',
    },
    {
      id: 'C104',
      title: '用电与应急处置',
      desc: '触电、火灾、人员伤害处置',
      duration: 22,
      lessons: 4,
      progress: 0,
      thumb: 'green',
      icon: 'bolt',
    },
    {
      id: 'C105',
      title: '生物与辐射安全',
      desc: '生物样本、放射源管理',
      duration: 30,
      lessons: 4,
      progress: 0,
      thumb: 'red',
      icon: 'bio',
    },
  ],

  // 当前课程章节
  currentCourse: {
    id: 'C101',
    title: '实验室基础安全',
    totalLessons: 6,
    completed: 2,
    lessons: [
      { n: 1, title: '走进实验室 · 你必须知道的 5 件事', duration: '6:24', done: true },
      { n: 2, title: '个人防护装备（PPE）正确使用', duration: '8:12', done: true },
      { n: 3, title: '夜间与节假日作业规范', duration: '7:05', current: true },
      { n: 4, title: '事故现场应急处置流程', duration: '9:38' },
      { n: 5, title: '危险废液与固体废弃物', duration: '5:47' },
      { n: 6, title: '课程总结与 10 题测验', duration: '测验', quiz: true },
    ],
  },

  // 考试题
  quiz: [
    {
      q: '发现同学在实验室独自进行高温实验且未报备，应如何处理？',
      options: [
        '不管，让他自己处理',
        '立即劝阻并报告导师或巡查员',
        '帮他一起做，避免出事',
        '等他做完再私下提醒',
      ],
      correct: 1,
    },
  ],

  // 巡查员 · 今日任务
  patrolTasks: [
    {
      id: 'T20250310-001',
      type: 'urgent',
      title: '材料楼 303 · 温湿度异常告警',
      lab: '材料楼 303',
      desc: '温度 38.2°C 超阈值，需现场核查烧结炉工况',
      time: '14:20',
      tags: ['紧急', '设备'],
    },
    {
      id: 'T20250310-002',
      type: 'routine',
      title: '材料楼 2 层 · 月度合规巡查',
      lab: '材料楼 201 / 203 / 205 / 207',
      desc: '共 4 间实验室 · 按 12 项检查清单逐项核验',
      time: '全天',
      tags: ['例行'],
    },
    {
      id: 'T20250310-003',
      type: 'normal',
      title: '危化品柜 · 抽查 A-12 柜',
      lab: '材料楼 305',
      desc: '核对台账与实物；重点检查冰醋酸余量',
      time: '16:00',
      tags: ['危化品'],
    },
    {
      id: 'T20250310-004',
      type: 'normal',
      title: '整改复检 · 王磊案',
      lab: '材料楼 402',
      desc: '复核 3月5日 登记的废液标签缺失整改结果',
      time: '17:30',
      tags: ['复检'],
    },
  ],

  // 巡查员历史记录
  patrolHistory: [
    { id: 'V20250307-018', title: '夜间单人作业超时', who: '张一凡', lab: '材料楼 303', time: '3月7日', score: -2, status: 'appealed' },
    { id: 'V20250305-014', title: '废液标签缺失', who: '王磊', lab: '材料楼 402', time: '3月5日', score: -1, status: 'rectifying' },
    { id: 'V20250303-009', title: '未佩戴护目镜', who: '刘梓萱', lab: '材料楼 207', time: '3月3日', score: -1, status: 'closed' },
    { id: 'V20250301-005', title: '危化品柜未落锁', who: '—', lab: '材料楼 305', time: '3月1日', score: -3, status: 'rectifying' },
  ],

  // 常见违规类型（登记时多选）
  violationTypes: [
    { id: 'late-alone', label: '夜间单人作业' },
    { id: 'no-ppe', label: '未佩戴 PPE' },
    { id: 'unreported', label: '未报备操作' },
    { id: 'chem-open', label: '试剂瓶敞开' },
    { id: 'chem-nolock', label: '危化柜未落锁' },
    { id: 'waste-label', label: '废液标签缺失' },
    { id: 'eat-drink', label: '实验区饮食' },
    { id: 'gas-unfixed', label: '气瓶未固定' },
    { id: 'hot-unattended', label: '加热设备无人值守' },
    { id: 'messy', label: '台面凌乱' },
    { id: 'door-open', label: '安全门长开' },
    { id: 'other', label: '其他' },
  ],
};

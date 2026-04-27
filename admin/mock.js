/* Mock data — kept minimal & realistic, inline so prototype is self-contained */

/* === Schema 同构 · admin / mp-demo / doorplate 三端共享语义 ==================
 * labs[i]:   { id, name, dept, lead, status, level, nextInspection,
 *              temp, humidity, score, inRoom, today, hazards, note?, deadline? }
 *   status:  'normal' | 'warning' | 'rectifying'   （三档，仅此三档）
 *   level:   1 | 2                                  （一级周检 / 二级月检）
 * events[i]: { id, kind, severity, lab, time, title, detail, status,
 *              actors?, counter?, progress? }
 *   kind:    见下方 EVENT_KIND_META（单一真相源）
 *   severity:'critical' | 'warning' | 'info'
 *   status:  'active' | 'pending' | 'rectifying' | 'handled' | 'done'
 * ============================================================================ */

/* === EVENT_KIND_META · UI 展示元数据的唯一来源 ============================
 * 任何页面（inbox / events / bigscreen）都从此读 label/color/scoring，
 * 禁止在页面内重新写字典。新增 kind 时只改这一处。
 * scoring=true 表示该类事件触发扣分；false 仅留痕或告警。
 * ========================================================================== */
const EVENT_KIND_META = {
  alert:      { label: '🚨 实时告警', color: 'var(--red)',   scoring: false },
  violation:  { label: '⚖ 重大违规', color: 'var(--amber)', scoring: true  },
  rectify:    { label: '🔧 整改跟进', color: 'var(--brand)', scoring: false },
  inspection: { label: '📋 检查扣分', color: 'var(--amber)', scoring: true  },
  patrol:     { label: '🔍 巡查记录', color: 'var(--ink-2)', scoring: false },
  unattended: { label: '👤 无人值守', color: 'var(--red)',   scoring: false },
};
const EVENT_KINDS_ORDER = ['alert', 'violation', 'inspection', 'unattended', 'rectify', 'patrol'];

const MOCK = {
  today: '2026-04-21',
  me: { name: '李雪茹', role: '管理员 · 学院 HSE', dept: '材料科学与工程学院', avatar: '李' },
  labs: [
    // level 临时算法：hazards.length >= 4 → 一级（周检），否则二级（月检）。待甲方提供分级表。
    { id: '302', name: '电化学与储能材料实验室', dept: '材料化学系', lead: '赵振华', status: 'normal',     level: 1, nextInspection: '2026-04-28', temp: 22.2, humidity: 59,   score: 92, inRoom: 3, today: 14, hazards: ['腐蚀','火灾','爆炸','中毒','高压'], note: '' },
    { id: '410', name: '功能材料合成实验室',     dept: '材料物理系', lead: '周景明', status: 'rectifying', level: 1, nextInspection: '2026-04-28', temp: 24.1, humidity: 52,   score: 48, inRoom: 0, today: 2,  hazards: ['火灾','爆炸','高温','中毒'], note: '违规积分触发关闭门禁，整改至 04-28', deadline: '2026-04-28' },
    { id: 'A208', name: '色质联用与有机分析室',  dept: '测试中心',   lead: '钱雨桐', status: 'warning',    level: 2, nextInspection: '2026-05-21', temp: 26.8, humidity: 65.4, score: 78, inRoom: 2, today: 6,  hazards: ['火灾','中毒','高温'],         note: '挥发性气体浓度偏高，通风已加强' },
    { id: '105', name: 'X 射线衍射分析室',       dept: '测试中心',   lead: '孙学明', status: 'warning',    level: 2, nextInspection: '2026-05-21', temp: 21.5, humidity: 48,   score: 80, inRoom: 1, today: 3,  hazards: ['辐射','高压'],                note: '单人操作告警 · 已通知' },
    { id: '207', name: '扫描电镜测试室',         dept: '测试中心',   lead: '李雪茹', status: 'normal',     level: 2, nextInspection: '2026-05-21', temp: 22.0, humidity: 45,   score: 96, inRoom: 1, today: 2,  hazards: ['高压','辐射'] },
    { id: '312', name: '手套箱与惰性气氛实验室', dept: '材料化学系', lead: '赵振华', status: 'normal',     level: 2, nextInspection: '2026-05-21', temp: 23.5, humidity: 30,   score: 94, inRoom: 2, today: 8,  hazards: ['爆炸','低温','缺氧'] },
    { id: '216', name: '材料力学性能测试室',     dept: '材料工程系', lead: '黄志刚', status: 'normal',     level: 2, nextInspection: '2026-05-21', temp: 24.0, humidity: 50,   score: 90, inRoom: 1, today: 4,  hazards: ['机械','噪声','高压'] },
    { id: 'B105', name: '生物材料细胞培养室',    dept: '材料化学系', lead: '周明',   status: 'normal',     level: 2, nextInspection: '2026-05-21', temp: 25.0, humidity: 55,   score: 88, inRoom: 2, today: 5,  hazards: ['生物','腐蚀'] },
  ],
  events: [
    // === 重映射后的 8 条原始事件 + 3 条新增（ev-09 unattended / ev-10 inspection / ev-11 patrol）===
    { id: 'ev-01', kind: 'alert',      severity: 'critical', lab: 'A208', time: '今日 14:32', title: '长时驻留 10 小时', detail: '孙静怡 · 进入时间 04:30 · 单人连续工作', actors: ['已通知 导师', '未通知 HSE'], status: 'active', counter: '升级倒计时 07:12' },
    { id: 'ev-02', kind: 'inspection', severity: 'warning',  lab: '410',  time: '今日 10:23', title: '管式炉周围堆放可燃试剂 · 周检扣 5 分', detail: '违规者 李浩然（累计 -12 分 黄牌）· 检查人 王玉鸿（一级周检发现）', status: 'pending', counter: '申诉期剩 59h' },
    { id: 'ev-03', kind: 'rectify',    severity: 'info',     lab: '410',  time: '04-19',     title: '整改期 · 剩 3 天', detail: '周景明已提交整改报告（8 张照片）· 待你现场签字', progress: 80, status: 'pending', counter: '04-28 截止' },
    { id: 'ev-04', kind: 'inspection', severity: 'warning',  lab: '302',  time: '昨日 16:08', title: '未戴护目镜操作酸液 · 季检扣 3 分', detail: '违规者 王语嫣 · 检查人 王玉鸿（学校季度检查发现）', status: 'rectifying' },
    { id: 'ev-05', kind: 'alert',      severity: 'warning',  lab: '105',  time: '昨日 22:15', title: '单人夜间操作（禁止独自）', detail: '孙学明 · 已远程语音提醒', status: 'handled' },
    { id: 'ev-06', kind: 'alert',      severity: 'info',     lab: '207',  time: '04-19 12:05', title: '烟感报警（焊接作业误报）', detail: '3 分钟内确认处置', status: 'handled' },
    { id: 'ev-07', kind: 'patrol',     severity: 'info',     lab: 'A208', time: '04-18',     title: '废液桶未分类 · 巡查记录', detail: '钱雨桐已现场重新分类 · 不扣分（日常巡查仅留痕）', status: 'done' },
    { id: 'ev-08', kind: 'rectify',    severity: 'info',     lab: '302',  time: '04-10',     title: '电化学工作站接地线松动 整改完成', detail: '赵振华签字 · 复检合格', status: 'done' },
    { id: 'ev-09', kind: 'unattended', severity: 'critical', lab: '410',  time: '今日 13:42', title: '反应炉运行中 · 0 人在室', detail: '李浩然 13:24 离开 · 实验「催化合成 #3」未停止 · 已 18 分钟', actors: ['已通知 周景明', '已通知 王玉鸿'], status: 'active', counter: '升级倒计时 02:00' },
    { id: 'ev-10', kind: 'inspection', severity: 'info',     lab: '302',  time: '04-28',     title: '一级实验室 · 周检即将到达（剩 7 天）', detail: '检查人 王玉鸿 · 重点：危化柜双锁 / 管式炉周边 / 通风柜负载', status: 'pending', counter: '04-28 09:00 截止' },
    { id: 'ev-11', kind: 'patrol',     severity: 'info',     lab: 'A208', time: '昨日 11:20', title: '试剂瓶标签褪色 · 巡查记录', detail: '已现场提醒钱雨桐重新标注 · 不扣分', status: 'handled' },
  ],
  people: [
    { id: 'p01', name: '李浩然', role: '学生',   dept: '材料研24',  labs: ['410'],       score: 78,  status: '黄牌', violations: 2, training: 'valid' },
    { id: 'p02', name: '王语嫣', role: '学生',   dept: '材料研24',  labs: ['302'],       score: 89,  status: '正常', violations: 1, training: 'valid' },
    { id: 'p03', name: '赵梓豪', role: '学生',   dept: '材料研23',  labs: ['410'],       score: 72,  status: '黄牌', violations: 3, training: 'expiring' },
    { id: 'p04', name: '孙静怡', role: '学生',   dept: '测试中心',  labs: ['A208'],      score: 95,  status: '正常', violations: 0, training: 'valid' },
    { id: 'p05', name: '钱雨桐', role: '学生',   dept: '测试中心',  labs: ['A208'],      score: 72,  status: '黄牌', violations: 3, training: 'valid' },
    { id: 'p06', name: '赵振华', role: '导师',   dept: '材料化学系', labs: ['302','312'], score: 100, status: '正常', violations: 0, training: 'valid' },
    { id: 'p07', name: '周景明', role: '导师',   dept: '材料物理系', labs: ['410'],       score: 88,  status: '正常', violations: 1, training: 'valid' },
    { id: 'p08', name: '王玉鸿', role: '巡查员', dept: '学院 HSE',   labs: ['*'],         score: 100, status: '正常', violations: 0, training: 'valid' },
  ],
  accessFlow: [
    { t: '14:45', who: '赵振华', action: '进入', lab: '302', via: '人脸' },
    { t: '14:32', who: '孙静怡', action: '⚠ 长时驻留告警', lab: 'A208', via: '系统' },
    { t: '14:28', who: '王语嫣', action: '进入', lab: '302', via: '人脸' },
    { t: '14:10', who: '李浩然', action: '拒绝进入（整改期）', lab: '410', via: '人脸' },
    { t: '13:55', who: '钱雨桐', action: '离开', lab: 'A208', via: '人脸' },
    { t: '13:40', who: '黄志刚', action: '进入', lab: '216', via: '人脸' },
  ],
  trend7d: [22, 28, 31, 27, 35, 18, 24],
};

window.MOCK = MOCK;
window.EVENT_KIND_META = EVENT_KIND_META;
window.EVENT_KINDS_ORDER = EVENT_KINDS_ORDER;

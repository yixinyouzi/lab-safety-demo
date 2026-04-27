# 实验室安全 demo · 升级计划 v2

> 基于甲方 13 条反馈的代码侧改造方案 · 2026-04-27 · Claude 整理
> 用途：交专家审查、对齐口径，再开工
> 范围：admin（Web 控制台）+ mp-demo（H5 模拟小程序）+ doorplate（电子门牌）三端

---

## 0. 摘要

| 维度 | 现状 | 升级后 |
|---|---|---|
| admin 页面数 | 9（含 settings 占位） | 12（+ 危险源 / 实验项目 / 检查计划） |
| mp-demo 学生入口 | 4（扫码/预约/培训/违规） | 7（+ 项目报备 / 危化品采购 / 废液报备） |
| mp-demo 导师待审类别 | 4（appeal/booking/chem/rectify，每天弹） | 3（过夜实验/危废/危化品采购，扣分被动通知） |
| 审批链 | 仅 1 级（学生 → 导师） | 4 级夜间审批 + 3 级危化品采购 |
| 事件类型 | alert/violation/rectify | + inspection（检查扣分）/ patrol（巡查不扣）/ unattended（无人值守告警）/ purchase / waste / night |
| doorplate 状态 | 9 个 | 10 个（+ 检查模式 inspect） |
| 工时估算 | — | ≈ 10 人日（前端 mock，无后端） |

13 条按性质分四桶：

| 桶 | 反馈条号 | 性质 | 优先级 |
|---|---|---|---|
| 1. 语义校准 | 1, 6, 8, 9 | 改字段、拆 enum、调流程语义 | 高（先动） |
| 2. 审批链重设计 | 2, 10, 11, 12, 13 | 多角色、多级流程，跨三端 | 高（最伤） |
| 3. 新增模块 | 3, 5, 4 | 新增页面 + 新增 MOCK | 中 |
| 4. 门牌微调 | 7 | doorplate 单端 | 低 |

---

## 1. 现有代码骨架（专家阅读前先扫一眼）

### admin（`/admin/*.jsx`）

```
shell.jsx       侧栏 11 项 + Topbar
mock.js         labs(8) / events(8) / people(8) / accessFlow(6) / trend7d
page-inbox      今日待办（Kpi×4 + 待我处理 + 实验室 8 格 + 出入流水）
page-events     事件中心（kind 三选一 + status 三选一 时间流）
page-labs       实验室台账（卡片/列表 双视图）
page-other      PeoplePage / LabPanel / EventPanel / PlaceholderPage
page-bigscreen  指挥大屏（雷达 sweep + 楼层平面 + 设备 + 人流 + 告警 + 流水）
page-training   培训（CoursesTab / PeopleTab / NoticesTab + 详情）
page-chems      危化品（KPI + 库存清单/领用流水/三废处置 + 详情面板）
page-reports    报表（HeroStat + TwinTrend + DonutChart）
page-sysmap     关于系统（SVG 系统全貌图）
```

**关键 enum**：
- `lab.status` = `normal | warning | rectifying`
- `event.kind` = `alert | violation | rectify`
- `event.severity` = `critical | warning | info`
- `event.status` = `active | pending | rectifying | handled | done`

### mp-demo（`/mp-demo/*.jsx`）

```
page-login        3 角色入口（student/teacher/patrol）
page-student      home/book/train/msg/me 5 tab
page-student-detail   违规 → 申诉 → 整改 → 提交 5 页
page-teacher      t-home/book/t-msg/t-me 4 tab，TEA_PENDING 4 类待审
page-patrol       p-tasks/p-log/p-history/p-me 4 tab
mock.js           role/student/teacher/patrol/violation/courses/bookings/...
components.jsx    Icon×30+ / StatusBar / NavBar / TabBar / MiniProgram
```

**待审类型**：`TEA_PENDING.kind` = `appeal | booking | chem | rectify`

### doorplate（`/doorplate/*`）

```
SCENES  9 个状态：free/busy/high/rect/closed/scan/success/fail/alert
LAB     {id, name, dept, lead, hazards: 字符串数组(5项), contacts: [{role,name,phone}]}
组件    Hazards (固定 5 chip)、QR 区、人脸取景框
```

---

## 2. 13 条反馈逐条计划

### 反馈 1：检查节奏 + 扣分边界

**原话**：一级实验室每周学院检查 / 二级每月 / 学校每三月一次；**检查时才扣分**，日常巡查不扣分，遇重要危险才扣。

**现状**：
- `MOCK.events.kind` 只有 `alert | violation | rectify`，违规登记直接扣分（见 `ev-02`：「扣 5 分」），没有「巡查 vs 检查」之分。
- mp-demo 巡查员端 `PatLogPage` 现场登记表带「扣分滑块（0-6）」，按下即扣。
- 没有「下次检查倒计时」「上次检查日期」概念。

**改动**：
1. `MOCK.events.kind` 扩展为 `alert | violation | rectify | inspection | patrol`
   - `patrol`：巡查记录，**不扣分**，仅留痕
   - `inspection`：周/月/季度检查，**扣分** + 限期整改
   - `violation`：保留，仅限「重大危险（明火/剧毒泄漏/伤亡风险）」即时扣分
2. `MOCK.labs[i]` 增加 `level: 1 | 2`（一级/二级实验室）+ `nextInspection: ISO date`
3. admin 新增「检查计划」面板（在 `page-inbox` 顶部 KPI 行加一格「3 天后周检 · 302」，或独立到 `page-other` 的 PlaceholderPage 替换）
4. mp-demo `PatLogPage` 现场登记区分「巡查记录（仅留痕）」「检查（扣分+限期）」两种 mode

**影响文件**：
- `admin/mock.js`（events kind 扩展、labs 加 level/nextInspection）
- `admin/page-inbox.jsx`（KPI 新增检查倒计时；EventRow kindLabel 加两类）
- `admin/page-events.jsx`（filter pill 加两个）
- `mp-demo/mock.js`、`mp-demo/page-patrol.jsx`（PatLogPage 加 mode 切换）

**风险**：现有 `ev-02`「扣 5 分」要分类——是「检查发现」还是「巡查重大违规」？需用一份重映射表，按反馈第 1 条的精神逐条标注。

---

### 反馈 2：导师每日审核范围收窄

**原话**：导师只审 **过夜实验 / 危废处理 / 危化品采购**；遇学生扣分才处理，否则负担太重。

**现状**（`mp-demo/mock.js` TEA_PENDING）：
- 4 类：`appeal`（申诉）/ `booking`（预约）/ `chem`（危化领用）/ `rectify`（整改签字）
- 「待审 4 条」首页大字；导师每天看到所有预约都得审 → 反馈说"太多"

**改动**：
1. `TEA_PENDING.kind` 收窄为 `night | waste | purchase | violation-notice`
   - `night` = 过夜实验审批
   - `waste` = 废液固废报备的复核
   - `purchase` = 危化品采购审批
   - `violation-notice` = 学生扣分通知（不需主动审，仅看，被动 push）
2. **常规预约**（日间时段）改为「自动通过 + 仅备查」，不进 TEA_PENDING
3. **申诉复核**移交巡查员 → 见反馈 8
4. `TeaHomePage` 顶部「待审 4 条」→ 「待审 N 条 · 扣分通知 M 条」分两列

**影响文件**：`mp-demo/mock.js`、`mp-demo/page-teacher.jsx`（TeaHomePage / 待审列表 / TeaReviewPage）

**风险**：当前 `appeal` 流程已有完整 5 页跳转，移交巡查员后这部分代码要重定向到 `page-patrol.jsx`，并在那侧补「申诉处理」入口。

---

### 反馈 3：缺「危险源清单」+「实验项目审核清单」

**原话**：这是近期重点关注的两个事情。

**现状**：
- `MOCK.labs[i].hazards` 是字符串数组（如 `['腐蚀','火灾','爆炸']`），**仅作 chip 展示，无结构化条目**
- 无「实验项目」概念
- doorplate 也只展示这 5 个 chip

**改动**（**最大新增模块**）：

#### 3a. 危险源清单
1. `labs[i].hazardSources` = `[{ id, kind, name, location, severity, ppe, emergency, lastCheck }]`
   - `kind` ∈ `chemical | physical | biological | radiation | mechanical | electrical | gas`
   - 例：`{kind:'chemical', name:'氢氟酸 500ml', location:'A208 剧毒柜', severity:'critical', ppe:['丁腈手套','防雾面屏'], emergency:'葡萄糖酸钙凝胶+就医', lastCheck:'2026-04-15'}`
2. admin 侧边栏「台账」组新增「危险源台账」(`page-hazards.jsx`)：按 lab 分组的清单 + 类别筛选 + 详情面板
3. doorplate「检查模式」下显示当前 lab 的 hazardSources 列表（见反馈 7）
4. mp-demo 学生端 `StuMyLab` 可查看（只读）

#### 3b. 实验项目审核清单
1. `MOCK.projects` = `[{ id, title, lab, applicant, advisor, riskLevel, status, hazardSources, sop, currentStep, timeline }]`
   - `riskLevel` ∈ `low | medium | high`
   - `status` ∈ `draft | submitted | advisor-review | center-review | dean-review | approved | rejected`
2. mp-demo 学生端首页快捷入口加「项目报备」`StuProjectPage`：填表（项目名/涉及危险源/SOP/导师/起止）→ 提交
3. mp-demo 教师端 t-home 加「项目审核」tab（`riskLevel === 'high'` 自动加塞实验中心和副院长）
4. admin 侧边栏新增「实验项目」(`page-projects.jsx`)：按状态时间流 + 详情面板
5. doorplate 当前 lab 进行中的高风险项目在 `high` 状态显示（见反馈 6）

**影响文件**：
- `admin/mock.js`（labs.hazardSources、新增 MOCK.projects）
- `admin/page-hazards.jsx`（新建）
- `admin/page-projects.jsx`（新建）
- `admin/shell.jsx`（侧栏 +2 项）
- `admin/index.html`（cache bump + 引用）
- `mp-demo/mock.js`（新增 PROJECTS）
- `mp-demo/page-student.jsx`（首页入口 + 新增 StuProjectPage）
- `mp-demo/page-teacher.jsx`（项目审核 tab）
- `doorplate/index.html`（hazardSources 在 inspect 模式下渲染）

**风险**：这是改造量最大的一项。**专家务必先确认数据模型**，决定后再编码。

---

### 反馈 4：mp-demo 实时看实验室 + 通话

**原话**：微信端需要实时看见实验室情况及通话功能。

**现状**：
- mp-demo 学生/导师首页**无实验室实时面板**；通话只能看到 doorplate 上的电话号
- doorplate 已有 `LAB.contacts: [{role, name, phone}]`

**改动**：
1. `mp-demo/page-student.jsx` StuHomePage 顶部加「我的实验室 · 实时」卡：
   - 头像组（inRoom 几个人）
   - 视频流缩略图（mock 一张静态截图 + LIVE 角标）
   - 「呼叫负责人」按钮 → `tel:` 跳转 LAB.contacts[0].phone
   - 「呼叫巡查员」按钮（同上）
2. 教师端类似，但显示自己负责的所有实验室（数量 1-3 个）
3. `mock.js` 增加 `labCameras = { '302': '/mock/cam-302.jpg', ... }`（用占位图即可）

**影响文件**：`mp-demo/page-student.jsx`、`mp-demo/page-teacher.jsx`、`mp-demo/mock.js`、`mp-demo/styles.css`

**风险**：低。可独立做。

---

### 反馈 5：设备维护临期提示（替代「高风险使用」位）

**原话**：设备维护临期比高风险使用提示更有用。

**现状**：
- `admin/page-bigscreen.jsx` 第 375 行 `EQUIPMENT` 数组 8 项，仅含 `name/lab/tone/meta`
- 无 `lastMaintenance / nextMaintenance / calibrationDue` 字段
- chems 侧已有「过期日」可参考实现

**改动**：
1. `EQUIPMENT` 字段扩展 `nextMaintenance: ISO date`、`calibrationDue: ISO date`
2. `EquipmentList` 改造：按 `nextMaintenance - today` 倒序，前 3 项标红「7 天内」、橙「30 天内」
3. bigscreen 标题从「关键设备状态」改为「设备维护 · 临期提醒」
4. admin 新增「设备维护」（可挂在 LabPanel 详情下，不必独立页）

**影响文件**：`admin/page-bigscreen.jsx`、`admin/mock.js`（EQUIPMENT 移到 mock 集中）

**风险**：bigscreen 当前 EQUIPMENT 内联，要先迁到 mock。

---

### 反馈 6：「高风险作业」语义重审

**原话**：使用中的「高风险作业」是什么？炉子常用不算高风险。

**现状**：
- `doorplate/index.html` SCENES.high：「高风险作业进行中（卤化反应）」+ 红色 banner + 危险警戒带
- 当前是按「使用中是否高风险」二选一，没有触发条件

**改动**（待专家确认选其一）：
- **A 方案（推荐）**：保留 `high` 状态视觉，但**重定义触发条件**为「当前 lab 有 `project.riskLevel === 'high'` 进行中」。常规设备使用归 `busy`。
- **B 方案**：删除 `high`，9 改 8 状态，高危走 `alert`。
- **C 方案**：拆 `high` 为「高风险化学合成」「高风险物理操作」（kind 不同 banner 文案不同）。

无论哪种，文案从「高风险作业进行中」改为「**高风险项目进行中**」+ 项目名 + 涉及危险源 chip。

**影响文件**：`doorplate/index.html`（SCENES.high 内容 + 触发逻辑）

**风险**：与反馈 3b 联动；A 方案最优雅，需先有 `projects` 数据。

---

### 反馈 7：门牌巡查模式显示危险源详情

**原话**：导师/巡查员巡查时，门牌应显示危险源具体说明。

**现状**：
- doorplate 当前 9 状态 `Hazards()` 组件只展示 5 个 chip 字符串
- 无「展开/详情」交互

**改动**：
1. SCENES 新增第 10 个状态 `inspect` —「检查/巡查模式」：
   - 触发：巡查员 NFC 卡刷或 QR 扫描进入（mock：URL 带 `?mode=inspect` 即可）
   - banner 蓝色「检查模式 · 王玉鸿」
   - 主区不显示 5-chip，而是 `lab.hazardSources` 完整列表（每条：kind 图标 + 名称 + 位置 + severity 灯 + emergency 缩略）
   - 点击任一项展开 PPE + 应急方案
   - 底部显示「上次检查：04-15 · 由 王玉鸿」
2. NAV 控制条增加 `inspect` 按钮

**影响文件**：`doorplate/index.html`（SCENES + 新组件 InspectMode）、`doorplate/door-display.css`

**风险**：依赖反馈 3a 的 hazardSources 数据。

---

### 反馈 8：违规驳回权归巡查者

**原话**：学生违规导师审核是否处罚？驳回权应在实验中心巡查者。可申诉但驳回权在巡查者。

**现状**（`mp-demo/page-teacher.jsx` TeaReviewPage）：
- 当前流程：学生申诉 → 导师 2 选 1（支持/驳回） → 完结
- timeline 6 步，导师即终审

**改动**：
1. 流程改为：
   - 学生违规 → 学生申诉 → **导师事实核实**（仅写补充意见，不判决） → **巡查员/实验中心终审**（支持/驳回）
2. timeline 扩展为 8 步：告警 → 巡查登记 → 进入申诉期 → 学生申诉 → 导师补充 → 巡查员复核 → 终审 → 整改/解除
3. mp-demo TeaReviewPage 改为：只显示「事实补充」textarea + 提交按钮（无支持/驳回）
4. mp-demo 巡查员端 `PatHistoryPage` 增加「申诉待复核」状态，进入 `PatAppealPage`（新页），有支持/驳回 + 理由

**影响文件**：`mp-demo/mock.js`（violation.timeline 8 步）、`mp-demo/page-teacher.jsx`（TeaReviewPage）、`mp-demo/page-patrol.jsx`（新增 PatAppealPage）、`mp-demo/page-student-detail.jsx`（StuViolationPage timeline）

**风险**：流程变长，UI 要保证 timeline 在小屏不挤。

---

### 反馈 9：当事人不存在 / 无人值守 + 实验进行中

**原话**：实验室开门，无人值守，实验在进行，怎么设计？

**现状**：
- 没有此类事件类型
- MOCK 仅有 `ev-01`「长时驻留」（人在实验室太久），相反场景（人不在但实验运行）缺失

**改动**：
1. `MOCK.events.kind` 增加 `unattended`
2. 触发条件（在 mock 注释中说明）：lab 有「运行中实验」标签 AND `inRoom === 0`
3. MOCK 新增 1-2 条示例事件：
   ```
   { id:'ev-09', kind:'unattended', severity:'warning', lab:'410',
     time:'今日 13:42', title:'反应炉运行中 · 0 人在室',
     detail:'李浩然 13:24 离开 · 实验「催化合成 #3」未停止 · 已 18 分钟',
     actors:['已通知 周景明', '已通知 王玉鸿'], status:'active',
     counter:'升级倒计时 02:00' }
   ```
4. doorplate 状态切换：`busy` 模式如果检测到 inRoom === 0 → 自动切 `alert` + banner「无人值守告警」
5. mp-demo 巡查员端推送通知（首页红色 banner）

**影响文件**：`admin/mock.js`、`admin/page-inbox.jsx`（kindLabel 加一项）、`admin/page-events.jsx`（filter）、`doorplate/index.html`（alert 子文案）、`mp-demo/page-patrol.jsx`

**风险**：低，但与反馈 6（高风险作业）的触发逻辑要协调，避免事件重复。

---

### 反馈 10：夜间实验四级审批

**原话**：学生申请 → 导师 → 实验中心主任 → 副院长终审；周末节假日：学生 → 导师审核（可能 → 实验中心主任）。

**现状**：
- mp-demo 学生端 `StuBookPage` 时段 6 个，20-24 / 00-08 已禁用
- 没有「过夜实验申请」专项流程
- 没有「实验中心主任 / 副院长」角色

**改动**：
1. `MOCK.nightExperiments` = `[{id, applicant, lab, scope, dateRange, isWeekend, flow, currentStep, timeline}]`
   - `flow` 例：`['学生申请','导师审核','实验中心复核','副院长终审']`
   - 周末节假日 flow 缩为 3 级：`['学生申请','导师审核','实验中心复核']`
2. mp-demo 学生端预约页**分流**：
   - 时段在日间 → 自动通过流程（备查）
   - 时段含夜间或跨天 → 跳「过夜申请」表单（含范围/SOP/应急方案/同行人）
3. mp-demo 教师端新增 `night` 待审 tab
4. **不在 mp-demo 加 director/dean 角色**（避免角色膨胀），admin 端模拟终审：
   - admin 「事件中心」可见 `kind === 'night'` 事件，admin 用户作为「学院副院长 · 终审」处理
5. `MOCK.events` 加 night 类型示例

**影响文件**：`mp-demo/mock.js`、`mp-demo/page-student.jsx`（StuBookPage 分流 + 新增 StuNightApplyPage）、`mp-demo/page-teacher.jsx`（新 tab）、`admin/mock.js`、`admin/page-events.jsx`

**风险**：流程涉及 4 级审批 + 3 级（节假日）双分支，timeline UI 要分支表达。

---

### 反馈 11：寒暑假授权

**原话**：寒暑假白天，导师给学生授权进行实验。

**现状**：
- `MOCK.people[i]` 有 `score / yellowCard`，但**没有日期范围条件**
- 学生进门由 score 判断，不能按日期窗口

**改动**：
1. `MOCK.labs[i].vacationAuth` = `[{studentId, fromDate, toDate, dayOnly: boolean, grantedBy}]`
2. mp-demo 教师端「我的学生」每行新增「假期授权」按钮 → 弹层选日期范围
3. admin `LabPanel`（`page-other.jsx`）详情面板增加「假期授权列表」section
4. doorplate 当 lab 处于假期且学生在 vacationAuth 内 → 允许进入；否则按原逻辑

**影响文件**：`admin/mock.js`、`mp-demo/mock.js`、`mp-demo/page-teacher.jsx`、`admin/page-other.jsx`（LabPanel）

**风险**：低。

---

### 反馈 12：危化品采购线上三级审批

**原话**：学生申请 → 导师审核 → 学院安全负责人终审。

**现状**：
- `mp-demo TEA_PENDING.chem` = 「危化品**领用**审核」（不是采购）
- `admin/page-chems.jsx` 有 `CHEMS / USE_FLOW / WASTE`，**没有「采购单」概念**

**改动**：
1. `MOCK.PURCHASES` = `[{id, applicant, advisor, college, items:[{name, cas, amount, unit}], purpose, status, currentStep, timeline}]`
   - status: `draft | advisor-review | college-review | approved | rejected | delivered`
2. mp-demo 学生端首页快捷入口加「危化品采购」`StuPurchasePage`（独立于「危化品领用」）
3. mp-demo 教师端 `chem` tab 拆为两组：「采购审核」「领用确认」
4. admin `page-chems.jsx` 顶部 tab 从 3 个（库存/流水/三废）扩为 4 个（**+ 采购单**）
5. admin 用户=「学院安全负责人」终审，由 admin 操作

**影响文件**：`mp-demo/mock.js`（新增 PURCHASES）、`mp-demo/page-student.jsx`（新增 StuPurchasePage）、`mp-demo/page-teacher.jsx`（chem tab 拆分）、`admin/page-chems.jsx`（新增 PurchaseTab）、`admin/mock.js`

**风险**：与反馈 10 一样涉及多级审批，UI 模式可复用。

---

### 反馈 13：废液固废处理报备

**原话**：废液固废处理由各实验室通过微信小程序报备。

**现状**：
- `admin/page-chems.jsx` 已有 `WASTE` + `WasteTab`，但是「HSE 视角的回收记录」（已对接第三方）
- mp-demo **无学生端报备入口**
- patrol 现场登记可勾选「废液标签未贴」违规，但不是报备

**改动**：
1. `MOCK.WASTE` 字段扩展：`reportedBy: 学生名 / null` + `reportedAt: ISO datetime` + `photo`
2. mp-demo 学生端首页快捷入口加「废液报备」`StuWastePage`：
   - 表单：废液类型（酸/碱/有机/剧毒/含氟）/ 体积 / 实验室（自动识别）/ 来源（项目/课程）/ 拍照（≥1 张）
   - 提交 → 进 admin `WASTE` 队列（status: `pending`）
3. admin `WasteTab` 增加 filter：「学生报备」「HSE 排程」「已回收」
4. admin 详情显示 reportedBy + 学生备注

**影响文件**：`mp-demo/page-student.jsx`（新增 StuWastePage）、`mp-demo/mock.js`、`admin/page-chems.jsx`（WASTE 字段 + WasteTab filter）、`admin/mock.js`

**风险**：低。

---

## 3. 数据模型变更汇总（专家审查重点）

### 3.1 `admin/mock.js`

```diff
labs[i] += {
  level: 1 | 2,                    // 反馈 1
  nextInspection: ISO date,        // 反馈 1
  hazardSources: [...]             // 反馈 3a
  vacationAuth: [...]              // 反馈 11
}

events[i].kind:
- 'alert' | 'violation' | 'rectify'
+ 'alert' | 'violation' | 'rectify' | 'inspection' | 'patrol' | 'unattended' | 'night' | 'purchase' | 'waste'

events += [
  ev-09 (unattended 示例),
  ev-10 (night 示例),
  ev-11 (purchase 示例),
  ev-12 (inspection 示例),
]

+ MOCK.projects = [{id,title,lab,applicant,advisor,riskLevel,status,hazardSources,sop,currentStep,timeline}]
+ MOCK.purchases = [{id,applicant,advisor,college,items,purpose,status,currentStep,timeline}]
+ MOCK.equipment = [{id,name,lab,lastMaintenance,nextMaintenance,calibrationDue,...}]  // 从 page-bigscreen 迁出
```

### 3.2 `mp-demo/mock.js`

```diff
TEA_PENDING.kind:
- 'appeal' | 'booking' | 'chem' | 'rectify'
+ 'night' | 'waste' | 'purchase' | 'project' | 'violation-notice'

violation.timeline: 6 步 → 8 步

+ MOCK.nightExperiments = [...]
+ MOCK.purchases = [...]
+ MOCK.wasteReports = [...]  
+ MOCK.projects = [...]
+ MOCK.labCameras = { '302': '...' }
```

### 3.3 `doorplate/index.html`

```diff
SCENES: 9 个 → 10 个（新增 inspect）
+ SCENES.high 触发条件改为「project.riskLevel === 'high' 进行中」
+ LAB.hazardSources 从外部加载或内联（与 admin labs.hazardSources 一致）
```

---

## 4. 三端联动一致性矩阵

| 数据/概念 | admin | mp-demo | doorplate | 一致点 |
|---|---|---|---|---|
| lab.status | ✓ normal/warning/rectifying | 引用同字段（首页面板） | scene 映射: free/busy=normal, alert=warning, rect=rectifying | 一致 |
| event.kind | ✓ 9 类（升级后） | TEA_PENDING.kind 4 类（升级后） | — | 子集关系 |
| project | ✓ 列表页 | 学生报备 + 教师审核 | high 状态显示进行中项目 | 同一 id |
| hazardSources | ✓ 台账 | 学生只读 | inspect 模式列表 | 同一数组 |
| vacationAuth | ✓ LabPanel 显示 | 教师设置 | 门禁判断 | 同一字段 |
| nightExperiment | ✓ events 终审 | 学生申请+教师审 | — | 同一 timeline |
| purchase | ✓ chems tab | 学生申请+教师审 | — | 同一 timeline |
| waste report | ✓ WasteTab filter | 学生报备 | — | 同一队列 |

---

## 5. 风险 + 待甲方明确的开放问题

| # | 问题 | 推荐答案 | 影响范围 |
|---|---|---|---|
| Q1 | mp-demo 是否新增「实验中心主任 / 副院长」角色？ | **不加**，admin 端模拟终审 | 反馈 10、12 |
| Q2 | 反馈 6「高风险作业」选 A/B/C 哪个方案？ | A（保留视觉，重定义为高风险项目触发） | doorplate / projects |
| Q3 | 「学院 HSE」与「实验中心」是否同一组织？ | 当前 mock `me.role` 是「管理员·学院 HSE」，建议保留单一视角 | 全局 |
| Q4 | 寒暑假具体日期范围放哪？ | mock 写死 2026-07-15 → 2026-08-31 | 反馈 11 |
| Q5 | 危险源 severity 几档？ | 3 档：critical / warning / info（与 event.severity 一致） | 反馈 3a |
| Q6 | doorplate 「检查模式」由谁触发？ | mock：URL `?mode=inspect`；实战可 NFC | 反馈 7 |
| Q7 | 反馈 1 现有 8 条 events 要不要重映射？ | 要，每条标注「检查/巡查/重大违规」 | 反馈 1 |
| Q8 | 一级/二级实验室分级标准？ | 由甲方提供分级表，mock 临时按 hazards 数量 ≥4 = 一级 | 反馈 1 |

---

## 6. 工期估算 + 依赖图

```
桶 1（语义校准） 反馈 1, 6, 8, 9       → 1 天
桶 2（审批链）   反馈 10, 12, 13, 2    → 3-4 天   ← 最大块，依赖桶 1 的事件 kind 扩展
桶 3（新模块）   反馈 3a/3b, 5, 4      → 3 天     ← 可与桶 2 并行
桶 4（门牌）     反馈 7, 反馈 11        → 1 天     ← 依赖桶 3a (hazardSources)
                                       ────
                                        ~9 人日
```

依赖：桶 1 → 桶 2 / 桶 3；桶 3a → 桶 4 + 反馈 6。

建议先做桶 1（最小风险，建立通用约定），同时启动桶 3a（数据模型）。桶 1 + 桶 3a 完成后再开桶 2 和桶 4。

---

## 7. 不在本计划内的事项

- 后端实现（保持纯 mock，符合 demo 定位）
- 真微信小程序改造（已确认走 H5 模拟）
- 视觉大改（沿用 `.impeccable.md` 调性，仅按需扩展组件）
- 翻译/i18n
- 移动端 admin（继续 desktop-only）

---

## 附：当前代码引用

如专家需要直接看代码：

- 状态语义三档：`admin/page-inbox.jsx:4-9` (statusChip)、`admin/page-bigscreen.jsx:414-415` (riskLabel/riskColor)
- 事件 kind 渲染：`admin/page-inbox.jsx:30-31` (kindLabel/kindColor)、`admin/page-events.jsx:33-37` (filters)
- 待审类型：`mp-demo/mock.js`（搜 `TEA_PENDING`）、`mp-demo/page-teacher.jsx`（TeaReviewPage）
- doorplate 状态切换：`doorplate/index.html` SCENES 数组 + NAV 控制条
- 设备列表：`admin/page-bigscreen.jsx:375-405` (EQUIPMENT + EquipmentList)
- 危化品台账：`admin/page-chems.jsx`（CHEMS / USE_FLOW / WASTE 三个 const）

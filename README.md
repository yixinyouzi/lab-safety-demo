# 实验室安全管理系统 demo

中国地质大学（北京）材料科学与工程学院 · 实验室安全管理 demo

3 个端联动展示：

| 端 | 国内镜像（推荐甲方使用） | 海外/兜底 |
|---|---|---|
| **Web 管理控制台** (学院 HSE) | _EdgeOne 开通后回填_ `/` | https://yaron9.github.io/lab-safety-demo/ |
| **微信小程序** (师生 / 巡查员) | _EdgeOne 开通后回填_ `/mp-demo/` | https://yaron9.github.io/lab-safety-demo/mp-demo/ |
| **电子门牌** (实验室门口 1080×1920) | _EdgeOne 开通后回填_ `/doorplate/` | https://yaron9.github.io/lab-safety-demo/doorplate/ |

> 国内访问优先用 EdgeOne Pages 镜像（`*.edgeone.app` 默认子域名免备案）。GitHub Pages 永久保留作为海外兜底。镜像运维见 [docs/deploy-mirror.md](docs/deploy-mirror.md)。

## 各端能力

### Web 管理控制台
今日待办 · 事件中心 · 指挥大屏 · 实验室台账 · 人员档案 · 统计与报表 · 系统全貌

指挥大屏左上角「安全实时监控」是飞机驾驶舱风格 PPI 雷达，8 间实验室作为 blip 显示在雷达上。

### 微信小程序
3 个角色分端：
- 学生（预约 / 扫码进门 / 培训 / 违规申诉 / 整改）
- 教师 / 导师（待审 / 复核申诉 / 我的学生）
- 巡查员（任务 / 现场登记 / 复检）

### 电子门牌
1080×1920 竖屏 Android 一体机，9 个状态切换：
空闲 / 使用中 / 高风险作业 / 整改中（停用）/ 关闭维护 / 扫码识别中 / 识别成功 / 识别失败 / 紧急事件

含实验室名 + 状态徽章 + 责任人电话 + 危险类别 + 在场人员 + 实时危化品台账 + QR 扫码 + 人脸识别取景框。

## 技术栈
React 18 UMD + Babel standalone + 单一 styles.css，无构建工具。

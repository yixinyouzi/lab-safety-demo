# 实验室安全管理系统 demo

中国地质大学（北京）材料科学与工程学院 · 实验室安全管理 demo（演示用，非生产）

三端联动展示，**一个入口 URL** 通到全部三端：

```
/             → Portal（导航页，三端入口）
  ├─ /admin/      → Web 管理控制台（HSE）
  ├─ /mp-demo/    → 微信小程序 H5 模拟（师生 / 实验室管理员）
  └─ /doorplate/  → 电子门牌（1080×1920 竖屏 kiosk）
```

## 给甲方的 URL

| 用途 | URL |
|---|---|
| **国内访问 · 主推**（每次演示前重新部署、3 小时窗口） | 见 `docs/deploy-mirror.md` 的「演示前重新部署」流程 |
| **海外 / 兜底**（永久） | https://yaron9.github.io/lab-safety-demo/ |

> 国内默认走 EdgeOne Pages 的 `*.edgeone.cool` 预览链接（带 `eo_token`，3 小时合规窗口）。每次演示前跑一次 `npx edgeone pages deploy` 即拿到新 URL。三端共用同一个 cookie，从 portal 点进去任意端都不用重新认证。GitHub Pages 在国内打不开但海外稳定，是兜底备份。

## 各端能力

### Web 管理控制台（`/admin/`）

侧边栏分三组：

- **日常**：今日待办 · 事件中心 · 指挥大屏
- **台账**：实验室 · 危险源 · 实验项目 · 人员 · 安全培训 · 危化品 / 资产
- **系统**：统计与报表 · 扣分细则 · 关于系统

指挥大屏左上角「安全实时监控」是飞机驾驶舱风格 PPI 雷达，8 间实验室作为 blip 显示在雷达上。「扣分细则」页对应学院《实验室违规扣分细则及处理办法（试行）》PDF，5 类 40 条规则可在线编辑（写 localStorage）。

### 微信小程序（`/mp-demo/`）

3 角色分端，登录后单机切换；首页可切「多机预览」一屏看 10 屏故事线。

- **学生**：实验预约 / 扫码进门 / 安全培训 / 违规申诉 / 整改 · 三类申报（实验项目 / 危化品采购 / 夜间实验）+ 废液固废报备
- **教师**：审 5 类「学生实验申请」（预约 / 危化品 / 实验项目 / 采购 / 夜间），自己做实验复用学生 book / scan，含「我的学生」与教师消息中心
- **实验室管理员**（PDF 落地后由原"巡查员"扩权而来）：违规登记 / 申诉复核 / 整改验收 / 废液接收 / 巡查记录

### 电子门牌（`/doorplate/`）

面向 1080×1920 竖屏 Android 一体机，页面打开后直接全屏展示电子门牌，不再显示状态选择、自动轮播或预览工具栏。默认状态固定为**空闲开放**，刷新后不读取旧的 `localStorage` 状态；URL `?mode=inspect` 可进入**检查模式**并展开危险源完整台账。

含实验室名 + 状态徽章 + 责任人电话 + 危险类别 + 在场人员 + 实时危化品台账 + QR 扫码 + 人脸识别取景框 + 底部 PERIOD POINTS 仪表带（当前 6 月记分周期累积扣分）。

门牌内部采用 1080×1920 逻辑画布，在其他尺寸的 WebView 中等比缩放。React、ReactDOM 与 Babel 均从 `doorplate/vendor/` 本地加载，不依赖设备联网；`doorplate/scoring-rules.js` 是 `lib/scoring-rules.js` 的 APK 打包副本。

#### Capacitor Android 调试

当前使用 Capacitor 6，应用 ID 为 `cugb.labsafety.doorplate`，`webDir` 直接指向 `doorplate`。页面更新后，在项目根目录执行：

```powershell
# 先同步计分规则的打包副本
Copy-Item .\lib\scoring-rules.js .\doorplate\scoring-rules.js -Force

# 将 doorplate 资源同步到 Android 工程
npx cap sync android

# 用 Android Studio 打开并自行 Run
npx cap open android
```

`flatDir` 的提示是 Capacitor 生成工程的 Gradle 仓库警告，不影响页面运行。若 APK 仅显示深蓝背景，应检查 `doorplate/vendor/` 下的三个本地运行库是否已随 `cap sync` 复制到 `android/app/src/main/assets/public/vendor/`。

#### 海康人脸录入与核验

**本次改进汇总**

- 接入海康 `HikSDK_V1.2.3`，通过 Capacitor 本地插件 `HikFace` 桥接设备能力。
- 增加全屏原生取景流程，可采集人脸、创建或更新设备人员记录，并将人脸绑定到虚构工号。
- 门牌右下角人脸区支持两种操作：单击启动核验，长按约 2 秒进入录入；长按时显示进度反馈，并抑制随后产生的单击事件。
- 核验固定使用 `VerifyType.verify`，只返回通过、失败、取消或超时结果，不驱动物理门锁。
- 移除 `android.uid.system` 以解决特权进程无法加载 Capacitor WebView 的冲突，同时继续使用设备匹配的平台证书签名访问 HEOP 能力。
- 人脸图片 URL、建模数据和采集结果图片只在 Android 原生层处理，不进入 WebView、日志或 `localStorage`。

Android 工程已接入 `HikSDK_V1.2.3`，通过本地 Capacitor 插件 `HikFace` 向门牌提供三个接口：

- `isAvailable()`：检查 SDK 初始化及门禁、人员管理器是否就绪。
- `verify()`：以 `FLAG_FACE + VerifyType.verify` 启动设备人脸核验，只返回通过/失败，不执行开门。
- `enroll({ employeeNo, name })`：全屏采集人脸，创建或更新人员后绑定设备人脸数据。

日常门牌单击右下角「人脸核验」进入全屏原生核验；长按该取景区约 2 秒进入虚构演示人员录入页（内部地址为 `/doorplate/?mode=enroll`）。普通浏览器没有海康设备能力时，两处入口会运行 mock 降级流程，不写入任何设备数据。

设备端测试流程：长按「人脸核验」→ 输入虚构工号与姓名（如 `TEST001 / 林知远`）→「进入人脸采集」→ 在全屏原生取景页点击「采集并录入」→ 返回日常门牌后单击「人脸核验」验证。核验模式仍为 `VerifyType.verify`，不会执行开门。

人脸图片 URL、建模数据和采集结果图片只在 Android 原生层使用，不返回 WebView、不写日志或 `localStorage`。WebView 只会收到状态、虚构工号、姓名与事件时间。

海康 AAR 默认从仓库同级资料目录读取：

```text
../03_集成组件/HikSDK_V1.2.3.aar
```

如果资料目录位置不同，在 Gradle 属性或环境变量中设置 `HIK_SDK_AAR` 为 AAR 的绝对路径。

该应用需要使用设备匹配的平台证书签名，但不声明 `android.uid.system`。平台签名用于获取设备授予的签名级能力；系统共享 UID 则会让应用进入特权进程，而 Android 出于安全限制不允许该进程加载 WebView，因此两者不能混为一谈。编译前将 `android/hik-signing.properties.example` 复制为 `android/hik-signing.properties`，填写平台签名路径与口令；真实配置和 `.jks` 已被 `.gitignore` 排除，不应提交到公开仓库。

```powershell
Copy-Item .\android\hik-signing.properties.example .\android\hik-signing.properties
# 编辑 hik-signing.properties 后，再执行你自己的 cap sync / Gradle 构建流程
```

若设备上已安装过带 `android.uid.system` 的版本，必须先卸载旧 APK，再安装移除共享 UID 后的新版本，不能直接覆盖升级；这会清除该 demo 的本地应用数据。普通调试签名切换为平台签名时同样通常需要卸载旧包。实机验收至少覆盖：门牌 WebView 正常显示、录入成功、已录入人员核验通过、陌生人失败、20 秒超时、取消/切后台后摄像头与认证监听正常释放。

## 数据基准与单一来源

- 三端 mock 同步到 `today: '2026-04-21'`（admin/mp-demo/doorplate）。
- 扣分规则与计算唯一来自 `lib/scoring-rules.js`（IIFE 暴露 `window.SCORING`）；UI 内禁止 hardcode 分值。
- 个人 0→12 分触发挂牌；实验室 0→60 分触发关停整改；6 月记分周期（春 3.1–8.31 / 秋 9.1–次年 2.28）。

## 技术栈

Admin 与小程序使用 React 18 UMD + Babel standalone + 单一 styles.css，无前端构建工具；Portal 是纯 HTML/CSS，无 JS。电子门牌使用本地 React 18 UMD、Babel standalone，并通过 Capacitor 6 封装为 Android 应用。三端计分规则的源文件统一为 `lib/scoring-rules.js`，门牌目录保留一份供 APK 打包的同步副本。

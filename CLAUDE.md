# 实验室安全管理系统 demo

中国地质大学（北京）材料科学与工程学院 · 三端联动的实验室安全 demo（演示用，非生产）。
所有数据 mock，所有 dept/student 名都虚构。

## 必读指针（按这个顺序读）

- @.impeccable.md — design context（品牌、调性、anti-references）
- @README.md — 三端 URL + 各端能力清单（也是甲方拿到的版本说明）
- `/Users/yaron/.claude/projects/-Users-yaron-AGI-lab-safety-demo/memory/MEMORY.md` — 累积的用户反馈和偏好

## 三端结构

| 路径 | 端 | 入口文件 |
|---|---|---|
| `/` | Web 管理控制台 | `index.html` + `page-*.jsx` + `shell.jsx` + `styles.css` |
| `/mp-demo/` | 微信小程序（H5 模拟，不上微信审核） | `mp-demo/index.html` + `mp-demo/page-*.jsx` + `mp-demo/styles.css` |
| `/doorplate/` | 电子门牌（1080×1920 竖屏 kiosk） | `doorplate/index.html` + `doorplate/door-display.css`（与 `mp-demo/door-display.html` 同源拷贝） |

`mock.js` 是 admin 唯一数据源；`mp-demo/mock.js` 是小程序自己的；门牌的 LAB/SCENES 内联在 `doorplate/index.html` 里。

## 硬约束（违反会被骂）

1. **不要改字体栈** — admin 用 Inter+PingFang，mp 和门牌用 system PingFang，已经定调。`--font` / `--font-num` 是 CSS 变量，沿用就行。
2. **数据全部反算自 MOCK，不许 hardcode 字符串数值**（如 "98%"/"60%"/"响应中" 这种）。每个数字都要能从 `MOCK.labs/events/people/accessFlow` 推出来。
3. **状态三档**：正常 / 关注 / 预警。不要 高危/中危/低危/严重隐患/需关注异常 这套。
   - 正常 = `rectifying === 0 && warnCount === 0`
   - 关注 = `warnCount > 0 && rectifying === 0`
   - 预警 = `rectifying > 0`
4. **大屏指挥页（`page-bigscreen.jsx`）的「安全实时监控」必须保留 `conic-gradient` 旋转扫描臂**（动态雷达 sweep）— 这是用户领导喜欢的视觉锚点。不要换成静态分层仪表。
5. **系名只用 4 个**（中国地大材料学院实际结构）：材料化学系 / 材料物理系 / 材料工程系 / 测试中心。教师姓名保留虚构（赵振华/周景明/钱雨桐/王玉鸿/李雪茹 等）。
6. **改样式文件后 bump cache 版本号**：`index.html` 里 `?v=N` 全部 +1，否则浏览器读旧版（甲方没 hard refresh 习惯）。

## 部署

GitHub repo: https://github.com/Yaron9/lab-safety-demo  · GitHub Pages 部署（main 分支根目录）。
Push 自动触发 `.github/workflows/pages.yml`，~17s 完成。

```sh
# 本地预览
python3 -m http.server 8734
open http://localhost:8734/

# 部署后验证
curl -sI https://yaron9.github.io/lab-safety-demo/ | head -1
gh run list -R Yaron9/lab-safety-demo --limit 1
```

## 已建立的工作模式

- **设计大改用 worktree** — 不确定方向的视觉/结构改动开 `git worktree add` 到 `../lab-safety-demo-XYZ`，并起独立端口（8735）对照 main 的 8734。确认了再 ff merge。已删过 `radar` 分支的 worktree。
- **设计 skill 使用** — `/impeccable craft` 走完整流程（先读 `.impeccable.md` 上下文）。带具体硬约束 brief，不要让 skill 重新发挥。
- **UI 改完用 Playwright 自审** — 见 `memory/feedback_review_before_handoff.md`。

## 不要做的

- 不要做真微信小程序（用户已经决定用 H5 模拟，发给甲方扫码即可）。
- 不要再追问"高危/中危/低危"那套术语。
- 不要给状态卡加边框左侧色条（border-left > 1px 是 AI slop）— 见 `.impeccable.md` 的 absolute_bans。

## 完整改动历史

`git log --oneline` — 已经按 conventional commit 写得比较清楚，需要追溯就直接看 git。

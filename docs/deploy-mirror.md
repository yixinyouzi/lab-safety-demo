# 部署与镜像

## 部署矩阵

| 镜像 | URL（占位，开通后回填） | 用途 | 触发方式 |
|---|---|---|---|
| **GitHub Pages**（主） | https://yaron9.github.io/lab-safety-demo/ | 海外兜底，永远保留 | `.github/workflows/pages.yml` push 到 main 自动跑，~17s |
| **EdgeOne Pages**（国内主力） | https://<project>.edgeone.app/ | 国内甲方访问 | EdgeOne 控制台连 GitHub repo，push 到 main 自动构建 |
| **Cloudflare Pages**（备用） | https://<project>.pages.dev/ | EdgeOne 故障时兜底；部分国内运营商也能开 | Cloudflare 控制台连 GitHub repo，push 到 main 自动构建 |

三处部署的产物完全一致，都是仓库根目录原样发布，三个子路径 `/`、`/mp-demo/`、`/doorplate/` 同时可用。

## 首次开通（一次性，每个镜像 5 分钟）

### EdgeOne Pages

1. 打开 https://console.cloud.tencent.com/edgeone/pages，微信扫码登录腾讯云。
2. **创建项目** → **从 Git 导入** → 选 GitHub → 授权 `Yaron9/lab-safety-demo`。
3. 构建配置全部留空：
   - Framework preset: `None / Static`
   - Build command: 留空
   - Output directory: `.`（仓库根）
   - Root directory: `/`
   - Install command: 留空
4. **Deploy** → 等 ~30s。完成后记下 `https://<project>.edgeone.app/`，回填到本文件和 `README.md`。

> **不要在国内版 EdgeOne 上绑自定义域名**——国内自定义域名要 ICP 备案。默认 `*.edgeone.app` 子域名免备案。

### Cloudflare Pages

1. 打开 https://dash.cloudflare.com → Workers & Pages → **Create application** → **Pages** → **Connect to Git**。
2. GitHub 授权 `Yaron9/lab-safety-demo` → **Begin setup**。
3. 构建配置：
   - Framework preset: `None`
   - Build command: 留空
   - Build output directory: `/`
4. **Save and Deploy**。完成后记下 `https://<project>.pages.dev/`，回填到本文件和 `README.md`。

## 日常重部署

`git push origin main` —— 三个镜像都会同时收到 webhook，各自自动构建。**不需要手动触发任何一个**。

```sh
# 验证三处都更新到最新 commit
curl -sI https://yaron9.github.io/lab-safety-demo/ | head -1
curl -sI https://<project>.edgeone.app/ | head -1
curl -sI https://<project>.pages.dev/ | head -1

# GitHub Pages 部署日志
gh run list -R Yaron9/lab-safety-demo --limit 1
# EdgeOne / Cloudflare 部署日志各自在控制台 Deployments 页
```

## 凭据存哪

- **GitHub Pages**：`GITHUB_TOKEN` 由 Actions 自动注入，仓库 settings 里没有手动配置。
- **EdgeOne Pages / Cloudflare Pages**：通过各自的 GitHub App OAuth 授权 repo 读权限。**没有任何 token、密钥写进本仓库**。撤销授权在 GitHub → Settings → Applications → Authorized GitHub Apps。

## 故障回滚

三个镜像都按 commit 一一对应，没有"额外的发布版本"概念。出问题的优先级：

1. **某一个镜像挂了** → 把 README 里那一行临时删掉/换 GitHub Pages URL，让甲方走另外两个。镜像方控制台一般 5–30 分钟自动恢复。
2. **代码本身写坏** → `git revert <bad-sha> && git push`，三处同时回滚到上一个好版本。
3. **整个 EdgeOne Pages 公测期出大故障** → 不动 workflow，让甲方暂时走 GitHub Pages 兜底；EdgeOne 现阶段仍是公测产品，已知"半成品"。

## 别做的

- 不要替换 `.github/workflows/pages.yml`，GitHub Pages 是兜底，永远保留。
- 不要在 EdgeOne 国内版上绑自定义域名（要备案）。需要绑域名的时候再走备案流程。
- 不要为 EdgeOne / Cloudflare 单独开构建分支。三处都从 `main` 部署，保持产物一致。

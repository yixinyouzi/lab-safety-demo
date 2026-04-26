# 部署与镜像

## 部署矩阵

| 镜像 | URL | 用途 | 触发 |
|---|---|---|---|
| **GitHub Pages**（兜底） | https://yaron9.github.io/lab-safety-demo/ | 海外访问；EdgeOne 故障时甲方退路 | `.github/workflows/pages.yml` push 到 main，~17s |
| **EdgeOne Pages**（国内主力） | `https://<project>.edgeone.app/`（开通后回填） | 国内甲方访问 | `.github/workflows/edgeone.yml` push 到 main，调 EdgeOne CLI，~30s |

两份产物完全一致，都是仓库根目录原样发布。三个子路径 `/`、`/mp-demo/`、`/doorplate/` 同时可用。

> Cloudflare Pages 暂未启用——EdgeOne 公测期如果出大故障，先靠 GitHub Pages 兜底；要再加一份镜像随时可以加。

## 首次开通（一次性）

EdgeOne 部署不走控制台 OAuth，走 **EdgeOne CLI + GitHub Actions**。第一次需要人工做的两件事：

1. **开通 EdgeOne Pages 服务**（API 不开放代点）：
   - 浏览器登录 https://console.cloud.tencent.com/edgeone/pages
   - 第一次进会弹"开通"或服务条款，勾同意 → **开通**（公测期免费）
2. **生成 API Token**：
   - 同一控制台 → 左侧菜单 **API Token** → **新建** → 描述/有效期随意 → **提交** → 复制
   - Token 加到 GitHub Secrets：
     ```sh
     gh secret set EDGEONE_API_TOKEN -R Yaron9/lab-safety-demo --body "<paste-token>"
     ```
   - Token 同时存进本地 macOS Keychain（开发机本地 deploy 用）：
     ```sh
     security add-generic-password -a EDGEONE_API_TOKEN -s tencent-cloud-cli -w "<paste-token>" -U
     ```

## 日常重部署

`git push origin main` —— GitHub Pages 和 EdgeOne 同时自动跑，~30s 内两处都更新。

```sh
# 验证两处都更新到最新 commit
curl -sI https://yaron9.github.io/lab-safety-demo/ | head -1
curl -sI https://<project>.edgeone.app/ | head -1

# GitHub Pages 日志
gh run list -R Yaron9/lab-safety-demo --workflow=pages.yml --limit 1
# EdgeOne 日志（GitHub Action 跑）
gh run list -R Yaron9/lab-safety-demo --workflow=edgeone.yml --limit 1
# EdgeOne 历史部署列表（含每次的临时预览 URL）也在 EdgeOne 控制台 Deployments 页
```

## 本地手动部署（debug 用）

```sh
TOKEN=$(security find-generic-password -a EDGEONE_API_TOKEN -s tencent-cloud-cli -w)
npx -y edgeone pages deploy . -n lab-safety-demo -t "$TOKEN" -e production -a global
```

## 凭据放哪

| Secret | 存放位置 | 用途 |
|---|---|---|
| `EDGEONE_API_TOKEN` | macOS Keychain (`-s tencent-cloud-cli -a EDGEONE_API_TOKEN`) + GitHub Secret | EdgeOne CLI 部署，CI/CD 主凭证 |
| `TENCENTCLOUD_SECRET_ID` / `_KEY`（CAM）| macOS Keychain (`-s tencent-cloud-cli`) | **一次性测试用，用完即删**——主账号 root 权限不应长期存在 |
| `GITHUB_TOKEN` | Actions 自动注入 | GitHub Pages 部署 |

**仓库里没有任何 token、密钥**。

## 故障回滚

1. **EdgeOne 部署失败/挂了** → README 顶部把"国内镜像"那行临时换成 GitHub Pages URL，让甲方走兜底。EdgeOne 控制台 Deployments 页可以一键回滚到上一个 production 版本。
2. **代码本身写坏** → `git revert <bad-sha> && git push`，两处同时回滚。
3. **EdgeOne 公测期长期出大故障** → 不动 workflow，去 https://dash.cloudflare.com 加一份 Cloudflare Pages 作为第二镜像（步骤本文件之前 git history 里有，需要时找回）。

## 凭据轮换 / 撤销

```sh
# 旋转 EdgeOne API Token（控制台禁用旧 token，新建后）
gh secret set EDGEONE_API_TOKEN -R Yaron9/lab-safety-demo --body "<new-token>"
security add-generic-password -a EDGEONE_API_TOKEN -s tencent-cloud-cli -w "<new-token>" -U

# 删掉 CAM 凭证（demo 跑通后立即做）
# 1. https://console.cloud.tencent.com/cam/capi 禁用 / 删除那对 key
# 2. 本地 keychain 也清掉
security delete-generic-password -a TENCENTCLOUD_SECRET_ID -s tencent-cloud-cli
security delete-generic-password -a TENCENTCLOUD_SECRET_KEY -s tencent-cloud-cli
```

## 别做的

- 不要替换 `.github/workflows/pages.yml`，GitHub Pages 是兜底，永远保留。
- 不要在 EdgeOne 国内版上绑自定义域名（要 ICP 备案）。默认 `*.edgeone.app` 子域名免备案，demo 用足够。
- 不要把 EdgeOne API Token 写进任何 commit、CLAUDE.md、README 或文档示例——只通过 keychain / GitHub Secret 引用。

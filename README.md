# dsh-icon

[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/weidows/dsh-icon)
[![license](https://img.shields.io/github/license/Weidows/dsh-icon?style=flat-square)](LICENSE)

给 DSH 工作步骤里的文件路径加图标：工具调用行（read / write / edit 等）的路径前会显示对应文件类型的图标。

## 装

```bash
# from npm
dsh plugin --profile web add @weidows/dsh-icon

# from source
dsh plugin --profile web add github:Weidows/dsh-icon
```

重启 DSH，到 设置 → 文件图标 里选主题（JetBrains 暗色 / JetBrains 亮色 / 关闭），选择存在 localStorage。

改名说明：npm 上不带 scope 的 `dsh-icon` 是别人的包，所以这个插件发布为 `@weidows/dsh-icon`。

## 主题

首个主题是 JetBrains 文件图标主题：
- https://intellij-icons.jetbrains.design/
- https://github.com/fogio-org/vscode-jetbrains-file-icon-theme

图标文件与主题清单取自该项目（MIT），SVG 版权归 JetBrains s.r.o.，按 Apache-2.0 授权，见 assets/jetbrains/LICENSE。

## 开发

```bash
npm run build   # assets/jetbrains -> lib/client.js（把 SVG 内联成 base64 data URI）
npm test
```

插件只有浏览器半边：宿主 lib/index.js 是空 apply，只为让补丁行能被 import。
图标不能作为静态文件提供——客户端模块路由只服务 client*.js，所以图标在构建时内联进 client.js。

客户端 bundle 的 `window.__ModuleLoader__.load({ id })` 必须等于包名，改包名时 `src/client.js` 和 `cordis.patch.yml` 要一起改（`lib/client.js` 由 build 重新生成）。

源码调试也可以直接装本地目录：`dsh plugin --profile web add link:<本目录>`。

# SVG Snapshot

[English](./README.md) | 中文

一个将网页捕获为可缩放 SVG 图像的浏览器扩展。与传统截图不同，SVG 快照在任何缩放级别下都保持清晰，并且可以在矢量图形软件中轻松编辑。

## 功能特性

### 捕获模式

- **捕获视口** - 捕获当前标签页的整个可见区域
- **捕获区域** - 选择特定区域进行捕获

### 输出选项

- **下载 SVG** - 将捕获的 SVG 文件保存到电脑
- **新标签页打开** - 在新浏览器标签页中预览 SVG
- **复制到剪贴板** - 将 SVG 代码直接复制到剪贴板

### 处理选项

- **内联资源** - 将外部资源（图片、字体）嵌入到 SVG 中
- **保留链接** - 在捕获的 SVG 中保留超链接
- **压缩 SVG** - 通过移除不必要的数据来优化文件大小
- **格式化输出** - 格式化 SVG 代码以提高可读性

## 安装

### 从源码安装

1. 克隆此仓库
2. 安装依赖：
   ```bash
   pnpm install
   ```
3. 构建扩展：
   ```bash
   pnpm build
   ```
4. 在 Chrome 中加载扩展：
   - 打开 `chrome://extensions/`
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `build/chrome-mv3-prod` 目录

## 使用方法

1. 点击浏览器工具栏中的 SVG Snapshot 图标
2. 选择捕获模式（视口或区域）
3. 根据需要配置输出和处理选项
4. 点击捕获

## 开发

启动开发服务器：

```bash
pnpm dev
```

在 Chrome 中加载 `build/chrome-mv3-dev` 目录作为开发版本。

## 技术栈

- [Plasmo](https://docs.plasmo.com/) - 浏览器扩展框架
- [Vue 3](https://vuejs.org/) - UI 框架
- [dom2svg](https://www.npmjs.com/package/dom2svg) - DOM 转 SVG
- [SVGO](https://github.com/svg/svgo) - SVG 优化
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

## 许可证

MIT

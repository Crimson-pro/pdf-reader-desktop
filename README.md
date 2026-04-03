# PDF 阅读器 - 桌面应用

高性能 PDF 阅读器桌面应用（.exe），支持文本高亮、划线、添加备注，并可将所有标注保存到 PDF 文件中。

## 功能特性

- 📄 **高性能 PDF 渲染**：支持 200MB 以上的大文件
- 🖍️ **文本高亮**：多种颜色可选，双击删除
- 📝 **下划线标注**：强调重要内容
- 📌 **备注功能**：在任意位置添加备注，支持备注列表管理
- 💾 **保存到 PDF**：将所有高亮和备注保存为新的 PDF 文件
- 🔍 **缩放控制**：支持 50% - 300% 缩放
- 📖 **翻页导航**：上一页/下一页快速切换

## 技术栈

- **Electron** - 桌面应用框架
- **React 19 + TypeScript** - 前端框架
- **PDF.js** - PDF 渲染引擎
- **pdf-lib** - PDF 标注和保存
- **Zustand** - 状态管理
- **Tailwind CSS** - UI 样式
- **Vite** - 构建工具

## 安装和使用

### 1. 安装依赖

```bash
cd pdf-reader-desktop
npm install
```

### 2. 开发模式

同时启动 Vite 开发服务器和 Electron：

```bash
npm run electron:dev
```

或者分别启动：

```bash
# 终端 1 - 启动 Vite
npm run dev

# 终端 2 - 启动 Electron
npm run electron
```

### 3. 构建应用

```bash
npm run electron:build
```

构建完成后，安装文件会在 `release` 文件夹中。

### 4. 仅构建前端

```bash
npm run build
```

## 使用说明

1. **打开 PDF** - 点击页面上的"打开 PDF 文件"按钮，选择你要阅读的 PDF 文件

2. **选择工具**（顶部工具栏）：
   - 🖱️ **选择** - 普通浏览模式
   - 🖍️ **高亮** - 拖动鼠标选择区域进行高亮
   - 📝 **下划线** - 拖动鼠标添加下划线
   - 📌 **备注** - 点击任意位置添加备注

3. **选择颜色** - 在颜色选择器中点击你喜欢的颜色

4. **删除高亮** - 双击高亮区域即可删除

5. **查看备注** - 点击"备注列表"按钮查看所有备注

6. **保存 PDF** - 点击"保存 PDF"按钮，将所有标注保存为新文件

## 项目结构

```
pdf-reader-desktop/
├── electron/
│   └── main.js              # Electron 主进程
├── src/
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   ├── index.css            # 全局样式
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── store/               # Zustand 状态管理
│   │   └── index.ts
│   └── utils/               # 工具函数
│       └── pdf.ts           # PDF 相关工具
├── public/
│   └── icons/               # 应用图标
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 性能优化

- ✅ 使用 PDF.js 的 Canvas 渲染，支持大文件
- ✅ 按需渲染页面，只渲染当前页
- ✅ 优化的内存管理
- ✅ 使用 Web Worker 处理 PDF 解析

## 注意事项

- 首次加载大文件可能需要一些时间
- 保存带标注的 PDF 时，请确保有足够的磁盘空间
- 建议使用 Windows 10 或更高版本

## License

ISC

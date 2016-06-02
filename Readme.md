# Elia's foo_wsh_panel_mod_plus.dll scripts


**[WSH Panel Mod Plus]()** 是 foobar2000 最好的插件之一，Elia 本人折服于其强大的功能，从一穷二白中开始自学 JScript 以自定义自己的 foobar2000。在不断的重复与自我推翻过程中，一些脚本被留下来了，本人将其整理于此，以飨众人。


## ESLyric

[**ESLyric**(foo_uie_eslyric.dll)]() 是 ttsping (aka ohyeah) 为 foobar2000 写的歌词插件，简介与教程见这里。

ESLyric 目录里的 `*.js` 文件是 ESLyric 的歌词抓取文件，都是独立文件。

使用方法：

- File > Preferences > Tools > ESLyric 打开 ESLyric 的设置页面，
- 切换到 `搜索` 标签页下，单击 `添加` 按钮，弹出 ESLyric 的脚本编辑器窗口，
- 左下角按钮 `工具 > 导入`



## Common

**Common** 目录里是一些公共文件，通常会在脚本开始根据需要通过 `@import` 导入到脚本中。各个文件说明：

- common4.js: 里面是一些常用的常量、函数、对象等
- lang.js: 多语言化功能
- inputbox.js (by [br3tt]()): 输入框功能

例如：

```
// ==PREPROCESSOR==
// @import "path\to\common4.js"
// @import "path\to\lang.js"
// ==/PREPROCESSOR==
```

**Scripts** 目录中则为一些已完成的脚本，它们**应当**是可以直接导入到 WSH Panel Mod Plus 面板中并直接使用的。

> 然而本人没有良好的开发习惯，导致里面的文件经常无法处于可使用状态……

- PlaybackControlPanel.txt: 播放控制面板，提供播放控制按钮（播放、暂停、前一首等）、进度条、音量条及简单的音轨信息显示。仿照的是 WIN10 默认播放器 Groove 的底部面板。WIN10 之前的操作系统需要安装额外的字体 **Segoe MDL2 Assets**。

- ...



## 其它说明

...



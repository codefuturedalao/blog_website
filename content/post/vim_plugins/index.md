---
title: Vim Plugin探索[持续更新]
subtitle: Vim
date: 2023-04-10T00:00:00Z
summary: Vim Plugins
draft: false
featured: false
authors:
  - admin
lastmod: 2023-04-10T00:00:00Z
tags:
  - Academic
  - 开源
categories:
  - Vim
  - Tools
projects: []
image:
  caption: "Image credit: [**Unsplash**](https://unsplash.com/photos/vOTBmRh3-7I)"
  focal_point: ""
  placement: 2
  preview_only: false

---

环境：Ubuntu22.04

## YouCompleteMe

先配置好vpn，其中需要clone很多子repo

### Linux 64-bit

The following assume you're using Ubuntu 20.04.

#### Quick start, installing all completers

- Install YCM plugin via [Vundle](https://github.com/VundleVim/Vundle.vim#about)
- Install CMake, Vim and Python

```
apt install build-essential cmake vim-nox python3-dev
```

- Install mono-complete, go, node, java and npm

```
apt install mono-complete golang nodejs openjdk-17-jdk openjdk-17-jre npm
```

- Compile YCM

```
cd ~/.vim/bundle/YouCompleteMe
git submodule update --init --recursive
python3 install.py --all
```

- For plugging an arbitrary LSP server, check [the relevant section](https://github.com/ycm-core/YouCompleteMe#plugging-an-arbitrary-lsp-server)

如果遇到以下报错信息

```shell
Building regex module.mrab-regex/setup.py': [Errno 2] No such file or directory
```

则需要单独clone该repo

```shell
git clone https://github.com/mrabarnett/mrab-regex.git
```

## vim-polyglot

对超过五十种语言提供语法高亮和缩进。

安装方式：

```shell
Plugin 'sheerun/vim-polyglot'
  # Install on command line
$ vim +PluginInstall +qall
```

## AutoPairs

实现括号、方括号和引用的自动补全

安装方式

```shell
Plugin 'jiangmiao/auto-pairs'
  # Install on command line
$ vim +PluginInstall +qall
```

对于C或C++来说，括号的自动补全是很很有用的，但是当编辑基础的配置文件时，不需要自动补全，因此我们可以设置一个快捷键来自动打开和关闭该插件。将以下添加到.vimrc中

```
let g:AutoPairsShortcutToggle = '<C-P>'
```

现在可以通过`Ctrl+P`来控制auto-pairs的开关。

## NERDTree

文件管理器，可以浏览、打开、或对文件进行某些操作。

安装方式

```shell
Plugin 'preservim/nerdtree'
  # Install on command line
$ vim +PluginInstall +qall
```

通过在.vimrc中添加以下代码来快捷打开NERDTree（通过按jf）和关闭NERDTree

```shell
" Setting for NERDTree 
nnoremap jf :NERDTreeFocus<CR>
" Exit Vim if NERDTree is the only window remaining in the only tab.
autocmd BufEnter * if tabpagenr('$') == 1 && winnr('$') == 1 && exists('b:NERDTree') && b:NERDTree.isTabTree() | quit | endif
" Close the tab if NERDTree is the only window remaining in it.
autocmd BufEnter * if winnr('$') == 1 && exists('b:NERDTree') && b:NERDTree.isTabTree() | quit | endif
```

下面表格是NERDTree的常用键

| Mapping   | Description                                                  |      |
| :-------- | :----------------------------------------------------------- | ---- |
| o         | Exand/close directories and open files in the current active window. |      |
| go        | Opens files in the active window, but focus stays in the tree. |      |
| t , T     | Opens the selected file or bookmark in a new tab. (T) keeps focus in the tree. |      |
| i , gi    | Opens the selected node in a split window. (gi) keeps focus in the tree. |      |
| s , gs    | Opens the selected node in a vertical split window. (gs) keeps focus in the tree. |      |
| O , X     | Recursively open (O) and close (X) all child directories under the selected directory. |      |
| C         | Change the tree root to the current working directory.       |      |
| r , R     | Recursively refresh the current directory (r) and the current root directory (R). |      |
| I , F , B | Toggle display of hidden files (I), all files (F) and the bookmarks table (B). |      |
| A , q , ? | Toggle maximize and minimize (A), close the tree panel (q), and toggle quick help (?). |      |
| m         | Display the NERDTree menu. Simulates a right-click menu.     |      |

NERDTree同样支持一些书签的操作（暂时用不到，略）

## Tagbar

依赖于ctags，可以显示出文中所有的tag。

安装方式：

```shell
Plugin 'preservim/tagbar'
  # Install on command line
$ vim +PluginInstall +qall
```

## CtrlFS

在文件内搜索的工具，需要下载`ack`或`ag`

安装方式

```shell
Plugin 'dyng/ctrlsf.vim'
  # Install on command line
$ vim +PluginInstall +qall
```

添加以下配置在vimrc中，可以增加快捷键和设置一些基础设置。

```shell
" (Ctrl+F) Open search prompt (Normal Mode)
nmap <C-F>f <Plug>CtrlSFPrompt 
" " (Ctrl-F + f) Open search prompt with selection (Visual Mode)
xmap <C-F>f <Plug>CtrlSFVwordPath
" " (Ctrl-F + F) Perform search with selection (Visual Mode)
xmap <C-F>F <Plug>CtrlSFVwordExec
" " (Ctrl-F + n) Open search prompt with current word (Normal Mode)
nmap <C-F>n <Plug>CtrlSFCwordPath
" " (Ctrl-F + o )Open CtrlSF window (Normal Mode)
nnoremap <C-F>o :CtrlSFOpen<CR>
" " (Ctrl-F + t) Toggle CtrlSF window (Normal Mode)
nnoremap <C-F>t :CtrlSFToggle<CR>
" " (Ctrl-F + t) Toggle CtrlSF window (Insert Mode)
inoremap <C-F>t <Esc>:CtrlSFToggle<CR>

" Use the ack tool as the backend
" let g:ctrlsf_backend = 'ack'
" " Auto close the results panel when opening a file
let g:ctrlsf_auto_close = { "normal":0, "compact":0  }
" " Immediately switch focus to the search window
let g:ctrlsf_auto_focus = { "at":"start"  }
" " Don't open the preview window automatically
let g:ctrlsf_auto_preview = 0
" " Use the smart case sensitivity search scheme
let g:ctrlsf_case_sensitive = 'smart'
" " Normal mode, not compact mode
let g:ctrlsf_default_view = 'normal'
" " Use absoulte search by default
let g:ctrlsf_regex_pattern = 0
" " Position of the search window
let g:ctrlsf_position = 'right'
" " Width or height of search window
let g:ctrlsf_winsize = '46'
" " Search from the current working directory
let g:ctrlsf_default_root = 'cwd'"

```

## 其它

可以通过https://vimawesome.com/查找其他插件。本文主要参考[How to Turn Vim Into a Lightweight IDE](https://dane-bulat.medium.com/how-to-turn-vim-into-a-lightweight-ide-6185e0f47b79)

注：尽量不要映射j[x]为打开插件的快捷键，会导致hjkl移动时响应缓慢。
/**
 * ============================================================================
 * 交通图库 - 主题切换与深色模式模块 (theme.js)
 * ============================================================================
 *
 * 【文件说明】
 * 本文件是交通图库网站的主题切换模块，实现了完整的主题管理功能：
 * 1. 深色/浅色模式切换
 * 2. 跟随系统主题
 * 3. 主题持久化（localStorage）
 * 4. 平滑过渡动画
 * 5. 自定义主题色彩
 *
 * 【主题配置】
 * - light: 浅色主题（默认）
 * - dark: 深色主题
 * - auto: 跟随系统
 *
 * 【技术特点】
 * - CSS变量动态切换
 * - 平滑过渡动画
 * - 图片亮度自适应
 * - 图表颜色适配
 *
 * 【依赖关系】
 * - 无依赖，可独立使用
 *
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：主题配置
// ============================================

/**
 * 主题配置
 * 【说明】定义各主题的CSS变量值
 */
const THEME_CONFIG = {
  light: {
    // 背景色
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f5',
    '--bg-tertiary': '#e8e8e8',
    '--bg-card': '#ffffff',
    '--bg-hover': '#f0f0f0',
    '--bg-active': '#e3e3e3',

    // 文字色
    '--text-primary': '#333333',
    '--text-secondary': '#666666',
    '--text-tertiary': '#999999',
    '--text-muted': '#aaaaaa',
    '--text-inverse': '#ffffff',

    // 边框色
    '--border-color': '#e0e0e0',
    '--border-light': '#eeeeee',
    '--border-dark': '#cccccc',

    // 主题色
    '--primary-color': '#3498db',
    '--primary-light': '#5dade2',
    '--primary-dark': '#2980b9',
    '--secondary-color': '#95a5a6',
    '--accent-color': '#e74c3c',

    // 功能色
    '--success-color': '#27ae60',
    '--warning-color': '#f39c12',
    '--error-color': '#e74c3c',
    '--info-color': '#3498db',

    // 阴影
    '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
    '--shadow-md': '0 4px 6px rgba(0,0,0,0.1)',
    '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',

    // 其他
    '--overlay-color': 'rgba(0,0,0,0.5)',
    '--code-bg': '#f4f4f4',
    '--image-brightness': '1'
  },

  dark: {
    // 背景色
    '--bg-primary': '#1a1a2e',
    '--bg-secondary': '#16213e',
    '--bg-tertiary': '#0f3460',
    '--bg-card': '#1f1f3a',
    '--bg-hover': '#2a2a4a',
    '--bg-active': '#353560',

    // 文字色
    '--text-primary': '#e0e0e0',
    '--text-secondary': '#b0b0b0',
    '--text-tertiary': '#808080',
    '--text-muted': '#606060',
    '--text-inverse': '#1a1a2e',

    // 边框色
    '--border-color': '#2a2a4a',
    '--border-light': '#353560',
    '--border-dark': '#1f1f3a',

    // 主题色
    '--primary-color': '#4fc3f7',
    '--primary-light': '#80d8ff',
    '--primary-dark': '#29b6f6',
    '--secondary-color': '#78909c',
    '--accent-color': '#ff5252',

    // 功能色
    '--success-color': '#66bb6a',
    '--warning-color': '#ffa726',
    '--error-color': '#ef5350',
    '--info-color': '#42a5f5',

    // 阴影
    '--shadow-sm': '0 1px 2px rgba(0,0,0,0.3)',
    '--shadow-md': '0 4px 6px rgba(0,0,0,0.4)',
    '--shadow-lg': '0 10px 15px rgba(0,0,0,0.5)',

    // 其他
    '--overlay-color': 'rgba(0,0,0,0.7)',
    '--code-bg': '#2d2d44',
    '--image-brightness': '0.9'
  }
};

/**
 * 当前主题
 */
let currentTheme = 'light';

// ============================================
// 第二部分：主题管理函数
// ============================================

/**
 * 初始化主题
 * 【说明】页面加载时调用，恢复用户上次选择的主题
 */
function initTheme() {
  // 从localStorage读取主题设置
  const savedTheme = localStorage.getItem('theme_preference') || 'light';

  if (savedTheme === 'auto') {
    // 跟随系统
    followSystemTheme();
  } else {
    // 应用保存的主题
    applyTheme(savedTheme);
  }

  // 监听系统主题变化
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (currentTheme === 'auto') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  console.log('[主题] 主题系统已初始化');
}

/**
 * 应用主题
 * @param {string} theme - 主题名称（light/dark/auto）
 */
function applyTheme(theme) {
  if (theme === 'auto') {
    followSystemTheme();
    currentTheme = 'auto';
    return;
  }

  const themeVars = THEME_CONFIG[theme];
  if (!themeVars) {
    console.error('[主题] 未知的主题:', theme);
    return;
  }

  const root = document.documentElement;

  // 应用CSS变量
  Object.keys(themeVars).forEach(key => {
    root.style.setProperty(key, themeVars[key]);
  });

  // 添加/移除dark类
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }

  // 更新当前主题
  currentTheme = theme;

  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));

  console.log('[主题] 已切换到:', theme);
}

/**
 * 跟随系统主题
 */
function followSystemTheme() {
  if (window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  } else {
    applyTheme('light');
  }
  currentTheme = 'auto';
}

/**
 * 切换主题
 * 【说明】在light和dark之间切换
 */
function toggleTheme() {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  saveThemePreference(newTheme);
}

/**
 * 保存主题偏好
 * @param {string} theme - 主题名称
 */
function saveThemePreference(theme) {
  localStorage.setItem('theme_preference', theme);
}

/**
 * 获取当前主题
 * @returns {string} 当前主题名称
 */
function getCurrentTheme() {
  return currentTheme;
}

/**
 * 检查是否为深色模式
 * @returns {boolean} 是否为深色模式
 */
function isDarkMode() {
  return document.body.classList.contains('dark-theme');
}

// ============================================
// 第三部分：主题切换按钮组件
// ============================================

/**
 * 渲染主题切换按钮
 * @returns {string} HTML字符串
 */
function renderThemeToggle() {
  const isDark = isDarkMode();
  const icon = isDark ? '🌙' : '☀️';
  const text = isDark ? '深色' : '浅色';

  return `
    <button class="theme-toggle-btn" onclick="toggleTheme()" title="切换主题">
      <span class="theme-icon">${icon}</span>
      <span class="theme-text">${text}</span>
    </button>
  `;
}

/**
 * 渲染主题选择器
 * @returns {string} HTML字符串
 */
function renderThemeSelector() {
  const themes = [
    { value: 'light', label: '☀️ 浅色', icon: '☀️' },
    { value: 'dark', label: '🌙 深色', icon: '🌙' },
    { value: 'auto', label: '🖥️ 跟随系统', icon: '🖥️' }
  ];

  return `
    <div class="theme-selector">
      <h4>主题设置</h4>
      <div class="theme-options">
        ${themes.map(theme => `
          <label class="theme-option ${currentTheme === theme.value ? 'active' : ''}">
            <input type="radio" name="theme" value="${theme.value}"
                   ${currentTheme === theme.value ? 'checked' : ''}
                   onchange="handleThemeChange('${theme.value}')">
            <span class="theme-icon">${theme.icon}</span>
            <span class="theme-label">${theme.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * 处理主题变更
 * @param {string} theme - 选择的主题
 */
function handleThemeChange(theme) {
  applyTheme(theme);
  saveThemePreference(theme);

  // 更新选中状态
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.remove('active');
  });
  event.target.closest('.theme-option').classList.add('active');
}

// ============================================
// 第四部分：动态样式注入
// ============================================

/**
 * 注入主题相关CSS
 */
function injectThemeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* 主题过渡动画 */
    *, *::before, *::after {
      transition: background-color 0.3s ease,
                  color 0.3s ease,
                  border-color 0.3s ease,
                  box-shadow 0.3s ease;
    }

    /* 主题切换按钮样式 */
    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      background: var(--bg-card);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .theme-toggle-btn:hover {
      background: var(--bg-hover);
      transform: scale(1.05);
    }

    .theme-toggle-btn .theme-icon {
      font-size: 18px;
    }

    /* 主题选择器样式 */
    .theme-selector {
      padding: 20px;
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .theme-selector h4 {
      margin: 0 0 16px 0;
      color: var(--text-primary);
      font-size: 16px;
    }

    .theme-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .theme-option:hover {
      background: var(--bg-hover);
    }

    .theme-option.active {
      border-color: var(--primary-color);
      background: var(--bg-active);
    }

    .theme-option input[type="radio"] {
      display: none;
    }

    .theme-option .theme-icon {
      font-size: 20px;
    }

    .theme-option .theme-label {
      color: var(--text-primary);
      font-size: 14px;
    }

    /* 深色模式特定样式 */
    .dark-theme img {
      filter: brightness(var(--image-brightness));
    }

    .dark-theme .card,
    .dark-theme .modal-content,
    .dark-theme .dropdown-menu {
      background: var(--bg-card);
      border-color: var(--border-color);
    }

    .dark-theme input,
    .dark-theme textarea,
    .dark-theme select {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border-color: var(--border-color);
    }

    .dark-theme .navbar {
      background: rgba(26, 26, 46, 0.95);
      backdrop-filter: blur(10px);
    }

    /* 代码块样式 */
    .dark-theme code,
    .dark-theme pre {
      background: var(--code-bg);
      color: var(--text-primary);
    }

    /* 滚动条样式 */
    .dark-theme ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    .dark-theme ::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }

    .dark-theme ::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 5px;
    }

    .dark-theme ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }
  `;

  document.head.appendChild(style);
}

// ============================================
// 第五部分：初始化
// ============================================

// 页面加载完成后初始化主题
document.addEventListener('DOMContentLoaded', function() {
  injectThemeStyles();
  initTheme();
});

console.log('[主题] theme.js 已加载');

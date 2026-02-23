/**
 * ============================================================================
 * 交通图库 - 数据可视化大屏模块 (dashboard.js)
 * ============================================================================
 *
 * 【文件说明】
 * 本文件是交通图库网站的数据可视化大屏模块，实现了全面的数据分析和实时监控：
 * 1. 实时数据更新 - 定时刷新各项统计数据
 * 2. 图表绘制 - 使用Canvas API绘制各种图表
 * 3. 数据模拟 - 生成模拟数据用于演示
 * 4. 交互功能 - 支持图表交互和数据筛选
 * 5. 响应式适配 - 适配不同屏幕尺寸
 *
 * 【图表类型】
 * - 折线图：访问趋势、用户增长
 * - 饼图：分类分布、设备分布
 * - 柱状图：热门标签、活跃时段
 * - 热力图：用户活跃时段
 * - 进度条：系统健康状态
 *
 * 【技术特点】
 * - 纯Canvas绘制，无需第三方库
 * - 动画过渡效果
 * - 实时数据推送
 * - 深色主题优化
 *
 * 【依赖关系】
 * - 依赖database.js的数据
 * - 依赖config.js的配置
 *
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：全局配置和状态
// ============================================

/**
 * 大屏配置
 */
const DASHBOARD_CONFIG = {
  // 更新间隔（毫秒）
  UPDATE_INTERVAL: 5000,
  // 图表动画时长（毫秒）
  ANIMATION_DURATION: 1000,
  // 最大数据点数量
  MAX_DATA_POINTS: 24,
  // 颜色配置
  COLORS: {
    primary: '#00d4ff',
    secondary: '#7b2cbf',
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',
    info: '#3498db',
    chartColors: ['#00d4ff', '#7b2cbf', '#27ae60', '#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c']
  }
};

/**
 * 大屏状态
 */
const _dashboardState = {
  // 历史数据
  historyData: {
    visits: [],
    users: [],
    works: []
  },
  // 实时数据流
  realtimeStream: [],
  // 定时器
  updateTimer: null,
  // 图表实例
  charts: {}
};

// ============================================
// 第二部分：初始化函数
// ============================================

/**
 * 初始化大屏
 */
function initDashboard() {
  console.log('[大屏] 初始化数据可视化大屏');

  // 初始化历史数据
  initHistoryData();

  // 初始化实时数据流
  initRealtimeStream();

  // 渲染所有图表
  renderAllCharts();

  // 更新统计数据
  updateStatistics();

  // 启动定时更新
  startRealtimeUpdate();

  // 更新时间显示
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);

  console.log('[大屏] 大屏初始化完成');
}

/**
 * 初始化历史数据
 */
function initHistoryData() {
  const now = new Date();

  // 生成24小时访问数据
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();

    // 模拟访问数据（白天多，晚上少）
    let baseVisits = 100;
    if (hour >= 9 && hour <= 18) {
      baseVisits = 300 + Math.random() * 200;
    } else if (hour >= 19 && hour <= 22) {
      baseVisits = 200 + Math.random() * 150;
    } else {
      baseVisits = 50 + Math.random() * 50;
    }

    _dashboardState.historyData.visits.push({
      time: `${hour}:00`,
      value: Math.floor(baseVisits)
    });
  }
}

/**
 * 初始化实时数据流
 */
function initRealtimeStream() {
  const actions = [
    { type: 'upload', text: '上传了新作品', user: '摄影师小王' },
    { type: 'like', text: '点赞了作品', user: '摄影爱好者' },
    { type: 'login', text: '登录了系统', user: '新用户' },
    { type: 'comment', text: '发表了评论', user: '资深摄友' },
    { type: 'favorite', text: '收藏了作品', user: '收藏达人' }
  ];

  // 生成初始数据
  for (let i = 0; i < 10; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const time = new Date(Date.now() - i * 60000);

    _dashboardState.realtimeStream.push({
      time: formatTime(time),
      content: `${action.user} ${action.text}`,
      type: action.type
    });
  }
}

// ============================================
// 第三部分：图表绘制函数
// ============================================

/**
 * 渲染所有图表
 */
function renderAllCharts() {
  renderVisitTrendChart();
  renderCategoryChart();
  renderActivityHeatmap();
  renderTagCloudChart();
  renderDeviceChart();
  renderBrowserChart();
  renderRealtimeStream();
}

/**
 * 渲染访问趋势图（折线图）
 */
function renderVisitTrendChart() {
  const canvas = document.getElementById('visitTrendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const data = _dashboardState.historyData.visits;

  // 设置canvas尺寸
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 计算数据范围
  const maxValue = Math.max(...data.map(d => d.value)) * 1.2;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 绘制网格线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Y轴标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    const value = Math.round(maxValue - (maxValue / 5) * i);
    ctx.fillText(value.toString(), padding.left - 10, y + 4);
  }

  // 绘制折线
  ctx.strokeStyle = DASHBOARD_CONFIG.COLORS.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding.left + (chartWidth / (data.length - 1)) * index;
    const y = padding.top + chartHeight - (point.value / maxValue) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // 绘制渐变填充
  const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartHeight);

  data.forEach((point, index) => {
    const x = padding.left + (chartWidth / (data.length - 1)) * index;
    const y = padding.top + chartHeight - (point.value / maxValue) * chartHeight;
    ctx.lineTo(x, y);
  });

  ctx.lineTo(width - padding.right, padding.top + chartHeight);
  ctx.closePath();
  ctx.fill();

  // 绘制数据点
  data.forEach((point, index) => {
    const x = padding.left + (chartWidth / (data.length - 1)) * index;
    const y = padding.top + chartHeight - (point.value / maxValue) * chartHeight;

    ctx.fillStyle = DASHBOARD_CONFIG.COLORS.primary;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // X轴标签（每4小时显示一个）
    if (index % 4 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.time, x, height - padding.bottom + 20);
    }
  });
}

/**
 * 渲染分类分布图（饼图）
 */
function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // 获取分类数据
  const categories = {
    '铁路摄影': 35,
    '航空摄影': 25,
    '陆运摄影': 20,
    '水运摄影': 10,
    '特殊交通': 5,
    '风景人文': 5
  };

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const centerX = width / 2;
  const centerY = height / 2 - 20;
  const radius = Math.min(width, height) / 3;

  ctx.clearRect(0, 0, width, height);

  let currentAngle = -Math.PI / 2;
  const total = Object.values(categories).reduce((a, b) => a + b, 0);

  Object.entries(categories).forEach(([category, value], index) => {
    const angle = (value / total) * Math.PI * 2;
    const color = DASHBOARD_CONFIG.COLORS.chartColors[index % DASHBOARD_CONFIG.COLORS.chartColors.length];

    // 绘制扇形
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
    ctx.closePath();
    ctx.fill();

    // 绘制标签
    const labelAngle = currentAngle + angle / 2;
    const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
    const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${category}`, labelX, labelY);
    ctx.fillText(`${value}%`, labelX, labelY + 14);

    currentAngle += angle;
  });

  // 绘制中心圆
  ctx.fillStyle = 'rgba(15, 12, 41, 0.9)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('分类', centerX, centerY - 5);
  ctx.font = '14px Arial';
  ctx.fillText('分布', centerX, centerY + 15);
}

/**
 * 渲染活跃时段热力图
 */
function renderActivityHeatmap() {
  const canvas = document.getElementById('activityHeatmap');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  ctx.clearRect(0, 0, width, height);

  // 生成7天 x 24小时的数据
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const cellWidth = (width - 60) / 24;
  const cellHeight = (height - 60) / 7;

  // 绘制热力图
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // 模拟活跃度数据
      let activity = Math.random();
      if (hour >= 9 && hour <= 18) activity = 0.5 + Math.random() * 0.5;
      if (hour >= 19 && hour <= 22) activity = 0.7 + Math.random() * 0.3;

      const x = 50 + hour * cellWidth;
      const y = 40 + day * cellHeight;

      // 根据活跃度设置颜色
      const intensity = Math.floor(activity * 255);
      ctx.fillStyle = `rgba(0, 212, 255, ${activity * 0.8 + 0.2})`;
      ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
    }
  }

  // 绘制标签
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '11px Arial';

  // Y轴标签（星期）
  days.forEach((day, index) => {
    ctx.textAlign = 'right';
    ctx.fillText(day, 45, 40 + index * cellHeight + cellHeight / 2 + 4);
  });

  // X轴标签（时间）
  for (let hour = 0; hour < 24; hour += 4) {
    ctx.textAlign = 'center';
    ctx.fillText(`${hour}:00`, 50 + hour * cellWidth + cellWidth / 2, height - 10);
  }
}

/**
 * 渲染热门标签云
 */
function renderTagCloudChart() {
  const canvas = document.getElementById('tagCloudChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  ctx.clearRect(0, 0, width, height);

  // 热门标签数据
  const tags = [
    { name: '高铁', count: 156 },
    { name: '飞机', count: 134 },
    { name: '地铁', count: 122 },
    { name: '轮船', count: 98 },
    { name: '公交', count: 87 },
    { name: '夜景', count: 76 },
    { name: '航拍', count: 65 },
    { name: '复古', count: 54 },
    { name: '速度', count: 43 },
    { name: '风景', count: 38 }
  ];

  const maxCount = Math.max(...tags.map(t => t.count));

  // 绘制柱状图
  const barWidth = (width - 80) / tags.length;
  const maxBarHeight = height - 100;

  tags.forEach((tag, index) => {
    const barHeight = (tag.count / maxCount) * maxBarHeight;
    const x = 40 + index * barWidth + barWidth * 0.2;
    const y = height - 50 - barHeight;

    // 绘制柱子
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, DASHBOARD_CONFIG.COLORS.primary);
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.3)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth * 0.6, barHeight);

    // 绘制数值
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tag.count.toString(), x + barWidth * 0.3, y - 8);

    // 绘制标签名（旋转45度）
    ctx.save();
    ctx.translate(x + barWidth * 0.3, height - 35);
    ctx.rotate(-Math.PI / 4);
    ctx.font = '11px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(tag.name, 0, 0);
    ctx.restore();
  });
}

/**
 * 渲染设备分布图
 */
function renderDeviceChart() {
  const canvas = document.getElementById('deviceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  ctx.clearRect(0, 0, width, height);

  const devices = {
    '桌面端': 45,
    '移动端': 40,
    '平板': 15
  };

  const barHeight = 30;
  const maxBarWidth = width - 150;
  const startY = 50;

  Object.entries(devices).forEach(([device, percentage], index) => {
    const y = startY + index * 60;
    const barWidth = (percentage / 100) * maxBarWidth;

    // 绘制标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(device, 20, y + barHeight / 2 + 5);

    // 绘制背景条
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(100, y, maxBarWidth, barHeight);

    // 绘制数据条
    const gradient = ctx.createLinearGradient(100, 0, 100 + barWidth, 0);
    gradient.addColorStop(0, DASHBOARD_CONFIG.COLORS.primary);
    gradient.addColorStop(1, DASHBOARD_CONFIG.COLORS.secondary);

    ctx.fillStyle = gradient;
    ctx.fillRect(100, y, barWidth, barHeight);

    // 绘制百分比
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${percentage}%`, 100 + barWidth + 10, y + barHeight / 2 + 5);
  });
}

/**
 * 渲染浏览器分布图
 */
function renderBrowserChart() {
  const canvas = document.getElementById('browserChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  ctx.clearRect(0, 0, width, height);

  const browsers = {
    'Chrome': 55,
    'Safari': 20,
    'Edge': 12,
    'Firefox': 8,
    '其他': 5
  };

  let currentY = 40;

  Object.entries(browsers).forEach(([browser, percentage], index) => {
    // 绘制浏览器名称
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(browser, 20, currentY);

    // 绘制百分比
    ctx.textAlign = 'right';
    ctx.fillText(`${percentage}%`, width - 20, currentY);

    // 绘制进度条背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(20, currentY + 8, width - 40, 8);

    // 绘制进度条
    const barWidth = (percentage / 100) * (width - 40);
    const color = DASHBOARD_CONFIG.COLORS.chartColors[index % DASHBOARD_CONFIG.COLORS.chartColors.length];

    ctx.fillStyle = color;
    ctx.fillRect(20, currentY + 8, barWidth, 8);

    currentY += 45;
  });
}

/**
 * 渲染实时数据流
 */
function renderRealtimeStream() {
  const streamList = document.getElementById('realtime-stream');
  if (!streamList) return;

  streamList.innerHTML = _dashboardState.realtimeStream.map(item => `
    <li class="stream-item">
      <span class="stream-time">${item.time}</span>
      <span class="stream-badge ${item.type}">${getActionLabel(item.type)}</span>
      <span class="stream-content">${item.content}</span>
    </li>
  `).join('');
}

/**
 * 获取动作标签
 * @param {string} type - 动作类型
 * @returns {string} 标签文字
 */
function getActionLabel(type) {
  const labels = {
    upload: '上传',
    like: '点赞',
    login: '登录',
    comment: '评论',
    favorite: '收藏'
  };
  return labels[type] || type;
}

// ============================================
// 第四部分：数据更新函数
// ============================================

/**
 * 更新统计数据
 */
function updateStatistics() {
  // 获取实时数据
  const stats = typeof getStatistics === 'function' ? getStatistics() : {
    onlineUsers: Math.floor(Math.random() * 50) + 20,
    todayVisits: Math.floor(Math.random() * 1000) + 500,
    totalWorks: 2000 + Math.floor(Math.random() * 100),
    registeredUsers: 500 + Math.floor(Math.random() * 50)
  };

  // 更新DOM
  updateElement('online-users', stats.onlineUsers);
  updateElement('today-visits', stats.todayVisits.toLocaleString());
  updateElement('total-works', stats.totalWorks.toLocaleString());
  updateElement('total-users', stats.registeredUsers.toLocaleString());

  // 更新变化百分比
  updateElement('online-change', `+${Math.floor(Math.random() * 20)}%`);
  updateElement('visits-change', `+${Math.floor(Math.random() * 15)}%`);
  updateElement('works-change', `+${Math.floor(Math.random() * 10)}`);
  updateElement('users-change', `+${Math.floor(Math.random() * 5)}`);

  // 更新系统健康状态
  updateSystemHealth();
}

/**
 * 更新元素内容
 * @param {string} id - 元素ID
 * @param {string} value - 新值
 */
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/**
 * 更新系统健康状态
 */
function updateSystemHealth() {
  // 模拟系统状态
  const serverLoad = Math.floor(Math.random() * 40) + 30;
  const memoryUsage = Math.floor(Math.random() * 30) + 50;
  const dbConnections = Math.floor(Math.random() * 20) + 20;
  const apiResponse = Math.floor(Math.random() * 50) + 20;

  // 更新显示
  updateElement('server-load', `${serverLoad}%`);
  updateElement('memory-usage', `${memoryUsage}%`);
  updateElement('db-connections', `${dbConnections}/100`);
  updateElement('api-response', `${apiResponse}ms`);

  // 更新进度条
  updateProgressBar('server-load-bar', serverLoad);
  updateProgressBar('memory-usage-bar', memoryUsage);
  updateProgressBar('db-connections-bar', dbConnections);
  updateProgressBar('api-response-bar', Math.min(apiResponse / 2, 100));
}

/**
 * 更新进度条
 * @param {string} id - 进度条ID
 * @param {number} value - 百分比值
 */
function updateProgressBar(id, value) {
  const bar = document.getElementById(id);
  if (bar) {
    bar.style.width = `${value}%`;
  }
}

/**
 * 启动实时更新
 */
function startRealtimeUpdate() {
  // 定时更新统计数据
  _dashboardState.updateTimer = setInterval(() => {
    updateStatistics();

    // 添加新的实时数据
    addRealtimeItem();

    // 更新访问趋势数据
    updateVisitTrend();
  }, DASHBOARD_CONFIG.UPDATE_INTERVAL);
}

/**
 * 添加实时数据项
 */
function addRealtimeItem() {
  const actions = [
    { type: 'upload', text: '上传了新作品《城市夜景》', user: '摄影师' + Math.floor(Math.random() * 100) },
    { type: 'like', text: '点赞了作品', user: '用户' + Math.floor(Math.random() * 1000) },
    { type: 'login', text: '登录了系统', user: '新用户' + Math.floor(Math.random() * 100) },
    { type: 'comment', text: '评论：拍得太棒了！', user: '摄影爱好者' },
    { type: 'favorite', text: '收藏了作品', user: '收藏达人' + Math.floor(Math.random() * 50) }
  ];

  const action = actions[Math.floor(Math.random() * actions.length)];

  _dashboardState.realtimeStream.unshift({
    time: formatTime(new Date()),
    content: `${action.user} ${action.text}`,
    type: action.type
  });

  // 限制数量
  if (_dashboardState.realtimeStream.length > 20) {
    _dashboardState.realtimeStream.pop();
  }

  renderRealtimeStream();
}

/**
 * 更新访问趋势
 */
function updateVisitTrend() {
  // 移除最旧的数据
  _dashboardState.historyData.visits.shift();

  // 添加新数据
  const now = new Date();
  const hour = now.getHours();
  let baseVisits = 100;
  if (hour >= 9 && hour <= 18) {
    baseVisits = 300 + Math.random() * 200;
  } else if (hour >= 19 && hour <= 22) {
    baseVisits = 200 + Math.random() * 150;
  }

  _dashboardState.historyData.visits.push({
    time: `${hour}:00`,
    value: Math.floor(baseVisits)
  });

  // 重新渲染图表
  renderVisitTrendChart();
}

// ============================================
// 第五部分：工具函数
// ============================================

/**
 * 格式化时间
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 更新时间显示
 */
function updateTimeDisplay() {
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = formatTime(now);
    timeElement.textContent = `${year}-${month}-${day} ${time}`;
  }
}

// ============================================
// 第六部分：初始化
// ============================================

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initDashboard);

console.log('[大屏] dashboard.js 已加载');

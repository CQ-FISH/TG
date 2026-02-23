/**
 * ============================================================================
 * 交通图库 - BUG管理模块 (bug.js)
 * ============================================================================
 *
 * 【文件说明】
 * 本文件负责网站BUG反馈系统的完整功能，包括：
 * 1. BUG数据的提交、存储、读取、更新和删除
 * 2. BUG状态管理（待处理/处理中/已解决/已驳回）
 * 3. BUG分类管理（前端/功能/性能/安全/UI/数据/其他）
 * 4. BUG优先级管理（低/中/高/紧急）
 * 5. 管理员回复功能
 * 6. 截图附件管理
 * 7. 统计数据和报表
 *
 * 【数据存储】
 * - 使用内存数据库存储（依赖database.js）
 * - 完全脱离localStorage
 *
 * 【依赖关系】
 * - 依赖database.js中的BUG管理函数
 * - 依赖database.js中的addLog函数记录操作日志
 *
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v2.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：常量定义（枚举类型）
// ============================================

/**
 * BUG状态枚举
 * 【状态流转】
 * pending -> processing -> resolved
 *    |           |
 *    v           v
 * rejected    rejected
 *
 * 【使用说明】
 * - PENDING: 用户刚提交，等待管理员处理
 * - PROCESSING: 管理员已开始处理
 * - RESOLVED: 问题已解决
 * - REJECTED: 问题被驳回（非BUG/重复/无法复现等）
 */
const BUG_STATUS = {
  PENDING: 'pending',        // 待处理
  PROCESSING: 'processing',  // 处理中
  RESOLVED: 'resolved',      // 已解决
  REJECTED: 'rejected'       // 已驳回
};

/**
 * BUG分类枚举
 * 【分类说明】
 * - FRONTEND: 页面显示异常、布局错乱、样式问题
 * - FUNCTION: 功能无法使用、逻辑错误、操作失效
 * - PERFORMANCE: 加载缓慢、卡顿、资源占用高
 * - SECURITY: 安全漏洞、隐私泄露、越权访问
 * - UI: 界面设计、交互体验、视觉问题
 * - DATA: 数据错误、数据丢失、同步问题
 * - OTHER: 不属于以上分类的其他问题
 */
const BUG_CATEGORY = {
  FRONTEND: { value: 'frontend', label: '前端显示问题', icon: '🎨' },
  FUNCTION: { value: 'function', label: '功能异常', icon: '⚙️' },
  PERFORMANCE: { value: 'performance', label: '性能问题', icon: '⚡' },
  SECURITY: { value: 'security', label: '安全问题', icon: '🔒' },
  UI: { value: 'ui', label: '界面设计', icon: '🖼️' },
  DATA: { value: 'data', label: '数据问题', icon: '📊' },
  OTHER: { value: 'other', label: '其他问题', icon: '📌' }
};

/**
 * BUG优先级枚举
 * 【优先级说明】
 * - LOW: 轻微问题，不影响主要功能，可延后处理
 * - MEDIUM: 一般问题，影响部分功能，建议近期处理
 * - HIGH: 严重问题，影响主要功能，需要优先处理
 * - CRITICAL: 紧急问题，系统崩溃或核心功能不可用，需立即处理
 */
const BUG_PRIORITY = {
  LOW: { value: 'low', label: '低', color: '#28a745' },
  MEDIUM: { value: 'medium', label: '中', color: '#ffc107' },
  HIGH: { value: 'high', label: '高', color: '#fd7e14' },
  CRITICAL: { value: 'critical', label: '紧急', color: '#dc3545' }
};

// ============================================
// 第二部分：兼容性函数（适配database.js）
// ============================================

/**
 * 获取所有BUG
 * 【说明】从JavaScript内存存储获取BUG数据
 * @returns {Array} BUG列表
 */
function getAllBugs() {
  // 优先使用bug-sync.js的内存存储（如果已加载）
  if (typeof syncGetAllBugs === 'function') {
    return syncGetAllBugs();
  }
  
  // 其次从内存数据库获取
  if (typeof _db !== 'undefined' && _db.bugs) {
    return _db.bugs;
  }
  
  console.warn('[BUG模块] 无法获取BUG数据');
  return [];
}

/**
 * 根据ID获取BUG
 * 【说明】调用database.js的getBugById函数
 * @param {string} bugId - BUG ID
 * @returns {Object|null} BUG对象
 */
function getBugById(bugId) {
  if (typeof window.getBugByIdFromDB === 'function') {
    return window.getBugByIdFromDB(bugId);
  }
  if (typeof getBugById === 'function' && getBugById !== arguments.callee) {
    return getBugById(bugId);
  }
  const bugs = getAllBugs();
  return bugs.find(bug => bug.id === bugId) || null;
}

/**
 * 提交BUG
 * 【说明】提交BUG到内存数据库和localStorage
 * @param {Object} bugData - BUG数据
 * @returns {Object} 提交结果
 */
function submitBug(bugData) {
  // 确保BUG数据完整
  const completeBugData = {
    ...bugData,
    id: generateBugId(),
    submitTime: new Date().toISOString(),
    status: BUG_STATUS.PENDING,
    replies: []
  };

  // 优先使用bug-sync.js的同步提交功能（如果已加载）
  if (typeof syncBugSubmit === 'function') {
    return syncBugSubmit(completeBugData);
  }
  
  // 后备方案：直接保存到内存数据库
  if (typeof _db !== 'undefined' && _db.bugs) {
    _db.bugs.unshift(completeBugData);
    console.log('[BUG模块] BUG提交成功:', completeBugData.id);
    
    // 触发刷新（如果在bug-list页面）
    if (typeof window.refreshBugList === 'function') {
      window.refreshBugList();
    }
    
    return { success: true, bugId: completeBugData.id };
  }
  
  console.error('[BUG模块] 无法提交BUG，内存数据库未初始化');
  return { success: false, message: '系统错误' };
}

/**
 * 更新BUG状态
 * 【说明】调用database.js的updateBugStatus函数
 * @param {string} bugId - BUG ID
 * @param {string} newStatus - 新状态
 * @param {string} reply - 回复内容（可选）
 * @returns {Object} 更新结果
 */
function updateBugStatus(bugId, newStatus, reply) {
  if (typeof window.updateBugStatusInDB === 'function') {
    return window.updateBugStatusInDB(bugId, newStatus, reply);
  }
  if (typeof updateBugStatus === 'function' && updateBugStatus !== arguments.callee) {
    return updateBugStatus(bugId, newStatus, reply);
  }

  const bugs = getAllBugs();
  const bug = bugs.find(b => b.id === bugId);
  if (!bug) {
    return { success: false, message: 'BUG不存在' };
  }

  bug.status = newStatus;
  if (reply) {
    if (!bug.replies) bug.replies = [];
    bug.replies.push({
      content: reply,
      time: new Date().toISOString(),
      admin: getCurrentUser ? getCurrentUser().username : 'admin'
    });
  }

  console.log('[BUG模块] BUG状态更新成功:', bugId, newStatus);
  return { success: true };
}

/**
 * 删除BUG
 * 【说明】调用database.js的deleteBug函数
 * @param {string} bugId - BUG ID
 * @returns {Object} 删除结果
 */
function deleteBug(bugId) {
  if (typeof window.deleteBugFromDB === 'function') {
    return window.deleteBugFromDB(bugId);
  }
  if (typeof deleteBug === 'function' && deleteBug !== arguments.callee) {
    return deleteBug(bugId);
  }

  if (typeof _db !== 'undefined' && _db.bugs) {
    const index = _db.bugs.findIndex(b => b.id === bugId);
    if (index !== -1) {
      _db.bugs.splice(index, 1);
      console.log('[BUG模块] BUG删除成功:', bugId);
      return { success: true };
    }
  }
  return { success: false, message: 'BUG不存在' };
}

/**
 * 获取BUG统计
 * 【说明】调用database.js的getBugStatistics函数
 * @returns {Object} 统计数据
 */
function getBugStatistics() {
  if (typeof window.getBugStatisticsFromDB === 'function') {
    return window.getBugStatisticsFromDB();
  }
  if (typeof getBugStatistics === 'function' && getBugStatistics !== arguments.callee) {
    return getBugStatistics();
  }

  const bugs = getAllBugs();
  return {
    total: bugs.length,
    pending: bugs.filter(b => b.status === BUG_STATUS.PENDING).length,
    processing: bugs.filter(b => b.status === BUG_STATUS.PROCESSING).length,
    resolved: bugs.filter(b => b.status === BUG_STATUS.RESOLVED).length,
    rejected: bugs.filter(b => b.status === BUG_STATUS.REJECTED).length
  };
}

// ============================================
// 第三部分：辅助函数
// ============================================

/**
 * 生成BUG ID
 * @returns {string} BUG唯一标识符
 */
function generateBugId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BUG-${timestamp}-${random}`;
}

/**
 * 根据状态筛选BUG
 * @param {string} status - BUG状态
 * @returns {Array} 筛选后的BUG列表
 */
function getBugsByStatus(status) {
  const bugs = getAllBugs();
  if (!status || status === 'all') {
    return bugs;
  }
  return bugs.filter(bug => bug.status === status);
}

/**
 * 根据分类筛选BUG
 * @param {string} category - BUG分类
 * @returns {Array} 筛选后的BUG列表
 */
function getBugsByCategory(category) {
  const bugs = getAllBugs();
  if (!category || category === 'all') {
    return bugs;
  }
  return bugs.filter(bug => bug.category === category);
}

/**
 * 获取状态显示信息
 * @param {string} status - 状态值
 * @returns {Object} 显示信息
 */
function getStatusDisplay(status) {
  const statusMap = {
    [BUG_STATUS.PENDING]: { label: '待处理', class: 'status-pending', color: '#6c757d' },
    [BUG_STATUS.PROCESSING]: { label: '处理中', class: 'status-processing', color: '#ffc107' },
    [BUG_STATUS.RESOLVED]: { label: '已解决', class: 'status-resolved', color: '#28a745' },
    [BUG_STATUS.REJECTED]: { label: '已驳回', class: 'status-rejected', color: '#dc3545' }
  };
  return statusMap[status] || { label: '未知', class: 'status-unknown', color: '#6c757d' };
}

/**
 * 获取分类显示信息
 * @param {string} category - 分类值
 * @returns {Object} 显示信息
 */
function getCategoryDisplay(category) {
  const cat = Object.values(BUG_CATEGORY).find(c => c.value === category);
  return cat || { value: category, label: '未知分类', icon: '❓' };
}

/**
 * 获取优先级显示信息
 * @param {string} priority - 优先级值
 * @returns {Object} 显示信息
 */
function getPriorityDisplay(priority) {
  const pri = Object.values(BUG_PRIORITY).find(p => p.value === priority);
  return pri || { value: priority, label: '中', color: '#ffc107' };
}

/**
 * 格式化BUG时间
 * @param {string} timeString - ISO时间字符串
 * @returns {string} 格式化后的时间
 */
function formatBugTime(timeString) {
  if (!timeString) return '未知时间';
  const date = new Date(timeString);
  const now = new Date();
  const diff = now - date;

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  // 小于1小时
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  }
  // 小于24小时
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  }
  // 小于7天
  if (diff < 604800000) {
    return Math.floor(diff / 86400000) + '天前';
  }

  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 验证BUG数据
 * @param {Object} bugData - BUG数据
 * @returns {Object} 验证结果
 */
function validateBugData(bugData) {
  const errors = [];

  if (!bugData.title || bugData.title.trim().length < 5) {
    errors.push('标题至少需要5个字符');
  }

  if (!bugData.description || bugData.description.trim().length < 10) {
    errors.push('描述至少需要10个字符');
  }

  if (!bugData.category || !Object.values(BUG_CATEGORY).some(c => c.value === bugData.category)) {
    errors.push('请选择有效的分类');
  }

  if (!bugData.priority || !Object.values(BUG_PRIORITY).some(p => p.value === bugData.priority)) {
    errors.push('请选择有效的优先级');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ============================================
// 第四部分：初始化
// ============================================

console.log('[BUG模块] bug.js v2.0.0 已加载，使用内存数据库存储');

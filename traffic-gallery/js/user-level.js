/**
 * ============================================================================
 * 交通图库 - 用户等级与积分系统 (user-level.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站的用户等级与积分系统，实现了完整的用户成长体系：
 * 1. 积分系统 - 用户通过各种行为获得积分
 * 2. 等级系统 - 基于积分自动计算用户等级
 * 3. 徽章系统 - 用户完成特定成就获得徽章
 * 4. 排行榜 - 展示积分最高的用户
 * 5. 每日签到 - 连续签到奖励机制
 * 
 * 【积分规则】
 * - 注册：+50积分
 * - 每日签到：+10积分（连续签到有加成）
 * - 上传作品：+20积分
 * - 作品被点赞：+2积分
 * - 作品被收藏：+5积分
 * - 发表评论：+3积分
 * - 点赞他人作品：+1积分
 * - 收藏他人作品：+2积分
 * - 完善个人资料：+30积分
 * - 连续7天签到：额外+50积分
 * - 连续30天签到：额外+200积分
 * 
 * 【等级规则】
 * - Lv.1 新手摄影师：0-99分
 * - Lv.2 初级摄影师：100-299分
 * - Lv.3 中级摄影师：300-599分
 * - Lv.4 高级摄影师：600-999分
 * - Lv.5 资深摄影师：1000-1999分
 * - Lv.6 摄影大师：2000-4999分
 * - Lv.7 传奇摄影师：5000分以上
 * 
 * 【徽章系统】
 * - 初来乍到：完成注册
 * - 作品首秀：上传第一个作品
 * - 人气之星：作品获得100个赞
 * - 收藏达人：收藏50个作品
 * - 评论专家：发表100条评论
 * - 签到王者：连续签到30天
 * - 社交达人：获得50个粉丝
 * - 摄影大师：达到Lv.6等级
 * 
 * 【依赖关系】
 * - 必须在config.js和database.js之后引入
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：等级配置
// ============================================

/**
 * 等级配置
 * 【说明】定义每个等级所需的积分和称号
 */
const LEVEL_CONFIG = [
  { level: 1, name: '新手摄影师', minPoints: 0, maxPoints: 99, color: '#95a5a6' },
  { level: 2, name: '初级摄影师', minPoints: 100, maxPoints: 299, color: '#3498db' },
  { level: 3, name: '中级摄影师', minPoints: 300, maxPoints: 599, color: '#2ecc71' },
  { level: 4, name: '高级摄影师', minPoints: 600, maxPoints: 999, color: '#9b59b6' },
  { level: 5, name: '资深摄影师', minPoints: 1000, maxPoints: 1999, color: '#f39c12' },
  { level: 6, name: '摄影大师', minPoints: 2000, maxPoints: 4999, color: '#e74c3c' },
  { level: 7, name: '传奇摄影师', minPoints: 5000, maxPoints: Infinity, color: '#ffd700' }
];

/**
 * 积分规则配置
 * 【说明】定义各种行为对应的积分值
 */
const POINTS_RULES = {
  REGISTER: 50,           // 注册
  DAILY_SIGNIN: 10,       // 每日签到
  UPLOAD_WORK: 20,        // 上传作品
  WORK_LIKED: 2,          // 作品被点赞
  WORK_FAVORITED: 5,      // 作品被收藏
  POST_COMMENT: 3,        // 发表评论
  LIKE_WORK: 1,           // 点赞他人作品
  FAVORITE_WORK: 2,       // 收藏他人作品
  COMPLETE_PROFILE: 30,   // 完善个人资料
  WEEKLY_STREAK: 50,      // 连续7天签到奖励
  MONTHLY_STREAK: 200     // 连续30天签到奖励
};

/**
 * 徽章配置
 * 【说明】定义所有可获得的徽章
 */
const BADGES_CONFIG = {
  WELCOME: {
    id: 'welcome',
    name: '初来乍到',
    description: '完成注册，加入交通图库大家庭',
    icon: '👋',
    condition: '完成注册'
  },
  FIRST_WORK: {
    id: 'first_work',
    name: '作品首秀',
    description: '上传第一个摄影作品',
    icon: '📷',
    condition: '上传1个作品'
  },
  POPULAR: {
    id: 'popular',
    name: '人气之星',
    description: '作品累计获得100个赞',
    icon: '⭐',
    condition: '获得100个赞'
  },
  COLLECTOR: {
    id: 'collector',
    name: '收藏达人',
    description: '收藏50个喜欢的作品',
    icon: '💎',
    condition: '收藏50个作品'
  },
  COMMENTATOR: {
    id: 'commentator',
    name: '评论专家',
    description: '发表100条精彩评论',
    icon: '💬',
    condition: '发表100条评论'
  },
  SIGNIN_KING: {
    id: 'signin_king',
    name: '签到王者',
    description: '连续签到30天',
    icon: '👑',
    condition: '连续签到30天'
  },
  SOCIAL_STAR: {
    id: 'social_star',
    name: '社交达人',
    description: '获得50个粉丝关注',
    icon: '🤝',
    condition: '获得50个粉丝'
  },
  MASTER: {
    id: 'master',
    name: '摄影大师',
    description: '达到Lv.6等级',
    icon: '🏆',
    condition: '达到Lv.6'
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: '早起鸟',
    description: '在早上6点前签到',
    icon: '🐦',
    condition: '早6点前签到'
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: '夜猫子',
    description: '在晚上11点后签到',
    icon: '🦉',
    condition: '晚11点后签到'
  }
};

// ============================================
// 第二部分：用户积分数据管理
// ============================================

/**
 * 用户积分数据存储
 * 【说明】使用内存对象存储用户积分信息
 */
const _userPoints = {};

/**
 * 签到记录存储
 */
const _signinRecords = {};

/**
 * 徽章记录存储
 */
const _userBadges = {};

/**
 * 积分历史记录
 */
const _pointsHistory = [];

/**
 * 初始化用户积分数据
 * @param {string} username - 用户名
 */
function initUserPoints(username) {
  if (!_userPoints[username]) {
    _userPoints[username] = {
      username: username,
      points: 0,
      level: 1,
      totalWorks: 0,
      totalLikes: 0,
      totalFavorites: 0,
      totalComments: 0,
      followers: 0,
      streakDays: 0,
      lastSignin: null,
      badges: [],
      createdAt: new Date().toISOString()
    };
  }
}

/**
 * 获取用户积分信息
 * @param {string} username - 用户名
 * @returns {Object} 用户积分信息
 */
function getUserPoints(username) {
  initUserPoints(username);
  return _userPoints[username];
}

/**
 * 增加用户积分
 * @param {string} username - 用户名
 * @param {number} points - 积分值
 * @param {string} reason - 原因
 * @returns {Object} 更新后的信息
 */
function addPoints(username, points, reason) {
  initUserPoints(username);
  
  const userData = _userPoints[username];
  const oldLevel = userData.level;
  
  // 增加积分
  userData.points += points;
  
  // 计算新等级
  const newLevel = calculateLevel(userData.points);
  userData.level = newLevel;
  
  // 记录积分历史
  _pointsHistory.push({
    username: username,
    points: points,
    reason: reason,
    totalPoints: userData.points,
    createdAt: new Date().toISOString()
  });
  
  // 检查是否升级
  const leveledUp = newLevel > oldLevel;
  
  // 检查徽章
  const newBadges = checkAndAwardBadges(username);
  
  return {
    success: true,
    points: userData.points,
    level: newLevel,
    leveledUp: leveledUp,
    oldLevel: oldLevel,
    newBadges: newBadges
  };
}

/**
 * 根据积分计算等级
 * @param {number} points - 积分值
 * @returns {number} 等级
 */
function calculateLevel(points) {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (points >= LEVEL_CONFIG[i].minPoints) {
      return LEVEL_CONFIG[i].level;
    }
  }
  return 1;
}

/**
 * 获取等级信息
 * @param {number} level - 等级
 * @returns {Object} 等级信息
 */
function getLevelInfo(level) {
  return LEVEL_CONFIG.find(l => l.level === level) || LEVEL_CONFIG[0];
}

/**
 * 获取下一等级所需积分
 * @param {number} currentPoints - 当前积分
 * @returns {number} 还需多少积分升级
 */
function getPointsToNextLevel(currentPoints) {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevel = LEVEL_CONFIG.find(l => l.level === currentLevel + 1);
  
  if (!nextLevel) return 0; // 已满级
  
  return nextLevel.minPoints - currentPoints;
}

// ============================================
// 第三部分：签到系统
// ============================================

/**
 * 用户签到
 * @param {string} username - 用户名
 * @returns {Object} 签到结果
 */
function userSignin(username) {
  if (!username) {
    return { success: false, message: '请先登录' };
  }
  
  initUserPoints(username);
  const userData = _userPoints[username];
  const today = new Date().toDateString();
  
  // 检查今天是否已签到
  if (userData.lastSignin === today) {
    return { success: false, message: '今天已经签到过了' };
  }
  
  // 计算连续签到天数
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (userData.lastSignin === yesterday.toDateString()) {
    userData.streakDays++;
  } else {
    userData.streakDays = 1;
  }
  
  userData.lastSignin = today;
  
  // 基础签到积分
  let points = POINTS_RULES.DAILY_SIGNIN;
  let bonusMessage = '';
  
  // 连续签到奖励
  if (userData.streakDays === 7) {
    points += POINTS_RULES.WEEKLY_STREAK;
    bonusMessage = '恭喜！连续签到7天，额外获得50积分！';
  } else if (userData.streakDays === 30) {
    points += POINTS_RULES.MONTHLY_STREAK;
    bonusMessage = '太棒了！连续签到30天，额外获得200积分！';
  }
  
  // 早鸟/夜猫子徽章检查
  const hour = new Date().getHours();
  if (hour < 6) {
    // 早鸟
    awardBadge(username, 'early_bird');
  } else if (hour >= 23) {
    // 夜猫子
    awardBadge(username, 'night_owl');
  }
  
  // 添加积分
  const result = addPoints(username, points, '每日签到');
  
  return {
    success: true,
    message: `签到成功！获得${points}积分`,
    bonusMessage: bonusMessage,
    streakDays: userData.streakDays,
    ...result
  };
}

/**
 * 检查今天是否已签到
 * @param {string} username - 用户名
 * @returns {boolean} 是否已签到
 */
function hasSignedInToday(username) {
  if (!username || !_userPoints[username]) return false;
  const today = new Date().toDateString();
  return _userPoints[username].lastSignin === today;
}

/**
 * 获取用户签到信息
 * @param {string} username - 用户名
 * @returns {Object} 签到信息
 */
function getSigninInfo(username) {
  if (!username || !_userPoints[username]) {
    return { streakDays: 0, lastSignin: null };
  }
  
  return {
    streakDays: _userPoints[username].streakDays,
    lastSignin: _userPoints[username].lastSignin,
    hasSignedToday: hasSignedInToday(username)
  };
}

// ============================================
// 第四部分：徽章系统
// ============================================

/**
 * 检查并授予徽章
 * @param {string} username - 用户名
 * @returns {Array} 新获得的徽章列表
 */
function checkAndAwardBadges(username) {
  initUserPoints(username);
  const userData = _userPoints[username];
  const newBadges = [];
  
  // 检查各个徽章条件
  if (userData.totalWorks >= 1) {
    if (awardBadge(username, 'first_work')) {
      newBadges.push(BADGES_CONFIG.FIRST_WORK);
    }
  }
  
  if (userData.totalLikes >= 100) {
    if (awardBadge(username, 'popular')) {
      newBadges.push(BADGES_CONFIG.POPULAR);
    }
  }
  
  if (userData.totalFavorites >= 50) {
    if (awardBadge(username, 'collector')) {
      newBadges.push(BADGES_CONFIG.COLLECTOR);
    }
  }
  
  if (userData.totalComments >= 100) {
    if (awardBadge(username, 'commentator')) {
      newBadges.push(BADGES_CONFIG.COMMENTATOR);
    }
  }
  
  if (userData.streakDays >= 30) {
    if (awardBadge(username, 'signin_king')) {
      newBadges.push(BADGES_CONFIG.SIGNIN_KING);
    }
  }
  
  if (userData.followers >= 50) {
    if (awardBadge(username, 'social_star')) {
      newBadges.push(BADGES_CONFIG.SOCIAL_STAR);
    }
  }
  
  if (userData.level >= 6) {
    if (awardBadge(username, 'master')) {
      newBadges.push(BADGES_CONFIG.MASTER);
    }
  }
  
  return newBadges;
}

/**
 * 授予徽章
 * @param {string} username - 用户名
 * @param {string} badgeId - 徽章ID
 * @returns {boolean} 是否成功授予（如果是新获得返回true）
 */
function awardBadge(username, badgeId) {
  initUserPoints(username);
  const userData = _userPoints[username];
  
  if (!userData.badges.includes(badgeId)) {
    userData.badges.push(badgeId);
    
    // 记录日志
    if (typeof addLog === 'function') {
      const badge = BADGES_CONFIG[Object.keys(BADGES_CONFIG).find(
        key => BADGES_CONFIG[key].id === badgeId
      )];
      addLog('badge', `用户 ${username} 获得徽章：${badge ? badge.name : badgeId}`);
    }
    
    return true;
  }
  
  return false;
}

/**
 * 获取用户的徽章列表
 * @param {string} username - 用户名
 * @returns {Array} 徽章列表
 */
function getUserBadges(username) {
  initUserPoints(username);
  const userData = _userPoints[username];
  
  return userData.badges.map(badgeId => {
    const badge = Object.values(BADGES_CONFIG).find(b => b.id === badgeId);
    return badge || { id: badgeId, name: '未知徽章', icon: '❓' };
  });
}

/**
 * 获取所有可用徽章
 * @returns {Array} 所有徽章配置
 */
function getAllBadges() {
  return Object.values(BADGES_CONFIG);
}

// ============================================
// 第五部分：排行榜
// ============================================

/**
 * 获取积分排行榜
 * @param {number} limit - 限制数量
 * @returns {Array} 排行榜列表
 */
function getPointsLeaderboard(limit = 10) {
  const users = Object.values(_userPoints);
  
  return users
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((user, index) => ({
      rank: index + 1,
      username: user.username,
      points: user.points,
      level: user.level,
      levelName: getLevelInfo(user.level).name,
      badges: user.badges.length
    }));
}

/**
 * 获取作品数量排行榜
 * @param {number} limit - 限制数量
 * @returns {Array} 排行榜列表
 */
function getWorksLeaderboard(limit = 10) {
  const users = Object.values(_userPoints);
  
  return users
    .sort((a, b) => b.totalWorks - a.totalWorks)
    .slice(0, limit)
    .map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalWorks: user.totalWorks,
      level: user.level
    }));
}

// ============================================
// 第六部分：用户行为统计更新
// ============================================

/**
 * 更新用户作品数量
 * @param {string} username - 用户名
 * @param {number} count - 作品数量（不传则自动计算）
 */
function updateUserWorksCount(username, count) {
  initUserPoints(username);
  
  if (typeof count === 'number') {
    _userPoints[username].totalWorks = count;
  } else {
    // 自动计算
    if (typeof getAllWorks === 'function') {
      const works = getAllWorks().filter(w => w.author === username);
      _userPoints[username].totalWorks = works.length;
    }
  }
  
  // 检查徽章
  checkAndAwardBadges(username);
}

/**
 * 更新用户获赞数量
 * @param {string} username - 用户名
 * @param {number} count - 点赞数量
 */
function updateUserLikesCount(username, count) {
  initUserPoints(username);
  _userPoints[username].totalLikes = count;
  checkAndAwardBadges(username);
}

/**
 * 更新用户收藏数量
 * @param {string} username - 用户名
 * @param {number} count - 收藏数量
 */
function updateUserFavoritesCount(username, count) {
  initUserPoints(username);
  _userPoints[username].totalFavorites = count;
  checkAndAwardBadges(username);
}

/**
 * 更新用户评论数量
 * @param {string} username - 用户名
 * @param {number} count - 评论数量
 */
function updateUserCommentsCount(username, count) {
  initUserPoints(username);
  _userPoints[username].totalComments = count;
  checkAndAwardBadges(username);
}

// ============================================
// 第七部分：UI渲染函数
// ============================================

/**
 * 渲染用户等级徽章
 * @param {string} username - 用户名
 * @returns {string} HTML字符串
 */
function renderUserLevelBadge(username) {
  const userData = getUserPoints(username);
  const levelInfo = getLevelInfo(userData.level);
  
  return `
    <div class="user-level-badge" style="background-color: ${levelInfo.color}">
      <span class="level-number">Lv.${userData.level}</span>
      <span class="level-name">${levelInfo.name}</span>
    </div>
  `;
}

/**
 * 渲染用户积分信息
 * @param {string} username - 用户名
 * @returns {string} HTML字符串
 */
function renderUserPointsInfo(username) {
  const userData = getUserPoints(username);
  const levelInfo = getLevelInfo(userData.level);
  const pointsToNext = getPointsToNextLevel(userData.points);
  
  // 计算进度百分比
  let progressPercent = 100;
  if (pointsToNext > 0) {
    const currentLevelMin = levelInfo.minPoints;
    const nextLevelMin = LEVEL_CONFIG.find(l => l.level === userData.level + 1)?.minPoints || currentLevelMin;
    const progress = userData.points - currentLevelMin;
    const total = nextLevelMin - currentLevelMin;
    progressPercent = (progress / total) * 100;
  }
  
  return `
    <div class="user-points-card">
      <div class="points-header">
        <h3>我的等级</h3>
        ${renderUserLevelBadge(username)}
      </div>
      <div class="points-info">
        <div class="points-value">
          <span class="number">${userData.points}</span>
          <span class="label">积分</span>
        </div>
        <div class="next-level">
          ${pointsToNext > 0 
            ? `还需 <strong>${pointsToNext}</strong> 积分升级` 
            : '已达到最高等级'}
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%; background-color: ${levelInfo.color}"></div>
      </div>
      <div class="signin-info">
        ${hasSignedInToday(username) 
          ? '<span class="signed">✅ 今日已签到</span>' 
          : `<button class="btn-signin" onclick="handleSignin('${username}')">立即签到</button>`}
        <span class="streak">连续签到 ${userData.streakDays} 天</span>
      </div>
    </div>
  `;
}

/**
 * 渲染用户徽章展示
 * @param {string} username - 用户名
 * @returns {string} HTML字符串
 */
function renderUserBadges(username) {
  const badges = getUserBadges(username);
  
  if (badges.length === 0) {
    return '<p class="no-badges">还没有获得徽章，快去完成任务吧！</p>';
  }
  
  return `
    <div class="badges-grid">
      ${badges.map(badge => `
        <div class="badge-item" title="${badge.description}">
          <span class="badge-icon">${badge.icon}</span>
          <span class="badge-name">${badge.name}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * 渲染排行榜
 * @param {number} limit - 限制数量
 * @returns {string} HTML字符串
 */
function renderLeaderboard(limit = 10) {
  const leaderboard = getPointsLeaderboard(limit);
  
  return `
    <div class="leaderboard">
      <h3>🏆 积分排行榜</h3>
      <div class="leaderboard-list">
        ${leaderboard.map((user, index) => {
          const rankClass = index < 3 ? `rank-${index + 1}` : '';
          const medals = ['🥇', '🥈', '🥉'];
          return `
            <div class="leaderboard-item ${rankClass}">
              <span class="rank">${index < 3 ? medals[index] : user.rank}</span>
              <span class="username">${user.username}</span>
              <span class="level">Lv.${user.level}</span>
              <span class="points">${user.points} 积分</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ============================================
// 第八部分：事件处理
// ============================================

/**
 * 处理签到点击
 * @param {string} username - 用户名
 */
function handleSignin(username) {
  if (!username) {
    showToast('请先登录', 'warning');
    return;
  }
  
  const result = userSignin(username);
  
  if (result.success) {
    let message = result.message;
    if (result.bonusMessage) {
      message += '\n' + result.bonusMessage;
    }
    showToast(message, 'success');
    
    // 刷新积分显示
    const pointsCard = document.querySelector('.user-points-card');
    if (pointsCard) {
      pointsCard.outerHTML = renderUserPointsInfo(username);
    }
    
    // 如果有新徽章，显示
    if (result.newBadges && result.newBadges.length > 0) {
      result.newBadges.forEach(badge => {
        setTimeout(() => {
          showToast(`🎉 获得新徽章：${badge.name}`, 'success');
        }, 1000);
      });
    }
  } else {
    showToast(result.message, 'error');
  }
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型
 */
function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function' && window.showToast !== showToast) {
    window.showToast(message, type);
    return;
  }
  
  // 简单的toast实现
  alert(message);
}

console.log('[等级系统] user-level.js 已加载');

/**
 * ============================================================================
 * 交通图库 - AI智能推荐系统 (ai-recommendation.js)
 * ============================================================================
 *
 * 【文件说明】
 * 本文件是交通图库网站的AI智能推荐系统，实现了基于用户行为的个性化推荐：
 * 1. 协同过滤推荐 - 基于用户相似度的推荐
 * 2. 内容推荐 - 基于作品标签和特征的推荐
 * 3. 热门推荐 - 基于热度的推荐
 * 4. 新作品推荐 - 最新上传的作品
 * 5. 混合推荐 - 综合多种算法的推荐
 *
 * 【推荐算法】
 * - 用户画像分析：分析用户的浏览、点赞、收藏行为
 * - 相似度计算：计算用户之间的相似度
 * - 标签匹配：基于作品标签的相似度
 * - 时间衰减：近期行为权重更高
 * - 多样性保证：避免推荐结果过于单一
 *
 * 【技术特点】
 * - 纯前端实现，无需后端
 * - 实时计算推荐结果
 * - 可解释的推荐原因
 * - 支持A/B测试
 *
 * 【依赖关系】
 * - 依赖database.js的数据
 * - 依赖interaction.js的用户行为
 *
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：推荐算法配置
// ============================================

/**
 * 推荐算法配置
 */
const RECOMMENDATION_CONFIG = {
  // 推荐数量
  RECOMMEND_COUNT: 12,

  // 相似用户数量
  SIMILAR_USERS_COUNT: 5,

  // 时间衰减系数（天数）
  TIME_DECAY_DAYS: 7,

  // 权重配置
  WEIGHTS: {
    collaborative: 0.4,    // 协同过滤权重
    content: 0.3,          // 内容推荐权重
    popular: 0.2,          // 热门推荐权重
    new: 0.1               // 新作品权重
  },

  // 标签相似度阈值
  TAG_SIMILARITY_THRESHOLD: 0.3,

  // 用户相似度阈值
  USER_SIMILARITY_THRESHOLD: 0.2,

  // 多样性参数
  DIVERSITY_FACTOR: 0.3
};

// ============================================
// 第二部分：用户画像系统
// ============================================

/**
 * 用户画像存储
 */
const _userProfiles = {};

/**
 * 初始化用户画像
 * @param {string} username - 用户名
 */
function initUserProfile(username) {
  if (!_userProfiles[username]) {
    _userProfiles[username] = {
      username: username,
      // 标签偏好分数
      tagPreferences: {},
      // 分类偏好分数
      categoryPreferences: {},
      // 浏览历史（带权重）
      viewHistory: [],
      // 点赞历史
      likeHistory: [],
      // 收藏历史
      favoriteHistory: [],
      // 活跃时间段
      activeHours: new Array(24).fill(0),
      // 最后更新时间
      lastUpdate: new Date().toISOString()
    };
  }
}

/**
 * 获取用户画像
 * @param {string} username - 用户名
 * @returns {Object} 用户画像
 */
function getUserProfile(username) {
  initUserProfile(username);
  return _userProfiles[username];
}

/**
 * 更新用户画像
 * @param {string} username - 用户名
 * @param {string} action - 行为类型（view/like/favorite）
 * @param {Object} work - 作品对象
 */
function updateUserProfile(username, action, work) {
  initUserProfile(username);
  const profile = _userProfiles[username];

  const timestamp = new Date().toISOString();
  const hour = new Date().getHours();

  // 记录活跃时间
  profile.activeHours[hour]++;

  // 更新分类偏好
  if (work.category) {
    if (!profile.categoryPreferences[work.category]) {
      profile.categoryPreferences[work.category] = 0;
    }
    profile.categoryPreferences[work.category] += getActionWeight(action);
  }

  // 更新标签偏好
  if (work.tags && Array.isArray(work.tags)) {
    work.tags.forEach(tag => {
      if (!profile.tagPreferences[tag]) {
        profile.tagPreferences[tag] = 0;
      }
      profile.tagPreferences[tag] += getActionWeight(action);
    });
  }

  // 记录行为历史
  const historyEntry = {
    workId: work.id,
    action: action,
    timestamp: timestamp
  };

  switch (action) {
    case 'view':
      profile.viewHistory.push(historyEntry);
      break;
    case 'like':
      profile.likeHistory.push(historyEntry);
      break;
    case 'favorite':
      profile.favoriteHistory.push(historyEntry);
      break;
  }

  // 限制历史记录数量
  const maxHistory = 100;
  if (profile.viewHistory.length > maxHistory) {
    profile.viewHistory = profile.viewHistory.slice(-maxHistory);
  }
  if (profile.likeHistory.length > maxHistory) {
    profile.likeHistory = profile.likeHistory.slice(-maxHistory);
  }
  if (profile.favoriteHistory.length > maxHistory) {
    profile.favoriteHistory = profile.favoriteHistory.slice(-maxHistory);
  }

  profile.lastUpdate = timestamp;

  console.log(`[AI推荐] 更新用户 ${username} 的画像，行为：${action}`);
}

/**
 * 获取行为权重
 * @param {string} action - 行为类型
 * @returns {number} 权重值
 */
function getActionWeight(action) {
  const weights = {
    view: 1,
    like: 3,
    favorite: 5,
    comment: 4,
    share: 3
  };
  return weights[action] || 1;
}

// ============================================
// 第三部分：相似度计算
// ============================================

/**
 * 计算两个用户的相似度（余弦相似度）
 * @param {string} user1 - 用户1
 * @param {string} user2 - 用户2
 * @returns {number} 相似度（0-1）
 */
function calculateUserSimilarity(user1, user2) {
  const profile1 = getUserProfile(user1);
  const profile2 = getUserProfile(user2);

  // 计算标签偏好的相似度
  const tagSim = calculateCosineSimilarity(
    profile1.tagPreferences,
    profile2.tagPreferences
  );

  // 计算分类偏好的相似度
  const catSim = calculateCosineSimilarity(
    profile1.categoryPreferences,
    profile2.categoryPreferences
  );

  // 综合相似度
  return (tagSim * 0.7 + catSim * 0.3);
}

/**
 * 计算余弦相似度
 * @param {Object} vec1 - 向量1
 * @param {Object} vec2 - 向量2
 * @returns {number} 相似度
 */
function calculateCosineSimilarity(vec1, vec2) {
  const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  keys.forEach(key => {
    const val1 = vec1[key] || 0;
    const val2 = vec2[key] || 0;

    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * 计算作品与用户的匹配度
 * @param {Object} work - 作品
 * @param {string} username - 用户名
 * @returns {number} 匹配度
 */
function calculateWorkMatchScore(work, username) {
  const profile = getUserProfile(username);

  // 标签匹配度
  let tagScore = 0;
  if (work.tags && Array.isArray(work.tags)) {
    work.tags.forEach(tag => {
      if (profile.tagPreferences[tag]) {
        tagScore += profile.tagPreferences[tag];
      }
    });
  }

  // 分类匹配度
  let categoryScore = 0;
  if (work.category && profile.categoryPreferences[work.category]) {
    categoryScore = profile.categoryPreferences[work.category];
  }

  // 归一化
  const maxTagScore = Math.max(...Object.values(profile.tagPreferences), 1);
  const maxCatScore = Math.max(...Object.values(profile.categoryPreferences), 1);

  return (tagScore / maxTagScore * 0.7) + (categoryScore / maxCatScore * 0.3);
}

// ============================================
// 第四部分：推荐算法
// ============================================

/**
 * 协同过滤推荐
 * @param {string} username - 用户名
 * @param {number} count - 推荐数量
 * @returns {Array} 推荐作品列表
 */
function collaborativeFilteringRecommend(username, count) {
  const profile = getUserProfile(username);
  const allUsers = Object.keys(_userProfiles).filter(u => u !== username);

  if (allUsers.length === 0) return [];

  // 计算与所有用户的相似度
  const similarities = allUsers.map(user => ({
    username: user,
    similarity: calculateUserSimilarity(username, user)
  })).filter(s => s.similarity >= RECOMMENDATION_CONFIG.USER_SIMILARITY_THRESHOLD);

  // 按相似度排序，取前N个相似用户
  similarities.sort((a, b) => b.similarity - a.similarity);
  const similarUsers = similarities.slice(0, RECOMMENDATION_CONFIG.SIMILAR_USERS_COUNT);

  // 收集相似用户喜欢的作品
  const candidateWorks = new Map();

  similarUsers.forEach(({ username: similarUser, similarity }) => {
    const similarProfile = getUserProfile(similarUser);

    // 收集该用户喜欢的作品
    [...similarProfile.likeHistory, ...similarProfile.favoriteHistory].forEach(item => {
      const work = getWorkById(item.workId);
      if (work) {
        const currentScore = candidateWorks.get(work.id) || 0;
        candidateWorks.set(work.id, currentScore + similarity);
      }
    });
  });

  // 过滤掉用户已经看过的
  const viewedWorkIds = new Set([
    ...profile.viewHistory.map(h => h.workId),
    ...profile.likeHistory.map(h => h.workId),
    ...profile.favoriteHistory.map(h => h.workId)
  ]);

  // 排序并返回
  const recommendations = Array.from(candidateWorks.entries())
    .filter(([workId]) => !viewedWorkIds.has(workId))
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([workId, score]) => ({
      work: getWorkById(workId),
      score: score,
      reason: '和你兴趣相似的用户也喜欢'
    }));

  return recommendations;
}

/**
 * 内容推荐
 * @param {string} username - 用户名
 * @param {number} count - 推荐数量
 * @returns {Array} 推荐作品列表
 */
function contentBasedRecommend(username, count) {
  const allWorks = getAllWorks();
  const profile = getUserProfile(username);

  // 计算每个作品的匹配度
  const scoredWorks = allWorks.map(work => ({
    work: work,
    score: calculateWorkMatchScore(work, username),
    reason: '基于你的浏览偏好'
  }));

  // 过滤已看过的
  const viewedWorkIds = new Set([
    ...profile.viewHistory.map(h => h.workId),
    ...profile.likeHistory.map(h => h.workId)
  ]);

  // 排序并返回
  return scoredWorks
    .filter(item => !viewedWorkIds.has(item.work.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

/**
 * 热门推荐
 * @param {number} count - 推荐数量
 * @returns {Array} 推荐作品列表
 */
function popularRecommend(count) {
  const allWorks = getAllWorks();

  // 计算热度分数
  const scoredWorks = allWorks.map(work => {
    const heatScore = (work.likes || 0) * 2 +
                     (work.favorites || 0) * 3 +
                     (work.comments || 0) * 1.5 +
                     (work.views || 0) * 0.1;

    return {
      work: work,
      score: heatScore,
      reason: '热门作品'
    };
  });

  // 排序并返回
  return scoredWorks
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

/**
 * 新作品推荐
 * @param {number} count - 推荐数量
 * @returns {Array} 推荐作品列表
 */
function newWorksRecommend(count) {
  const allWorks = getAllWorks();

  // 按时间排序
  return allWorks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, count)
    .map(work => ({
      work: work,
      score: 1,
      reason: '最新上传'
    }));
}

/**
 * 混合推荐（综合多种算法）
 * @param {string} username - 用户名
 * @param {number} count - 推荐数量
 * @returns {Array} 推荐作品列表
 */
function hybridRecommend(username, count = RECOMMENDATION_CONFIG.RECOMMEND_COUNT) {
  const weights = RECOMMENDATION_CONFIG.WEIGHTS;

  // 获取各类推荐
  const collaborative = collaborativeFilteringRecommend(username, count * 2);
  const content = contentBasedRecommend(username, count * 2);
  const popular = popularRecommend(count);
  const newWorks = newWorksRecommend(Math.ceil(count * 0.3));

  // 合并推荐结果
  const allRecommendations = new Map();

  // 添加协同过滤推荐
  collaborative.forEach((item, index) => {
    const normalizedScore = 1 - (index / collaborative.length);
    allRecommendations.set(item.work.id, {
      work: item.work,
      score: normalizedScore * weights.collaborative,
      reasons: [item.reason]
    });
  });

  // 添加内容推荐
  content.forEach((item, index) => {
    const normalizedScore = 1 - (index / content.length);
    const existing = allRecommendations.get(item.work.id);
    if (existing) {
      existing.score += normalizedScore * weights.content;
      existing.reasons.push(item.reason);
    } else {
      allRecommendations.set(item.work.id, {
        work: item.work,
        score: normalizedScore * weights.content,
        reasons: [item.reason]
      });
    }
  });

  // 添加热门推荐
  popular.forEach((item, index) => {
    const normalizedScore = 1 - (index / popular.length);
    const existing = allRecommendations.get(item.work.id);
    if (existing) {
      existing.score += normalizedScore * weights.popular;
      if (!existing.reasons.includes(item.reason)) {
        existing.reasons.push(item.reason);
      }
    } else {
      allRecommendations.set(item.work.id, {
        work: item.work,
        score: normalizedScore * weights.popular,
        reasons: [item.reason]
      });
    }
  });

  // 添加新作品推荐
  newWorks.forEach((item, index) => {
    const existing = allRecommendations.get(item.work.id);
    if (!existing) {
      allRecommendations.set(item.work.id, {
        work: item.work,
        score: weights.new,
        reasons: [item.reason]
      });
    }
  });

  // 排序并返回
  const recommendations = Array.from(allRecommendations.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  // 保证多样性
  return diversifyRecommendations(recommendations);
}

/**
 * 保证推荐结果的多样性
 * @param {Array} recommendations - 推荐列表
 * @returns {Array} 多样化后的推荐列表
 */
function diversifyRecommendations(recommendations) {
  const diversified = [];
  const categoryCount = {};

  recommendations.forEach(item => {
    const category = item.work.category || 'unknown';

    if (!categoryCount[category]) {
      categoryCount[category] = 0;
    }

    // 如果该分类已经有太多作品，降低其优先级
    if (categoryCount[category] < 3) {
      diversified.push(item);
      categoryCount[category]++;
    }
  });

  return diversified;
}

// ============================================
// 第五部分：智能推荐UI
// ============================================

/**
 * 渲染推荐作品卡片
 * @param {Object} recommendation - 推荐对象
 * @returns {string} HTML字符串
 */
function renderRecommendationCard(recommendation) {
  const work = recommendation.work;
  const reason = recommendation.reasons ? recommendation.reasons[0] : '推荐给你';

  return `
    <div class="recommendation-card" data-work-id="${work.id}">
      <div class="recommendation-image">
        <img src="${work.thumbnail || work.imageUrl}" alt="${work.title}" loading="lazy">
        <div class="recommendation-reason">${reason}</div>
      </div>
      <div class="recommendation-info">
        <h4 class="work-title">${work.title}</h4>
        <p class="work-author">👤 ${work.author}</p>
        <div class="work-stats">
          <span>❤️ ${work.likes || 0}</span>
          <span>⭐ ${work.favorites || 0}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染推荐区域
 * @param {string} username - 用户名
 * @returns {string} HTML字符串
 */
function renderRecommendationSection(username) {
  const recommendations = hybridRecommend(username, 6);

  if (recommendations.length === 0) {
    return `
      <div class="recommendation-section">
        <h3>🎯 为你推荐</h3>
        <p class="no-recommendations">浏览更多作品，获取个性化推荐</p>
      </div>
    `;
  }

  return `
    <div class="recommendation-section">
      <div class="section-header">
        <h3>🎯 为你推荐</h3>
        <button class="refresh-btn" onclick="refreshRecommendations()">🔄 换一批</button>
      </div>
      <div class="recommendation-grid">
        ${recommendations.map(rec => renderRecommendationCard(rec)).join('')}
      </div>
    </div>
  `;
}

/**
 * 刷新推荐
 */
function refreshRecommendations() {
  const user = getCurrentUser();
  if (!user) {
    showToast('请先登录', 'warning');
    return;
  }

  const section = document.querySelector('.recommendation-section');
  if (section) {
    section.innerHTML = renderRecommendationSection(user.username);
    showToast('推荐已更新', 'success');
  }
}

/**
 * 获取推荐解释
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @returns {string} 推荐原因
 */
function getRecommendationExplanation(workId, username) {
  const work = getWorkById(workId);
  const profile = getUserProfile(username);

  // 检查标签匹配
  if (work.tags && Array.isArray(work.tags)) {
    const matchedTags = work.tags.filter(tag =>
      profile.tagPreferences[tag] && profile.tagPreferences[tag] > 5
    );

    if (matchedTags.length > 0) {
      return `因为你关注了 ${matchedTags.slice(0, 2).join('、')} 等标签`;
    }
  }

  // 检查分类匹配
  if (work.category && profile.categoryPreferences[work.category] > 10) {
    return `因为你对${work.category}类作品感兴趣`;
  }

  return '基于你的浏览历史推荐';
}

// ============================================
// 第六部分：推荐效果评估
// ============================================

/**
 * 记录推荐点击
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @param {string} recommendationType - 推荐类型
 */
function recordRecommendationClick(workId, username, recommendationType) {
  if (typeof addLog === 'function') {
    addLog('recommendation_click', `用户 ${username} 点击了推荐作品 ${workId}，类型：${recommendationType}`);
  }

  // 更新用户画像
  const work = getWorkById(workId);
  if (work) {
    updateUserProfile(username, 'view', work);
  }
}

/**
 * 获取推荐统计
 * @returns {Object} 推荐统计数据
 */
function getRecommendationStats() {
  const totalUsers = Object.keys(_userProfiles).length;
  const totalRecommendations = Object.values(_userProfiles).reduce((sum, profile) => {
    return sum + profile.viewHistory.length;
  }, 0);

  return {
    totalUsers: totalUsers,
    totalRecommendations: totalRecommendations,
    averageRecommendationsPerUser: totalUsers > 0 ? (totalRecommendations / totalUsers).toFixed(2) : 0
  };
}

// ============================================
// 第七部分：初始化
// ============================================

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('[AI推荐] ai-recommendation.js 已加载');

  // 如果有当前用户，初始化其画像
  const user = getCurrentUser ? getCurrentUser() : null;
  if (user && user.username) {
    initUserProfile(user.username);
  }
});

console.log('[AI推荐] AI智能推荐系统已就绪');

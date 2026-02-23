/**
 * 作品详情页核心逻辑
 * 依赖 config.js、data.js，需优先引入
 */

// 全局作品ID
let currentWorkId = null;

// 页面初始化
function initDetailPage() {
  currentWorkId = getWorkIdFromUrl();
  if (!currentWorkId) {
    alert('作品不存在，即将返回图库页');
    window.location.href = 'gallery.html';
    return;
  }

  renderWorkDetail();
  updateWorkViews(currentWorkId);
  renderRelatedWorks();
  bindDetailEvents();
}

// 1. 从URL获取作品ID
function getWorkIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// 2. 渲染作品详情
function renderWorkDetail() {
  const work = getWorkById(currentWorkId);
  if (!work) return;

  const category = CATEGORIES[work.category.main];
  const isLiked = isWorkLiked(currentWorkId);

  // 填充页面数据
  document.getElementById('work-title').textContent = work.title;
  document.getElementById('work-main-image').src = work.imageUrl;
  document.getElementById('work-main-image').alt = work.title;
  document.getElementById('work-description').textContent = work.description || '暂无作品描述';
  document.getElementById('work-photographer').textContent = work.photographer;
  document.getElementById('work-shoot-date').textContent = work.shootDate;
  document.getElementById('work-location').textContent = work.location;
  document.getElementById('work-views').textContent = work.views;
  document.getElementById('work-likes').textContent = work.likes;
  document.getElementById('work-upload-time').textContent = work.uploadTime;

  // 分类信息
  const categoryElement = document.getElementById('work-category');
  categoryElement.textContent = `${category.icon} ${category.name} / ${category.subCategories.find(sub => sub.id === work.category.sub).name}`;
  categoryElement.style.color = category.themeColor;

  // 标签渲染
  const tagContainer = document.getElementById('work-tags');
  tagContainer.innerHTML = work.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('');

  // 点赞按钮状态
  const likeBtn = document.getElementById('like-btn');
  if (isLiked) {
    likeBtn.classList.add('liked');
    likeBtn.innerHTML = '❤️ 已点赞';
  }
}

// 3. 渲染相关作品推荐（同分类作品）
function renderRelatedWorks() {
  const work = getWorkById(currentWorkId);
  const relatedContainer = document.getElementById('related-works');
  if (!work || !relatedContainer) return;

  // 获取同分类的其他作品
  const allWorks = getAllWorks();
  const relatedWorks = allWorks
    .filter(item => item.category.main === work.category.main && item.id !== Number(currentWorkId))
    .slice(0, 4);

  if (relatedWorks.length === 0) {
    relatedContainer.innerHTML = '<div class="no-related" style="text-align: center; padding: 2rem; color: #7f8c8d;">暂无相关作品推荐</div>';
    return;
  }

  // 渲染相关作品
  let html = '';
  relatedWorks.forEach(item => {
    html += `
      <div class="related-card" onclick="goToWorkDetail(${item.id})"><!-- 修复了这里的语法错误，添加了引号 -->
        <div class="related-img-wrapper">
          <img src="${item.thumbnailUrl}" alt="${item.title}" loading="lazy">
        </div>
        <p class="related-title">${item.title}</p>
      </div>
    `;
  });

  relatedContainer.innerHTML = html;
}

// 4. 绑定事件
function bindDetailEvents() {
  // 点赞按钮点击事件
  document.getElementById('like-btn').addEventListener('click', () => {
    const result = toggleWorkLike(currentWorkId);
    const likeBtn = document.getElementById('like-btn');
    const likesCount = document.getElementById('work-likes');

    if (result.isLiked) {
      likeBtn.classList.add('liked');
      likeBtn.innerHTML = '❤️ 已点赞';
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.innerHTML = '🤍 点赞';
    }

    likesCount.textContent = result.likes;
  });

  // 返回图库按钮事件
  document.getElementById('back-btn').addEventListener('click', () => {
    window.history.back();
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initDetailPage);

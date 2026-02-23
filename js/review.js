/**
 * ============================================================================
 * 交通图库 - 作品审核脚本 (review.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站作品审核页面的核心脚本，提供完整的审核功能：
 * - 作品列表展示和筛选
 * - 批量审核操作
 * - 作品详情查看
 * - 审核统计更新
 * 
 * 【主要功能】
 * 1. 作品加载：从数据库加载作品数据
 * 2. 筛选排序：按状态、分类、关键词筛选
 * 3. 批量操作：支持批量通过/拒绝
 * 4. 详情弹窗：查看作品完整信息
 * 5. 实时统计：更新审核统计数据
 * 
 * 【依赖关系】
 * - config.js: 分类配置
 * - database.js: 数据操作
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v2.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：全局状态和配置
// ============================================

/**
 * 审核页面全局状态
 */
const ReviewState = {
  works: [],           // 所有作品
  filteredWorks: [],   // 筛选后的作品
  selectedIds: [],     // 选中的作品ID
  currentPage: 1,      // 当前页码
  pageSize: 12,        // 每页数量
  currentWork: null,   // 当前查看的作品
  filters: {
    status: 'pending',
    category: 'all',
    search: ''
  }
};

// ============================================
// 第二部分：页面初始化
// ============================================

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
  initCategoryFilter();
  loadWorks();
  bindEventListeners();
  updateStatistics();
});

/**
 * 初始化分类筛选器
 */
function initCategoryFilter() {
  const select = document.getElementById('filter-category');
  if (!select || typeof CATEGORIES === 'undefined') return;
  
  let html = '<option value="all">全部分类</option>';
  for (const key in CATEGORIES) {
    const category = CATEGORIES[key];
    html += `<option value="${key}">${category.icon} ${category.name}</option>`;
  }
  select.innerHTML = html;
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
  // 搜索框回车事件
  const searchInput = document.getElementById('filter-search');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
  }
  
  // 弹窗关闭事件
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  // ESC键关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// ============================================
// 第三部分：数据加载
// ============================================

/**
 * 加载作品数据
 */
function loadWorks() {
  // 从数据库获取作品
  if (typeof getAllWorks === 'function') {
    ReviewState.works = getAllWorks();
  } else {
    // 模拟数据
    ReviewState.works = generateMockWorks();
  }
  
  // 应用筛选
  applyFilters();
}

/**
 * 生成模拟数据（用于测试）
 */
function generateMockWorks() {
  const mockWorks = [];
  const statuses = ['pending', 'approved', 'rejected'];
  const categories = ['railway', 'road', 'aviation', 'water'];
  
  for (let i = 1; i <= 50; i++) {
    mockWorks.push({
      id: i,
      title: `交通摄影作品 ${i}`,
      category: {
        main: categories[Math.floor(Math.random() * categories.length)],
        sub: 'sub_' + Math.floor(Math.random() * 5)
      },
      description: '这是一张精美的交通摄影作品，展示了交通工具的独特魅力。拍摄于黄金时段，光线柔和，构图精美。',
      location: ['北京', '上海', '广州', '深圳', '成都'][Math.floor(Math.random() * 5)],
      shootDate: '2026-02-' + String(Math.floor(Math.random() * 20) + 1).padStart(2, '0'),
      photographer: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
      tags: ['高铁', '日落', '城市'].slice(0, Math.floor(Math.random() * 3) + 1),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      imageUrl: `https://picsum.photos/400/300?random=${i}`,
      uploadTime: '2026-02-21 ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':00',
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100)
    });
  }
  
  return mockWorks;
}

// ============================================
// 第四部分：筛选功能
// ============================================

/**
 * 应用筛选条件
 */
function applyFilters() {
  // 获取筛选条件
  const statusFilter = document.getElementById('filter-status')?.value || 'all';
  const categoryFilter = document.getElementById('filter-category')?.value || 'all';
  const searchFilter = document.getElementById('filter-search')?.value.trim().toLowerCase() || '';
  
  ReviewState.filters = {
    status: statusFilter,
    category: categoryFilter,
    search: searchFilter
  };
  
  // 筛选作品
  ReviewState.filteredWorks = ReviewState.works.filter(work => {
    // 状态筛选
    if (statusFilter !== 'all' && work.status !== statusFilter) {
      return false;
    }
    
    // 分类筛选
    if (categoryFilter !== 'all' && work.category.main !== categoryFilter) {
      return false;
    }
    
    // 关键词搜索
    if (searchFilter) {
      const searchFields = [
        work.title,
        work.photographer,
        work.location,
        work.description
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchFilter)) {
        return false;
      }
    }
    
    return true;
  });
  
  // 重置到第一页
  ReviewState.currentPage = 1;
  
  // 清空选择
  clearSelection();
  
  // 渲染列表
  renderWorks();
  renderPagination();
}

/**
 * 重置筛选条件
 */
function resetFilters() {
  const statusSelect = document.getElementById('filter-status');
  const categorySelect = document.getElementById('filter-category');
  const searchInput = document.getElementById('filter-search');
  
  if (statusSelect) statusSelect.value = 'pending';
  if (categorySelect) categorySelect.value = 'all';
  if (searchInput) searchInput.value = '';
  
  applyFilters();
  showToast('✅ 筛选条件已重置', 'success');
}

// ============================================
// 第五部分：作品列表渲染
// ============================================

/**
 * 渲染作品列表
 */
function renderWorks() {
  const grid = document.getElementById('works-grid');
  const emptyState = document.getElementById('empty-state');
  
  if (!grid) return;
  
  // 获取当前页数据
  const start = (ReviewState.currentPage - 1) * ReviewState.pageSize;
  const end = start + ReviewState.pageSize;
  const pageWorks = ReviewState.filteredWorks.slice(start, end);
  
  // 显示/隐藏空状态
  if (ReviewState.filteredWorks.length === 0) {
    grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';
  
  // 渲染作品卡片
  grid.innerHTML = pageWorks.map(work => {
    const isSelected = ReviewState.selectedIds.includes(work.id);
    const statusText = {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝'
    }[work.status];
    
    const categoryName = CATEGORIES?.[work.category.main]?.name || work.category.main;
    
    return `
      <div class="work-card ${isSelected ? 'selected' : ''}" data-id="${work.id}">
        <div class="card-checkbox ${isSelected ? 'checked' : ''}" onclick="toggleSelect(${work.id})"></div>
        <span class="status-badge ${work.status}">${statusText}</span>
        
        <div class="work-image-wrap">
          <img class="work-image" src="${work.imageUrl}" alt="${work.title}" loading="lazy">
          <div class="image-overlay">
            <button class="view-btn" onclick="viewDetail(${work.id})">查看详情</button>
          </div>
        </div>
        
        <div class="work-content">
          <h4 class="work-title">${work.title}</h4>
          <div class="work-meta">
            <span>👤 ${work.photographer}</span>
            <span>📁 ${categoryName}</span>
            <span>📍 ${work.location}</span>
          </div>
          <div class="work-tags">
            ${work.tags?.map(tag => `<span class="work-tag">${tag}</span>`).join('') || ''}
          </div>
          <div class="work-actions">
            ${work.status === 'pending' ? `
              <button class="action-btn approve" onclick="approveWork(${work.id})">✓ 通过</button>
              <button class="action-btn reject" onclick="rejectWork(${work.id})">✕ 拒绝</button>
            ` : `
              <button class="action-btn" style="grid-column: span 2; background: #f0f0f0; color: #666;" onclick="viewDetail(${work.id})">
                👁 查看详情
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 渲染分页
 */
function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(ReviewState.filteredWorks.length / ReviewState.pageSize);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // 上一页
  html += `
    <button class="page-btn" onclick="goToPage(${ReviewState.currentPage - 1})" 
      ${ReviewState.currentPage === 1 ? 'disabled' : ''}>
      ←
    </button>
  `;
  
  // 页码
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= ReviewState.currentPage - 2 && i <= ReviewState.currentPage + 2)
    ) {
      html += `
        <button class="page-btn ${i === ReviewState.currentPage ? 'active' : ''}" 
          onclick="goToPage(${i})">
          ${i}
        </button>
      `;
    } else if (
      i === ReviewState.currentPage - 3 ||
      i === ReviewState.currentPage + 3
    ) {
      html += `<span class="page-btn" disabled>...</span>`;
    }
  }
  
  // 下一页
  html += `
    <button class="page-btn" onclick="goToPage(${ReviewState.currentPage + 1})" 
      ${ReviewState.currentPage === totalPages ? 'disabled' : ''}>
      →
    </button>
  `;
  
  pagination.innerHTML = html;
}

/**
 * 跳转到指定页
 */
function goToPage(page) {
  const totalPages = Math.ceil(ReviewState.filteredWorks.length / ReviewState.pageSize);
  
  if (page < 1 || page > totalPages) return;
  
  ReviewState.currentPage = page;
  renderWorks();
  renderPagination();
  
  // 滚动到顶部
  document.querySelector('.review-main')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// 第六部分：批量操作
// ============================================

/**
 * 切换作品选择状态
 */
function toggleSelect(workId) {
  const index = ReviewState.selectedIds.indexOf(workId);
  
  if (index === -1) {
    ReviewState.selectedIds.push(workId);
  } else {
    ReviewState.selectedIds.splice(index, 1);
  }
  
  updateBatchBar();
  renderWorks();
}

/**
 * 更新批量操作栏
 */
function updateBatchBar() {
  const batchBar = document.getElementById('batch-bar');
  const selectedCount = document.getElementById('selected-count');
  
  if (!batchBar) return;
  
  const count = ReviewState.selectedIds.length;
  
  if (count > 0) {
    batchBar.classList.add('show');
    if (selectedCount) selectedCount.textContent = count;
  } else {
    batchBar.classList.remove('show');
  }
}

/**
 * 清空选择
 */
function clearSelection() {
  ReviewState.selectedIds = [];
  updateBatchBar();
  renderWorks();
}

/**
 * 批量通过
 */
function batchApprove() {
  if (ReviewState.selectedIds.length === 0) return;
  
  if (!confirm(`确定要通过选中的 ${ReviewState.selectedIds.length} 个作品吗？`)) return;
  
  ReviewState.selectedIds.forEach(id => {
    const work = ReviewState.works.find(w => w.id === id);
    if (work) {
      work.status = 'approved';
      work.reviewTime = new Date().toISOString();
    }
  });
  
  showToast(`✅ 已通过 ${ReviewState.selectedIds.length} 个作品`, 'success');
  clearSelection();
  applyFilters();
  updateStatistics();
}

/**
 * 批量拒绝
 */
function batchReject() {
  if (ReviewState.selectedIds.length === 0) return;
  
  const reason = prompt(`请输入拒绝 ${ReviewState.selectedIds.length} 个作品的原因（可选）：`);
  if (reason === null) return; // 用户取消
  
  ReviewState.selectedIds.forEach(id => {
    const work = ReviewState.works.find(w => w.id === id);
    if (work) {
      work.status = 'rejected';
      work.reviewTime = new Date().toISOString();
      work.rejectReason = reason;
    }
  });
  
  showToast(`❌ 已拒绝 ${ReviewState.selectedIds.length} 个作品`, 'success');
  clearSelection();
  applyFilters();
  updateStatistics();
}

// ============================================
// 第七部分：单个作品操作
// ============================================

/**
 * 通过作品
 */
function approveWork(workId) {
  const work = ReviewState.works.find(w => w.id === workId);
  if (!work) return;
  
  work.status = 'approved';
  work.reviewTime = new Date().toISOString();
  
  showToast('✅ 作品已通过', 'success');
  renderWorks();
  updateStatistics();
}

/**
 * 拒绝作品
 */
function rejectWork(workId) {
  const work = ReviewState.works.find(w => w.id === workId);
  if (!work) return;
  
  const reason = prompt('请输入拒绝原因（可选）：');
  if (reason === null) return;
  
  work.status = 'rejected';
  work.reviewTime = new Date().toISOString();
  work.rejectReason = reason;
  
  showToast('❌ 作品已拒绝', 'success');
  renderWorks();
  updateStatistics();
}

// ============================================
// 第八部分：详情弹窗
// ============================================

/**
 * 查看作品详情
 */
function viewDetail(workId) {
  const work = ReviewState.works.find(w => w.id === workId);
  if (!work) return;
  
  ReviewState.currentWork = work;
  
  // 填充弹窗数据
  document.getElementById('modal-image').src = work.imageUrl;
  document.getElementById('modal-title').textContent = work.title;
  document.getElementById('modal-photographer').textContent = work.photographer;
  document.getElementById('modal-category').textContent = 
    CATEGORIES?.[work.category.main]?.name || work.category.main;
  document.getElementById('modal-location').textContent = work.location || '未知';
  document.getElementById('modal-time').textContent = work.uploadTime;
  document.getElementById('modal-description').textContent = work.description || '暂无描述';
  
  // 标签
  const tagsContainer = document.getElementById('modal-tags');
  tagsContainer.innerHTML = work.tags?.map(tag => 
    `<span class="modal-tag">${tag}</span>`
  ).join('') || '<span style="color: #999;">无标签</span>';
  
  // 根据状态显示/隐藏操作按钮
  const actionsContainer = document.getElementById('modal-actions');
  const rejectBox = document.getElementById('reject-reason-box');
  
  if (work.status === 'pending') {
    actionsContainer.style.display = 'grid';
    rejectBox.style.display = 'none';
    document.getElementById('reject-reason').value = '';
  } else {
    actionsContainer.style.display = 'none';
    rejectBox.style.display = 'none';
  }
  
  // 显示弹窗
  document.getElementById('detail-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * 关闭弹窗
 */
function closeModal() {
  document.getElementById('detail-modal').classList.remove('show');
  document.body.style.overflow = '';
  ReviewState.currentWork = null;
}

/**
 * 弹窗中通过
 */
function modalApprove() {
  if (!ReviewState.currentWork) return;
  
  approveWork(ReviewState.currentWork.id);
  closeModal();
}

/**
 * 弹窗中拒绝
 */
function modalReject() {
  if (!ReviewState.currentWork) return;
  
  const reason = document.getElementById('reject-reason').value;
  
  const work = ReviewState.currentWork;
  work.status = 'rejected';
  work.reviewTime = new Date().toISOString();
  work.rejectReason = reason;
  
  showToast('❌ 作品已拒绝', 'success');
  renderWorks();
  updateStatistics();
  closeModal();
}

// ============================================
// 第九部分：统计更新
// ============================================

/**
 * 更新统计数据
 */
function updateStatistics() {
  const stats = {
    pending: ReviewState.works.filter(w => w.status === 'pending').length,
    approved: ReviewState.works.filter(w => w.status === 'approved').length,
    rejected: ReviewState.works.filter(w => w.status === 'rejected').length,
    total: ReviewState.works.length
  };
  
  document.getElementById('stat-pending').textContent = stats.pending;
  document.getElementById('stat-approved').textContent = stats.approved;
  document.getElementById('stat-rejected').textContent = stats.rejected;
  document.getElementById('stat-total').textContent = stats.total;
}

// ============================================
// 第十部分：Toast 提示
// ============================================

/**
 * 显示 Toast 提示
 */
function showToast(message, type = 'info') {
  // 如果页面已有 showToast 函数，使用它
  if (typeof window.showToast === 'function' && window.showToast !== showToast) {
    window.showToast(message, type);
    return;
  }
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  };
  toast.style.background = colors[type] || colors.info;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

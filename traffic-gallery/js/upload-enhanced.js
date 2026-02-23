/**
 * ============================================================================
 * 交通图库 - 增强版作品上传脚本 (upload-enhanced.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站增强版作品上传功能的核心脚本，采用现代化设计：
 * - 支持拖拽上传和批量上传
 * - 实时图片预览和管理
 * - 智能标签输入系统
 * - 表单草稿自动保存
 * - 上传进度实时显示
 * 
 * 【主要功能】
 * 1. 拖拽上传：支持拖拽文件到上传区域
 * 2. 批量管理：多图片预览、删除、排序
 * 3. 标签系统：智能标签输入，支持推荐标签
 * 4. 表单验证：完整的字段验证机制
 * 5. 草稿保存：自动保存未提交的表单数据
 * 6. 进度显示：模拟上传进度动画
 * 
 * 【依赖关系】
 * - config.js: 全局配置和分类数据
 * - database.js: 数据存储操作
 * - main.js: 通用功能函数
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
 * 上传页面全局状态对象
 * 【状态说明】
 * - selectedFiles: 用户选择的文件列表
 * - previewUrls: 图片预览URL列表
 * - tags: 当前输入的标签列表
 * - isUploading: 是否正在上传中
 * - draftSaved: 草稿是否已保存
 */
const UploadState = {
  selectedFiles: [],
  previewUrls: [],
  tags: [],
  isUploading: false,
  draftSaved: false,
  maxFiles: 20,
  maxFileSize: 10 * 1024 * 1024 // 10MB
};

// ============================================
// 第二部分：页面初始化
// ============================================

/**
 * 页面加载完成后初始化
 * 【初始化流程】
 * 1. 初始化拖拽上传区域
 * 2. 初始化分类选择器
 * 3. 初始化标签输入
 * 4. 加载草稿数据
 * 5. 绑定事件监听器
 */
document.addEventListener('DOMContentLoaded', function() {
  initDropZone();
  initCategorySelects();
  initTagInput();
  loadDraft();
  bindEventListeners();
  updateStepIndicator(1);
});

// ============================================
// 第三部分：拖拽上传功能
// ============================================

/**
 * 初始化拖拽上传区域
 * 【功能说明】
 * - 绑定拖拽事件（dragenter, dragover, dragleave, drop）
 * - 绑定点击选择文件事件
 * - 添加视觉反馈效果
 */
function initDropZone() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  
  if (!dropArea || !fileInput) return;
  
  // 点击选择文件
  dropArea.addEventListener('click', () => fileInput.click());
  
  // 文件选择变化
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; // 清空以便重复选择相同文件
  });
  
  // 拖拽事件
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // 拖拽进入
  dropArea.addEventListener('dragenter', () => {
    dropArea.classList.add('dragover');
  });
  
  // 拖拽离开
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });
  
  // 放置文件
  dropArea.addEventListener('drop', (e) => {
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
  });
}

/**
 * 处理选择的文件
 * @param {FileList} files - 选择的文件列表
 * 
 * 【处理流程】
 * 1. 验证文件数量和大小
 * 2. 验证文件类型
 * 3. 生成预览URL
 * 4. 更新预览网格
 */
function handleFiles(files) {
  const validFiles = [];
  
  Array.from(files).forEach(file => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showToast(`❌ ${file.name} 不是图片文件`, 'error');
      return;
    }
    
    // 验证文件大小
    if (file.size > UploadState.maxFileSize) {
      showToast(`❌ ${file.name} 超过10MB限制`, 'error');
      return;
    }
    
    // 验证总数量
    if (UploadState.selectedFiles.length + validFiles.length >= UploadState.maxFiles) {
      showToast(`⚠️ 最多只能上传 ${UploadState.maxFiles} 张图片`, 'warning');
      return;
    }
    
    validFiles.push(file);
  });
  
  // 添加到状态
  validFiles.forEach(file => {
    UploadState.selectedFiles.push(file);
    const url = URL.createObjectURL(file);
    UploadState.previewUrls.push(url);
  });
  
  // 更新UI
  updatePreviewGrid();
  updateStepIndicator(UploadState.selectedFiles.length > 0 ? 2 : 1);
  
  if (validFiles.length > 0) {
    showToast(`✅ 成功添加 ${validFiles.length} 张图片`, 'success');
  }
}

// ============================================
// 第四部分：图片预览和管理
// ============================================

/**
 * 更新图片预览网格
 * 【功能说明】
 * - 显示/隐藏预览区域
 * - 渲染预览图片
 * - 更新选择计数
 */
function updatePreviewGrid() {
  const previewSection = document.getElementById('preview-section');
  const emptyState = document.getElementById('empty-state');
  const previewGrid = document.getElementById('preview-grid');
  const selectedCount = document.getElementById('selected-count');
  
  if (!previewSection || !emptyState || !previewGrid) return;
  
  const count = UploadState.selectedFiles.length;
  
  if (count === 0) {
    previewSection.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    previewSection.style.display = 'block';
    emptyState.style.display = 'none';
    selectedCount.textContent = count;
    
    // 渲染预览
    previewGrid.innerHTML = UploadState.previewUrls.map((url, index) => `
      <div class="preview-item" data-index="${index}">
        <img src="${url}" alt="预览 ${index + 1}">
        <span class="preview-index">${index + 1}</span>
        <div class="preview-overlay">
          <div class="preview-actions">
            <button type="button" class="preview-btn edit" onclick="moveImage(${index}, -1)" title="前移">←</button>
            <button type="button" class="preview-btn edit" onclick="moveImage(${index}, 1)" title="后移">→</button>
            <button type="button" class="preview-btn delete" onclick="removeImage(${index})" title="删除">×</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

/**
 * 删除指定图片
 * @param {number} index - 图片索引
 */
function removeImage(index) {
  if (index < 0 || index >= UploadState.selectedFiles.length) return;
  
  // 释放URL
  URL.revokeObjectURL(UploadState.previewUrls[index]);
  
  // 从数组中移除
  UploadState.selectedFiles.splice(index, 1);
  UploadState.previewUrls.splice(index, 1);
  
  // 更新UI
  updatePreviewGrid();
  updateStepIndicator(UploadState.selectedFiles.length > 0 ? 2 : 1);
  
  showToast('✅ 已删除图片', 'success');
}

/**
 * 移动图片位置
 * @param {number} index - 当前索引
 * @param {number} direction - 移动方向（-1前移，1后移）
 */
function moveImage(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= UploadState.selectedFiles.length) return;
  
  // 交换位置
  [UploadState.selectedFiles[index], UploadState.selectedFiles[newIndex]] = 
  [UploadState.selectedFiles[newIndex], UploadState.selectedFiles[index]];
  
  [UploadState.previewUrls[index], UploadState.previewUrls[newIndex]] = 
  [UploadState.previewUrls[newIndex], UploadState.previewUrls[index]];
  
  updatePreviewGrid();
}

/**
 * 清空所有图片
 */
function clearAllImages() {
  if (UploadState.selectedFiles.length === 0) return;
  
  if (!confirm('确定要清空所有已选择的图片吗？')) return;
  
  // 释放所有URL
  UploadState.previewUrls.forEach(url => URL.revokeObjectURL(url));
  
  // 清空数组
  UploadState.selectedFiles = [];
  UploadState.previewUrls = [];
  
  updatePreviewGrid();
  updateStepIndicator(1);
  
  showToast('✅ 已清空所有图片', 'success');
}

// ============================================
// 第五部分：分类选择
// ============================================

/**
 * 初始化分类选择器
 * 【功能说明】
 * - 渲染主分类选项
 * - 绑定主分类变化事件
 * - 级联更新子分类
 */
function initCategorySelects() {
  const mainSelect = document.getElementById('main-category');
  const subSelect = document.getElementById('sub-category');
  
  if (!mainSelect || !subSelect) return;
  
  // 渲染主分类
  if (typeof CATEGORIES !== 'undefined') {
    let html = '<option value="">选择主分类</option>';
    for (const key in CATEGORIES) {
      const category = CATEGORIES[key];
      html += `<option value="${key}">${category.icon} ${category.name}</option>`;
    }
    mainSelect.innerHTML = html;
  }
  
  // 主分类变化
  mainSelect.addEventListener('change', () => {
    const selectedKey = mainSelect.value;
    
    if (!selectedKey || !CATEGORIES[selectedKey]) {
      subSelect.innerHTML = '<option value="">选择子分类</option>';
      subSelect.disabled = true;
      return;
    }
    
    // 渲染子分类
    const subCategories = CATEGORIES[selectedKey].subCategories;
    let html = '<option value="">选择子分类</option>';
    subCategories.forEach(sub => {
      html += `<option value="${sub.id}">${sub.name}</option>`;
    });
    subSelect.innerHTML = html;
    subSelect.disabled = false;
    
    // 更新推荐标签
    updateSuggestedTags(selectedKey);
  });
}

/**
 * 根据分类更新推荐标签
 * @param {string} categoryKey - 分类键名
 */
function updateSuggestedTags(categoryKey) {
  const container = document.getElementById('suggested-tags');
  if (!container) return;
  
  const tagMap = {
    'railway': ['高铁', '动车', '火车', '地铁', '轻轨', '轨道', '站台'],
    'road': ['汽车', '公交', '卡车', '高速公路', '城市道路', '桥梁'],
    'aviation': ['飞机', '机场', '航站楼', '起飞', '降落', '航空'],
    'water': ['轮船', '游轮', '港口', '码头', '海运', '江景'],
    'other': ['交通', '运输', '出行', '旅行', '风景']
  };
  
  const tags = tagMap[categoryKey] || tagMap['other'];
  container.innerHTML = tags.map(tag => 
    `<button type="button" class="suggested-tag" onclick="addTag('${tag}')">${tag}</button>`
  ).join('');
}

// ============================================
// 第六部分：标签输入系统
// ============================================

/**
 * 初始化标签输入
 * 【功能说明】
 * - 绑定回车添加标签
 * - 绑定粘贴事件
 * - 支持逗号分隔
 */
function initTagInput() {
  const input = document.getElementById('tag-input');
  if (!input) return;
  
  // 回车添加标签
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
        addTag(value);
        input.value = '';
      }
    }
    
    // 退格删除最后一个标签
    if (e.key === 'Backspace' && input.value === '' && UploadState.tags.length > 0) {
      removeTag(UploadState.tags.length - 1);
    }
  });
  
  // 粘贴处理
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const tags = pasted.split(/[,，\s]+/).filter(t => t.trim());
    tags.forEach(tag => addTag(tag.trim()));
  });
}

/**
 * 添加标签
 * @param {string} tag - 标签内容
 */
function addTag(tag) {
  tag = tag.trim();
  if (!tag) return;
  
  // 验证长度
  if (tag.length > 20) {
    showToast('⚠️ 标签长度不能超过20个字符', 'warning');
    return;
  }
  
  // 验证数量
  if (UploadState.tags.length >= 10) {
    showToast('⚠️ 最多只能添加10个标签', 'warning');
    return;
  }
  
  // 验证重复
  if (UploadState.tags.includes(tag)) {
    showToast('⚠️ 标签已存在', 'warning');
    return;
  }
  
  UploadState.tags.push(tag);
  renderTags();
}

/**
 * 删除标签
 * @param {number} index - 标签索引
 */
function removeTag(index) {
  UploadState.tags.splice(index, 1);
  renderTags();
}

/**
 * 渲染标签列表
 */
function renderTags() {
  const container = document.getElementById('tag-container');
  if (!container) return;
  
  const input = container.querySelector('.tag-input');
  
  // 保留输入框，移除所有标签
  container.innerHTML = '';
  
  // 添加标签
  UploadState.tags.forEach((tag, index) => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag-item';
    tagEl.innerHTML = `
      ${tag}
      <span class="tag-remove" onclick="removeTag(${index})">×</span>
    `;
    container.appendChild(tagEl);
  });
  
  // 添加输入框
  container.appendChild(input);
  input.focus();
}

// ============================================
// 第七部分：草稿保存
// ============================================

/**
 * 保存草稿
 * 【功能说明】
 * - 收集表单数据
 * - 保存到 localStorage
 * - 显示保存成功提示
 */
function saveDraft() {
  const draft = {
    title: document.getElementById('work-title')?.value || '',
    mainCategory: document.getElementById('main-category')?.value || '',
    subCategory: document.getElementById('sub-category')?.value || '',
    description: document.getElementById('work-description')?.value || '',
    location: document.getElementById('shoot-location')?.value || '',
    date: document.getElementById('shoot-date')?.value || '',
    device: document.getElementById('shoot-device')?.value || '',
    tags: UploadState.tags,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem('upload_draft', JSON.stringify(draft));
  UploadState.draftSaved = true;
  
  showToast('✅ 草稿已保存', 'success');
}

/**
 * 加载草稿
 * 【功能说明】
 * - 从 localStorage 读取草稿
 * - 恢复表单数据
 * - 恢复标签
 */
function loadDraft() {
  const draftStr = localStorage.getItem('upload_draft');
  if (!draftStr) return;
  
  try {
    const draft = JSON.parse(draftStr);
    
    // 恢复表单
    const titleEl = document.getElementById('work-title');
    if (titleEl) titleEl.value = draft.title || '';
    
    const mainCatEl = document.getElementById('main-category');
    if (mainCatEl && draft.mainCategory) {
      mainCatEl.value = draft.mainCategory;
      mainCatEl.dispatchEvent(new Event('change'));
    }
    
    setTimeout(() => {
      const subCatEl = document.getElementById('sub-category');
      if (subCatEl && draft.subCategory) {
        subCatEl.value = draft.subCategory;
      }
    }, 100);
    
    const descEl = document.getElementById('work-description');
    if (descEl) descEl.value = draft.description || '';
    
    const locEl = document.getElementById('shoot-location');
    if (locEl) locEl.value = draft.location || '';
    
    const dateEl = document.getElementById('shoot-date');
    if (dateEl) dateEl.value = draft.date || '';
    
    const deviceEl = document.getElementById('shoot-device');
    if (deviceEl) deviceEl.value = draft.device || '';
    
    // 恢复标签
    if (draft.tags && draft.tags.length > 0) {
      UploadState.tags = draft.tags;
      renderTags();
    }
    
    console.log('[上传] 草稿已恢复');
  } catch (e) {
    console.error('[上传] 加载草稿失败:', e);
  }
}

/**
 * 清除草稿
 */
function clearDraft() {
  localStorage.removeItem('upload_draft');
  UploadState.draftSaved = false;
}

// ============================================
// 第八部分：表单提交
// ============================================

/**
 * 提交作品
 * 【功能说明】
 * 1. 验证表单数据
 * 2. 验证图片选择
 * 3. 显示上传进度
 * 4. 保存作品数据
 * 5. 清除草稿
 * 6. 跳转页面
 */
function submitWorks() {
  // 验证图片
  if (UploadState.selectedFiles.length === 0) {
    showToast('❌ 请至少选择一张图片', 'error');
    updateStepIndicator(1);
    return;
  }
  
  // 获取表单数据
  const title = document.getElementById('work-title')?.value.trim();
  const mainCategory = document.getElementById('main-category')?.value;
  const subCategory = document.getElementById('sub-category')?.value;
  const description = document.getElementById('work-description')?.value.trim();
  const location = document.getElementById('shoot-location')?.value.trim();
  const date = document.getElementById('shoot-date')?.value;
  const device = document.getElementById('shoot-device')?.value.trim();
  
  // 验证必填项
  if (!title) {
    showToast('❌ 请填写作品标题', 'error');
    document.getElementById('work-title')?.focus();
    return;
  }
  
  if (!mainCategory) {
    showToast('❌ 请选择作品主分类', 'error');
    return;
  }
  
  if (!subCategory) {
    showToast('❌ 请选择作品子分类', 'error');
    return;
  }
  
  // 开始上传
  UploadState.isUploading = true;
  updateStepIndicator(3);
  showProgress();
  
  // 模拟上传进度
  let progress = 0;
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const progressPercent = document.getElementById('progress-percent');
  
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
    
    if (progress < 30) {
      if (progressText) progressText.textContent = '正在处理图片...';
    } else if (progress < 60) {
      if (progressText) progressText.textContent = '正在保存数据...';
    } else if (progress < 90) {
      if (progressText) progressText.textContent = '正在提交审核...';
    } else {
      if (progressText) progressText.textContent = '即将完成...';
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      completeUpload({
        title,
        mainCategory,
        subCategory,
        description,
        location,
        date,
        device,
        tags: UploadState.tags
      });
    }
  }, 200);
}

/**
 * 完成上传
 * @param {Object} formData - 表单数据
 */
function completeUpload(formData) {
  // 获取当前用户
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const photographer = currentUser ? currentUser.username : '匿名用户';
  
  // 创建作品数据
  const works = UploadState.selectedFiles.map((file, index) => ({
    id: Date.now() + index,
    title: UploadState.selectedFiles.length === 1 ? formData.title : `${formData.title} (${index + 1})`,
    category: {
      main: formData.mainCategory,
      sub: formData.subCategory
    },
    description: formData.description,
    location: formData.location || '未知地点',
    shootDate: formData.date || new Date().toISOString().split('T')[0],
    device: formData.device || '',
    tags: UploadState.tags,
    photographer: photographer,
    views: 0,
    likes: 0,
    imageUrl: UploadState.previewUrls[index],
    thumbnailUrl: UploadState.previewUrls[index],
    uploadTime: new Date().toLocaleString(),
    status: 'pending' // 待审核状态
  }));
  
  // 保存到数据库
  works.forEach(work => {
    if (typeof addNewWork === 'function') {
      addNewWork(work);
    }
  });
  
  // 清除草稿
  clearDraft();
  
  // 延迟跳转
  setTimeout(() => {
    hideProgress();
    showToast(`✅ 成功上传 ${works.length} 个作品，等待审核`, 'success');
    
    setTimeout(() => {
      window.location.href = 'gallery.html';
    }, 1500);
  }, 500);
}

// ============================================
// 第九部分：进度显示
// ============================================

/**
 * 显示上传进度
 */
function showProgress() {
  const progress = document.getElementById('upload-progress');
  if (progress) {
    progress.classList.add('show');
  }
}

/**
 * 隐藏上传进度
 */
function hideProgress() {
  const progress = document.getElementById('upload-progress');
  if (progress) {
    progress.classList.remove('show');
  }
  UploadState.isUploading = false;
}

// ============================================
// 第十部分：步骤指示器
// ============================================

/**
 * 更新步骤指示器
 * @param {number} step - 当前步骤（1-3）
 */
function updateStepIndicator(step) {
  const steps = document.querySelectorAll('.step-item');
  steps.forEach((item, index) => {
    const itemStep = parseInt(item.dataset.step);
    item.classList.remove('active', 'completed');
    
    if (itemStep === step) {
      item.classList.add('active');
    } else if (itemStep < step) {
      item.classList.add('completed');
    }
  });
}

// ============================================
// 第十一部分：事件绑定
// ============================================

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
  // 自动保存草稿（输入后3秒）
  let saveTimeout;
  const autoSaveFields = ['work-title', 'work-description', 'shoot-location', 'shoot-device'];
  autoSaveFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveDraft, 3000);
      });
    }
  });
  
  // 日期选择器默认今天
  const dateEl = document.getElementById('shoot-date');
  if (dateEl && !dateEl.value) {
    dateEl.value = new Date().toISOString().split('T')[0];
  }
}

// ============================================
// 第十二部分：Toast 提示
// ============================================

/**
 * 显示 Toast 提示
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型（success/error/warning/info）
 */
function showToast(message, type = 'info') {
  // 如果页面已有 showToast 函数，使用它
  if (typeof window.showToast === 'function' && window.showToast !== showToast) {
    window.showToast(message, type);
    return;
  }
  
  // 创建 toast 元素
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
  
  // 根据类型设置颜色
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  };
  toast.style.background = colors[type] || colors.info;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // 显示动画
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  
  // 自动隐藏
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

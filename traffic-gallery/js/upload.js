/**
 * 作品上传页核心逻辑
 * 依赖 config.js、data.js，需优先引入
 */

// 页面初始化
function initUploadPage() {
  renderMainCategorySelect();
  bindUploadEvents();
}

// 1. 渲染主分类下拉框
function renderMainCategorySelect() {
  const mainSelect = document.getElementById('main-category-select');
  if (!mainSelect) return;

  let html = `<option value="">请选择作品主分类</option>`;
  for (const key in CATEGORIES) {
    const category = CATEGORIES[key];
    html += `<option value="${category.id}">${category.icon} ${category.name}</option>`;
  }

  mainSelect.innerHTML = html;
}

// 2. 主分类变化时，更新子分类下拉框
function updateSubCategorySelect() {
  const mainSelect = document.getElementById('main-category-select');
  const subSelect = document.getElementById('sub-category-select');
  const selectedMain = mainSelect.value;

  let html = `<option value="">请选择作品子分类</option>`;

  // 未选择主分类时，禁用子分类
  if (!selectedMain || !CATEGORIES[selectedMain]) {
    subSelect.innerHTML = html;
    subSelect.disabled = true;
    return;
  }

  // 渲染对应子分类
  const subCategories = CATEGORIES[selectedMain].subCategories;
  subCategories.forEach(sub => {
    html += `<option value="${sub.id}">${sub.name}</option>`;
  });

  subSelect.innerHTML = html;
  subSelect.disabled = false;
}

// 3. 图片上传预览
function handleImageUpload(event) {
  const file = event.target.files[0];
  const previewImg = document.getElementById('upload-preview');
  const previewContainer = document.getElementById('preview-container');
  if (!file || !previewImg || !previewContainer) return;

  // 验证文件类型
  if (!GLOBAL_CONST.ALLOW_IMAGE_TYPE.includes(file.type)) {
    alert('仅支持上传 JPG、PNG、WebP 格式的图片');
    event.target.value = '';
    return;
  }

  // 验证文件大小
  if (file.size > GLOBAL_CONST.MAX_IMAGE_SIZE) {
    alert('图片大小不能超过 5MB');
    event.target.value = '';
    return;
  }

  // 读取文件并预览
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewContainer.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// 4. 表单验证
function validateForm(formData) {
  const { title, mainCategory, subCategory, imageSrc } = formData;

  if (!title.trim()) {
    alert('请填写作品标题');
    return false;
  }
  if (!mainCategory) {
    alert('请选择作品主分类');
    return false;
  }
  if (!subCategory) {
    alert('请选择作品子分类');
    return false;
  }
  if (!imageSrc) {
    alert('请上传作品图片');
    return false;
  }

  return true;
}

// 5. 提交作品
function submitWork(event) {
  event.preventDefault();

  // 获取表单数据
  const formData = {
    title: document.getElementById('work-title').value,
    mainCategory: document.getElementById('main-category-select').value,
    subCategory: document.getElementById('sub-category-select').value,
    description: document.getElementById('work-description').value,
    location: document.getElementById('work-location').value,
    shootDate: document.getElementById('work-shoot-date').value,
    photographer: document.getElementById('work-photographer').value || '匿名用户',
    tags: document.getElementById('work-tags').value,
    imageSrc: document.getElementById('upload-preview').src
  };

  // 表单验证
  if (!validateForm(formData)) return;

  // 处理标签
  const tags = formData.tags
    ? formData.tags.split(/[,，\s]+/).filter(tag => tag.trim())
    : [];

  // 构建作品数据
  const newWork = {
    id: Date.now(), // 用时间戳作为唯一ID
    title: formData.title,
    category: {
      main: formData.mainCategory,
      sub: formData.subCategory
    },
    description: formData.description,
    tags: tags,
    location: formData.location || '未知地点',
    shootDate: formData.shootDate || new Date().toISOString().split('T')[0],
    photographer: formData.photographer,
    views: 0,
    likes: 0,
    imageUrl: formData.imageSrc,
    thumbnailUrl: formData.imageSrc,
    uploadTime: new Date().toLocaleString()
  };

  // 保存作品
  addNewWork(newWork);

  // 提交成功提示与跳转
  alert('作品上传成功！即将跳转到图库页');
  window.location.href = 'gallery.html';
}

// 6. 绑定所有事件
function bindUploadEvents() {
  // 主分类变化事件
  document.getElementById('main-category-select').addEventListener('change', updateSubCategorySelect);

  // 图片上传事件
  document.getElementById('image-upload').addEventListener('change', handleImageUpload);

  // 表单提交事件
  document.getElementById('upload-form').addEventListener('submit', submitWork);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initUploadPage);

(() => {
  'use strict';
  const gallery = document.getElementById('visual-gallery');
  const asset = name => `assets/visual-projects/${name}.webp`;
  const projects = [
    {
      id: 'meitu-effects', label: 'AIGC EFFECT DESIGN', title: 'Meitu · AIGC Effects.',
      zh: '美图秀秀 AIGC 效果设计', cover: 'meitu-effects',
      alt: '美图秀秀 PS2 游戏风格效果，两组用户原图与生成效果对比',
      summary: '以 PS2 与龙珠风格为例，完成训练数据准备、LoRA 训练与 ComfyUI 验证，将风格探索转化为端内玩法。',
      tags: ['数据准备', 'LoRA 训练', '工作流调试', '稳定性验证'],
      focus: '把风格，变成可以使用的效果。',
      note: '从人物特征与画面风格的对应关系出发，精修数据、迭代训练，再以批量测试检验不同照片中的效果稳定性。',
      evidence: [['60', '组精修数据对 · PS2 案例'], ['50', '张批跑测试 · 稳定性验证']],
      steps: [['Prepare', '精修原图与效果图，建立对应的数据对。'], ['Train', '训练 LoRA，比较不同阶段的风格与还原度。'], ['Validate', '在 ComfyUI 调试参数，批跑验证稳定性。'], ['Deliver', '结合审核反馈，完成端内效果落地。']],
      images: [
        ['meitu-testing', 'PS2 · ComfyUI 测试与批跑验证'],
        ['meitu-dragonball', '龙珠风格 · 项目目标与效果对比'],
        ['meitu-data', '龙珠风格 · 训练数据准备'],
        ['meitu-workflow', '龙珠风格 · 工作流与效果验证']
      ]
    },
    {
      id: 'miaocuihua', label: 'BRAND IDENTITY', title: 'Miaocuihua · Brand Identity.',
      zh: '苗翠花 · 品牌视觉与传播', cover: 'miaocuihua-system',
      alt: '苗翠花品牌视觉系统，包含标志、民族纹样、菜单与宣发海报',
      summary: '从苗寨山野与民族纹样提炼视觉线索，建立字体、色彩与辅助图形，并延展至菜单、包装、海报与门店应用。',
      tags: ['文化提炼', '视觉识别', '宣传物料', '门店应用'],
      focus: '从山野文化，到可识别的品牌语言。',
      note: '以自然、山石与质朴的手绘感建立品牌气质，让标志、纹样和应用物料共享同一套视觉识别。',
      steps: [['Discover', '提炼苗寨山野、饮食与民族文化线索。'], ['Define', '建立标志字体、品牌色彩与辅助纹样。'], ['Extend', '延展菜单、海报、包装等品牌物料。'], ['Apply', '将视觉系统应用于门头与空间场景。']],
      images: [
        ['miaocuihua-identity', '品牌识别 · 标志与整体气质'],
        ['miaocuihua-culture', '文化提炼 · 山野与食材的视觉线索'],
        ['miaocuihua-menu', '品牌应用 · 菜单与纸品'],
        ['miaocuihua-space', '场景应用 · 门头与空间视觉']
      ]
    },
    {
      id: 'coco', label: 'CAMPAIGN DESIGN', title: 'CoCo · Summer Campaign.',
      zh: 'CoCo 都可 ·「来都可！有惊喜」夏日活动视觉', cover: 'coco-cover',
      alt: 'CoCo 都可夏日活动 H5，包含饮品集卡、活动说明、奖励与签到页面',
      summary: '以 AIGC 构建夏日饮品主视觉，延展活动字体、图标、宣发海报、H5 集卡页面及开屏弹窗，形成统一的活动体验。',
      tags: ['活动主视觉', 'AIGC 运营设计', 'H5 视觉', '多触点适配'],
      focus: '从一杯夏日饮品，延展一场活动体验。',
      note: '围绕「来都可！有惊喜」建立明亮的夏日视觉，以集卡与奖励串联参与路径，让主视觉贯穿宣发与活动页面。',
      steps: [['Concept', '提炼夏日主题与活动参与路径。'], ['Create', '制作 AIGC 素材，精修字体与画面。'], ['Build', '形成饮品卡片、图标与 H5 页面。'], ['Adapt', '适配开屏、Banner 与活动弹窗。']],
      images: [
        ['coco-process', '创意制作 · AIGC 素材与主视觉构成'],
        ['coco-type', '视觉组件 · 活动字体与六款饮品卡片'],
        ['coco-h5', '参与体验 · H5 集卡与活动页面'],
        ['coco-touchpoints', '多触点应用 · 页面与弹窗']
      ]
    }
  ];
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  projects.forEach((project, index) => {
    const article = document.createElement('article');
    article.className = 'visual-case';
    article.id = `visual-${project.id}`;
    article.setAttribute('aria-labelledby', `${article.id}-title`);
    article.innerHTML = `
      <div class="visual-case-overview">
        <button type="button" class="visual-cover visual-image-button" data-image="${asset(project.cover)}" data-caption="${escape(project.alt)}" aria-label="放大查看${escape(project.zh)}作品图"><img src="${asset(project.cover)}" alt="${escape(project.alt)}" loading="lazy" decoding="async"><span class="visual-image-hint">VIEW IMAGE / 点击放大 ↗</span></button>
        <div class="visual-case-copy"><span class="eyebrow">${String(index + 1).padStart(2, '0')} / ${project.label}</span><h3 id="${article.id}-title">${project.title}</h3><p class="visual-case-zh">${project.zh}</p><p class="visual-case-summary">${project.summary}</p><ul class="visual-tags" aria-label="项目能力">${project.tags.map(tag => `<li>${tag}</li>`).join('')}</ul><a href="#${article.id}-notes" class="visual-notes-link">PROJECT NOTES <span>项目说明与过程 ↓</span></a></div>
      </div>
      <details id="${article.id}-notes" class="film-notes visual-notes"><summary><span>Project Notes <small>项目说明 · 点击展开</small></span><span class="film-notes-toggle" aria-hidden="true"></span></summary>
        <div class="visual-case-detail"><div class="visual-detail-intro"><h4>${project.focus}</h4><p>${project.note}</p></div>
        ${project.evidence ? `<div class="visual-evidence">${project.evidence.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>` : ''}
        <ol class="visual-process">${project.steps.map(([title, copy], i) => `<li><span>${String(i + 1).padStart(2, '0')} / ${title.toUpperCase()}</span><p>${copy}</p></li>`).join('')}</ol>
        <div class="visual-process-gallery">${project.images.map(([name, caption]) => `<figure><button type="button" class="visual-image-button" data-image="${asset(name)}" data-caption="${escape(caption)}" aria-label="放大查看${escape(caption)}"><img data-visual-src="${asset(name + '--preview')}" alt="${escape(caption)}" loading="lazy" decoding="async"><span class="visual-image-hint">点击放大 ↗</span></button><figcaption>${caption}</figcaption></figure>`).join('')}</div>
        </div>
      </details>`;
    const notes = article.querySelector('details');
    notes.addEventListener('toggle', () => {
      notes.querySelector('summary small').textContent = notes.open ? '项目说明 · 点击收起' : '项目说明 · 点击展开';
      if (notes.open) notes.querySelectorAll('[data-visual-src]').forEach(img => { if (!img.src) img.src = img.dataset.visualSrc; });
    });
    article.querySelector('.visual-notes-link').addEventListener('click', event => {
      event.preventDefault();
      notes.open = true;
      notes.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
    });
    gallery.append(article);
  });
  gallery.addEventListener('click', event => {
    const trigger = event.target.closest('[data-image]');
    if (!trigger) return;
    document.dispatchEvent(new CustomEvent('portfolio:open-image', {detail: {src: trigger.dataset.image, alt: trigger.dataset.caption, trigger}}));
  });
})();

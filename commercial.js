(() => {
  'use strict';
  const films = window.portfolioCommercials || [];
  const byId = id => document.getElementById(id);
  const dialog = byId('film-dialog');
  const gallery = byId('kiva-gallery');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const filters = [
    {id: 'all', label: 'All scenes', zh: '全部场景', caption: '从商品质感到门店氛围，为不同生意找到表达。'},
    {id: 'product', label: 'Product', zh: '商品推广', caption: '用质感、细节与视觉创意，让商品成为主角。'},
    {id: 'store', label: 'Store', zh: '门店推广', caption: '用人物、空间与情绪，传达来到这里的理由。'}
  ];
  const kiva = films.filter(film => film.collection === 'kiva');
  const tvc = films.filter(film => film.collection === 'tvc');
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let activeFilter = 'all';
  let currentFilm = null;
  let returnFocus = null;
  let studyState = null;
  const imageDialog = byId('film-image-dialog');
  const image = byId('film-image');
  const imagePan = byId('film-image-pan');
  let imageReturnFocus = null;
  let imageZoomed = false;
  let imageDrag = null;
  const visibleKiva = () => kiva.filter(film => activeFilter === 'all' || film.group === activeFilter);
  const seconds = value => `${value.toFixed(1)}s`;

  function pauseMedia(except) {
    document.querySelectorAll('video').forEach(video => { if (video !== except) video.pause(); });
    document.querySelectorAll('.project-card.is-playing').forEach(card => {
      if (card.querySelector('video') !== except) card.classList.remove('is-playing');
    });
  }

  function stopPreview(card) {
    card.dataset.previewActive = 'false';
    card.querySelector('video')?.pause();
    card.classList.remove('is-playing');
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) stopPreview(entry.target); });
  }, {threshold: .05}) : null;

  function createCard(film, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `project-card commercial-card${film.collection === 'tvc' ? ' tvc-card' : ''}`;
    card.dataset.film = film.id;
    card.setAttribute('aria-label', `${film.title}，点击有声播放完整成片`);
    const title = escapeHTML(film.displayTitle || film.title);
    card.innerHTML = `<span class="project-visual"><img src="${film.poster}" loading="lazy" decoding="async" width="${film.width}" height="${film.height}" alt="${escapeHTML(film.title)}成片封面"><video muted loop playsinline preload="none" poster="${film.poster}" data-src="${film.preview}" aria-hidden="true"></video><span class="project-number">${String(index + 1).padStart(2, '0')} / ${film.collection === 'tvc' ? 'AIGC TVC' : film.group === 'store' ? 'SPACE' : 'PRODUCT'}</span><span class="project-play" aria-hidden="true">▶</span></span><span class="project-heading"><h3>${title}</h3><span class="arrow" aria-hidden="true">↗</span></span><span class="project-caption"><span>${escapeHTML(film.type)} / ${seconds(film.duration)}</span><span>WATCH FILM ↗</span></span>`;
    const subtitle = document.createElement('span');
    subtitle.className = 'commercial-card-zh';
    subtitle.textContent = film.title;
    card.querySelector('.project-heading').after(subtitle);
    const video = card.querySelector('video');
    video.addEventListener('playing', () => {
      if (card.dataset.previewActive === 'true') card.classList.add('is-playing');
      else video.pause();
    });
    video.addEventListener('error', () => stopPreview(card));
    const playPreview = () => {
      if (reduce.matches || coarse.matches || document.hidden || document.querySelector('dialog[open]')) return;
      pauseMedia(video);
      card.dataset.previewActive = 'true';
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.muted = true;
      video.play()?.catch(() => stopPreview(card));
    };
    card.addEventListener('pointerenter', playPreview);
    card.addEventListener('focus', playPreview);
    card.addEventListener('pointerleave', () => stopPreview(card));
    card.addEventListener('blur', () => stopPreview(card));
    card.addEventListener('click', () => { returnFocus = card; openFilm(film.id); });
    observer?.observe(card);
    return card;
  }

  function renderKiva() {
    gallery.querySelectorAll('.commercial-card').forEach(card => { stopPreview(card); observer?.unobserve(card); });
    gallery.replaceChildren(...visibleKiva().map(film => createCard(film, kiva.indexOf(film))));
    byId('kiva-count').textContent = `${String(visibleKiva().length).padStart(2, '0')} SCENES`;
    byId('kiva-caption').textContent = filters.find(filter => filter.id === activeFilter).caption;
    byId('kiva-filters').querySelectorAll('button').forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function navigationList(film) { return film.collection === 'tvc' ? tvc : visibleKiva(); }

  const studySource = (art, original = false) => `assets/commercial-details/${art.file}${original ? '' : '--preview'}.webp`;
  function studyImage(art) {
    return `<img data-study-src="${studySource(art)}" width="${art.width}" height="${art.height}" alt="${escapeHTML(art.alt)}" loading="lazy" decoding="async">`;
  }
  function loadStudyImages() {
    if (!byId('film-notes').open) return;
    byId('film-description').querySelectorAll('img[data-study-src]').forEach(img => {
      if (!img.getAttribute('src')) img.src = img.dataset.studySrc;
    });
  }
  function renderDescription(film) {
    const content = byId('film-description');
    content.classList.toggle('has-study', Boolean(film.study));
    studyState = film.study ? {step: 1, board: 0, art: film.study.boards[0].art} : null;
    if (!film.study) {
      content.innerHTML = `<span class="film-description-label">${escapeHTML(film.type)} / KIVA</span><p>${escapeHTML(film.summary)}</p>`;
      return;
    }
    const study = film.study;
    const summary = study.summary.map(part => typeof part === 'string' ? escapeHTML(part) : `<em>${escapeHTML(part.highlight)}</em>`).join('');
    content.innerHTML = `
      <div class="film-role"><div><span class="film-label">MY ROLE / 我的职责</span><strong>${escapeHTML(study.role)}</strong></div><p>${study.responsibilities.map(escapeHTML).join('<br>')}</p></div>
      <p class="film-study-summary">${summary}</p>
      <div class="film-focus">${study.focus.map(item => `<section><h4>${escapeHTML(item.title)} <span>${escapeHTML(item.label)}</span></h4><p>${escapeHTML(item.description)}</p></section>`).join('')}</div>
      <section class="film-making" aria-labelledby="film-making-title">
        <h3 id="film-making-title" class="film-study-heading">Making Of. <span>制作过程 · 点击步骤查看</span></h3>
        <div class="film-steps" role="group" aria-label="制作过程">${study.steps.map((step, index) => `<button type="button" data-study-step="${index}" aria-controls="film-stage" aria-pressed="${index === 1}"><span>${String(index + 1).padStart(2, '0')} / ${escapeHTML(step.label)}</span><b>${escapeHTML(step.title)}</b></button>`).join('')}</div>
        <div id="film-stage"><p id="film-step-description" class="film-step-description" aria-live="polite"></p><figure class="film-evidence"><button type="button" class="film-art-button" id="film-stage-art" aria-label="放大查看当前制作图"><span class="film-art-hint">VIEW DETAIL / 放大查看 ↗</span></button><figcaption id="film-stage-caption"></figcaption></figure></div>
        <div class="film-boards" role="group" aria-label="分镜组图切换">${study.boards.map((board, index) => `<button type="button" data-study-board="${index}" aria-pressed="${index === 0}">${escapeHTML(board.label)}</button>`).join('')}</div>
      </section>
      <section class="film-selected" aria-labelledby="film-frames-title"><h3 id="film-frames-title" class="film-study-heading">Selected Frames. <span>视觉表达</span></h3><div class="film-frames">${study.frames.map((frame, index) => `<figure><button class="film-art-button" type="button" data-study-art="${escapeHTML(frame.art)}" aria-label="放大查看${escapeHTML(frame.caption)}">${studyImage(study.art[frame.art])}<span class="film-art-hint" aria-hidden="true">↗</span></button><figcaption>${String(index + 1).padStart(2, '0')} / ${escapeHTML(frame.caption)}</figcaption></figure>`).join('')}</div></section>`;
    setStudyStep(1);
  }
  function setStudyArt(key, caption) {
    const art = currentFilm?.study?.art[key];
    if (!art) return;
    studyState.art = key;
    const button = byId('film-stage-art');
    button.dataset.studyArt = key;
    button.setAttribute('aria-label', `放大查看${art.alt}`);
    button.innerHTML = `${studyImage(art)}<span class="film-art-hint">VIEW DETAIL / 放大查看 ↗</span>`;
    byId('film-stage-caption').textContent = caption;
    loadStudyImages();
  }
  function setStudyStep(index) {
    const study = currentFilm?.study;
    const step = study?.steps[index];
    if (!step) return;
    studyState.step = index;
    byId('film-description').querySelectorAll('[data-study-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.studyStep) === index)));
    byId('film-step-description').textContent = step.description;
    byId('film-description').querySelector('.film-boards').hidden = index !== 1;
    if (index === 1) setStudyBoard(studyState.board);
    else setStudyArt(step.art, step.caption);
  }
  function setStudyBoard(index) {
    const board = currentFilm?.study?.boards[index];
    if (!board) return;
    studyState.board = index;
    byId('film-description').querySelectorAll('[data-study-board]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.studyBoard) === index)));
    setStudyArt(board.art, `${board.label} / 分镜与画面推演`);
  }

  function fitStudyImage() {
    if (!image.naturalWidth) return;
    const fitWidth = Math.min(image.naturalWidth, Math.max(1, imagePan.clientWidth - 32));
    image.style.width = `${Math.round(fitWidth * (imageZoomed ? 2 : 1))}px`;
    byId('film-image-zoom').textContent = imageZoomed ? '还原比例' : '放大 2×';
    byId('film-image-zoom').setAttribute('aria-pressed', String(imageZoomed));
  }
  function openStudyImage(key, trigger) {
    const art = currentFilm?.study?.art[key];
    if (!art) return;
    openImage(studySource(art, true), art.alt, trigger);
  }
  function openImage(src, alt, trigger) {
    if (!src?.startsWith('assets/')) return;
    imageReturnFocus = trigger;
    imageZoomed = false;
    byId('film-image-title').textContent = 'Production Detail / 制作细节';
    byId('film-image-caption').textContent = alt;
    byId('film-image-error').hidden = true;
    image.hidden = false;
    image.alt = alt;
    image.style.width = '100%';
    image.src = src;
    if (!imageDialog.open) imageDialog.showModal();
    document.body.classList.add('modal-open');
    imagePan.scrollTo(0, 0);
    fitStudyImage();
  }
  document.addEventListener('portfolio:open-image', event => {
    const {src, alt, trigger} = event.detail || {};
    if (typeof src === 'string' && typeof alt === 'string') openImage(src, alt, trigger);
  });
  byId('film-description').addEventListener('click', event => {
    const step = event.target.closest('[data-study-step]');
    if (step) { setStudyStep(Number(step.dataset.studyStep)); return; }
    const board = event.target.closest('[data-study-board]');
    if (board) { setStudyBoard(Number(board.dataset.studyBoard)); return; }
    const art = event.target.closest('[data-study-art]');
    if (art) openStudyImage(art.dataset.studyArt, art);
  });
  byId('film-notes').addEventListener('toggle', () => {
    byId('film-notes-label').textContent = byId('film-notes').open ? '项目说明 · 点击收起' : '项目说明 · 点击展开';
    loadStudyImages();
  });
  image.addEventListener('load', fitStudyImage);
  image.addEventListener('error', () => { if (imageDialog.open) { image.hidden = true; byId('film-image-error').hidden = false; } });
  byId('film-image-fit').addEventListener('click', () => { imageZoomed = false; fitStudyImage(); imagePan.scrollTo(0, 0); });
  byId('film-image-zoom').addEventListener('click', () => { imageZoomed = !imageZoomed; fitStudyImage(); if (!imageZoomed) imagePan.scrollTo(0, 0); });
  byId('close-film-image').addEventListener('click', () => imageDialog.close());
  imagePan.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || (imagePan.scrollWidth <= imagePan.clientWidth && imagePan.scrollHeight <= imagePan.clientHeight)) return;
    imageDrag = {pointer: event.pointerId, x: event.clientX, y: event.clientY, left: imagePan.scrollLeft, top: imagePan.scrollTop};
    imagePan.setPointerCapture(event.pointerId); imagePan.classList.add('is-dragging'); event.preventDefault();
  });
  imagePan.addEventListener('pointermove', event => {
    if (!imageDrag || event.pointerId !== imageDrag.pointer) return;
    imagePan.scrollLeft = imageDrag.left - (event.clientX - imageDrag.x); imagePan.scrollTop = imageDrag.top - (event.clientY - imageDrag.y); event.preventDefault();
  });
  function endImageDrag() {
    if (imageDrag && imagePan.hasPointerCapture(imageDrag.pointer)) imagePan.releasePointerCapture(imageDrag.pointer);
    imageDrag = null; imagePan.classList.remove('is-dragging');
  }
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => imagePan.addEventListener(type, endImageDrag));
  imageDialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); imageDialog.close(); });
  imageDialog.addEventListener('click', event => {
    if (event.target !== imageDialog) return;
    const r = imageDialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) imageDialog.close();
  });
  imageDialog.addEventListener('close', () => {
    endImageDrag(); image.removeAttribute('src');
    if (imageReturnFocus?.isConnected) imageReturnFocus.focus({preventScroll: true});
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    imageReturnFocus = null;
  });
  window.addEventListener('resize', () => { if (imageDialog.open) fitStudyImage(); });

  function openFilm(id) {
    const film = films.find(film => film.id === id);
    if (!film) return;
    if (imageDialog.open) imageDialog.close();
    currentFilm = film;
    pauseMedia();
    byId('film-title').textContent = film.displayTitle || film.title;
    byId('film-subtitle').textContent = film.title;
    byId('film-collection').textContent = film.collection === 'tvc' ? 'BRAND FILMS / TVC 品牌短片' : 'PRODUCT FILMS / 产品营销短片';
    byId('film-meta').textContent = `${film.aspect} / ${seconds(film.duration)}`;
    const list = navigationList(film);
    const index = list.indexOf(film);
    byId('film-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    byId('prev-film').disabled = index <= 0;
    byId('next-film').disabled = index >= list.length - 1;
    byId('film-notes').open = false;
    renderDescription(film);
    const player = byId('film-player');
    const previous = player.querySelector('video');
    if (previous) { previous.pause(); previous.removeAttribute('src'); previous.load(); }
    const video = document.createElement('video');
    video.className = 'film-full-video';
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.poster = film.poster;
    video.src = film.video;
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;
    video.setAttribute('aria-label', `${film.title}，完整成片，原声播放`);
    const status = byId('film-status');
    status.hidden = true;
    video.addEventListener('play', () => { pauseMedia(video); status.hidden = true; });
    video.addEventListener('error', () => { status.textContent = '视频暂时无法播放，请关闭后重新打开。'; status.hidden = false; });
    player.replaceChildren(video);
    dialog.classList.toggle('is-portrait', film.height > film.width);
    dialog.classList.toggle('is-landscape-standard', film.aspect === '4:3');
    if (!dialog.open) { dialog.showModal(); document.body.classList.add('modal-open'); }
    dialog.scrollTop = 0;
    // Called synchronously from the user's click: start the full film with its original audio.
    video.play()?.catch(() => {
      if (currentFilm?.id === id && dialog.open) {
        status.textContent = '点击视频播放键，开启声音观看完整成片。';
        status.hidden = false;
      }
    });
  }

  filters.forEach(filter => {
    const button = document.createElement('button');
    const count = kiva.filter(film => filter.id === 'all' || film.group === filter.id).length;
    button.type = 'button'; button.className = 'filter'; button.dataset.filter = filter.id;
    button.innerHTML = `<span>${filter.label}<sup>${String(count).padStart(2, '0')}</sup></span><small>${filter.zh}</small>`;
    button.setAttribute('aria-label', `${filter.label} ${filter.zh}，${count}条成片`);
    button.addEventListener('click', () => { activeFilter = filter.id; renderKiva(); });
    byId('kiva-filters').append(button);
  });
  renderKiva();
  byId('tvc-gallery').replaceChildren(...tvc.map((film, index) => createCard(film, index)));
  byId('tvc-count').textContent = `${String(tvc.length).padStart(2, '0')} FILMS / CLICK TO WATCH ↗`;
  byId('close-film').addEventListener('click', () => dialog.close());
  byId('back-to-films').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (imageDialog.open) imageDialog.close();
    const video = byId('film-player').querySelector('video');
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    byId('film-player').replaceChildren();
    byId('film-notes').open = false;
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    currentFilm = null;
    studyState = null;
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
    returnFocus = null;
  });
  function navigate(delta) {
    if (!currentFilm) return;
    const list = navigationList(currentFilm);
    const next = list[list.indexOf(currentFilm) + delta];
    if (next) openFilm(next.id);
  }
  byId('prev-film').addEventListener('click', () => navigate(-1));
  byId('next-film').addEventListener('click', () => navigate(1));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseMedia(); });
  reduce.addEventListener('change', () => {
    if (reduce.matches) document.querySelectorAll('.commercial-card').forEach(stopPreview);
  });
})();

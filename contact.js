(() => {
  'use strict';
  const dialog = document.getElementById('wechat-dialog');
  let returnFocus = null;
  document.querySelectorAll('[data-open-wechat]').forEach(button => button.addEventListener('click', () => {
    returnFocus = button;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  document.getElementById('close-wechat').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
    returnFocus = null;
  });
})();

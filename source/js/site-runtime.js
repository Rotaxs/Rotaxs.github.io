(function () {
  var start = new Date(2025, 7, 20, 0, 0, 0);

  function update() {
    var el = document.getElementById('site-run-time');
    if (!el) return;
    var now = new Date();
    if (now < start) {
      el.textContent = '网站已运行 0 天';
      return;
    }
    var diff = now - start;
    var days = Math.floor(diff / 86400000);
    el.textContent = '网站已运行 ' + days + ' 天';
  }

  update();
  setInterval(update, 60000);
})();

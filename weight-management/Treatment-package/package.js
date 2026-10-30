/* =============================================================================
   体重管理 · 减重首诊用药套餐（weight-management/Treatment-package）
   静态内容页：套餐卡 + 支付后就诊流程 + 常见问题；
   吸底「开始体重管理」进入线上订阅下单页（Payment-Page）。
   ============================================================================= */
(function () {
  'use strict';

  /* 线上订阅下单页 */
  var PAY_URL = '../../Payment-Page/index.html';
  /* 返回兜底：本页由评估报告进入，无历史记录时回到报告页 */
  var BACK_URL = '../Assessment-report/index.html';

  /* 兜底人设：直接打开本页时使用（与报告页 normal 分支口径一致） */
  var FALLBACK = { name: '王倩', age: 35, gender: '女', height: 168, weight: 80, bmi: '28.3' };

  var toast = ZZ.toast;
  var esc = ZZ.esc;

  /* 报告生成时间：取当前打开时刻（演示口径），精确到分 */
  var GEN_TIME = (function () {
    var n = new Date();
    function p2(x) { return (x < 10 ? '0' : '') + x; }
    return n.getFullYear() + '-' + p2(n.getMonth() + 1) + '-' + p2(n.getDate()) +
      ' ' + p2(n.getHours()) + ':' + p2(n.getMinutes());
  })();

  /* 结论头：用户基础信息 + 套餐匹配度（读取报告页写入的问卷结果） */
  function readUser() {
    try {
      var raw = sessionStorage.getItem('zz:assessResult');
      if (!raw) return FALLBACK;
      var r = JSON.parse(raw);
      if (!r || !r.height || !r.weight) return FALLBACK;
      r.name = FALLBACK.name;
      r.age = FALLBACK.age;
      r.gender = FALLBACK.gender;
      return r;
    } catch (e) { return FALLBACK; }
  }

  function renderHero() {
    var el = document.getElementById('hero');
    if (!el) return;
    var u = readUser();
    var bmi = parseFloat(u.bmi) || (u.weight / Math.pow(u.height / 100, 2)).toFixed(1);
    el.innerHTML =
      '<div class="hero__hd">' +
      '<span class="hero__name">' + esc(u.name) + '</span>' +
      '<span class="hero__meta">' + esc(u.gender || '') + ' · ' + u.age + ' 岁 · ' +
      u.height + 'cm / ' + u.weight + 'kg · BMI ' + Number(bmi).toFixed(1) + '</span>' +
      '<button type="button" class="hero__info" id="genInfoBtn" aria-label="查看生成时间" aria-expanded="false">' +
      '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 11.2v4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="8" r="1.1" fill="currentColor"/></svg>' +
      '</button>' +
      '<span class="hero__tip" id="genTip" hidden>生成时间：' + GEN_TIME + '</span>' +
      '</div>' +
      '<div class="mbar">' +
      '<span class="mbar__lab">套餐匹配度</span>' +
      '<span class="mbar__lv">较高</span>' +
      '<span class="mbar__tr"><i style="width:78%"></i></span>' +
      '</div>' +
      '<p class="hero__d">你的 BMI ' + Number(bmi).toFixed(1) + ' 已进入建议药物介入的区间，生活方式干预见效慢、难维持，可以考虑体重管理首诊套餐，配合减重。</p>';
  }

  /* 折叠动画：与评估报告页同实现 */
  function setFold(el, open) {
    clearTimeout(el._foldT);
    el._open = open;
    if (open) {
      el.style.maxHeight = el.scrollHeight + 'px';
      el._foldT = setTimeout(function () {
        if (el._open) el.style.maxHeight = 'none';
      }, 340);
    } else {
      if (!el.style.maxHeight || el.style.maxHeight === 'none') {
        el.style.maxHeight = el.scrollHeight + 'px';
        void el.offsetHeight;
      }
      el.style.maxHeight = '0px';
    }
  }

  /* 生成时间气泡：点右上角 info 图标显示，点外面/再点一次收起（与评估报告页同实现） */
  function initGenInfo() {
    var btn = document.getElementById('genInfoBtn');
    var tip = document.getElementById('genTip');
    if (!btn || !tip) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      tip.hidden = !tip.hidden;
      btn.setAttribute('aria-expanded', String(!tip.hidden));
    });
    document.addEventListener('click', function (e) {
      if (tip.hidden || tip.contains(e.target)) return;
      tip.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function init() {
    renderHero();
    initGenInfo();

    /* 模块折叠 */
    document.querySelectorAll('.mod').forEach(function (mod) {
      var h = mod.querySelector('.mod__h');
      var b = mod.querySelector('.mod__b');
      if (!h || !b) return;
      h.addEventListener('click', function () {
        var folded = mod.classList.toggle('is-fold');
        h.setAttribute('aria-expanded', folded ? 'false' : 'true');
        setFold(b, !folded);
      });
    });

    /* 顶部导航 */
    var back = document.getElementById('backBtn');
    if (back) {
      back.addEventListener('click', function () {
        if (history.length > 1) history.back();
        else location.href = BACK_URL;
      });
    }
    var more = document.getElementById('moreBtn');
    if (more) {
      more.addEventListener('click', function () {
        toast('是否用药以医生面诊与处方为准');
      });
    }

    /* 吸底：未勾选协议不放行 */
    var buy = document.getElementById('buyBtn');
    var chk = document.getElementById('agrChk');
    if (buy) {
      buy.addEventListener('click', function () {
        if (!chk || !chk.checked) { toast('请先勾选同意《减重管理服务知情同意书》'); return; }
        location.href = PAY_URL;
      });
    }

    var view = document.getElementById('view');
    if (view) view.classList.add('view-in');
  }

  document.addEventListener('DOMContentLoaded', init);
})();

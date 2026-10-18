(function () {
  var root = document.getElementById("site-chrome");
  if (!root) return;

  // Self-contained header styles (products-page look) — same on every page
  if (!document.getElementById("anabee-nav-css")) {
    var css = document.createElement("style");
    css.id = "anabee-nav-css";
    css.textContent =
      "#site-chrome header.anabee-header{" +
      "position:fixed;top:0;left:0;right:0;z-index:50;" +
      "border-bottom:1px solid rgba(226,229,228,.7);" +
      "background:rgba(252,250,247,.95);" +
      "-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)" +
      "}" +
      "#site-chrome .anabee-header-inner{" +
      "max-width:1440px;margin:0 auto;height:4rem;" +
      "padding-left:20px;padding-right:20px;" +
      "display:flex;align-items:center;justify-content:space-between;gap:.75rem;min-width:0" +
      "}" +
      "@media (min-width:768px){" +
      "#site-chrome .anabee-header-inner{padding-left:64px;padding-right:64px}" +
      "}" +
      "#site-chrome .anabee-logo{flex-shrink:0;display:block;line-height:0}" +
      "#site-chrome .anabee-logo img{height:2.5rem;width:auto;display:block;object-fit:contain}" +
      "#site-chrome .anabee-nav{" +
      "display:none;align-items:center;gap:1.5rem;flex-shrink:0;" +
      "font-size:.875rem;line-height:1.4;font-weight:500" +
      "}" +
      "@media (min-width:1024px){#site-chrome .anabee-nav{display:flex}}" +
      "#site-chrome .anabee-nav a," +
      "#site-chrome #nav-panel a.nav-link{" +
      "color:#5C6160;text-decoration:none;transition:color .2s" +
      "}" +
      "#site-chrome .anabee-nav a:hover," +
      "#site-chrome #nav-panel a.nav-link:hover{color:#0F4C3A}" +
      "#site-chrome .anabee-nav a[aria-current=page]," +
      "#site-chrome #nav-panel a.nav-link[aria-current=page]{" +
      "color:#0F4C3A;font-weight:600" +
      "}" +
      "#site-chrome .anabee-actions{" +
      "display:flex;align-items:center;gap:.5rem;flex-shrink:0" +
      "}" +
      "@media (min-width:640px){#site-chrome .anabee-actions{gap:.75rem}}" +
      "#site-chrome .anabee-cta{" +
      "display:none;align-items:center;justify-content:center;" +
      "background:#0F4C3A;color:#fff;border-radius:.5rem;" +
      "padding:.625rem 1rem;font-size:.875rem;font-weight:600;" +
      "text-decoration:none;line-height:1.4;border:none;cursor:pointer;" +
      "white-space:nowrap" +
      "}" +
      "@media (min-width:640px){#site-chrome .anabee-cta{display:inline-flex}}" +
      "#site-chrome .anabee-cta:hover{filter:brightness(1.08)}" +
      "#site-chrome #nav-open{" +
      "display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:44px;min-height:44px;padding:.5rem;margin-right:-.5rem;" +
      "color:#0F4C3A;background:transparent;border:none;cursor:pointer" +
      "}" +
      "@media (min-width:1024px){#site-chrome #nav-open{display:none}}" +
      "#site-chrome #nav-panel{" +
      "display:none;position:fixed;top:4rem;left:0;right:0;z-index:40;" +
      "border-bottom:1px solid #E2E5E4;background:rgba(252,250,247,.95);" +
      "-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);" +
      "padding:1rem 20px;flex-direction:column;gap:.75rem;" +
      "font-size:1.125rem;line-height:1.75;" +
      "box-shadow:0 4px 16px rgba(0,0,0,.04)" +
      "}" +
      "#site-chrome #nav-panel.is-open{display:flex}" +
      "#site-chrome #nav-panel .anabee-cta-mobile{" +
      "display:inline-flex;align-items:center;justify-content:center;" +
      "background:#0F4C3A;color:#fff;border-radius:.5rem;" +
      "padding:.75rem 1rem;font-weight:600;text-decoration:none;text-align:center" +
      "}" +
      "@media (min-width:640px){#site-chrome #nav-panel .anabee-cta-mobile{display:none}}";
    document.head.appendChild(css);
  }

  var ar = document.documentElement.lang === "ar";
  var home = "/";
  var path = (location.pathname || "/").replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  if (path.length > 1 && path.slice(-1) === "/") path = path.slice(0, -1);

  var links = ar
    ? [
        ["/#target", "الهدف"],
        ["/#pillars", "المحاور"],
        ["/products", "المنتجات"],
        ["/academy", "الأكاديمية"],
        ["/blog/", "المدونة"],
        ["/investors", "المستثمرون"]
      ]
    : [
        ["/#target", "Target"],
        ["/#pillars", "Pillars"],
        ["/products", "Products"],
        ["/academy", "Academy"],
        ["/blog/", "Blog"],
        ["/investors", "Investors"]
      ];
  var cta = ar ? "سجّل 7 ثواني" : "Record 7 seconds";
  var menuLabel = ar ? "القائمة" : "Menu";

  function isActive(href) {
    if (href.charAt(0) === "#") return false;
    if (href.indexOf("/#") === 0) return path === "/" || path === "";
    var clean = href.replace(/\/$/, "");
    if (clean === "/blog") return path === "/blog" || path.indexOf("/blog") === 0;
    return path === clean || path.indexOf(clean + "/") === 0;
  }

  var linkHtml = links
    .map(function (pair) {
      var active = isActive(pair[0]);
      return (
        '<a class="nav-link" href="' +
        pair[0] +
        '"' +
        (active ? ' aria-current="page"' : "") +
        ">" +
        pair[1] +
        "</a>"
      );
    })
    .join("");

  root.innerHTML =
    '<header class="anabee-header">' +
    '<div class="anabee-header-inner">' +
    '<a href="' +
    home +
    '" class="anabee-logo"><img src="/assets/anabee-logo-mark.png" alt="ANABEE"/></a>' +
    '<nav class="anabee-nav" aria-label="Main">' +
    linkHtml +
    "</nav>" +
    '<div class="anabee-actions">' +
    '<a href="/join" class="anabee-cta">' +
    cta +
    "</a>" +
    '<button type="button" id="nav-open" aria-label="' +
    menuLabel +
    '" aria-expanded="false"><span class="material-symbols-outlined">menu</span></button>' +
    "</div></div></header>" +
    '<div id="nav-panel">' +
    '<a href="/join" class="anabee-cta-mobile">' +
    cta +
    "</a>" +
    linkHtml +
    "</div>";

  var btn = document.getElementById("nav-open");
  var panel = document.getElementById("nav-panel");
  if (btn && panel) {
    btn.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();

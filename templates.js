// Páginas de contagem personalizadas. Uso em links.js: template: 'blackfriday'
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function blackfriday(url, seconds) {
  const safe = esc(url);
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#070505">
<title>Grupo VIP Black Friday | L'Essence</title>
<meta property="og:title" content="Grupo VIP Black Friday | L'Essence">
<meta property="og:description" content="Tenha acesso antecipado às promoções da Black Friday.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700;0,800;1,900&display=swap" rel="stylesheet">
<noscript><meta http-equiv="refresh" content="${seconds};url=${safe}"></noscript>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{background:#070505;color:#fff;font-family:Montserrat,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow-x:hidden}
  .stage{position:relative;min-height:100vh;min-height:100dvh;max-width:560px;margin:0 auto;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(18px,3.6vh,34px);padding:clamp(28px,5vh,56px) 22px;text-align:center;
    background:
      radial-gradient(60% 30% at 100% 0%,rgba(255,30,30,.28),transparent 70%),
      radial-gradient(70% 30% at 0% 100%,rgba(255,20,20,.34),transparent 70%),
      #070505}
  .deco{position:absolute;pointer-events:none;mix-blend-mode:lighten;z-index:0;height:auto}
  .deco.top{top:0;right:0;width:min(30%,170px);opacity:.9;-webkit-mask-image:linear-gradient(to right,transparent,#000 45%),linear-gradient(to top,transparent,#000 30%);-webkit-mask-composite:source-in;mask-image:linear-gradient(to right,transparent,#000 45%),linear-gradient(to top,transparent,#000 30%);mask-composite:intersect}
  .deco.bottom{bottom:0;left:0;width:min(38%,210px);-webkit-mask-image:linear-gradient(to left,transparent,#000 40%),linear-gradient(to bottom,transparent,#000 30%);-webkit-mask-composite:source-in;mask-image:linear-gradient(to left,transparent,#000 40%),linear-gradient(to bottom,transparent,#000 30%);mask-composite:intersect}
  .lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
  .stage>*:not(.deco):not(.lines){position:relative;z-index:1}
  .logo{width:clamp(170px,48vw,240px);height:auto}
  .bf{line-height:.9;font-style:italic;font-weight:900;text-transform:uppercase;letter-spacing:-.02em}
  .bf .black{display:block;font-size:clamp(64px,21vw,118px);color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.6)}
  .bf .friday{display:inline-block;margin-top:6px;font-size:clamp(62px,20.5vw,114px);color:#ff1616;padding:.04em .16em .02em;border:3px solid #ff1616;border-radius:14px;transform:skewX(-8deg);background:rgba(0,0,0,.55);box-shadow:0 0 18px rgba(255,22,22,.75),0 0 60px rgba(255,22,22,.35),inset 0 0 14px rgba(255,22,22,.35);text-shadow:0 0 22px rgba(255,22,22,.55)}
  .bf .friday span{display:inline-block;transform:skewX(8deg)}
  .vip{display:flex;align-items:center;justify-content:center;gap:12px;font-weight:800;font-size:clamp(30px,9.4vw,50px);letter-spacing:.02em}
  .vip svg{width:1.25em;height:1.25em;flex:none}
  .sub{font-size:clamp(16px,4.6vw,22px);line-height:1.35;color:#f1f1f1;margin-top:-8px}
  .sub b{font-weight:700}
  .pill{position:relative;width:100%;max-width:400px;border-radius:999px;background:#fff;color:#111;font-weight:800;font-size:clamp(15px,4.3vw,19px);letter-spacing:.02em;text-transform:uppercase;padding:17px 20px;overflow:hidden;box-shadow:0 8px 30px rgba(255,22,22,.35);text-decoration:none;display:block}
  .pill .fill{position:absolute;inset:0;background:#ffd2d2;transform-origin:left;transform:scaleX(0);animation:fill ${seconds}s linear forwards}
  .pill .txt{position:relative}
  .pill .n{display:inline-block;min-width:1ch;color:#e00000;font-variant-numeric:tabular-nums}
  @keyframes fill{to{transform:scaleX(1)}}
  .hint{font-size:13px;color:#e6dfdd;margin-top:-10px;min-height:1.4em}
  .hint a{color:#fff;font-weight:700}
  .chev{width:38px;height:38px;animation:bob 1.2s ease-in-out infinite;margin-top:-6px}
  @keyframes bob{50%{transform:translateY(6px)}}
  @media (prefers-reduced-motion:reduce){.chev{animation:none}}
</style>
</head>
<body>
<main class="stage">
  <svg class="lines" viewBox="0 0 400 800" preserveAspectRatio="none" aria-hidden="true">
    <defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <g fill="none" stroke="#ff2020" stroke-linecap="round">
      <path d="M-10 150 C60 110 110 40 150 -10" stroke-width="5" filter="url(#g)" opacity=".9"/>
      <path d="M-10 150 C60 110 110 40 150 -10" stroke-width="1.5" stroke="#ff8a8a"/>
      <path d="M-10 60 C30 45 60 20 80 -10" stroke-width="1.2" opacity=".7"/>
      <path d="M410 620 C330 650 270 720 230 810" stroke-width="5" filter="url(#g)" opacity=".9"/>
      <path d="M410 620 C330 650 270 720 230 810" stroke-width="1.5" stroke="#ff8a8a"/>
      <path d="M410 700 C360 720 330 760 310 810" stroke-width="1.2" opacity=".7"/>
    </g>
  </svg>
  <img class="deco top" src="/lessence/frasco-topo.webp" alt="" width="251" height="430">
  <img class="deco bottom" src="/lessence/frasco-base.webp" alt="" width="330" height="382">

  <img class="logo" src="/lessence/logo.webp" alt="L'Essence" width="440" height="200">

  <h1 class="bf"><span class="black">Black</span><span class="friday"><span>Friday</span></span></h1>

  <div class="vip">
    <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24ZM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43l-.47-.01Z"/></svg>
    <span>GRUPO VIP</span>
  </div>

  <p class="sub">Tenha acesso <b>antecipado</b><br>às promoções da Black Friday.</p>

  <a class="pill" id="go" href="${safe}" rel="noopener">
    <span class="fill"></span>
    <span class="txt" id="txt">Entrando no grupo em <span class="n" id="count">${seconds}</span>s</span>
  </a>

  <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l6 6 6-6M6 13l6 6 6-6"/></svg>

  <p class="hint" id="hint">Você será redirecionado automaticamente.</p>
</main>
<script>
  var left = ${seconds};
  var dest = ${JSON.stringify(url).replace(/</g, '\\u003c')};
  var count = document.getElementById('count');
  var t = setInterval(function () {
    left--;
    if (left > 0) { count.textContent = left; return; }
    clearInterval(t);
    document.getElementById('txt').textContent = 'Entrar no grupo agora';
    document.getElementById('hint').textContent = 'Não abriu? Toque no botão acima.';
    location.href = dest;
  }, 1000);
</script>
</body>
</html>`;
}

module.exports = { blackfriday };

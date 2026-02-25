(function () {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");

  let tris = [];
  let time = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", function () {
    resize();
  });

  // HSL gradient stops top→bottom (dark charcoal → dark orange → deep amber)
  const stops = [
    { pos: 0.0, h: 20, s: 70, l: 8 }, // very dark burnt orange
    { pos: 0.35, h: 25, s: 75, l: 11 }, // dark orange
    { pos: 0.65, h: 30, s: 65, l: 14 }, // dark amber
    { pos: 1.0, h: 15, s: 60, l: 9 }, // dark red-orange
  ];

  function baseHSL(cy) {
    const t = Math.max(0, Math.min(1, cy / canvas.height));
    let s1 = stops[0],
      s2 = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i].pos && t <= stops[i + 1].pos) {
        s1 = stops[i];
        s2 = stops[i + 1];
        break;
      }
    }
    const f = s1.pos === s2.pos ? 0 : (t - s1.pos) / (s2.pos - s1.pos);
    return {
      h: s1.h + (s2.h - s1.h) * f,
      s: s1.s + (s2.s - s1.s) * f,
      l: s1.l + (s2.l - s1.l) * f,
    };
  }

  function init() {
    tris = [];
    const W = canvas.width;
    const H = canvas.height;
    const cell = 90;
    const cols = Math.ceil(W / cell) + 1;
    const rows = Math.ceil(H / cell) + 1;

    // Jittered grid of vertices
    const pts = [];
    for (let r = 0; r <= rows; r++) {
      pts[r] = [];
      for (let c = 0; c <= cols; c++) {
        pts[r][c] = {
          x: c * cell + (Math.random() - 0.5) * cell * 0.75,
          y: r * cell + (Math.random() - 0.5) * cell * 0.75,
        };
      }
    }

    // Two triangles per cell
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p00 = pts[r][c],
          p10 = pts[r][c + 1];
        const p01 = pts[r + 1][c],
          p11 = pts[r + 1][c + 1];

        [
          [p00, p10, p01],
          [p10, p11, p01],
        ].forEach(function (verts) {
          const cy = (verts[0].y + verts[1].y + verts[2].y) / 3;
          const base = baseHSL(cy);
          tris.push({
            v: verts,
            h: base.h + (Math.random() - 0.5) * 22,
            s: base.s + (Math.random() - 0.5) * 10,
            l: base.l + (Math.random() - 0.5) * 14,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.6,
          });
        });
      }
    }
  }

  init();

  function animate() {
    time += 0.015;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < tris.length; i++) {
      const t = tris[i];

      // Iridescent shimmer: hue and lightness drift over time
      const h = t.h + Math.sin(time * t.speed + t.phase) * 20;
      const l = t.l + Math.sin(time * t.speed * 0.6 + t.phase + 1.2) * 10;

      ctx.beginPath();
      ctx.moveTo(t.v[0].x, t.v[0].y);
      ctx.lineTo(t.v[1].x, t.v[1].y);
      ctx.lineTo(t.v[2].x, t.v[2].y);
      ctx.closePath();
      ctx.fillStyle = "hsl(" + h + "," + t.s + "%," + l + "%)";
      ctx.fill();
      ctx.strokeStyle = "hsla(" + h + "," + t.s + "%," + (l + 12) + "%,0.35)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    requestAnimationFrame(animate);
  }

  animate();
})();

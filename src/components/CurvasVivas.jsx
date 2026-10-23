import { useEffect, useRef } from 'react';
import './CurvasVivas.css';

const CTRL_INDICES = [
  [1, -2, 3, -4],
  [9, -8, 7, -6],
  [5, 2, 5, -5],
  [-1, -3, 8, 9],
];
const MORPH_AMOUNT = 3.0;
const SPEED = 0.15;
const MORPH_SPEED = 0.05;
const BANDS = 2.0;
const LEVEL_STEP = 1 / BANDS;
const SCALE = 1.25;
const MOUSE_RADIUS = 0.3;
const MOUSE_STRENGTH = 0.4;
const LINE_COLOR = '#b8442a';
const NUMBER_COLOR = 'rgba(40,78,216,ALPHA)';
const NUMBER_GLYPHS = ['0', '1'];
const NUMBER_HOVER_RADIUS = 0.22;

function bez(t, c) {
  const w = 6.2831853 * t;
  return (
    0.5 *
    (c[0] * Math.sin(w) +
      c[1] * Math.cos(w) +
      c[2] * Math.sin(2 * w) +
      c[3] * Math.cos(2 * w))
  );
}

function hash01(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 2246822519;
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

/**
 * Topographic contour animation (Curvas Vivas), clipped as a circular ring.
 */
export default function CurvasVivas({ active = true, className = '' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctrlA = [0, 0, 0, 0];
    const ctrlB = [0, 0, 0, 0];
    const ctrlC = [0, 0, 0, 0];
    const ctrlD = [0, 0, 0, 0];
    const ctrlArrays = [ctrlA, ctrlB, ctrlC, ctrlD];

    let W = 0;
    let H = 0;
    let DPR = 1;
    let cellSize = 10;
    let cols = 0;
    let rows = 0;
    let FV = null;
    const mouse = { x: 0.5, y: 0.5 };
    const mouseSmooth = { x: 0.5, y: 0.5 };
    let mouseActiveTarget = 0;
    let mouseActive = 0;
    let raf = 0;
    let last = 0;
    let resizeTimer = 0;

    function updateCtrls(time) {
      for (let g = 0; g < 4; g += 1) {
        const idx = CTRL_INDICES[g];
        const arr = ctrlArrays[g];
        for (let j = 0; j < 4; j += 1) {
          const i = idx[j];
          arr[j] =
            MORPH_AMOUNT *
            Math.sin(time * SPEED * Math.sin(i * MORPH_SPEED) + i);
        }
      }
    }

    function field(ux, uy) {
      const ax = bez(ux, ctrlA);
      const ay = bez(ux, ctrlB);
      const bx = bez(uy, ctrlC);
      const by = bez(uy, ctrlD);
      const dx = ax - bx;
      const dy = ay - by;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function resize() {
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const targetCells = 1800;
      cellSize = Math.max(7, Math.round(Math.sqrt((W * H) / targetCells)));
      cols = Math.ceil(W / cellSize) + 1;
      rows = Math.ceil(H / cellSize) + 1;
      FV = new Float32Array(cols * rows);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    }

    function buildGrid(t) {
      updateCtrls(t);
      const mx = mouseSmooth.x;
      const my = mouseSmooth.y;
      const aspect = W / H;
      let minV = Infinity;
      let maxV = -Infinity;
      for (let r = 0; r < rows; r += 1) {
        const py = r * cellSize;
        const rawY = py / H;
        const uy = (rawY - 0.5) / SCALE + 0.5;
        const rowOff = r * cols;
        for (let c = 0; c < cols; c += 1) {
          const px = c * cellSize;
          const rawX = px / W;
          const ux = (rawX - 0.5) / SCALE + 0.5;
          let fv = field(ux, uy);
          const dxm = (rawX - mx) * aspect;
          const dym = rawY - my;
          const bump =
            Math.exp(-(dxm * dxm + dym * dym) / (MOUSE_RADIUS * MOUSE_RADIUS)) *
            MOUSE_STRENGTH *
            mouseActive;
          fv += bump;
          FV[rowOff + c] = fv;
          if (fv < minV) minV = fv;
          if (fv > maxV) maxV = fv;
        }
      }
      return { min: minV, max: maxV };
    }

    function traceLevel(level) {
      for (let r = 0; r < rows - 1; r += 1) {
        const rowOff = r * cols;
        const rowOffNext = (r + 1) * cols;
        const py0 = r * cellSize;
        const py1 = (r + 1) * cellSize;
        for (let c = 0; c < cols - 1; c += 1) {
          const px0 = c * cellSize;
          const px1 = (c + 1) * cellSize;
          const tl = FV[rowOff + c];
          const tr = FV[rowOff + c + 1];
          const bl = FV[rowOffNext + c];
          const br = FV[rowOffNext + c + 1];

          const tlAbove = tl > level;
          const trAbove = tr > level;
          const brAbove = br > level;
          const blAbove = bl > level;
          if (
            tlAbove === trAbove &&
            trAbove === brAbove &&
            brAbove === blAbove
          ) {
            continue;
          }

          let tx;
          let ty;
          let rx;
          let ry;
          let bx;
          let by;
          let lx;
          let ly;
          const hasT = tlAbove !== trAbove;
          const hasR = trAbove !== brAbove;
          const hasB = blAbove !== brAbove;
          const hasL = tlAbove !== blAbove;

          if (hasT) {
            tx = px0 + ((px1 - px0) * (level - tl)) / (tr - tl);
            ty = py0;
          }
          if (hasR) {
            rx = px1;
            ry = py0 + ((py1 - py0) * (level - tr)) / (br - tr);
          }
          if (hasB) {
            bx = px0 + ((px1 - px0) * (level - bl)) / (br - bl);
            by = py1;
          }
          if (hasL) {
            lx = px0;
            ly = py0 + ((py1 - py0) * (level - tl)) / (bl - tl);
          }

          const n =
            (hasT ? 1 : 0) + (hasR ? 1 : 0) + (hasB ? 1 : 0) + (hasL ? 1 : 0);
          if (n === 2) {
            if (hasT && hasR) {
              ctx.moveTo(tx, ty);
              ctx.lineTo(rx, ry);
            } else if (hasT && hasB) {
              ctx.moveTo(tx, ty);
              ctx.lineTo(bx, by);
            } else if (hasT && hasL) {
              ctx.moveTo(tx, ty);
              ctx.lineTo(lx, ly);
            } else if (hasR && hasB) {
              ctx.moveTo(rx, ry);
              ctx.lineTo(bx, by);
            } else if (hasR && hasL) {
              ctx.moveTo(rx, ry);
              ctx.lineTo(lx, ly);
            } else if (hasB && hasL) {
              ctx.moveTo(bx, by);
              ctx.lineTo(lx, ly);
            }
          } else if (n === 4) {
            const center = (tl + tr + br + bl) / 4;
            if (center > level) {
              ctx.moveTo(tx, ty);
              ctx.lineTo(lx, ly);
              ctx.moveTo(rx, ry);
              ctx.lineTo(bx, by);
            } else {
              ctx.moveTo(tx, ty);
              ctx.lineTo(rx, ry);
              ctx.moveTo(lx, ly);
              ctx.lineTo(bx, by);
            }
          }
        }
      }
    }

    function render(t) {
      const range = buildGrid(t);
      ctx.clearRect(0, 0, W, H);

      const startLevel = Math.ceil(range.min / LEVEL_STEP) * LEVEL_STEP;
      ctx.beginPath();
      for (let level = startLevel; level <= range.max; level += LEVEL_STEP) {
        traceLevel(level);
      }
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = Math.max(1, cellSize * 0.1);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      const mx = mouseSmooth.x;
      const my = mouseSmooth.y;
      const aspect = W / H;
      const baseSize = cellSize * 1.05;
      let lastSizeKey = -1;

      for (let r = 0; r < rows - 1; r += 1) {
        const rowOff = r * cols;
        const rowOffNext = (r + 1) * cols;
        const py = r * cellSize;
        const rawY = py / H;
        for (let c = 0; c < cols - 1; c += 1) {
          const here = FV[rowOff + c];
          const bHere = Math.floor(here / LEVEL_STEP);
          const bRight = Math.floor(FV[rowOff + c + 1] / LEVEL_STEP);
          const bDown = Math.floor(FV[rowOffNext + c] / LEVEL_STEP);
          if (bHere === bRight && bHere === bDown) continue;

          const px = c * cellSize;
          const rawX = px / W;
          const dxh = (rawX - mx) * aspect;
          const dyh = rawY - my;
          const hoverBoost =
            Math.exp(
              -(dxh * dxh + dyh * dyh) /
                (NUMBER_HOVER_RADIUS * NUMBER_HOVER_RADIUS),
            ) * mouseActive;

          const sizeKey = Math.round(hoverBoost * 8);
          if (sizeKey !== lastSizeKey) {
            ctx.font = `700 ${Math.round(baseSize * (1 + (sizeKey / 8) * 0.55))}px 'JetBrains Mono', monospace`;
            lastSizeKey = sizeKey;
          }

          const timeBucket = Math.floor((t + hash01(c, r, 0) * 20) / 30);
          const gr = hash01(c, r, timeBucket);
          const glyph =
            NUMBER_GLYPHS[Math.floor(gr * NUMBER_GLYPHS.length)];
          const alpha = 0.72 + hoverBoost * 0.28;
          ctx.fillStyle = NUMBER_COLOR.replace('ALPHA', alpha.toFixed(2));
          ctx.fillText(glyph, px, py);
        }
      }
    }

    function onPointerMove(ev) {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouse.x = (ev.clientX - rect.left) / rect.width;
      mouse.y = (ev.clientY - rect.top) / rect.height;
      mouseActiveTarget = 1;
    }

    function onPointerLeave() {
      mouseActiveTarget = 0;
    }

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduceMotion) render(6);
      }, 100);
    }

    wrap.addEventListener('pointermove', onPointerMove, { passive: true });
    wrap.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('resize', onResize);

    resize();

    if (reduceMotion) {
      render(6);
    } else {
      const FRAME_MS = 1000 / 22;
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        if (now - last < FRAME_MS) return;
        last = now;
        mouseSmooth.x += (mouse.x - mouseSmooth.x) * 0.045;
        mouseSmooth.y += (mouse.y - mouseSmooth.y) * 0.045;
        mouseActive += (mouseActiveTarget - mouseActive) * 0.035;
        render(now / 1000);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [active]);

  return (
    <div
      ref={wrapRef}
      className={['curvas-vivas', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="curvas-vivas__canvas" />
    </div>
  );
}

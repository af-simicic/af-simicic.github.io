// ── Knowledge Graph — af.dev ───────────────────────────
// Auto-generated from posts data. Add a post → add a node here.

var NODES = [
  {id:0, slug:'btrfs-luks-arch',          label:'Btrfs + LUKS\nen Arch',        cat:'linux', r:21},
  {id:1, slug:'hardening-servidor-linux',  label:'Hardening\nservidor',           cat:'sec',   r:19},
  {id:2, slug:'index-match-vs-vlookup',    label:'INDEX+MATCH\nvs VLOOKUP',       cat:'data',  r:17},
  {id:3, slug:'base-conocimiento-llm',     label:'Base de\nconocimiento',         cat:'ai',    r:20}
];

// Edges from "related" field of each post
var EDGES = [
  [0,1], [0,3], [2,3]
];

var COLORS = {
  linux: '#378ADD',
  sec:   '#E24B4A',
  data:  '#39d353',
  ai:    '#7F77DD',
  net:   '#F97316'
};

var LEGEND = [
  {label:'GNU/Linux',   cat:'linux'},
  {label:'Redes',       cat:'net'},
  {label:'Seguridad',   cat:'sec'},
  {label:'Data Science',cat:'data'},
  {label:'IA',          cat:'ai'}
];

var canvas, ctx, nodes, edges;
var hoveredNode = null, draggedNode = null;
var mouseX = 0, mouseY = 0;
var mouseDownX = 0, mouseDownY = 0;
var animId = null;

function openGraph() {
  document.getElementById('graphModal').classList.add('open');
  initGraph();
}

function closeGraph() {
  document.getElementById('graphModal').classList.remove('open');
  if (animId) { cancelAnimationFrame(animId); animId = null; }
}

function handleOverlayClick(e) {
  if (e.target === e.currentTarget) closeGraph();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeGraph();
});

function initGraph() {
  canvas = document.getElementById('graphCanvas');
  ctx    = canvas.getContext('2d');
  resize();

  var w = canvas.width, h = canvas.height;

  nodes = NODES.map(function(n, i) {
    var angle  = (i / NODES.length) * Math.PI * 2;
    var radius = Math.min(w, h) * 0.28;
    return Object.assign({}, n, {
      x:     w/2 + Math.cos(angle) * radius,
      y:     h/2 + Math.sin(angle) * radius,
      vx: 0, vy: 0,
      color: COLORS[n.cat]
    });
  });

  edges = EDGES.map(function(e) {
    return { source: nodes[e[0]], target: nodes[e[1]] };
  });

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup',   onMouseUp);
  window.addEventListener('resize',    resize);

  if (animId) cancelAnimationFrame(animId);
  loop();
}

function resize() {
  if (!canvas) return;
  canvas.width  = canvas.parentElement.clientWidth  || window.innerWidth;
  canvas.height = canvas.parentElement.clientHeight || window.innerHeight - 57;
}

function simulate() {
  var w = canvas.width, h = canvas.height;
  var repulsion = 4000, springK = 0.013, damping = 0.82, center = 0.0007;

  for (var i = 0; i < nodes.length; i++) {
    var a = nodes[i];
    for (var j = i+1; j < nodes.length; j++) {
      var b  = nodes[j];
      var dx = a.x - b.x, dy = a.y - b.y;
      var d  = Math.sqrt(dx*dx + dy*dy) || 1;
      var f  = repulsion / (d*d);
      a.vx += (dx/d)*f; a.vy += (dy/d)*f;
      b.vx -= (dx/d)*f; b.vy -= (dy/d)*f;
    }
    a.vx += (w/2 - a.x) * center;
    a.vy += (h/2 - a.y) * center;
  }

  edges.forEach(function(e) {
    var a = e.source, b = e.target;
    var dx = b.x - a.x, dy = b.y - a.y;
    var d  = Math.sqrt(dx*dx + dy*dy) || 1;
    var tl = 110 + a.r + b.r;
    var f  = (d - tl) * springK;
    var fx = (dx/d)*f, fy = (dy/d)*f;
    a.vx += fx; a.vy += fy;
    b.vx -= fx; b.vy -= fy;
  });

  nodes.forEach(function(n) {
    if (n === draggedNode) {
      n.x = mouseX; n.y = mouseY; n.vx = 0; n.vy = 0;
    } else {
      n.vx *= damping; n.vy *= damping;
      n.x  += n.vx;   n.y  += n.vy;
    }
  });
}

function draw() {
  var w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Edges
  edges.forEach(function(e) {
    var isHov = hoveredNode && (e.source === hoveredNode || e.target === hoveredNode);
    ctx.beginPath();
    ctx.moveTo(e.source.x, e.source.y);
    ctx.lineTo(e.target.x, e.target.y);
    ctx.strokeStyle = isHov ? hoveredNode.color + '99' : '#30363d';
    ctx.lineWidth   = isHov ? 1.5 : 0.5;
    ctx.stroke();
  });

  // Nodes
  nodes.forEach(function(n) {
    var hov = n === hoveredNode;

    if (hov) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 7, 0, Math.PI*2);
      ctx.strokeStyle = n.color + '22';
      ctx.lineWidth   = 3;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
    ctx.fillStyle   = hov ? n.color+'30' : n.color+'18';
    ctx.strokeStyle = hov ? n.color      : n.color+'66';
    ctx.lineWidth   = hov ? 1.8 : 0.8;
    ctx.fill();
    ctx.stroke();

    // Post indicator dot
    ctx.beginPath();
    ctx.arc(n.x + n.r*0.55, n.y - n.r*0.55, 3, 0, Math.PI*2);
    ctx.fillStyle = n.color;
    ctx.fill();

    // Label
    var fs = n.r < 15 ? 9 : n.r < 19 ? 10 : 11;
    ctx.font          = '500 ' + fs + "px 'JetBrains Mono'";
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'middle';
    var lines   = n.label.split('\n');
    var lineH   = fs + 3;
    var startY  = n.y - ((lines.length-1) * lineH) / 2;
    lines.forEach(function(line, i) {
      ctx.shadowColor = '#0d1117';
      ctx.shadowBlur  = 5;
      ctx.fillStyle   = hov ? n.color : n.color+'dd';
      ctx.fillText(line, n.x, startY + i*lineH);
      ctx.shadowBlur  = 0;
    });
  });

  // Legend
  var lx = 20, ly = h - LEGEND.length * 24 - 16;
  ctx.font          = "11px 'JetBrains Mono'";
  ctx.textAlign     = 'left';
  ctx.textBaseline  = 'middle';
  LEGEND.forEach(function(l) {
    var col = COLORS[l.cat];
    ctx.beginPath();
    ctx.arc(lx+6, ly, 5, 0, Math.PI*2);
    ctx.fillStyle   = col+'33';
    ctx.strokeStyle = col;
    ctx.lineWidth   = 1;
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8b949e';
    ctx.fillText(l.label, lx+18, ly);
    ly += 24;
  });

  // Hint
  ctx.font      = "10px 'JetBrains Mono'";
  ctx.fillStyle = '#484f58';
  ctx.textAlign = 'right';
  ctx.fillText('clic para abrir · arrastrar para mover', w - 20, h - 20);
}

function loop() {
  simulate();
  draw();
  animId = requestAnimationFrame(loop);
}

function onMouseMove(e) {
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if (!draggedNode) {
    hoveredNode = null;
    for (var i = 0; i < nodes.length; i++) {
      var n  = nodes[i];
      var dx = n.x - mouseX, dy = n.y - mouseY;
      if (Math.sqrt(dx*dx + dy*dy) <= n.r + 4) { hoveredNode = n; break; }
    }
    if (hoveredNode) {
      canvas.classList.add('hovering');
      var tt = document.getElementById('tooltip');
      document.getElementById('tt-title').textContent = hoveredNode.label.replace('\n',' ');
      var catName = LEGEND.find(function(l){ return l.cat === hoveredNode.cat; });
      document.getElementById('tt-cat').textContent  = (catName ? catName.label : hoveredNode.cat) + ' · clic para abrir';
      document.getElementById('tt-cat').style.color  = hoveredNode.color;
      tt.style.left = (e.clientX + 16) + 'px';
      tt.style.top  = (e.clientY + 16) + 'px';
      tt.classList.add('visible');
    } else {
      canvas.classList.remove('hovering');
      document.getElementById('tooltip').classList.remove('visible');
    }
  } else {
    document.getElementById('tooltip').classList.remove('visible');
  }
}

function onMouseDown(e) {
  var rect = canvas.getBoundingClientRect();
  mouseDownX = e.clientX - rect.left;
  mouseDownY = e.clientY - rect.top;
  if (hoveredNode) draggedNode = hoveredNode;
}

function onMouseUp(e) {
  var rect    = canvas.getBoundingClientRect();
  var upX     = e.clientX - rect.left;
  var upY     = e.clientY - rect.top;
  var moved   = Math.sqrt(Math.pow(upX-mouseDownX,2) + Math.pow(upY-mouseDownY,2));
  if (moved < 5 && draggedNode && draggedNode.slug) {
    var slug = draggedNode.slug;
    draggedNode = null;
    closeGraph();
    setTimeout(function(){ window.location.href = '/posts/' + slug + '/'; }, 50);
  } else {
    draggedNode = null;
  }
}

/* =============================================
   NETWORK VISUALIZATION — Canvas Animation
   Renders the interactive homelab network topology
   ============================================= */

class NetworkVisualization {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.connections = [];
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.frame = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.colors = {
      cyan: '#00e5ff',
      cyanDim: 'rgba(0,229,255,0.15)',
      violet: '#7c3aed',
      violetDim: 'rgba(124,58,237,0.15)',
      orange: '#ff9f43',
      green: '#4ade80',
      textPrimary: '#e8e8f0',
      textMuted: '#6a6a88',
      surface: '#12121a',
      border: 'rgba(255,255,255,0.08)',
    };

    this.init();
  }

  init() {
    this.resize();
    this.buildTopology();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);

    if (this.nodes.length > 0) {
      this.buildTopology();
    }
  }

  buildTopology() {
    this.nodes = [];
    this.connections = [];
    this.particles = [];

    const cx = this.width / 2;
    const cy = this.height / 2;
    const isMobile = this.width < 768;
    const scale = isMobile ? 0.6 : 1;

    // --- Define Nodes ---
    // Layer 0: External
    this.addNode('internet', '🌐', 'Internet', cx - 280 * scale, cy - 120 * scale, 28, this.colors.textMuted, 'external');

    // Layer 1: Routers
    this.addNode('router1', '📡', 'Primary Router', cx - 140 * scale, cy - 40 * scale, 26, this.colors.cyan, 'network');
    this.addNode('router2', '🔀', 'Lab Router', cx - 140 * scale, cy + 80 * scale, 26, this.colors.cyan, 'network');

    // Layer 2: Server Core
    this.addNode('server', '🐧', 'Ubuntu Server', cx + 20 * scale, cy + 20 * scale, 34, this.colors.violet, 'server');

    // Layer 3: Container Layer
    this.addNode('docker', '🐳', 'Docker', cx + 160 * scale, cy - 60 * scale, 24, this.colors.cyan, 'container');
    this.addNode('dockge', '📦', 'Dockge', cx + 160 * scale, cy + 100 * scale, 24, this.colors.cyan, 'container');

    // Layer 4: Services
    this.addNode('nextcloud', '☁️', 'Nextcloud', cx + 290 * scale, cy - 130 * scale, 22, this.colors.green, 'service');
    this.addNode('jellyfin', '🎬', 'Jellyfin', cx + 290 * scale, cy - 40 * scale, 22, this.colors.green, 'service');
    this.addNode('uptime', '📊', 'Uptime Kuma', cx + 290 * scale, cy + 50 * scale, 22, this.colors.green, 'service');
    this.addNode('more', '➕', 'More Soon', cx + 290 * scale, cy + 140 * scale, 20, this.colors.textMuted, 'service');

    // Layer: Security Overlay
    this.addNode('cloudflare', '🛡️', 'CF Tunnels', cx - 30 * scale, cy - 160 * scale, 22, this.colors.orange, 'security');
    this.addNode('tailscale', '🔒', 'Tailscale', cx + 80 * scale, cy + 180 * scale, 22, this.colors.violet, 'security');
    this.addNode('zerotier', '🌀', 'ZeroTier', cx + 200 * scale, cy + 200 * scale, 22, this.colors.violet, 'security');

    // --- Device Nodes ---
    this.addNode('laptop', '💻', 'Laptop', cx - 140 * scale, cy + 180 * scale, 22, this.colors.textMuted, 'device');

    // --- Define Connections ---
    // Physical network path
    this.addConnection('internet', 'router1', this.colors.textMuted, 1.5, false);
    this.addConnection('router1', 'router2', this.colors.cyan, 2, true);
    this.addConnection('router2', 'server', this.colors.cyan, 2.5, true);
    this.addConnection('router2', 'laptop', this.colors.textMuted, 1, false);

    // Server to containers
    this.addConnection('server', 'docker', this.colors.violet, 2, true);
    this.addConnection('server', 'dockge', this.colors.violet, 2, true);

    // Containers to services
    this.addConnection('docker', 'nextcloud', this.colors.green, 1.5, true);
    this.addConnection('docker', 'jellyfin', this.colors.green, 1.5, true);
    this.addConnection('docker', 'uptime', this.colors.green, 1.5, true);
    this.addConnection('dockge', 'more', this.colors.textMuted, 1, false);

    // Security tunnels (dashed)
    this.addConnection('cloudflare', 'router1', this.colors.orange, 1.5, true, true);
    this.addConnection('cloudflare', 'server', this.colors.orange, 1.5, true, true);
    this.addConnection('tailscale', 'server', this.colors.violet, 1.2, true, true);
    this.addConnection('zerotier', 'server', this.colors.violet, 1.2, true, true);
  }

  addNode(id, emoji, label, x, y, radius, color, type) {
    this.nodes.push({
      id, emoji, label, x, y, radius, color, type,
      baseX: x, baseY: y,
      hovered: false,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  addConnection(fromId, toId, color, width, hasParticles, dashed = false) {
    this.connections.push({ fromId, toId, color, width, hasParticles, dashed });

    if (hasParticles) {
      const count = 2;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          fromId, toId, color,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
          size: 2 + Math.random() * 2,
        });
      }
    }
  }

  getNode(id) {
    return this.nodes.find(n => n.id === id);
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resize(), 200);
    });
  }

  drawConnection(from, to, color, width, dashed) {
    this.ctx.save();
    this.ctx.beginPath();
    if (dashed) {
      this.ctx.setLineDash([6, 4]);
    }
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.globalAlpha = 0.4;

    // Slightly curved line using quad bezier
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const offsetX = (to.y - from.y) * 0.1;
    const offsetY = (from.x - to.x) * 0.1;

    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, to.x, to.y);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawNode(node) {
    const ctx = this.ctx;
    const t = this.frame * 0.02;
    const pulse = Math.sin(t + node.pulsePhase) * 0.12 + 1;

    // Check hover
    const dx = this.mouse.x - node.x;
    const dy = this.mouse.y - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    node.hovered = dist < node.radius + 10;

    // Subtle floating
    node.x = node.baseX + Math.sin(t * 0.5 + node.pulsePhase) * 3;
    node.y = node.baseY + Math.cos(t * 0.4 + node.pulsePhase) * 3;

    const r = node.radius * (node.hovered ? 1.15 : 1);

    // Outer glow
    if (node.type !== 'external' && node.type !== 'device') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 12, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r + 12);
      glow.addColorStop(0, node.color + '20');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.globalAlpha = pulse;
      ctx.fill();
      ctx.restore();
    }

    // Node background
    ctx.save();
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.surface;
    ctx.fill();
    ctx.strokeStyle = node.hovered ? node.color : this.colors.border;
    ctx.lineWidth = node.hovered ? 2 : 1;
    ctx.stroke();
    ctx.restore();

    // Emoji
    ctx.save();
    ctx.font = `${r * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.emoji, node.x, node.y);
    ctx.restore();

    // Label
    ctx.save();
    ctx.font = `600 ${node.hovered ? 11 : 10}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = node.hovered ? node.color : this.colors.textMuted;
    ctx.fillText(node.label, node.x, node.y + r + 16);
    ctx.restore();
  }

  drawParticle(p) {
    const from = this.getNode(p.fromId);
    const to = this.getNode(p.toId);
    if (!from || !to) return;

    p.progress += p.speed;
    if (p.progress > 1) p.progress = 0;

    // Interpolate along the curved path
    const t = p.progress;
    const midX = (from.x + to.x) / 2 + (to.y - from.y) * 0.1;
    const midY = (from.y + to.y) / 2 + (from.x - to.x) * 0.1;

    const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * midY + t * t * to.y;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, p.size, 0, Math.PI * 2);

    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, p.size * 3);
    grad.addColorStop(0, p.color);
    grad.addColorStop(1, 'transparent');
    this.ctx.fillStyle = grad;
    this.ctx.globalAlpha = 0.8;
    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.frame++;

    // Draw connections
    for (const conn of this.connections) {
      const from = this.getNode(conn.fromId);
      const to = this.getNode(conn.toId);
      if (from && to) {
        this.drawConnection(from, to, conn.color, conn.width, conn.dashed);
      }
    }

    // Draw particles
    for (const p of this.particles) {
      this.drawParticle(p);
    }

    // Draw nodes
    for (const node of this.nodes) {
      this.drawNode(node);
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  new NetworkVisualization('hero-network-canvas');
});

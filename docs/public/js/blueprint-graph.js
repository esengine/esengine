/**
 * Blueprint Graph Renderer
 * Custom layout algorithm designed specifically for blueprint-style graphs
 */
(function() {
  const PIN_COLORS = {
    exec: '#ffffff',
    entity: '#00a0e0',
    component: '#7030c0',
    float: '#7ecd32',
    int: '#1cc4c4',
    bool: '#8c0000',
    string: '#e060e0',
    any: '#707070'
  };

  const HEADER_CLASSES = {
    event: 'event',
    function: 'function',
    pure: 'pure',
    flow: 'flow',
    math: 'math',
    time: 'time',
    debug: 'debug',
    variable: 'variable'
  };

  const H_GAP = 50;        // Horizontal gap between columns
  const V_GAP = 25;        // Vertical gap between nodes
  const START_X = 20;
  const START_Y = 20;

  function estimateNodeSize(node) {
    const headerHeight = 28;      // Match CSS: min-height 28px
    const pinRowHeight = 22;      // Match CSS: pin row ~22px
    const bodyPadding = 12;       // Top + bottom padding

    // Count all pins in body (each pin is its own row now)
    const inputExecCount = node.inputs ? node.inputs.filter(p => p.type === 'exec').length : 0;
    const inputDataCount = node.inputs ? node.inputs.filter(p => p.type !== 'exec').length : 0;
    const outputExecCount = node.outputs ? node.outputs.filter(p => p.type === 'exec' && !p.inHeader).length : 0;
    const outputDataCount = node.outputs ? node.outputs.filter(p => p.type !== 'exec' && !p.inHeader).length : 0;
    const totalPins = inputExecCount + inputDataCount + outputExecCount + outputDataCount;

    // Calculate height: header + body padding + all pin rows
    const bodyHeight = totalPins > 0 ? bodyPadding + (totalPins * pinRowHeight) : 0;
    const height = headerHeight + bodyHeight;

    // Calculate width based on content
    let maxLabelLen = node.title.length;
    if (node.inputs) {
      node.inputs.forEach(p => {
        const len = (p.label || '').length + (p.value ? String(p.value).length + 3 : 0);
        maxLabelLen = Math.max(maxLabelLen, len);
      });
    }
    if (node.outputs) {
      node.outputs.forEach(p => {
        maxLabelLen = Math.max(maxLabelLen, (p.label || '').length);
      });
    }

    const width = Math.max(110, Math.min(170, maxLabelLen * 8 + 40));
    return { width, height };
  }

  /**
   * Smart blueprint layout algorithm
   *
   * Uses weighted graph analysis:
   * - All connections matter (exec has higher weight)
   * - Topological sort for X ordering
   * - Force-directed optimization for Y positions
   */
  function autoLayout(graphData, maxWidth) {
    const nodes = graphData.nodes;
    const connections = graphData.connections;

    if (nodes.length === 0) return { positions: {}, sizes: {} };

    // Calculate node sizes
    const nodeSizes = {};
    nodes.forEach(n => { nodeSizes[n.id] = estimateNodeSize(n); });

    // Build maps
    const pinToNode = {};
    const nodeById = {};
    nodes.forEach(n => {
      nodeById[n.id] = n;
      (n.inputs || []).forEach(p => { pinToNode[p.id] = n.id; });
      (n.outputs || []).forEach(p => { pinToNode[p.id] = n.id; });
    });

    // Build weighted adjacency: outgoing[nodeId] = [{to, weight}]
    const outgoing = {};
    const incoming = {};
    nodes.forEach(n => { outgoing[n.id] = []; incoming[n.id] = []; });

    connections.forEach(c => {
      const from = pinToNode[c.from];
      const to = pinToNode[c.to];
      if (!from || !to || from === to) return;

      const weight = c.type === 'exec' ? 3 : 1;
      outgoing[from].push({ to, weight });
      incoming[to].push({ from, weight });
    });

    // Calculate node "depth" using weighted longest path
    const nodeDepth = {};
    const visited = new Set();
    const inProcess = new Set();

    function calcDepth(nodeId) {
      if (visited.has(nodeId)) return nodeDepth[nodeId];
      if (inProcess.has(nodeId)) return 0; // Cycle detected

      inProcess.add(nodeId);

      let maxPrevDepth = -1;
      incoming[nodeId].forEach(({ from, weight }) => {
        const prevDepth = calcDepth(from);
        maxPrevDepth = Math.max(maxPrevDepth, prevDepth);
      });

      inProcess.delete(nodeId);
      visited.add(nodeId);
      nodeDepth[nodeId] = maxPrevDepth + 1;
      return nodeDepth[nodeId];
    }

    // Calculate depth for all nodes
    nodes.forEach(n => calcDepth(n.id));

    // Group nodes by depth (column)
    const columnNodes = {};
    nodes.forEach(n => {
      const depth = nodeDepth[n.id];
      if (!columnNodes[depth]) columnNodes[depth] = [];
      columnNodes[depth].push(n.id);
    });

    // Sort columns
    const sortedColumns = Object.keys(columnNodes).map(Number).sort((a, b) => a - b);

    // Calculate X positions
    const columnX = {};
    let currentX = START_X;
    sortedColumns.forEach(col => {
      columnX[col] = currentX;
      let maxW = 0;
      columnNodes[col].forEach(id => {
        maxW = Math.max(maxW, nodeSizes[id].width);
      });
      currentX += maxW + H_GAP;
    });

    // Initialize Y positions - simple stacking first
    const positions = {};
    sortedColumns.forEach(col => {
      let y = START_Y;
      columnNodes[col].forEach(id => {
        positions[id] = { x: columnX[col], y };
        y += nodeSizes[id].height + V_GAP;
      });
    });

    // Force-directed optimization for Y positions (few iterations)
    for (let iter = 0; iter < 5; iter++) {
      const forces = {};
      nodes.forEach(n => { forces[n.id] = 0; });

      // Calculate forces from connections
      connections.forEach(c => {
        const from = pinToNode[c.from];
        const to = pinToNode[c.to];
        if (!from || !to || from === to) return;

        const weight = c.type === 'exec' ? 2 : 1;
        const fromY = positions[from].y + nodeSizes[from].height / 2;
        const toY = positions[to].y + nodeSizes[to].height / 2;
        const diff = toY - fromY;

        // Pull nodes toward each other
        forces[from] += diff * 0.1 * weight;
        forces[to] -= diff * 0.1 * weight;
      });

      // Apply forces
      nodes.forEach(n => {
        positions[n.id].y += forces[n.id];
        positions[n.id].y = Math.max(START_Y, positions[n.id].y);
      });

      // Resolve overlaps within columns
      sortedColumns.forEach(col => {
        const nodesInCol = columnNodes[col];
        nodesInCol.sort((a, b) => positions[a].y - positions[b].y);

        for (let i = 1; i < nodesInCol.length; i++) {
          const prevId = nodesInCol[i - 1];
          const currId = nodesInCol[i];
          const minY = positions[prevId].y + nodeSizes[prevId].height + V_GAP;
          if (positions[currId].y < minY) {
            positions[currId].y = minY;
          }
        }
      });
    }

    return { positions, sizes: nodeSizes };
  }

  function renderPinSvg(type, filled = true) {
    const color = PIN_COLORS[type] || PIN_COLORS.any;
    if (type === 'exec') {
      return `<svg width="12" height="12"><polygon points="1,1 11,6 1,11" fill="${filled ? '#fff' : 'none'}" stroke="${filled ? 'none' : '#fff'}" stroke-width="2"/></svg>`;
    }
    return `<svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="${filled ? color : 'none'}" stroke="${filled ? 'none' : color}" stroke-width="2"/></svg>`;
  }

  function renderNode(node, position, size) {
    const isEvent = node.category === 'event';
    const headerClass = HEADER_CLASSES[node.category] || 'function';

    let html = `<div class="bp-node" style="left: ${position.x}px; top: ${position.y}px; width: ${size.width}px;">`;
    html += `<div class="bp-node-header ${headerClass}">`;
    if (isEvent) html += `<span class="bp-node-header-icon"></span>`;
    html += `<span class="bp-node-header-title">${node.title}</span>`;

    const headerExec = node.outputs && node.outputs.find(p => p.type === 'exec' && p.inHeader);
    if (headerExec) {
      html += `<span class="bp-header-exec" data-pin="${headerExec.id}">${renderPinSvg('exec')}</span>`;
    }
    html += `</div>`;

    // Separate exec and data pins (matching node-editor order)
    const inputExecPins = (node.inputs || []).filter(p => p.type === 'exec');
    const inputDataPins = (node.inputs || []).filter(p => p.type !== 'exec');
    const outputExecPins = (node.outputs || []).filter(p => p.type === 'exec' && !p.inHeader);
    const outputDataPins = (node.outputs || []).filter(p => p.type !== 'exec' && !p.inHeader);

    const hasBody = inputExecPins.length > 0 || inputDataPins.length > 0 ||
                    outputDataPins.length > 0 || outputExecPins.length > 0;

    if (hasBody) {
      html += `<div class="bp-node-body">`;

      // Input exec pins first
      inputExecPins.forEach(pin => {
        const filled = pin.connected !== false;
        html += `<div class="bp-pin-row input">`;
        html += `<span class="bp-pin" data-pin="${pin.id}">${renderPinSvg(pin.type, filled)}</span>`;
        html += `<span class="bp-pin-label">${pin.label || ''}</span>`;
        html += `</div>`;
      });

      // Input data pins
      inputDataPins.forEach(pin => {
        const filled = pin.connected !== false;
        html += `<div class="bp-pin-row input">`;
        html += `<span class="bp-pin" data-pin="${pin.id}">${renderPinSvg(pin.type, filled)}</span>`;
        html += `<span class="bp-pin-label">${pin.label || ''}</span>`;
        if (pin.value !== undefined) html += `<span class="bp-pin-value">${pin.value}</span>`;
        html += `</div>`;
      });

      // Output data pins (pin first, then label - CSS row-reverse will flip them)
      outputDataPins.forEach(pin => {
        html += `<div class="bp-pin-row output">`;
        html += `<span class="bp-pin" data-pin="${pin.id}">${renderPinSvg(pin.type)}</span>`;
        html += `<span class="bp-pin-label">${pin.label || ''}</span>`;
        html += `</div>`;
      });

      // Output exec pins
      outputExecPins.forEach(pin => {
        html += `<div class="bp-pin-row output">`;
        html += `<span class="bp-pin" data-pin="${pin.id}">${renderPinSvg(pin.type)}</span>`;
        html += `<span class="bp-pin-label">${pin.label || ''}</span>`;
        html += `</div>`;
      });

      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Setup drag-to-scroll for graph container
   * Works with native overflow:auto scrolling
   */
  function setupDragScroll(container) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let scrollLeft = 0, scrollTop = 0;

    container.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.pageX - container.offsetLeft;
      startY = e.pageY - container.offsetTop;
      scrollLeft = container.scrollLeft;
      scrollTop = container.scrollTop;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.pageX - container.offsetLeft;
      const y = e.pageY - container.offsetTop;
      container.scrollLeft = scrollLeft - (x - startX);
      container.scrollTop = scrollTop - (y - startY);
    });

    container.addEventListener('mouseup', () => {
      isDragging = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mouseleave', () => {
      isDragging = false;
      container.style.cursor = 'grab';
    });
  }

  function renderConnections(container, graphData) {
    const svg = container.querySelector('.bp-connections');
    if (!svg) return;

    const content = container.querySelector('.bp-graph-content') || container;
    const graphRect = content.getBoundingClientRect();

    graphData.connections.forEach(c => {
      const fromPin = container.querySelector(`[data-pin="${c.from}"]`);
      const toPin = container.querySelector(`[data-pin="${c.to}"]`);
      if (!fromPin || !toPin) return;

      const fromRect = fromPin.getBoundingClientRect();
      const toRect = toPin.getBoundingClientRect();

      const x1 = fromRect.left - graphRect.left + fromRect.width / 2;
      const y1 = fromRect.top - graphRect.top + fromRect.height / 2;
      const x2 = toRect.left - graphRect.left + toRect.width / 2;
      const y2 = toRect.top - graphRect.top + toRect.height / 2;

      // Simple bezier curve
      const dx = Math.abs(x2 - x1) * 0.5;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`);
      path.setAttribute('class', `bp-conn ${c.type || 'exec'}`);
      svg.appendChild(path);
    });
  }

  function initBlueprintGraphs() {
    document.querySelectorAll('.bp-graph[data-graph]').forEach(container => {
      try {
        const graphData = JSON.parse(container.dataset.graph);
        if (!graphData.nodes || graphData.nodes.length === 0) {
          console.warn('Blueprint graph has no nodes');
          return;
        }

        // Get container width for layout calculation
        let containerWidth = container.parentElement?.offsetWidth || 0;
        if (containerWidth < 200) {
          containerWidth = 650;
        }

        const { positions, sizes } = autoLayout(graphData, containerWidth - 30);

        let maxX = 0, maxY = 0;
        graphData.nodes.forEach(n => {
          const pos = positions[n.id];
          const size = sizes[n.id];
          if (pos && size) {
            maxX = Math.max(maxX, pos.x + size.width);
            maxY = Math.max(maxY, pos.y + size.height);
          }
        });

        // Add generous padding to ensure all nodes visible
        maxX += 80;
        maxY += 80;

        // Set minimum height but allow natural expansion
        const containerHeight = Math.max(maxY, 200);
        container.style.minHeight = containerHeight + 'px';

        let html = `<div class="bp-graph-content" style="width:${maxX}px;height:${maxY}px;position:relative;">`;
        html += `<svg class="bp-connections" width="${maxX}" height="${maxY}"></svg>`;
        graphData.nodes.forEach(n => {
          if (positions[n.id] && sizes[n.id]) {
            html += renderNode(n, positions[n.id], sizes[n.id]);
          }
        });
        html += `</div>`;
        container.innerHTML = html;

        // Setup drag-to-scroll
        setupDragScroll(container);

        requestAnimationFrame(() => renderConnections(container, graphData));
      } catch (e) {
        console.error('Blueprint graph error:', e);
      }
    });

    // Legacy format
    document.querySelectorAll('.bp-graph:not([data-graph])').forEach(graph => {
      const nodes = graph.querySelectorAll('.bp-node');
      let maxX = 0, maxY = 0;
      nodes.forEach(node => {
        const left = parseInt(node.style.left) || 0;
        const top = parseInt(node.style.top) || 0;
        const width = parseInt(node.style.width) || 150;
        maxX = Math.max(maxX, left + width + 40);
        maxY = Math.max(maxY, top + node.offsetHeight + 40);
      });
      // Don't set fixed width - let CSS handle it
      graph.style.minHeight = Math.max(maxY, 120) + 'px';

      const svg = graph.querySelector('.bp-connections');
      if (!svg) return;
      svg.setAttribute('width', maxX);
      svg.setAttribute('height', Math.max(maxY, 120));

      const conns = JSON.parse(graph.dataset.connections || '[]');
      const graphRect = graph.getBoundingClientRect();

      conns.forEach(c => {
        const fromPin = graph.querySelector(`[data-pin="${c.from}"]`);
        const toPin = graph.querySelector(`[data-pin="${c.to}"]`);
        if (!fromPin || !toPin) return;

        const fromRect = fromPin.getBoundingClientRect();
        const toRect = toPin.getBoundingClientRect();

        const x1 = fromRect.left - graphRect.left + fromRect.width / 2;
        const y1 = fromRect.top - graphRect.top + fromRect.height / 2;
        const x2 = toRect.left - graphRect.left + toRect.width / 2;
        const y2 = toRect.top - graphRect.top + toRect.height / 2;

        const dx = Math.abs(x2 - x1) * 0.5;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`);
        path.setAttribute('class', `bp-conn ${c.type || 'exec'}`);
        svg.appendChild(path);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlueprintGraphs);
  } else {
    initBlueprintGraphs();
  }
})();

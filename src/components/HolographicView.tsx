import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';
import { Maximize2, Minimize2, Globe, Share2, ZoomIn, ZoomOut, RotateCw, Trash2, Plus, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export function HolographicView() {
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const mindmapContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'globe' | 'mindmap'>('globe');
  const [isRotating, setIsRotating] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Data (Real data from localStorage)
  const [data, setData] = useState<any[]>(() => {
    const tracked = JSON.parse(localStorage.getItem('aegis_tracked_targets') || '[]');
    return tracked.map((t: any, i: number) => ({
      id: t.id || `target-${i}`,
      name: t.id,
      connections: [],
      tags: [t.status]
    }));
  });

  useEffect(() => {
    if (viewMode === 'globe') {
      initGlobe();
    } else {
      initMindmap();
    }

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        globeContainerRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, [viewMode]);

  const initGlobe = () => {
    if (!globeContainerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, globeContainerRef.current.offsetWidth / globeContainerRef.current.offsetHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(globeContainerRef.current.offsetWidth, globeContainerRef.current.offsetHeight);
    globeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create globe
    const globeGeometry = new THREE.SphereGeometry(5, 32, 32);
    const globeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0a0a2a,
      transparent: true,
      opacity: 0.8,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.2
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Add user points on the globe
    const pointGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    
    data.forEach((user, i) => {
      const phi = Math.acos(-1 + (2 * i) / data.length);
      const theta = Math.sqrt(data.length * Math.PI) * phi;
      
      const x = 5.5 * Math.sin(phi) * Math.cos(theta);
      const y = 5.5 * Math.sin(phi) * Math.sin(theta);
      const z = 5.5 * Math.cos(phi);
      
      positions.push(x, y, z);
      colors.push(Math.random(), Math.random(), Math.random());
    });
    
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const pointMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const points = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(points);
    pointsRef.current = points;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00f3ff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (isRotating && globeRef.current && pointsRef.current) {
        globeRef.current.rotation.y += 0.002;
        pointsRef.current.rotation.y += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();
  };

  const initMindmap = () => {
    if (!mindmapContainerRef.current) return;
    
    const container = mindmapContainerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'w-full h-full');

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const nodes: Node[] = data.map(d => ({ id: d.id, name: d.name, group: d.tags[0] || 'default' }));
    const links: Link[] = [];
    
    // Create some random connections for visualization if none exist
    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length; i++) {
        const targetIndex = (i + 1) % nodes.length;
        links.push({ source: nodes[i].id, target: nodes[targetIndex].id });
      }
    }

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = g.append('g')
      .attr('stroke', '#00f3ff')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('circle')
      .attr('r', 8)
      .attr('fill', '#1a1b1e')
      .attr('stroke', '#00f3ff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 5px #00f3ff)');

    node.append('text')
      .text(d => d.name)
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  };

  const filteredData = data.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-full bg-[#050518] overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-[#00f3ff]/20 bg-[#0a0a2a]/50 backdrop-blur-xl p-4 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f3ff]/40" size={14} />
          <input
            type="text"
            placeholder="Search Intelligence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1b1e] border border-[#00f3ff]/20 rounded p-2 pl-9 text-xs text-white focus:outline-none focus:border-[#00f3ff] font-mono"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#00f3ff]/60 mb-2">Tracked Entities</h3>
          {filteredData.map((user) => (
            <div 
              key={user.id}
              className="p-3 bg-[#1a1b1e] border border-[#00f3ff]/10 rounded hover:border-[#00f3ff]/40 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-mono text-white group-hover:text-[#00f3ff] transition-colors">{user.name}</span>
                <span className="text-[8px] px-1 bg-[#00f3ff]/10 text-[#00f3ff] rounded uppercase">{user.tags[0]}</span>
              </div>
              <div className="text-[9px] text-white/40 font-mono">ID: {user.id}</div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#00f3ff]/20">
          <button className="w-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] py-2 rounded text-[10px] font-mono uppercase hover:bg-[#00f3ff]/20 transition-colors flex items-center justify-center gap-2">
            <Plus size={12} />
            Add Manual Node
          </button>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 z-10 flex gap-2">
          <button 
            onClick={() => setViewMode('globe')}
            className={cn(
              "px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all",
              viewMode === 'globe' ? "bg-[#00f3ff] text-black shadow-[0_0_20px_#00f3ff]" : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            Globe View
          </button>
          <button 
            onClick={() => setViewMode('mindmap')}
            className={cn(
              "px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all",
              viewMode === 'mindmap' ? "bg-[#ff00d6] text-white shadow-[0_0_20px_#ff00d6]" : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            Mindmap View
          </button>
        </div>

        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <button 
            onClick={() => setIsRotating(!isRotating)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/60 hover:text-white transition-all"
            title="Toggle Rotation"
          >
            <RotateCw size={16} className={isRotating ? "animate-spin-slow" : ""} />
          </button>
          <button 
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/60 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/60 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
        </div>

        <div className="w-full h-full">
          <div 
            ref={globeContainerRef} 
            className={cn("w-full h-full", viewMode !== 'globe' && "hidden")}
          />
          <div 
            ref={mindmapContainerRef} 
            className={cn("w-full h-full bg-[#050518]/80 backdrop-blur-sm", viewMode !== 'mindmap' && "hidden")}
          />
        </div>

        {/* HUD Elements */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
          <div className="p-4 bg-[#0a0a2a]/80 border border-[#00f3ff]/20 rounded-lg backdrop-blur-xl max-w-xs pointer-events-auto">
            <h4 className="text-[10px] font-mono uppercase text-[#00f3ff] mb-2 tracking-tighter">System Status</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-white/40">Active Nodes:</span>
                <span className="text-white">{data.length}</span>
              </div>
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-white/40">Sync Rate:</span>
                <span className="text-[#00ff9d]">98.4%</span>
              </div>
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-white/40">Override Protocol:</span>
                <span className="text-red-500">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pointer-events-auto">
            <div className="p-2 bg-white/5 border border-white/10 rounded flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" />
              <span className="text-[8px] font-mono text-white/60 uppercase tracking-widest">Live Intelligence Stream</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

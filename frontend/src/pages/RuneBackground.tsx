import React, { useEffect, useRef, useState } from 'react';

const RuneBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentMousePos = { x: 0, y: 0 };
    let currentIsDragging = false;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // LoL Region-inspired symbols (keeping them constant)
    const runeSymbols = [
      '⚔', '🛡', '⚡', '✦', '◈', '◆', '◊', '⬡', '⬢', '⬣',
      '▲', '▼', '◀', '▶', '●', '○', '◐', '◑', '☼', '✧',
      '✦', '✵', '❖', '◇', '◈', '◆', '⟡', '⟐', '⬟', '⬠'
    ];

    interface Rune {
      x: number;
      y: number;
      speed: number;
      symbol: string;
      opacity: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      baseX: number;
      baseY: number;
      isHovered: boolean;
      isDragged: boolean;
      velocityX: number;
      velocityY: number;
    }

    // Decreased frequency - fewer columns and runes
    const columns = Math.floor(canvas.width / 90); // Increased frequency (was 120)
    const runes: Rune[] = [];

    // Initialize runes in columns with more runes per column
    for (let i = 0; i < columns; i++) {
      const numRunesInColumn = Math.floor(Math.random() * 2) + 2; // 2-3 runes per column
      for (let j = 0; j < numRunesInColumn; j++) {
        const startY = Math.random() * canvas.height - canvas.height;
        runes.push({
          x: i * 90 + 45,
          y: startY,
          speed: 0.8 + Math.random() * 0.6, // Increased speed
          symbol: runeSymbols[Math.floor(Math.random() * runeSymbols.length)],
          opacity: 0.15 + Math.random() * 0.2,
          size: 24 + Math.random() * 18,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.008,
          baseX: i * 90 + 45,
          baseY: startY,
          isHovered: false,
          isDragged: false,
          velocityX: 0,
          velocityY: 0
        });
      }
    }

    let animationId: number;
    let scrollOffset = 0;
    let draggedRune: Rune | null = null;

    // Track scroll position
    const handleScroll = () => {
      scrollOffset = window.scrollY;
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      currentMousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    // Mouse down handler
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check if clicking on a rune
      for (const rune of runes) {
        const adjustedY = (rune.y + scrollOffset * 0.3) % (canvas.height + 300);
        const distance = Math.sqrt(
          Math.pow(mouseX - rune.x, 2) + Math.pow(mouseY - adjustedY, 2)
        );
        
        if (distance < rune.size * 1.5) {
          currentIsDragging = true;
          draggedRune = rune;
          rune.isDragged = true;
          break;
        }
      }
    };

    // Mouse up handler
    const handleMouseUp = () => {
      currentIsDragging = false;
      if (draggedRune) {
        draggedRune.isDragged = false;
        draggedRune = null;
      }
    };

    window.addEventListener('scroll', handleScroll);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    const animate = () => {
      // Darker gradient background - more toward black
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000510'); // Almost black with tiny blue tint
      gradient.addColorStop(0.5, '#00030f'); // Extremely dark navy
      gradient.addColorStop(1, '#000000'); // Pure black
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      runes.forEach(rune => {
        // Calculate position with scroll sync
        let adjustedY = (rune.y + scrollOffset * 0.3) % (canvas.height + 300);
        let currentX = rune.x;
        let currentY = adjustedY;

        // Check hover state
        const distance = Math.sqrt(
          Math.pow(currentMousePos.x - currentX, 2) + Math.pow(currentMousePos.y - currentY, 2)
        );
        rune.isHovered = distance < rune.size * 2;

        // Magnetic attraction effect when dragging
        if (currentIsDragging && !rune.isDragged && distance < 150) {
          const angle = Math.atan2(currentMousePos.y - currentY, currentMousePos.x - currentX);
          const attractionStrength = Math.max(0, 1 - distance / 150) * 3;
          rune.velocityX += Math.cos(angle) * attractionStrength;
          rune.velocityY += Math.sin(angle) * attractionStrength;
        }

        // If this rune is being dragged
        if (rune.isDragged && draggedRune === rune) {
          currentX = currentMousePos.x;
          currentY = currentMousePos.y;
          rune.x = currentX;
        } else {
          // Apply velocity for magnetic effect
          rune.x += rune.velocityX;
          currentX = rune.x;
          
          // Damping
          rune.velocityX *= 0.92;
          rune.velocityY *= 0.92;

          // Gradually return to base position
          const returnSpeed = 0.02;
          rune.x += (rune.baseX - rune.x) * returnSpeed;
        }
        
        ctx.save();
        
        // Translate to rune position for rotation
        ctx.translate(currentX, currentY);
        ctx.rotate(rune.rotation);
        
        // Determine glow intensity based on hover/drag state
        const glowMultiplier = rune.isHovered ? 3 : (rune.isDragged ? 4 : 1);
        const opacityMultiplier = rune.isHovered ? 2 : (rune.isDragged ? 2.5 : 1);
        
        // Enhanced golden glow effect - shinier and more yellow
        ctx.shadowColor = rune.isHovered || rune.isDragged ? '#FFD700' : '#F4C430';
        ctx.shadowBlur = 25 * glowMultiplier;
        
        // Outer glow - brighter yellow
        ctx.globalAlpha = rune.opacity * 0.4 * opacityMultiplier;
        ctx.fillStyle = '#FFD700'; // Bright gold yellow
        ctx.font = `${rune.size + 6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rune.symbol, 0, 0);
        
        // Main symbol with stronger glow - shinier gold
        ctx.globalAlpha = rune.opacity * opacityMultiplier;
        ctx.fillStyle = '#F4C430'; // Maximum yellow gold
        ctx.shadowBlur = 30 * glowMultiplier;
        ctx.shadowColor = '#FFED4E'; // Bright yellow glow
        ctx.font = `${rune.size}px serif`;
        ctx.fillText(rune.symbol, 0, 0);
        
        // Inner highlight - pure yellow
        ctx.globalAlpha = rune.opacity * 0.8 * opacityMultiplier;
        ctx.shadowBlur = 20 * glowMultiplier;
        ctx.shadowColor = '#FFFF00';
        ctx.fillStyle = '#FFFACD';
        ctx.font = `${rune.size - 2}px serif`;
        ctx.fillText(rune.symbol, 0, 0);
        
        ctx.restore();

        // Move and rotate rune (increased speed)
        if (!rune.isDragged) {
          rune.y += rune.speed;
          rune.baseY += rune.speed;
        }
        rune.rotation += rune.rotationSpeed * (rune.isHovered ? 3 : 1);

        // Reset when out of view
        if (rune.y > canvas.height + 300) {
          rune.y = -150;
          rune.baseY = -150;
          rune.x = rune.baseX;
          rune.velocityX = 0;
          rune.velocityY = 0;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-auto cursor-pointer"
      style={{ zIndex: 0 }}
    />
  );
};

export default RuneBackground;
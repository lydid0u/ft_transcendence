/**
 * VHS/CRT Effects Module
 * Handles all VHS and CRT visual effects for the application
 */

// Initialize the date/time display
function initDateTime(): void {
  const updateDateTime = (): void => {
    const dt = new Date();
    const pad = (v: number): string => v.toString().padStart(2, '0');
    const date = [pad(dt.getDate()), pad(dt.getMonth() + 1), dt.getFullYear()].join('/');
    const time = [pad(dt.getHours()), pad(dt.getMinutes()), pad(dt.getSeconds())].join(':');
    
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
      datetimeElement.textContent = date + '  ' + time;
    }
  };
  
  // Update immediately and then every second
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

// Draw VHS tracking effect on canvas
function drawTracking(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const W = canvas.width = window.innerWidth;
  const H = canvas.height = canvas.parentElement?.offsetHeight || 22;
  ctx.clearRect(0, 0, W, H);

  // VHS tracking band configuration
  const bands = Math.floor(3 + Math.random() * 2);
  const now = Date.now();
  const colors = ['#cfeaf2', '#fff', '#a4aab1'];
  
  for (let i = 0; i < bands; i++) {
    // Y position with wave effect
    const y = Math.floor(H/3) + i * Math.floor(H/3) + Math.sin(now/270+(i*2)) * 2;
    ctx.save();
    ctx.globalAlpha = 0.50 - Math.random() * 0.22;
    
    // Variable width segments
    for (let j = 0; j < 12; j++) {
      const segW = W/12;
      const offset = Math.sin(now/220+(i*1.7)+(j*0.31)) * 4;
      
      ctx.beginPath();
      ctx.moveTo(j * segW, y + offset);
      ctx.lineTo((j + 0.6) * segW, y + offset + Math.random() * 2);
      
      ctx.lineWidth = Math.random() < 0.7 ? 2.4 : 1;
      ctx.strokeStyle = Math.random() < 0.2 ? colors[2] : (Math.random() < 0.5 ? colors[0] : colors[1]);
      ctx.setLineDash(Math.random() < 0.5 ? [8, 7] : [4, 7]);
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 6;
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Setup tracking animation
function initTrackingEffect(): void {
  const animateTracking = (): void => {
    drawTracking(document.getElementById('trackingTop') as HTMLCanvasElement);
    drawTracking(document.getElementById('trackingBottom') as HTMLCanvasElement);
    requestAnimationFrame(animateTracking);
  };
  
  // Handle window resize
  window.addEventListener('resize', () => {
    drawTracking(document.getElementById('trackingTop') as HTMLCanvasElement);
    drawTracking(document.getElementById('trackingBottom') as HTMLCanvasElement);
  });
  
  // Start animation
  animateTracking();
}

// VHS transition effect
function vhsTransition(callback: () => void): void {
  const app = document.querySelector('#content');
  if (!app) return;
  
  // Create transition overlay
  const transitionDiv = document.createElement('div');
  transitionDiv.className = 'vhs-transition';
  transitionDiv.innerHTML = `<img src="media/vhs.gif" class="vhs-gif" alt="Transition VHS">`;
  
  // Add to DOM
  app.appendChild(transitionDiv);
  
  // Remove after animation and execute callback
  setTimeout(() => {
    app.removeChild(transitionDiv);
    if (callback) callback();
  }, 2000);
}

// Initialize all VHS/CRT effects
function initVHSEffects(): void {
  initDateTime();
  initTrackingEffect();
}

// Export functions
export {
  initVHSEffects,
  vhsTransition,
  drawTracking
};

/**
 * Rive Scroll Walk Controller
 * Handles Rive WebGL2 runtime initialization, State Machine 'Number' input (1 = Walk, 0 = Idle),
 * and maps vertical scroll momentum to smooth left-to-right horizontal walking travel.
 */

(function () {
  'use strict';

  // DOM Elements
  const canvas = document.getElementById('rive-canvas');
  const loadingOverlay = document.getElementById('loading-overlay');
  const statusDot = document.getElementById('status-dot');
  const statusLabel = document.getElementById('status-label');
  const statusNum = document.getElementById('status-num');
  const progressBar = document.getElementById('progress-bar-fill');
  const teleCurrentVal = document.getElementById('tele-current-val');
  const teleProgress = document.getElementById('tele-scroll-progress');
  const teleSpeed = document.getElementById('tele-scroll-speed');

  const walkSection = document.getElementById('walk-section');
  const walkingArena = document.getElementById('walking-arena');
  const characterSlider = document.getElementById('character-slider');
  const characterHolopod = document.getElementById('character-holopod');
  const milestoneItems = document.querySelectorAll('.milestone-item');
  const waypointNodes = document.querySelectorAll('.waypoint-node');

  // State Variables
  let riveInstance = null;
  let numberInput = null;
  let isWalking = false;
  let scrollTimeout = null;
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();
  let autoWalkInterval = null;

  // Initialize Rive instance
  riveInstance = new rive.Rive({
    src: 'animation.riv',
    canvas: canvas,
    autoplay: true,
    autoBind: true,
    stateMachines: 'State Machine 1',
    onLoad: () => {
      console.log('[Rive] Engine initialized successfully');
      riveInstance.resizeDrawingSurfaceToCanvas();

      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }

      try {
        const inputs = riveInstance.stateMachineInputs('State Machine 1');
        console.log('[Rive] State Machine Inputs:', inputs);

        if (inputs && inputs.length > 0) {
          numberInput = inputs.find(i => i.name.toLowerCase() === 'number') || inputs[0];
          console.log('[Rive] Bound to input:', numberInput.name);
          setMotionState(0); // Start in Idle
        }
      } catch (err) {
        console.error('[Rive] Error accessing inputs:', err);
      }
    },
    onError: (err) => {
      console.error('[Rive] Loading failed:', err);
      if (loadingOverlay) {
        loadingOverlay.innerHTML = '<div style="color: #ef4444; font-family: monospace;">Failed to load animation.riv. Ensure server is active.</div>';
      }
    }
  });

  // Set Rive state machine motion (1 = Walk, 0 = Idle)
  function setMotionState(val) {
    if (numberInput) {
      numberInput.value = val;
    }

    const walking = val === 1;
    if (isWalking === walking) return;
    isWalking = walking;

    if (walking) {
      statusDot?.classList.add('walk');
      if (statusLabel) statusLabel.textContent = 'WALK';
      if (statusNum) statusNum.textContent = '1';
      if (teleCurrentVal) {
        teleCurrentVal.textContent = '1 (Walk)';
        teleCurrentVal.className = 'val active';
      }
    } else {
      statusDot?.classList.remove('walk');
      if (statusLabel) statusLabel.textContent = 'IDLE';
      if (statusNum) statusNum.textContent = '0';
      if (teleCurrentVal) {
        teleCurrentVal.textContent = '0 (Idle)';
        teleCurrentVal.className = 'val idle';
      }
    }
  }

  // Update horizontal character position and milestone text appearance
  function updateScrollProgress() {
    const currentY = window.scrollY;
    const currentTime = Date.now();
    const deltaY = currentY - lastScrollY;
    const deltaTime = Math.max(1, currentTime - lastScrollTime);

    // Calculate overall scroll progress (0% - 100%)
    const maxDocScroll = document.documentElement.scrollHeight - window.innerHeight;
    const overallProgress = maxDocScroll > 0 ? (currentY / maxDocScroll) * 100 : 0;
    if (progressBar) progressBar.style.width = overallProgress + '%';

    // Calculate section progress specifically for the horizontal walk
    if (walkSection && walkingArena && characterSlider) {
      const sectionRect = walkSection.getBoundingClientRect();
      const sectionHeight = walkSection.offsetHeight;
      const scrollableDistance = sectionHeight - window.innerHeight;

      // Progress through the pinned section: 0 to 1
      let sectionProgress = 0;
      if (sectionRect.top <= 0) {
        sectionProgress = Math.min(1, Math.max(0, -sectionRect.top / scrollableDistance));
      }

      // Compute horizontal translation across the arena width
      const arenaWidth = walkingArena.clientWidth;
      const sliderWidth = characterSlider.clientWidth;
      const maxTravel = Math.max(0, arenaWidth - sliderWidth);
      const targetX = sectionProgress * maxTravel;

      characterSlider.style.transform = `translateX(${targetX}px)`;

      // Direction facing (flip horizontally when moving backwards / scrolling up)
      if (deltaY > 1) {
        characterHolopod.style.transform = 'scaleX(1)';
      } else if (deltaY < -1) {
        characterHolopod.style.transform = 'scaleX(-1)';
      }

      // Activate milestone text cards and waypoint nodes based on character location
      // 4 checkpoints: 0% - 25%, 25% - 50%, 50% - 75%, 75% - 100%
      const activeIndex = Math.min(
        milestoneItems.length - 1,
        Math.floor(sectionProgress * milestoneItems.length)
      );

      milestoneItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });

      waypointNodes.forEach((node, idx) => {
        node.classList.toggle('reached', sectionProgress >= (idx / (waypointNodes.length - 1)) * 0.9);
      });

      // Update telemetry readout
      if (teleProgress) {
        teleProgress.textContent = Math.round(sectionProgress * 100) + '%';
      }
    }

    // Velocity readout
    const speed = Math.round(Math.abs(deltaY) / (deltaTime / 1000));
    if (teleSpeed) {
      teleSpeed.textContent = speed + ' px/s';
    }

    lastScrollY = currentY;
    lastScrollTime = currentTime;

    // Trigger Walk animation while active
    setMotionState(1);

    // Debounced return to Idle when scrolling pauses
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      setMotionState(0);
      if (teleSpeed) teleSpeed.textContent = '0 px/s';
    }, 180);
  }

  // Global manual testing functions
  window.manualState = function (val) {
    if (autoWalkInterval) {
      clearInterval(autoWalkInterval);
      autoWalkInterval = null;
      document.getElementById('btn-auto')?.classList.remove('active');
    }
    setMotionState(val);
    document.getElementById('btn-idle')?.classList.toggle('active', val === 0);
    document.getElementById('btn-walk')?.classList.toggle('active', val === 1);
  };

  window.toggleAutoWalk = function () {
    const btnAuto = document.getElementById('btn-auto');
    if (autoWalkInterval) {
      clearInterval(autoWalkInterval);
      autoWalkInterval = null;
      btnAuto?.classList.remove('active');
      setMotionState(0);
      document.getElementById('btn-idle')?.classList.add('active');
      document.getElementById('btn-walk')?.classList.remove('active');
    } else {
      btnAuto?.classList.add('active');
      document.getElementById('btn-idle')?.classList.remove('active');
      document.getElementById('btn-walk')?.classList.remove('active');
      let state = 1;
      setMotionState(state);
      autoWalkInterval = setInterval(() => {
        state = state === 1 ? 0 : 1;
        setMotionState(state);
      }, 1500);
    }
  };

  // Event Listeners
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('wheel', updateScrollProgress, { passive: true });
  window.addEventListener('touchmove', updateScrollProgress, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.code)) {
      updateScrollProgress();
    }
  });

  window.addEventListener('resize', () => {
    if (riveInstance) {
      riveInstance.resizeDrawingSurfaceToCanvas();
    }
    updateScrollProgress();
  });

  // Initial call
  updateScrollProgress();
})();

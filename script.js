/**
 * Rive Dual-Section Controller
 * 1. Top Section: Sticky scroll-driven horizontal walk journey from 0% left to 100% arrival right.
 * 2. Bottom Section: Split grid with click button on left and live animation on right to toggle Idle/Walk.
 */

(function () {
  'use strict';

  // Elements - Top Walk Section
  const canvasWalk = document.getElementById('rive-canvas-walk');
  const loadingOverlay = document.getElementById('loading-overlay');
  const statusDot = document.getElementById('status-dot');
  const statusLabel = document.getElementById('status-label');
  const statusNum = document.getElementById('status-num');
  const progressBar = document.getElementById('progress-bar-fill');

  const walkSection = document.getElementById('walk-section');
  const walkingArena = document.getElementById('walking-arena');
  const characterSlider = document.getElementById('character-slider');
  const characterHolopod = document.getElementById('character-holopod');
  const milestoneItems = document.querySelectorAll('.milestone-item');
  const waypointNodes = document.querySelectorAll('.waypoint-node');

  // Elements - Bottom Interactive Section
  const canvasInteractive = document.getElementById('rive-canvas-interactive');
  const btnToggleState = document.getElementById('btn-toggle-state');
  const btnToggleText = document.getElementById('btn-toggle-text');
  const btnToggleIcon = document.getElementById('btn-toggle-icon');
  const interactiveStatusDot = document.getElementById('interactive-status-dot');
  const interactiveStatusLabel = document.getElementById('interactive-status-label');
  const pillIdle = document.getElementById('pill-idle');
  const pillWalk = document.getElementById('pill-walk');

  // State Variables
  let riveWalkInstance = null;
  let walkNumberInput = null;
  let isWalkActive = false;
  let scrollTimeout = null;
  let lastScrollY = window.scrollY;

  let riveInteractiveInstance = null;
  let interactiveNumberInput = null;
  let interactiveState = 0; // 0 = Idle, 1 = Walk

  let loadedCount = 0;
  function checkAllLoaded() {
    loadedCount++;
    if (loadedCount >= 2 && loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }

  // =========================================================================
  // 1. Initialize Sticky Walk Rive Instance
  // =========================================================================
  riveWalkInstance = new rive.Rive({
    src: 'animation.riv',
    canvas: canvasWalk,
    autoplay: true,
    autoBind: true,
    stateMachines: 'State Machine 1',
    onLoad: () => {
      console.log('[Rive Walk] Initialized successfully');
      riveWalkInstance.resizeDrawingSurfaceToCanvas();
      
      try {
        const inputs = riveWalkInstance.stateMachineInputs('State Machine 1');
        if (inputs && inputs.length > 0) {
          walkNumberInput = inputs.find(i => i.name.toLowerCase() === 'number') || inputs[0];
          setWalkMotion(0); // Start at Idle
        }
      } catch (err) {
        console.error('[Rive Walk] Error accessing inputs:', err);
      }
      checkAllLoaded();
    },
    onError: (err) => {
      console.error('[Rive Walk] Failed to load:', err);
      checkAllLoaded();
    }
  });

  // Set Top Walk Rive Motion (1 = Walk, 0 = Idle)
  function setWalkMotion(val) {
    if (walkNumberInput) {
      walkNumberInput.value = val;
    }

    const walking = val === 1;
    if (isWalkActive === walking) return;
    isWalkActive = walking;

    if (walking) {
      statusDot?.classList.add('walk');
      if (statusLabel) statusLabel.textContent = 'WALK';
      if (statusNum) statusNum.textContent = '1';
    } else {
      statusDot?.classList.remove('walk');
      if (statusLabel) statusLabel.textContent = 'IDLE';
      if (statusNum) statusNum.textContent = '0';
    }
  }

  // =========================================================================
  // 2. Initialize Bottom Interactive Rive Instance
  // =========================================================================
  riveInteractiveInstance = new rive.Rive({
    src: 'animation.riv',
    canvas: canvasInteractive,
    autoplay: true,
    autoBind: true,
    stateMachines: 'State Machine 1',
    onLoad: () => {
      console.log('[Rive Interactive] Initialized successfully');
      riveInteractiveInstance.resizeDrawingSurfaceToCanvas();

      try {
        const inputs = riveInteractiveInstance.stateMachineInputs('State Machine 1');
        if (inputs && inputs.length > 0) {
          interactiveNumberInput = inputs.find(i => i.name.toLowerCase() === 'number') || inputs[0];
          setInteractiveMotion(0); // Start at Idle
        }
      } catch (err) {
        console.error('[Rive Interactive] Error accessing inputs:', err);
      }
      checkAllLoaded();
    },
    onError: (err) => {
      console.error('[Rive Interactive] Failed to load:', err);
      checkAllLoaded();
    }
  });

  // Set Bottom Interactive Rive Motion (0 = Idle, 1 = Walk)
  function setInteractiveMotion(val) {
    interactiveState = val;
    if (interactiveNumberInput) {
      interactiveNumberInput.value = val;
    }

    const isWalk = val === 1;
    if (btnToggleState) {
      btnToggleState.classList.toggle('is-walk', isWalk);
    }
    if (btnToggleText) {
      btnToggleText.textContent = isWalk ? 'Click to Idle' : 'Click to Walk';
    }
    if (btnToggleIcon) {
      btnToggleIcon.textContent = isWalk ? '⏸' : '⚡';
    }
    if (interactiveStatusDot) {
      interactiveStatusDot.classList.toggle('is-walk', isWalk);
    }
    if (interactiveStatusLabel) {
      interactiveStatusLabel.textContent = isWalk ? 'Current State: WALK' : 'Current State: IDLE';
    }
    if (pillIdle) pillIdle.classList.toggle('active', !isWalk);
    if (pillWalk) pillWalk.classList.toggle('active', isWalk);
  }

  // Public Click handler for the bottom section button
  window.toggleInteractiveState = function () {
    const nextState = interactiveState === 1 ? 0 : 1;
    setInteractiveMotion(nextState);
  };

  // =========================================================================
  // 3. Scroll Handler for Sticky Left-to-Right Walk
  // =========================================================================
  function handleScroll() {
    const currentY = window.scrollY;
    const deltaY = currentY - lastScrollY;

    // Overall document scroll progress bar
    const maxDocScroll = document.documentElement.scrollHeight - window.innerHeight;
    const overallProgress = maxDocScroll > 0 ? (currentY / maxDocScroll) * 100 : 0;
    if (progressBar) progressBar.style.width = overallProgress + '%';

    // Sticky walk calculation from start (0%) to 100% arrival
    if (walkSection && walkingArena && characterSlider) {
      const sectionHeight = walkSection.offsetHeight;
      const scrollableDistance = sectionHeight - window.innerHeight;

      // Progress from 0 (at scrollY=0) to 1.0 (at 100% arrival)
      let progress = 0;
      if (scrollableDistance > 0) {
        progress = Math.min(1, Math.max(0, currentY / scrollableDistance));
      }

      // Compute horizontal translation across the arena width
      const arenaWidth = walkingArena.clientWidth;
      const sliderWidth = characterSlider.clientWidth;
      const maxTravel = Math.max(0, arenaWidth - sliderWidth);
      const targetX = progress * maxTravel;

      characterSlider.style.transform = `translateX(${targetX}px)`;

      // Direction facing (flip horizontally when moving backwards / scrolling up)
      if (deltaY > 1) {
        characterHolopod.style.transform = 'scaleX(1)';
      } else if (deltaY < -1) {
        characterHolopod.style.transform = 'scaleX(-1)';
      }

      // Highlight milestones based on progress
      const activeIndex = Math.min(
        milestoneItems.length - 1,
        Math.floor(progress * milestoneItems.length)
      );

      milestoneItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });

      waypointNodes.forEach((node, idx) => {
        node.classList.toggle('reached', progress >= (idx / (waypointNodes.length - 1)) * 0.95);
      });

      // While inside the sticky walk section, scrolling triggers Walk
      if (currentY <= scrollableDistance + 100) {
        setWalkMotion(1);

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setWalkMotion(0);
        }, 180);
      }
    }

    lastScrollY = currentY;
  }

  // Event Listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('wheel', handleScroll, { passive: true });
  window.addEventListener('touchmove', handleScroll, { passive: true });

  window.addEventListener('resize', () => {
    if (riveWalkInstance) riveWalkInstance.resizeDrawingSurfaceToCanvas();
    if (riveInteractiveInstance) riveInteractiveInstance.resizeDrawingSurfaceToCanvas();
    handleScroll();
  });

  // Initial update
  handleScroll();
})();

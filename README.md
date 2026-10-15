# 🚶‍♂️ Rive Scroll-Driven Walk Animation

An interactive, scroll-driven web experience using the **[Rive Web (JS) Runtime](https://rive.app/docs/runtimes/web/web-js)** (`@rive-app/webgl2`). 

As you scroll down the page, a character animation moves across the screen from the **left side to the right side**. When the user scrolls, the character plays its **Walk** animation; when scrolling stops, the character seamlessly transitions back to its **Idle** stance. Along the journey, horizontal milestone story cards and waypoint ground beacons activate in sync with the character's progress.

---

## 🌟 Key Features

1. **Sticky Scroll Walk Right from the Start**:
   - The interactive walk section begins immediately at the top of the page.
   - Pinned sticky as you scroll: the character starts at `0%` on the far left and travels horizontally until `100% ARRIVAL` at the far right.
   - Once 100% arrival is reached, scrolling continues down naturally to reveal the bottom section.
   - Scrolling down triggers `Number = 1` (Walk), while pausing resets `Number = 0` (Idle).
   - Scrolling backwards flips the character horizontally (`scaleX(-1)`) to walk back to the left.

2. **Dynamic Story Milestones & Ground Beacons**:
   - Four milestone cards and neon ground nodes activate in sequence as the character reaches them:
     - **Stage 01 (0%)**: *Left Origin*
     - **Stage 02 (33%)**: *Pacing Forward*
     - **Stage 03 (66%)**: *Midway Horizon*
     - **Stage 04 (100%)**: *Right Destination*

3. **Bottom Interactive Section (Button on Left, Animation on Right)**:
   - Below the walk journey, a two-column interactive lab provides immediate manual testing:
     - **Left Column**: Headline *"Click to change the state"*, interactive status card, and a large toggle button.
     - **Right Column**: A dedicated Rive animation holopod.
     - Clicking the button instantly toggles the Rive State Machine between **Idle** (`Number = 0`) and **Walk** (`Number = 1`).

---

## 📁 File Structure

```
scroll/
├── scroll.html         # Main HTML5 page markup and layout
├── style.css           # Modern dark UI, sticky stage, and glassmorphism styling
├── script.js           # Rive engine lifecycle, scroll physics, and milestone logic
├── animation.riv       # Rive binary vector animation file
└── README.md           # Documentation and usage guide
```

---

## 💻 How to Run on PC (Windows / Mac / Linux)

> **Important Note:** Modern web browsers block loading external binary assets (like `.riv` files) via `file:///` URLs due to CORS security policies. Therefore, the project must be opened through a local web server.

### Option 1: Using VS Code Live Server (Easiest & Recommended)

1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Extensions marketplace.
3. Right-click on `scroll.html` in the file explorer and select **"Open with Live Server"**.
4. Your browser will automatically open:
   ```
   http://127.0.0.1:5500/scroll.html
   ```

---

### Option 2: Using Python (Built-in on most PCs)

Open your terminal or command prompt (**PowerShell** or **Command Prompt** on Windows, **Terminal** on Mac):

1. Navigate to the project folder:
   ```bash
   cd path/to/scroll
   ```

2. Start a local HTTP server:
   - **Windows**:
     ```bash
     python -m http.server 8080
     ```
   - **Mac / Linux**:
     ```bash
     python3 -m http.server 8080
     ```

3. Open your browser and go to:
   ```
   http://localhost:8080/scroll.html
   ```

---

### Option 3: Using Node.js (`npx`)

If you have Node.js installed:

```bash
npx serve .
```
or
```bash
npx http-server -p 8080
```
Then visit:
```
http://localhost:8080/scroll.html
```

---

## 🎮 How to Use & Interact

| Interaction | Action | Result |
| :--- | :--- | :--- |
| **Mouse Wheel / Trackpad** | Scroll Down | Character walks forward toward the right (`Number = 1`) |
| **Mouse Wheel / Trackpad** | Scroll Up | Character flips left and walks back toward origin |
| **Stop Scrolling** | Pause movement | Character smoothly returns to Idle stance (`Number = 0`) |
| **Keyboard** | `Arrow Down`, `Page Down`, `Space` | Advances the character forward |
| **Keyboard** | `Arrow Up`, `Page Up` | Moves the character backward |
| **Quick Test Buttons** | Click `Walk (1)` | Manually tests the walking cycle |
| **Quick Test Buttons** | Click `Idle (0)` | Manually tests the idle pose |
| **Quick Test Buttons** | Click `Auto Demo` | Automatically toggles walk and idle in a continuous loop |
| **Replay Button** | Click `Return to Start ↑` | Smoothly scrolls the window back to the top |

---

## ⚙️ Customization Guide

### Changing the Rive File
In `script.js`, change the `src` property:
```javascript
riveInstance = new rive.Rive({
  src: 'your-animation.riv', // Replace with your Rive file name
  canvas: canvas,
  autoplay: true,
  stateMachines: 'State Machine 1', // Replace with your State Machine name
  ...
});
```

### Changing the Input Name or Values
If your state machine uses a different input name (e.g. `isWalking` or `speed`):
```javascript
// In script.js:
numberInput = inputs.find(i => i.name.toLowerCase() === 'your_input_name');
```

### Adjusting Scroll Walk Speed
To make the walk section longer or shorter, modify `height` in `style.css`:
```css
.walk-section {
  height: 450vh; /* Increase for a longer, slower walk; decrease for a faster walk */
}
```

---

## 📄 Dependencies & Technologies

- **[Rive Web (JS) WebGL2 Runtime](https://unpkg.com/@rive-app/webgl2)**: High-performance WASM vector graphics rendering.
- **Vanilla CSS**: Pure CSS layout without framework overhead.
- **Vanilla JavaScript**: Lightweight native DOM and scroll momentum math.
- **Google Fonts**: [Outfit](https://fonts.google.com/specimen/Outfit) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono).

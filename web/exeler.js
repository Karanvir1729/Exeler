// Page script for the love.js build: the Emscripten Module, the loading screen, the "How to play" tip and the
// fullscreen button. Runs as a deferred script before game.js and love.js (deferred scripts run in document order),
// so Module exists when game.js registers the data package and love.js's load event starts the game. No inline
// handlers: the Content-Security-Policy in _headers allows no inline script.

var loadingCanvas = document.getElementById("loadingCanvas");
var gameCanvas = document.getElementById("canvas");
var loadingContext = loadingCanvas.getContext("2d");
var statusLine = document.getElementById("status");
var tipDialog = document.getElementById("tip");

var TIP_AFTER_MS = 8000; // the tip comes up this long after the game starts
var TIP_FOR_MS = 6000; // and goes away by itself after this long, or on "Got it"

function goFullScreen() {
  if (gameCanvas.requestFullscreen) gameCanvas.requestFullscreen();
  else if (gameCanvas.webkitRequestFullScreen) gameCanvas.webkitRequestFullScreen();
}

// While the tip is up, the page behind it takes no clicks and does not scroll. Both are inline styles on body,
// released again in unlockPage() when the tip closes.
function lockPage() {
  document.body.style.overflow = "hidden";
  document.body.style.pointerEvents = "none";
}

function unlockPage() {
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("pointer-events");
}

function showTip() {
  if (tipDialog.open) return;
  tipDialog.show();
  lockPage();
  setTimeout(hideTip, TIP_FOR_MS);
}

function hideTip() {
  if (!tipDialog.open) return;
  tipDialog.close();
  unlockPage();
}

function drawLoadingText(text) {
  var canvas = loadingContext.canvas;
  loadingContext.fillStyle = "#121a2b";
  loadingContext.fillRect(0, 0, canvas.width, canvas.height);
  loadingContext.font = "48px Georgia, serif";
  loadingContext.textAlign = "center";
  loadingContext.fillStyle = "#e9d9a7";
  loadingContext.fillText("Exeler", canvas.width / 2, canvas.height / 2 - 40);
  loadingContext.font = "28px system-ui, sans-serif";
  loadingContext.fillStyle = "#c9d3e6";
  loadingContext.fillText(text, canvas.width / 2, canvas.height / 2 + 30);
  statusLine.textContent = text;
}

var started = false;
function gameReady() {
  loadingCanvas.style.display = "none";
  gameCanvas.style.visibility = "visible";
  statusLine.textContent = "Click the game to give it the keyboard.";
  if (started) return;
  started = true;
  document.body.classList.add("playing");
  setTimeout(showTip, TIP_AFTER_MS);
}

document.querySelector(".fullscreen").addEventListener("click", goFullScreen);
document.querySelector(".tip-ok").addEventListener("click", hideTip);
loadingCanvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
gameCanvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

window.addEventListener("load", function () { window.focus(); });
window.addEventListener("click", function () { window.focus(); });

// Space and the arrow keys drive the game, not the page.
window.addEventListener("keydown", function (e) {
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) e.preventDefault();
}, false);

var Module = {
  arguments: ["./"],
  INITIAL_MEMORY: 67108864,
  printErr: console.error.bind(console),
  canvas: (function () {
    gameCanvas.addEventListener("webglcontextlost", function (e) {
      drawLoadingText("The graphics context was lost. Reload the page to keep playing.");
      loadingCanvas.style.display = "";
      e.preventDefault();
    }, false);
    return gameCanvas;
  })(),
  setStatus: function (text) {
    if (text) {
      drawLoadingText(text);
    } else if (Module.remainingDependencies === 0) {
      gameReady();
    }
  },
  totalDependencies: 0,
  remainingDependencies: 0,
  monitorRunDependencies: function (left) {
    this.remainingDependencies = left;
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(left ? "Preparing… (" + (this.totalDependencies - left) + "/" + this.totalDependencies + ")" : "All downloads complete.");
  }
};
Module.setStatus("Downloading…");

window.onerror = function () {
  Module.setStatus("Something went wrong. Reload the page to try again.");
  Module.setStatus = function (text) {
    if (text) Module.printErr("[post-exception status] " + text);
  };
};

// love.js is the deferred script after this one; its load event fires once it has run.
document.querySelector('script[src="love.js"]').addEventListener("load", function () { Love(Module); });

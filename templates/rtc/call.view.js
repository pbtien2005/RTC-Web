import { store } from "../../frontend/src/ws/store.js";
import { closePeer } from "./peerConnection.js";
import { sendWS } from "../../frontend/src/ws/socket.js";

let root = null;
let state = "idle"; // idle|calling|ringing|connecting|connected|ended
let host = "";
const listeners = new Map();
function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  for (const h of set)
    try {
      h(payload);
    } catch {}
}
export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
}
export function mount(containerSelector = "#video-container") {
  host = document.querySelector(containerSelector);

  host.innerHTML = `
    <div id="cv-root" class="cv-root" style="display:flex;flex-direction:column;gap:12px">
      <!-- Header -->
      <div class="cv-header" style="display:flex;align-items:center;gap:8px">
        <div id="cv-avatar" style="width:32px;height:32px;border-radius:50%;background:#ddd;overflow:hidden"></div>
        <div id="cv-peer-name" style="font-weight:600"></div>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button id="cv-btn-end" class="btn btn-danger btn-sm" type="button">End</button>
        </div>
      </div>

      <!-- Video area -->
      <div class="cv-video" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <video id="cv-remote" autoplay playsinline style="width:100%;background:#000;border-radius:12px; transform: scaleX(-1)">    <div style="position:absolute;bottom:8px;left:8px;padding:2px 6px;background:rgba(0,0,0,.5);color:#fff;border-radius:6px;font-size:12px">
            You
          </div></video>
      
        <div style="position:relative">
          <video id="cv-local" autoplay playsinline muted
                 style="width:100%;background:#000;border-radius:12px;opacity:.95; transform: scaleX(-1)"></video>
          <div style="position:absolute;bottom:8px;left:8px;padding:2px 6px;background:rgba(0,0,0,.5);color:#fff;border-radius:6px;font-size:12px">
            You
          </div>
        </div>
      </div>

      <!-- States -->
      <div id="cv-states" style="display:flex;flex-direction:column;gap:6px">
        <div id="cv-state-calling"    style="display:none">📞 Calling…</div>
        <div id="cv-state-ringing"    style="display:none">🔔 Incoming call…</div>
        <div id="cv-state-connecting" style="display:none">⏳ Connecting…</div>
        <div id="cv-state-connected"  style="display:none">✅ Connected</div>
        <div id="cv-state-ended"      style="display:none">🛑 Call ended</div>
      </div>

      <!-- Controls -->
      <div class="cv-controls" style="display:flex;gap:8px">
        <button id="cv-btn-mic"   class="btn btn-outline-secondary btn-sm" type="button">🎙️ Mic</button>
        <button id="cv-btn-cam"   class="btn btn-outline-secondary btn-sm" type="button">📷 Cam</button>
        <button id="cv-btn-share" class="btn btn-outline-secondary btn-sm" type="button">🖥️ Share</button>
      </div>
    </div>
  `;
  root = host.querySelector("#cv-root");
  bindButtons();
  //   document.querySelector("#cv-peer-name").textContent = `${store.getTarget()}`;
  setCallState(state);
}
function bindButtons() {
  if (!root) {
    console.warn(
      "[CallView] root chưa khởi tạo, hãy gọi CallView.mount() trước."
    );
    return;
  }
  root.querySelector("#cv-btn-end")?.addEventListener("click", () => {
    emit("end");
  });
  root.querySelector("#cv-btn-mic")?.addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("active");
    emit("toggle-mic", !e.currentTarget.classList.contains("active"));
  });
  root.querySelector("#cv-btn-cam")?.addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("active");
    emit("toggle-cam", !e.currentTarget.classList.contains("active"));
  });
  root
    .querySelector("#cv-btn-share")
    ?.addEventListener("click", () => emit("share-screen"));
}

export function setCallState(next) {
  state = next;
  if (!root) return;
  show("#cv-state-calling", next === "calling");
  show("#cv-state-ringing", next === "ringing");
  show("#cv-state-connecting", next === "connecting");
  show("#cv-state-connected", next === "connected");
  show("#cv-state-ended", next === "ended");
  if (next == "ended") {
    host.innerHTML = "";
  }
  // enable End khi đang nối/đã nối
  const endBtn = root.querySelector("#cv-btn-end");
  if (endBtn)
    endBtn.disabled = !(next === "connecting" || next === "connected");
}

function show(sel, on) {
  const el = root.querySelector(sel);
  if (el) el.style.display = on ? "block" : "none";
}

export function bindLocalStream(stream) {
  const v = root.querySelector("#cv-local");
  if (v) v.srcObject = stream || null;
}
export function bindRemoteStream(stream) {
  const v = root.querySelector("#cv-remote");
  if (v) v.srcObject = stream || null;
}

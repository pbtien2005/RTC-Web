import { store } from "./store.js";

let peersListEl, targetEl, clearBtnEl;

export function mountPeers({ listSelector, targerSelector, clearBtnSelector }) {
  peersListEl = document.querySelector(listSelector);
  targetEl = document.querySelector(targerSelector);
  clearBtnEl = document.querySelector(clearBtnSelector);

  clearBtnEl?.addEventListener("click", () => {
    store.clearTarget();
    document.querySelector("#ws-target-id").textContent = "";
    renderTarget();
  });
  renderPeers();
  renderTarget();
}

export function upsertPeerAndRender(id) {
  store.upsertPeer(id);
  renderPeers();
}

export function renderPeers() {
  if (!peersListEl) return;
  peersListEl.innerHTML = "";
  for (const p of store.listPeers()) {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = p;

    const pick = document.createElement("button");
    pick.className = "btn btn-sm btn-outline-primary";
    pick.textContent = "Target";
    pick.addEventListener("click", () => {
      store.setTarget(p);
      renderTarget();
      document.querySelector("#ws-target-id").textContent = store.getTarget();
    });
    li.appendChild(pick);
    peersListEl.appendChild(li);
  }
}

function renderTarget() {
  if (!targetEl) return;
  targetEl.textContent = store.getTarget() ?? "none";
}

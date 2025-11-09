export const store = {
  clientId: null,
  targetId: null,
  peers: new Set(),

  setClientId(id) {
    this.clientId = id;
  },
  getClientId() {
    return this.clientId;
  },

  setTarget(id) {
    this.targetId = id;
  },
  clearTarget() {
    this.targetId = null;
  },
  getTarget() {
    return this.targetId;
  },

  upsertPeer(id) {
    const s = id;
    if (s && s != this.clientId) this.peers.add(s);
  },
  deletePeer(id) {
    this.peers.delete(id);
  },
  listPeers() {
    return Array.from(this.peers);
  },
};

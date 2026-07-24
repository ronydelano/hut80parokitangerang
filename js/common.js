/* ============================================================
   common.js — shared Auth + GitHub Contents API helpers
   Used by dokumentasi.html for the "add/delete photo" admin mode.
   Uses the SAME session key as hut80-progress.html, so logging in
   on one page keeps you logged in on the other (same browser tab).
   ============================================================ */

const SESSION_KEY = 'pm_online_session_v1';

// Same account list as hut80-progress.html — keep both in sync if you
// change passwords. Generate a new hash with:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
//     .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')));
const USERS = [
  { username: 'admin', hash: '7823c8b7d47f7fa403ff89f914520a686154de90ff9eabebea7a480a4a76203e' }
];

async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

const Auth = {
  user: null,
  restore(){
    const raw = sessionStorage.getItem(SESSION_KEY);
    if(raw){ try{ this.user = JSON.parse(raw).username; }catch(e){} }
  },
  isEditor(){ return !!this.user; },
  async login(username, password){
    if(!window.isSecureContext){
      throw new Error('Login requires HTTPS (or localhost).');
    }
    const hash = await sha256Hex(password);
    const match = USERS.find(u => u.username === username && u.hash === hash);
    if(!match) throw new Error('Invalid username or password.');
    this.user = username;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({username}));
  },
  logout(){
    this.user = null;
    sessionStorage.removeItem(SESSION_KEY);
  }
};

/* ============================================================
   GitHubStore — generic read/write for any file in the repo
   (JSON metadata or binary/image content), using the same
   DEFAULT_GH_CONFIG-style setup as hut80-progress.html.
   ============================================================ */
const GH_CONFIG_KEY = 'pm_online_gh_config_v1';

function makeGitHubStore(defaultOwner, defaultRepo, defaultBranch){
  return {
    cfg: { owner: defaultOwner, repo: defaultRepo, branch: defaultBranch, token: '' },

    load(){
      const raw = localStorage.getItem(GH_CONFIG_KEY);
      if(raw){
        try{
          const saved = JSON.parse(raw);
          // Only take the token from local storage — owner/repo/branch stay
          // fixed to what this page was configured with, for consistency.
          if(saved.token) this.cfg.token = saved.token;
        }catch(e){}
      }
    },
    saveToken(token){
      this.cfg.token = token;
      const raw = localStorage.getItem(GH_CONFIG_KEY);
      let saved = {};
      if(raw){ try{ saved = JSON.parse(raw); }catch(e){} }
      saved.token = token;
      localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(saved));
    },
    isConfigured(){ return !!(this.cfg.owner && this.cfg.repo); },
    canWrite(){ return this.isConfigured() && !!this.cfg.token; },

    apiUrl(path){
      return `https://api.github.com/repos/${this.cfg.owner}/${this.cfg.repo}/contents/${encodeURI(path)}`;
    },
    authHeaders(){
      return this.cfg.token ? { Authorization: `token ${this.cfg.token}` } : {};
    },

    /** Get just the sha of a file (works for JSON or binary files). Returns null if missing. */
    async getSha(path){
      const url = `${this.apiUrl(path)}?ref=${encodeURIComponent(this.cfg.branch)}&t=${Date.now()}`;
      const res = await fetch(url, { headers: { ...this.authHeaders(), Accept: 'application/vnd.github+json' } });
      if(res.status === 404) return null;
      if(!res.ok) throw new Error(`GitHub read failed (${res.status})`);
      const json = await res.json();
      return json.sha;
    },

    /** Read a JSON file. Returns null if the file doesn't exist yet. */
    async fetchJson(path){
      const url = `${this.apiUrl(path)}?ref=${encodeURIComponent(this.cfg.branch)}&t=${Date.now()}`;
      const res = await fetch(url, { headers: { ...this.authHeaders(), Accept: 'application/vnd.github+json' } });
      if(res.status === 404) return { data: null, sha: null };
      if(!res.ok) throw new Error(`GitHub read failed (${res.status})`);
      const json = await res.json();
      const decoded = decodeURIComponent(escape(atob(json.content.replace(/\n/g, ''))));
      return { data: JSON.parse(decoded), sha: json.sha };
    },

    /** Write a JSON file (create or update). */
    async saveJson(path, obj, message){
      if(!this.canWrite()) throw new Error('No write access — log in and add a token first.');
      const existing = await this.fetchJson(path).catch(()=>({sha:null}));
      const body = {
        message: message || 'Update data',
        content: btoa(unescape(encodeURIComponent(JSON.stringify(obj, null, 2)))),
        branch: this.cfg.branch
      };
      if(existing.sha) body.sha = existing.sha;
      const res = await fetch(this.apiUrl(path), {
        method: 'PUT',
        headers: { ...this.authHeaders(), 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
        body: JSON.stringify(body)
      });
      if(!res.ok){
        const t = await res.text().catch(()=> '');
        throw new Error(`GitHub save failed (${res.status}) ${t.slice(0,150)}`);
      }
    },

    /** Upload a binary file (e.g. a photo) from a base64 data URL. */
    async uploadFile(path, dataUrl, message){
      if(!this.canWrite()) throw new Error('No write access — log in and add a token first.');
      const base64 = dataUrl.split(',')[1]; // strip "data:image/...;base64,"
      const body = {
        message: message || `Upload ${path}`,
        content: base64,
        branch: this.cfg.branch
      };
      const res = await fetch(this.apiUrl(path), {
        method: 'PUT',
        headers: { ...this.authHeaders(), 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
        body: JSON.stringify(body)
      });
      if(!res.ok){
        const t = await res.text().catch(()=> '');
        throw new Error(`Photo upload failed (${res.status}) ${t.slice(0,150)}`);
      }
    },

    /** Delete a file (used when removing a photo). Ignores 404s. */
    async deleteFile(path, message){
      if(!this.canWrite()) throw new Error('No write access — log in and add a token first.');
      const sha = await this.getSha(path);
      if(!sha) return; // already gone
      const res = await fetch(this.apiUrl(path), {
        method: 'DELETE',
        headers: { ...this.authHeaders(), 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
        body: JSON.stringify({ message: message || `Delete ${path}`, sha, branch: this.cfg.branch })
      });
      if(!res.ok && res.status !== 404){
        const t = await res.text().catch(()=> '');
        throw new Error(`Delete failed (${res.status}) ${t.slice(0,150)}`);
      }
    }
  };
}

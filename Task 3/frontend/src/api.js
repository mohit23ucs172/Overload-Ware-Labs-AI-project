const API = {
  base: import.meta.env.VITE_API_BASE || 'http://localhost:5000',
  token: '',
  setToken(t){ this.token = t },
  async fetch(path, opts={}){
    opts.headers = opts.headers || {}
    opts.headers['Content-Type'] = 'application/json'
    if(this.token) opts.headers['Authorization'] = 'Bearer ' + this.token
    const res = await fetch(this.base + path, opts)
    if(!res.ok){
      const err = await res.json().catch(()=>({message:res.statusText}))
      throw new Error(err.message || 'Request failed')
    }
    return res.json()
  },
  register(email, password){ return this.fetch('/api/auth/register', {method:'POST', body: JSON.stringify({email,password})}) },
  login(email, password){ return this.fetch('/api/auth/login', {method:'POST', body: JSON.stringify({email,password})}) },
  me(){ return this.fetch('/api/me') },
  listConversations(){ return this.fetch('/api/conversations') },
  createConversation(title){ return this.fetch('/api/conversations', {method:'POST', body: JSON.stringify({title})}) },
  getMessages(convId){ return this.fetch('/api/conversations/'+convId+'/messages') },
  postMessage(convId, sender, content){ return this.fetch('/api/conversations/'+convId+'/messages', {method:'POST', body: JSON.stringify({sender,content})}) }
}

export default API
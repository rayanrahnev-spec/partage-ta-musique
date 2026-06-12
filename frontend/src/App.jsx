import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, Search, Upload, BarChart3, Crown, Shield, User, Music, Cloud, PlusCircle } from "lucide-react";
import { api, setAuthToken } from "./lib/api";
import "./style.css";

const demoTracks = [
  { id: "demo1", title: "Bruxelles Minuit", artist_name: "NOVA INDÉ", genre: "Rap", plays: 8200, likes: 540, icon: "🌃", audio_url: "" },
  { id: "demo2", title: "Soleil d'été", artist_name: "LINA WAVE", genre: "Afro", plays: 6400, likes: 430, icon: "🌴", audio_url: "" },
  { id: "demo3", title: "Cœur froid", artist_name: "R-KID", genre: "R&B", plays: 5100, likes: 390, icon: "💙", audio_url: "" },
];

function App() {
  const [page, setPage] = useState("landing");
  const [token, setToken] = useState(localStorage.getItem("ptm_token") || "");
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState(demoTracks);
  const [artists, setArtists] = useState([]);
  const [now, setNow] = useState(null);
  const [status, setStatus] = useState("Mode démo");
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    if (token) setAuthToken(token);
    loadTracks();
    loadArtists();
  }, []);

  async function loadTracks() {
    try {
      const res = await api.get("/tracks");
      setTracks(res.data.tracks?.length ? res.data.tracks : demoTracks);
      setStatus("API connectée");
    } catch {
      setTracks(demoTracks);
      setStatus("Mode démo local");
    }
  }

  async function loadArtists() {
    try {
      const res = await api.get("/artists");
      setArtists(res.data.artists || []);
    } catch {
      setArtists([]);
    }
  }

  async function loginDemo() {
    try {
      const res = await api.post("/auth/login", { email: "demo@partagetamusique.com", password: "password123" });
      localStorage.setItem("ptm_token", res.data.token);
      setAuthToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      alert("Connecté à l’API.");
    } catch {
      alert("Backend non lancé ou seed non fait. Lance backend + PostgreSQL.");
    }
  }

  async function registerDemo() {
    try {
      const email = "demo" + Date.now() + "@partagetamusique.com";
      const res = await api.post("/auth/register", { email, password: "password123", publicName: "Nouveau Créateur" });
      localStorage.setItem("ptm_token", res.data.token);
      setAuthToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      alert("Compte créé.");
    } catch {
      alert("Impossible de créer le compte. Vérifie le backend.");
    }
  }

  async function createArtist(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const savedToken = localStorage.getItem("ptm_token");

    if (!savedToken) {
      alert("Tu n'es pas connecté. Clique d'abord sur Créer compte test.");
      return;
    }

    setAuthToken(savedToken);
    const fd = new FormData(form);

    try {
      await api.post("/artists", {
        publicName: fd.get("publicName"),
        bio: fd.get("bio")
      });

      form.reset();
      await loadArtists();
      alert("Artiste créé.");
    } catch (err) {
      alert(err.response?.data?.error || "Erreur création artiste");
      console.log(err.response?.data || err);
    }
  }

  async function uploadTrack(e) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);

    const savedToken = localStorage.getItem("ptm_token");
    if (savedToken) setAuthToken(savedToken);

    const form = new FormData();
    form.append("artistId", fd.get("artistId"));
    form.append("title", fd.get("title"));
    form.append("genre", fd.get("genre"));
    form.append("description", fd.get("description"));
    form.append("rightsConfirmed", "true");
    form.append("noUnauthorizedSamples", "true");
    form.append("audio", fd.get("audio"));
    form.append("cover", fd.get("cover"));

    try {
      await api.post("/tracks", form, { headers: { "Content-Type": "multipart/form-data" } });
      formElement.reset();
      await loadTracks();
      alert("Musique uploadée.");
    } catch (err) {
      alert(err.response?.data?.error || "Upload impossible. Vérifie connexion, artiste et fichier audio.");
    }
  }

  async function checkout(plan) {
    try {
      const res = await api.post("/subscriptions/checkout", { plan });
      if (res.data.checkoutUrl) window.open(res.data.checkoutUrl, "_blank");
      else alert("Checkout préparé.");
    } catch {
      alert("Connecte-toi et configure Stripe.");
    }
  }

  async function loadAdmin() {
    try {
      const res = await api.get("/admin/stats");
      setAdminStats(res.data);
    } catch {
      setAdminStats({ users: "?", tracks: tracks.length, reports: "?", revenue: "?" });
    }
  }

  return <div className="app">
    <aside className="sidebar">
      <div className="logo"><div>🎧</div><span>Partage<br/>ta musique</span></div>
      <Nav icon={<Home/>} label="Landing" id="landing" page={page} setPage={setPage}/>
      <Nav icon={<Music/>} label="Accueil" id="home" page={page} setPage={setPage}/>
      <Nav icon={<Search/>} label="Découvrir" id="discover" page={page} setPage={setPage}/>
      <Nav icon={<PlusCircle/>} label="Créer artiste" id="artistCreate" page={page} setPage={setPage}/>
      <Nav icon={<Upload/>} label="Publier" id="upload" page={page} setPage={setPage}/>
      <Nav icon={<BarChart3/>} label="Créateur" id="creator" page={page} setPage={setPage}/>
      <Nav icon={<Crown/>} label="Abonnements" id="premium" page={page} setPage={setPage}/>
      <Nav icon={<Shield/>} label="Admin" id="admin" page={page} setPage={(p)=>{setPage(p); loadAdmin();}}/>
      <Nav icon={<Cloud/>} label="Production" id="production" page={page} setPage={setPage}/>
      <div className="upgrade">
        <b>{status}</b>
        <p>{token ? "Token actif" : "Non connecté"}</p>
        <button onClick={loginDemo}>Connexion démo</button>
        <button onClick={registerDemo}>Créer compte test</button>
      </div>
    </aside>

    <main>
      <header className="topbar">
        <input placeholder="Rechercher..."/>
        <div className="account"><User size={18}/> {user?.publicName || user?.public_name || "Rayan Studio"}</div>
      </header>

      {page==="landing" && <Landing setPage={setPage}/>}
      {page==="home" && <HomePage tracks={tracks} setNow={setNow}/>}
      {page==="discover" && <Discover tracks={tracks} setNow={setNow}/>}
      {page==="artistCreate" && <ArtistCreate createArtist={createArtist} artists={artists}/>}
      {page==="upload" && <UploadPage uploadTrack={uploadTrack} artists={artists}/>}
      {page==="creator" && <Creator tracks={tracks} artists={artists}/>}
      {page==="premium" && <Premium checkout={checkout}/>}
      {page==="admin" && <Admin tracks={tracks} adminStats={adminStats}/>}
      {page==="production" && <Production/>}
    </main>

    <Player now={now}/>
  </div>
}

function Nav(p){return <button className={p.page===p.id?"nav active":"nav"} onClick={()=>p.setPage(p.id)}>{p.icon}{p.label}</button>}

function Landing({setPage}){return <section className="page"><div className="hero"><div><span className="pill">Startup V10</span><h1>Upload réel branché côté frontend.</h1><p>Création d’artiste, upload audio, cover image, lecture audio, API tracks, Stripe checkout et admin préparés.</p><button className="primary" onClick={()=>setPage("artistCreate")}>Créer artiste</button><button onClick={()=>setPage("upload")}>Publier un son</button></div><div className="phone"><div>React → API</div><div>Audio + Cover Upload</div><div>Audio Player</div><div className="phonePlayer">MVP connectable</div></div></div></section>}

function HomePage({tracks,setNow}){return <section className="page"><h1>Accueil</h1><div className="cards">{tracks.map(t=><Card key={t.id} t={t} setNow={setNow}/>)}</div></section>}

function Discover({tracks,setNow}){return <section className="page"><h1>Découvrir</h1><div className="list">{tracks.map(t=><Row key={t.id} t={t} setNow={setNow}/>)}</div></section>}

function ArtistCreate({createArtist, artists}){return <section className="page"><h1>Créer un profil artiste</h1><form className="panel" onSubmit={createArtist}><label>Nom artiste<input name="publicName" required placeholder="Ex : Rayan Studio"/></label><label>Bio<textarea name="bio" placeholder="Présente ton univers..."/></label><button className="primary">Créer artiste</button></form><h2>Artistes existants</h2><div className="list">{artists.map(a=><div className="row" key={a.id}><div className="thumb">⭐</div><div><b>{a.public_name}</b><p>{a.track_count || 0} titre(s)</p></div></div>)}</div></section>}

function UploadPage({uploadTrack, artists}){return <section className="page"><h1>Publier une musique</h1><div className="notice">Tu dois être connecté et avoir créé un artiste. Ajoute un MP3 et une image de couverture pour rendre le son plus professionnel.</div><form className="panel" onSubmit={uploadTrack}><label>Artiste<select name="artistId" required>{artists.map(a=><option key={a.id} value={a.id}>{a.public_name}</option>)}</select></label><label>Titre<input name="title" required placeholder="Titre du morceau"/></label><label>Genre<select name="genre"><option>Rap</option><option>Afro</option><option>R&B</option><option>Électro</option></select></label><label>Description<textarea name="description"/></label><label>Fichier audio<input name="audio" type="file" accept="audio/*" required/></label><label>Image de couverture<input name="cover" type="file" accept="image/*"/></label><div className="notice">En envoyant, tu confirmes que tu possèdes les droits et qu’il n’y a aucun sample non autorisé.</div><button className="primary">Uploader</button></form></section>}

function Creator({tracks,artists}){return <section className="page"><h1>Dashboard créateur</h1><div className="stats"><Info title={tracks.length} text="Titres affichés"/><Info title={artists.length} text="Artistes"/><Info title="Stripe" text="Checkout prêt"/><Info title="Supabase" text="Stockage prêt"/></div><div className="list">{tracks.map(t=><Row key={t.id} t={t} setNow={()=>{}}/>)}</div></section>}

function Premium({checkout}){return <section className="page"><h1>Abonnements</h1><div className="plans">{[{n:"Starter",k:"starter",p:"4,99€"},{n:"Pro",k:"pro",p:"9,99€"},{n:"Label",k:"label",p:"49€"}].map(x=><div className="plan" key={x.k}><h2>{x.n}</h2><div className="price">{x.p}/mois</div><button className="primary" onClick={()=>checkout(x.k)}>Payer</button></div>)}</div></section>}

function Admin({tracks, adminStats}){return <section className="page"><h1>Admin</h1><div className="stats"><Info title={adminStats?.tracks ?? tracks.length} text="Titres"/><Info title={adminStats?.users ?? "?"} text="Users"/><Info title={adminStats?.reports ?? "?"} text="Reports"/><Info title={adminStats?.revenue ?? "?"} text="MRR"/></div></section>}

function Production(){return <section className="page"><h1>Production</h1><div className="grid"><Info title="Frontend" text="Vercel"/><Info title="Backend" text="Render/Railway"/><Info title="DB" text="Supabase PostgreSQL"/><Info title="Audio" text="Supabase Storage"/><Info title="Paiement" text="Stripe"/><Info title="Légal" text="CGU/RGPD"/></div></section>}

function Card({t,setNow}){
  return <div className="card">
    <div className="cover" style={t.cover_url ? {backgroundImage:`url(${t.cover_url})`, backgroundSize:"cover", backgroundPosition:"center"} : {}}>
      {!t.cover_url && (t.icon || "🎧")}
    </div>
    <h3>{t.title}</h3>
    <p>{t.artist_name || t.artist} · {t.genre}</p>
    <button onClick={()=>setNow(t)}>▶</button>
  </div>
}

function Row({t,setNow}){
  return <div className="row">
    <div className="thumb" style={t.cover_url ? {backgroundImage:`url(${t.cover_url})`, backgroundSize:"cover", backgroundPosition:"center"} : {}}>
      {!t.cover_url && (t.icon || "🎧")}
    </div>
    <div><b>{t.title}</b><p>{t.artist_name || t.artist} · {t.genre}</p></div>
    <button onClick={()=>setNow(t)}>▶</button>
  </div>
}

function Info({title,text}){return <div className="info"><b>{title}</b><p>{text}</p></div>}

function Player({now}) {
  const src = now?.audio_url || "";
  return <div className="player">
    <div>{now ? `${now.title} — ${now.artist_name || now.artist}` : "Aucun titre sélectionné"}</div>
    {src ? <audio src={src} controls/> : <button onClick={()=>alert("Démo sans fichier audio.")}>▶</button>}
    <div className="bar"></div>
  </div>
}

createRoot(document.getElementById("root")).render(<App/>);

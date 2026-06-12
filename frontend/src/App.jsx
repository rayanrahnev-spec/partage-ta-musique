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
  const [query, setQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);

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
    const formElement = e.currentTarget;
    const savedToken = localStorage.getItem("ptm_token");

    if (!savedToken) {
      alert("Tu n'es pas connecté. Clique d'abord sur Créer compte test.");
      return;
    }

    setAuthToken(savedToken);

    const fd = new FormData(formElement);
    const form = new FormData();
    form.append("publicName", fd.get("publicName"));
    form.append("bio", fd.get("bio"));
    if (fd.get("avatar")) form.append("avatar", fd.get("avatar"));
    if (fd.get("banner")) form.append("banner", fd.get("banner"));

    try {
      await api.post("/artists", form, { headers: { "Content-Type": "multipart/form-data" } });
      formElement.reset();
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
async function likeTrack(trackId) {
    const savedToken = localStorage.getItem("ptm_token");

    if (!savedToken) {
      alert("Connecte-toi d'abord.");
      return;
    }

    setAuthToken(savedToken);

    try {
      const res = await api.post(`/likes/tracks/${trackId}`);
      await loadTracks();

      setNow(prev => {
        if (!prev || prev.id !== trackId) return prev;
        const currentLikes = Number(prev.likes) || 0;
        return {
          ...prev,
          likes: res.data.liked ? currentLikes + 1 : Math.max(currentLikes - 1, 0)
        };
      });
    } catch (err) {
      alert(err.response?.data?.error || "Impossible de liker.");
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

  const filteredTracks = tracks.filter(t => {
    const q = query.toLowerCase();
    return `${t.title || ""} ${t.artist_name || ""} ${t.artist || ""} ${t.genre || ""}`.toLowerCase().includes(q);
  });

  const selectedArtistTracks = selectedArtist
    ? tracks.filter(t => t.artist_id === selectedArtist.id || t.artist_name === selectedArtist.public_name)
    : [];

  const selectedArtistPlays = selectedArtistTracks.reduce((sum, t) => sum + (Number(t.plays) || 0), 0);

  return <div className="app">
    <aside className="sidebar">
      <div className="logo"><div>🎧</div><span>Partage<br/>ta musique</span></div>
      <Nav icon={<Home/>} label="Accueil pro" id="landing" page={page} setPage={setPage}/>
      <Nav icon={<Music/>} label="Musiques" id="home" page={page} setPage={setPage}/>
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
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher titre, artiste, genre..."/>
        <div className="account"><User size={18}/> {user?.publicName || user?.public_name || "Rayan Studio"}</div>
      </header>

      {page==="landing" && <Landing setPage={setPage} tracks={tracks} artists={artists} setNow={setNow} setSelectedArtist={setSelectedArtist}/>}
      {page==="home" && <HomePage tracks={filteredTracks} setNow={setNow}/>}
      {page==="discover" && <Discover tracks={filteredTracks} artists={artists} setNow={setNow} setSelectedArtist={setSelectedArtist}/>}
      {page==="artistCreate" && <ArtistCreate createArtist={createArtist} artists={artists} setSelectedArtist={setSelectedArtist}/>}
      {page==="upload" && <UploadPage uploadTrack={uploadTrack} artists={artists}/>}
      {page==="creator" && <Creator tracks={tracks} artists={artists} setSelectedArtist={setSelectedArtist}/>}
      {page==="premium" && <Premium checkout={checkout}/>}
      {page==="admin" && <Admin tracks={tracks} adminStats={adminStats}/>}
      {page==="production" && <Production/>}
    </main>

    {selectedArtist && (
      <ArtistModal
        artist={selectedArtist}
        tracks={selectedArtistTracks}
        totalPlays={selectedArtistPlays}
        setNow={setNow}
        onClose={() => setSelectedArtist(null)}
      />
    )}

  <Player now={now} likeTrack={likeTrack}/>
  </div>
}

function Nav(p){return <button className={p.page===p.id?"nav active":"nav"} onClick={()=>p.setPage(p.id)}>{p.icon}{p.label}</button>}

function Landing({setPage, tracks, artists, setNow, setSelectedArtist}){
  const latest = tracks.slice(0,4);
  const popularArtists = artists.slice(0,4);

  return <section className="page">
    <div className="hero">
      <div>
        <span className="pill">Plateforme musicale indépendante</span>
        <h1>Publie, découvre et fais grandir les artistes de demain.</h1>
        <p>Upload audio, covers, profils artistes, lecture en ligne, dashboard créateur et abonnement pro.</p>
        <button className="primary" onClick={()=>setPage("upload")}>Publier un son</button>
        <button onClick={()=>setPage("discover")}>Découvrir</button>
      </div>
      <div className="phone">
        <div>🔥 Derniers sons</div>
        <div>🎧 Covers + audio</div>
        <div>⭐ Profils artistes</div>
        <div className="phonePlayer">MVP en ligne</div>
      </div>
    </div>

    <SectionTitle title="Dernières sorties" action="Voir tout" onClick={()=>setPage("home")}/>
    <div className="cards">{latest.map(t=><Card key={t.id} t={t} setNow={setNow}/>)}</div>

    <SectionTitle title="Artistes à découvrir" action="Créer artiste" onClick={()=>setPage("artistCreate")}/>
    <div className="artist-grid">{popularArtists.length ? popularArtists.map(a=><ArtistCard key={a.id} artist={a} onOpen={setSelectedArtist}/>) : <Empty text="Crée ton premier artiste pour l’afficher ici."/>}</div>
  </section>
}

function SectionTitle({title, action, onClick}) {
  return <div className="section-title"><h2>{title}</h2>{action && <button onClick={onClick}>{action}</button>}</div>
}

function HomePage({tracks,setNow}){return <section className="page"><h1>Musiques</h1><div className="cards">{tracks.map(t=><Card key={t.id} t={t} setNow={setNow}/>)}</div></section>}

function Discover({tracks, artists, setNow, setSelectedArtist}){return <section className="page"><h1>Découvrir</h1><SectionTitle title="Artistes" /><div className="artist-grid">{artists.map(a=><ArtistCard key={a.id} artist={a} onOpen={setSelectedArtist}/>)}</div><SectionTitle title="Catalogue" /><div className="list">{tracks.map(t=><Row key={t.id} t={t} setNow={setNow}/>)}</div></section>}

function ArtistCreate({createArtist, artists, setSelectedArtist}){return <section className="page"><h1>Créer un profil artiste</h1><form className="panel" onSubmit={createArtist}><label>Nom artiste<input name="publicName" required placeholder="Ex : Rayan Studio"/></label><label>Bio<textarea name="bio" placeholder="Présente ton univers..."/></label><label>Avatar artiste<input name="avatar" type="file" accept="image/*"/></label><label>Bannière artiste<input name="banner" type="file" accept="image/*"/></label><button className="primary">Créer artiste</button></form><SectionTitle title="Artistes existants"/><div className="artist-grid">{artists.length ? artists.map(a=><ArtistCard key={a.id} artist={a} onOpen={setSelectedArtist}/>) : <Empty text="Aucun artiste pour l’instant."/>}</div></section>}

function UploadPage({uploadTrack, artists}){return <section className="page"><h1>Publier une musique</h1><div className="notice">Tu dois être connecté et avoir créé un artiste. Ajoute un MP3 et une image de couverture pour rendre le son plus professionnel.</div><form className="panel" onSubmit={uploadTrack}><label>Artiste<select name="artistId" required>{artists.map(a=><option key={a.id} value={a.id}>{a.public_name}</option>)}</select></label><label>Titre<input name="title" required placeholder="Titre du morceau"/></label><label>Genre<select name="genre"><option>Rap</option><option>Afro</option><option>R&B</option><option>Électro</option></select></label><label>Description<textarea name="description"/></label><label>Fichier audio<input name="audio" type="file" accept="audio/*" required/></label><label>Image de couverture<input name="cover" type="file" accept="image/*"/></label><div className="notice">En envoyant, tu confirmes que tu possèdes les droits et qu’il n’y a aucun sample non autorisé.</div><button className="primary">Uploader</button></form></section>}

function Creator({tracks,artists,setSelectedArtist}){return <section className="page"><h1>Dashboard créateur</h1><div className="stats"><Info title={tracks.length} text="Titres affichés"/><Info title={artists.length} text="Artistes"/><Info title="Supabase" text="Stockage audio/covers"/><Info title="Stripe" text="Checkout prêt"/></div><SectionTitle title="Tes artistes"/><div className="artist-grid">{artists.map(a=><ArtistCard key={a.id} artist={a} onOpen={setSelectedArtist}/>)}</div><SectionTitle title="Tes musiques"/><div className="list">{tracks.map(t=><Row key={t.id} t={t} setNow={()=>{}}/>)}</div></section>}

function Premium({checkout}){return <section className="page"><h1>Abonnements</h1><div className="plans">{[{n:"Starter",k:"starter",p:"4,99€",d:"Plus de publications"},{n:"Pro",k:"pro",p:"9,99€",d:"Profil pro + statistiques"},{n:"Label",k:"label",p:"49€",d:"Multi-artistes"}].map(x=><div className="plan" key={x.k}><h2>{x.n}</h2><div className="price">{x.p}/mois</div><p>{x.d}</p><button className="primary" onClick={()=>checkout(x.k)}>Payer</button></div>)}</div></section>}

function Admin({tracks, adminStats}){return <section className="page"><h1>Admin</h1><div className="stats"><Info title={adminStats?.tracks ?? tracks.length} text="Titres"/><Info title={adminStats?.users ?? "?"} text="Users"/><Info title={adminStats?.reports ?? "?"} text="Reports"/><Info title={adminStats?.revenue ?? "?"} text="MRR"/></div></section>}

function Production(){return <section className="page"><h1>Production</h1><div className="grid"><Info title="Frontend" text="Vercel"/><Info title="Backend" text="Render/Railway"/><Info title="DB" text="Supabase PostgreSQL"/><Info title="Audio" text="Supabase Storage"/><Info title="Paiement" text="Stripe"/><Info title="Légal" text="CGU/RGPD"/></div></section>}

function ArtistCard({artist,onOpen}) {
  return (
    <div className="artist-card" onClick={() => onOpen && onOpen(artist)} style={{ cursor: "pointer" }}>
      <div className="artist-banner" style={artist.banner_url ? {backgroundImage:`url(${artist.banner_url})`} : {}}></div>

      <div className="artist-body">
        <div className="artist-avatar" style={artist.avatar_url ? {backgroundImage:`url(${artist.avatar_url})`} : {}}>
          {!artist.avatar_url && "🎤"}
        </div>

        <div className="artist-name">{artist.public_name}</div>
        <div className="artist-bio">{artist.bio || "Artiste indépendant sur Partage ta musique."}</div>

        <div className="artist-meta">
          <span>🎵 {artist.track_count || 0} titre(s)</span>
          <span>{artist.is_verified ? "✅ Certifié" : "🚀 Indépendant"}</span>
        </div>

        <button
          className="primary"
          style={{width:"100%",marginTop:"14px"}}
          onClick={(e) => {
            e.stopPropagation();
            onOpen && onOpen(artist);
          }}
        >
          Voir le profil
        </button>
      </div>
    </div>
  );
}

function ArtistModal({artist, tracks, totalPlays, setNow, onClose}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.86)",zIndex:9999,overflow:"auto",padding:"30px"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto 90px",background:"#0f172a",borderRadius:"32px",overflow:"hidden",border:"1px solid rgba(255,255,255,.10)",boxShadow:"0 40px 120px rgba(0,0,0,.5)"}}>
        <button onClick={onClose} style={{position:"fixed",top:"28px",right:"28px",zIndex:10000,borderRadius:"999px",width:"48px",height:"48px",padding:0}}>✕</button>

        <div style={{height:"290px",backgroundImage:artist.banner_url ? `linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.55)),url(${artist.banner_url})` : "linear-gradient(135deg,#7c3aed,#2563eb,#06b6d4)",backgroundSize:"cover",backgroundPosition:"center"}}></div>

        <div style={{padding:"0 32px 34px"}}>
          <div style={{display:"flex",gap:"22px",alignItems:"end",marginTop:"-72px",flexWrap:"wrap"}}>
            <div style={{width:"150px",height:"150px",borderRadius:"50%",border:"7px solid #0f172a",backgroundImage:artist.avatar_url ? `url(${artist.avatar_url})` : "linear-gradient(135deg,#f97316,#ec4899)",backgroundSize:"cover",backgroundPosition:"center",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"50px"}}>
              {!artist.avatar_url && "🎤"}
            </div>

            <div style={{flex:1,minWidth:"250px"}}>
              <span className="pill">Profil artiste</span>
              <h1 style={{fontSize:"46px",margin:"10px 0 4px"}}>{artist.public_name}</h1>
              <p style={{color:"#94a3b8",fontSize:"17px",maxWidth:"720px"}}>{artist.bio || "Artiste indépendant sur Partage ta musique."}</p>
            </div>

            <button className="primary">Suivre</button>
          </div>

          <div className="stats">
            <Info title={artist.track_count || tracks.length || 0} text="Titres"/>
            <Info title={totalPlays} text="Écoutes"/>
            <Info title="0" text="Followers"/>
            <Info title={artist.is_verified ? "Oui" : "Non"} text="Certifié"/>
          </div>

          <SectionTitle title="Musiques de l’artiste" />
          <div className="list">
            {tracks.length ? tracks.map(t => <Row key={t.id} t={t} setNow={setNow}/>) : <Empty text="Aucune musique trouvée pour cet artiste."/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({t,setNow}){
  return <div className="card">
    <div className="cover" style={t.cover_url ? {backgroundImage:`url(${t.cover_url})`, backgroundSize:"cover", backgroundPosition:"center"} : {}}>
      {!t.cover_url && (t.icon || "🎧")}
    </div>
    <h3>{t.title}</h3>
    <p>{t.artist_name || t.artist} · {t.genre}</p>
    <button onClick={()=>setNow(t)}>▶ Écouter</button>
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
function Empty({text}){return <div className="info"><b>Vide</b><p>{text}</p></div>}

function Player({now, likeTrack}) {
  const src = now?.audio_url || "";

  return (
    <div className="player player-pro">
      <div className="player-track">
        <div
          className="player-cover"
          style={now?.cover_url ? { backgroundImage: `url(${now.cover_url})` } : {}}
        >
          {!now?.cover_url && "🎧"}
        </div>

        <div>
          <b>{now ? now.title : "Aucun titre sélectionné"}</b>
          <p>{now ? (now.artist_name || now.artist || "Artiste") : "Choisis une musique"}</p>
        </div>
      </div>

      {src ? (
        <audio src={src} controls autoPlay />
      ) : (
        <button onClick={() => alert("Choisis une vraie musique.")}>▶</button>
      )}

      <div className="player-actions">
        <button onClick={() => now && likeTrack(now.id)}>❤️ {now?.likes || 0}</button>
        <button>⭐</button>
        <button>⋯</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);

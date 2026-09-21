import { useEffect, useMemo, useState } from "react";
import { horrorMovies } from "./data/horrorMovies";
const categories = [
  { name: "Korku", count: 348, icon: "☠", tone: "red", character: "👻", tag: "Karanlık ve ürpertici" },
  { name: "Aksiyon", count: 729, icon: "🥷", tone: "blue", character: "🥷", tag: "Adrenalin dolu" },
  { name: "Komedi", count: 521, icon: "☻", tone: "amber", character: "😂", tag: "Bol kahkaha" },
  { name: "Dram", count: 634, icon: "◆", tone: "violet", character: "🎭", tag: "Duygusal hikâyeler" },
  { name: "Anime", count: 583, icon: "✦", tone: "pink", character: "⚔️", tag: "Anime evreni" },
  { name: "Manga", count: 421, icon: "▤", tone: "slate", character: "📚", tag: "Manga dünyası" },
  { name: "Bilim Kurgu", count: 314, icon: "◈", tone: "cyan", character: "🤖", tag: "Geleceğe yolculuk" },
  { name: "Fantastik", count: 392, icon: "✧", tone: "green", character: "🧙", tag: "Büyülü dünyalar" },
  { name: "Romantik", count: 416, icon: "♥", tone: "rose", character: "💘", tag: "Aşk hikâyeleri" },
  { name: "Gizem", count: 276, icon: "?", tone: "indigo", character: "🕵️", tag: "Sırları çöz" },
  { name: "Gerilim", count: 439, icon: "!", tone: "crimson", character: "👹", tag: "Tansiyon yükseliyor" },
  { name: "Aile", count: 287, icon: "⌂", tone: "lime", character: "🧸", tag: "Herkese uygun" },
];

const titles = [
  { id:"inception", title:"Inception", type:"Film", year:2010, genre:["Bilim Kurgu","Aksiyon","Gizem"], rating:8.8, emoji:"🌀", desc:"Rüyaların içine girerek fikir çalma ve yerleştirme üzerine kurulu bir bilim kurgu gerilimi." },
  { id:"dark", title:"Dark", type:"Dizi", year:2017, genre:["Gizem","Gerilim","Bilim Kurgu"], rating:8.7, emoji:"🕰️", desc:"Küçük bir kasabada kaybolan bir çocuk, dört ailenin nesiller boyunca uzanan sırlarını ortaya çıkarır." },
  { id:"alice", title:"Alice in Borderland", type:"Dizi", year:2020, genre:["Aksiyon","Gerilim","Gizem"], rating:7.7, emoji:"🃏", desc:"Boş bir Tokyo'da hayatta kalmak için ölümcül oyunlara katılan gençlerin hikâyesi." },
  { id:"aot", title:"Attack on Titan", type:"Anime", year:2013, genre:["Anime","Aksiyon","Dram"], rating:9.1, emoji:"⚔️", desc:"İnsanlığın devlere karşı verdiği hayatta kalma mücadelesi." },
  { id:"spirited", title:"Spirited Away", type:"Anime", year:2001, genre:["Anime","Fantastik","Aile"], rating:8.6, emoji:"🌌", desc:"Gizemli bir ruhlar dünyasında ailesini kurtarmaya çalışan genç bir kız." },
  { id:"parasite", title:"Parasite", type:"Film", year:2019, genre:["Dram","Gerilim","Gizem"], rating:8.5, emoji:"🏠", desc:"İki ailenin hayatlarının beklenmedik biçimde kesiştiği toplumsal gerilim." },
  { id:"squid", title:"Squid Game", type:"Dizi", year:2021, genre:["Gerilim","Dram","Gizem"], rating:8.0, emoji:"🎭", desc:"Büyük bir ödül için ölümcül çocuk oyunlarına katılan insanların hikâyesi." },
  { id:"interstellar", title:"Interstellar", type:"Film", year:2014, genre:["Bilim Kurgu","Dram","Fantastik"], rating:8.7, emoji:"🚀", desc:"İnsanlığın geleceği için yıldızlararası bir yolculuğa çıkan astronotların hikâyesi." },
];

const slides = [
  {
    title: "Karanlığın içine girmeye hazır mısın?",
    subtitle: "Korku dünyasından yüzlerce yapımı keşfet.",
    label: "KORKU",
    tone: "horror",
    visual: "👻",
  },
  {
    title: "Adrenalin hiç durmasın.",
    subtitle: "Aksiyon, macera ve yüksek tempolu hikâyeler.",
    label: "AKSİYON",
    tone: "action",
    visual: "🥷",
  },
  {
    title: "Biraz gülmeye ne dersin?",
    subtitle: "Kahkaha garantili yapımları tek yerde bul.",
    label: "KOMEDİ",
    tone: "comedy",
    visual: "😂",
  },
  {
    title: "Başka dünyaların kapısını aç.",
    subtitle: "Anime ve fantastik evrenlerde yeni maceralara çık.",
    label: "ANİME",
    tone: "anime",
    visual: "⚔️",
  },
];

function App() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("pisibox_session") || "");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);\n  const [selectedTitle, setSelectedTitle] = useState(null);\n  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("pisibox_favorites") || "[]"));\n  const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem("pisibox_ratings") || "{}"));\n  const [profilePage, setProfilePage] = useState(false);
  const [categoryPage, setCategoryPage] = useState(null);
  const [movieFilter, setMovieFilter] = useState("");

  const slide = slides[slideIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((index) => (index + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(
    () =>
      categories.filter((category) =>
        category.name.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))
      ),
    [search]
  );

  useEffect(() => {
    if (!authToken) return;
    const accounts = JSON.parse(localStorage.getItem("pisibox_accounts") || "{}");
    const account = accounts[authToken];
    if (!account) {
      localStorage.removeItem("pisibox_session");
      setAuthToken("");
      setUser(null);
      return;
    }
    setUser({ id: account.id, user_metadata: { display_name: account.displayName, username: account.username, avatar_url: account.avatarUrl || "" }, email: "" });
  }, [authToken]);

  const hashPassword = async (value) => {
    const data = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const openProfile = () => {
    if (!user) return;
    setProfileName(user.user_metadata?.display_name || user.email?.split("@")[0] || "PisiBox Kullanıcısı");
    setProfileAvatar(user.user_metadata?.avatar_url || "");
    setProfilePreview(user.user_metadata?.avatar_url || "");
    setProfileError("");
    setProfileOpen(true);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileError("");
    if (!file.type.startsWith("image/")) {
      setProfileError("Lütfen bir görsel dosyası seç.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Profil fotoğrafı en fazla 5 MB olabilir.");
      return;
    }
    setProfileAvatar(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!authToken) return;
    setProfileError("");
    setProfileLoading(true);
    try {
      const accounts = JSON.parse(localStorage.getItem("pisibox_accounts") || "{}");
      const account = accounts[authToken];
      if (!account) throw new Error("Oturum bulunamadı.");
      let avatarUrl = typeof profileAvatar === "string" ? profileAvatar : profilePreview;
      accounts[authToken] = { ...account, displayName: profileName.trim() || account.username, avatarUrl: avatarUrl || "" };
      localStorage.setItem("pisibox_accounts", JSON.stringify(accounts));
      setUser({ id: account.id, user_metadata: { display_name: accounts[authToken].displayName, username: account.username, avatar_url: accounts[authToken].avatarUrl }, email: "" });
      setProfileAvatar(accounts[authToken].avatarUrl);
      setProfilePreview(accounts[authToken].avatarUrl);
      setProfileOpen(false);
    } catch (error) {
      setProfileError(error.message || "Profil kaydedilemedi.");
    } finally {
      setProfileLoading(false);
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthUsername("");
    setAuthPassword("");
    setAuthName("");
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const username = authUsername.trim().toLowerCase();
      if (!/^[a-z0-9_.-]{3,24}$/.test(username)) throw new Error("Kullanıcı adı 3-24 karakter olmalı.");
      const accounts = JSON.parse(localStorage.getItem("pisibox_accounts") || "{}");
      const existingKey = Object.keys(accounts).find((key) => accounts[key].username === username);

      if (authMode === "register") {
        if (authPassword.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");
        if (existingKey) throw new Error("Bu kullanıcı adı zaten alınmış.");
        const id = crypto.randomUUID();
        const passwordHash = await hashPassword(authPassword);
        const account = {
          id,
          username,
          displayName: authName.trim() || username,
          passwordHash,
          avatarUrl: "",
          createdAt: new Date().toISOString(),
        };
        accounts[id] = account;
        localStorage.setItem("pisibox_accounts", JSON.stringify(accounts));
        localStorage.setItem("pisibox_session", id);
        setAuthToken(id);
        setUser({ id, user_metadata: { display_name: account.displayName, username, avatar_url: "" }, email: "" });
      } else {
        if (!existingKey) throw new Error("Kullanıcı adı veya şifre hatalı.");
        const account = accounts[existingKey];
        const passwordHash = await hashPassword(authPassword);
        if (account.passwordHash !== passwordHash) throw new Error("Kullanıcı adı veya şifre hatalı.");
        localStorage.setItem("pisibox_session", existingKey);
        setAuthToken(existingKey);
        setUser({ id: account.id, user_metadata: { display_name: account.displayName, username: account.username, avatar_url: account.avatarUrl || "" }, email: "" });
      }
      setAuthMode(null);
    } catch (error) {
      setAuthError(error.message || "Bir hata oluştu.");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pisibox_session");
    setAuthToken("");
    setUser(null);
    setProfileOpen(false);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <div className="site">
      <div className={`hero-scene scene-${slide.tone}`} aria-hidden="true">
        <div className="scene-noise" />
        <div className="scene-orb orb-one" />
        <div className="scene-orb orb-two" />
      </div>

      <header className="nav">
        <a className="brand" href="#top" aria-label="PisiBox ana sayfa">
          <span className="brand-paw">🐾</span>
          <span>Pisi<span>Box</span></span>
        </a>

        <nav className="nav-links">
          <a href="#top">Ana Sayfa</a>
          <a href="#categories">Kategoriler</a>
          <a href="#popular">Popüler</a>
          <a href="#about">Hakkımızda</a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <button className="profile-mini" onClick={openProfile} title="Profilim">
                {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="" /> : <span>👤</span>}
                <b>{user.user_metadata?.display_name || user.email?.split("@")[0]}</b>
              </button>
              <button className="ghost-btn" onClick={logout}>Çıkış</button>
            </>
          ) : (
            <>
              <button className="ghost-btn" onClick={() => openAuth("login")}>Giriş Yap</button>
              <button className="primary-btn" onClick={() => openAuth("register")}>Kayıt Ol</button>
            </>
          )}
        </div>
      </header>

      <main id="top">{categoryPage === "Korku" && <section className="category-page">
  <div className="category-page-head">
    <button className="back-btn" onClick={()=>setCategoryPage(null)}>← Ana Sayfa</button>
    <span className="section-kicker">PISIBOX · KORKU</span>
    <h1>En Popüler 300 Korku Filmi</h1>
    <p>Seçilmiş 300 korku klasiği ve modern yapımı keşfet.</p>
    <div className="movie-filter"><span>⌕</span><input value={movieFilter} onChange={e=>setMovieFilter(e.target.value)} placeholder="Korku filmlerinde ara..." /></div>
  </div>
  <div className="movie-grid">{horrorMovies.filter(m=>m.title.toLocaleLowerCase("tr-TR").includes(movieFilter.toLocaleLowerCase("tr-TR"))).map(movie =>
    <article className="movie-card" key={movie.id} onClick={()=>setSelectedTitle({id:"h"+movie.id,title:movie.title,type:"Film",year:movie.year,genre:["Korku"],rating:movie.rating,emoji:"👻",desc:movie.desc,poster:null})}>
      <div className="movie-poster"><div className="movie-poster-art"><span>👻</span><b>{movie.title}</b></div>{movie.rating ? <strong>⭐ {movie.rating}</strong> : <strong>IMDb</strong>}</div>
      <div className="movie-info"><h3>{movie.title}</h3><small>{movie.year} · {movie.rating ? "IMDb " + movie.rating : "IMDb puanı"}</small><p>{movie.desc}</p></div>
    </article>
  )}</div>
</section>}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> {slide.label}</div>
            <h1 key={slide.title}>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <div className="hero-actions">
              <button className="primary-btn large">Keşfet <b>→</b></button>
              <button className="glass-btn">◈ Rastgele Öner</button>
            </div>
            <div className="slide-dots">
              {slides.map((item, index) => (
                <button
                  key={item.label}
                  className={index === slideIndex ? "active" : ""}
                  onClick={() => setSlideIndex(index)}
                  aria-label={`Slayt ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="hero-art" key={slide.visual}>
            <div className="art-ring" />
            <div className="art-glow" />
            <div className="art-character">{slide.visual}</div>
            <div className="art-chip">PisiBox Original</div>
          </div>
        </section>

        <section className="search-wrap">
          <form className="search-box" onSubmit={(event) => event.preventDefault()}>
            <span className="search-icon">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Film, dizi, anime, manga veya kategori ara..."
              aria-label="PisiBox'ta ara"
            />
            {search && <button type="button" className="clear" onClick={() => setSearch("")}>×</button>}
            <button type="submit" className="search-btn">ARA</button>
          </form>
        </section>

        {search && (\n        <section className="section search-results">\n          <div className="section-head"><div><span className="section-kicker">ARAMA</span><h2>Yapımlar</h2></div></div>\n          <div className="title-grid">{searchResults.map(item=><article className="title-card" key={item.id} onClick={()=>setSelectedTitle(item)}><div className="poster">{item.emoji}<span>⭐ {item.rating}</span></div><div className="title-card-body"><b>{item.title}</b><small>{item.type} · {item.year}</small><p>{item.genre.join(" · ")}</p></div></article>)}</div>\n        </section>\n      )}\n\n      <section className="section" id="categories">
          <div className="section-head">
            <div>
              <span className="section-kicker">KEŞFET</span>
              <h2>Kategoriler</h2>
            </div>
            <button className="text-btn" onClick={() => setSearch("")}>Tümünü Gör <span>→</span></button>
          </div>

          <div className="category-grid">
            {filtered.map((category) => (
              <article className={`category-card tone-${category.tone}`} key={category.name} onClick={() => setSearch(category.name)}>
                <div className="card-shine" />
                <div className="card-character" aria-hidden="true">{category.character}</div>
                <div className="card-info">
                  <div className="category-icon">{category.icon}</div>
                  <h3>{category.name}</h3>
                  <p>{category.tag}</p>
                  <span>{category.count} Öneri</span>
                </div>
                <div className="card-arrow">→</div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty">“{search}” için kategori bulunamadı.</div>
          )}
        </section>

        <section className="section popular" id="popular">
          <div className="section-head">
            <div>
              <span className="section-kicker">TREND</span>
              <h2>Şu An PisiBox'ta</h2>
            </div>
          </div>
          <div className="title-grid featured-grid">{titles.slice(0,4).map(item=><article className="title-card" key={item.id} onClick={()=>setSelectedTitle(item)}><div className="poster">{item.emoji}<span>⭐ {item.rating}</span></div><div className="title-card-body"><b>{item.title}</b><small>{item.type} · {item.year}</small><p>{item.genre.join(" · ")}</p></div></article>)}</div>\n          <div className="trend-grid">
            <div className="trend-card"><span>🔥</span><div><b>En çok konuşulanlar</b><small>Toplulukta yükselen yapımlar</small></div></div>
            <div className="trend-card"><span>⭐</span><div><b>Yüksek puanlılar</b><small>Favorilerini keşfet</small></div></div>
            <div className="trend-card"><span>🆕</span><div><b>Yeni eklenenler</b><small>Aramıza yeni katılanlar</small></div></div>
            <div className="trend-card"><span>🎲</span><div><b>Rastgele keşfet</b><small>Karar veremiyorsan bize bırak</small></div></div>
          </div>
        </section>

        <section className="about" id="about">
          <div>
            <span className="section-kicker">PISIBOX</span>
            <h2>İzleyecek bir şey bulmak artık daha kolay.</h2>
          </div>
          <p>Film, dizi, anime ve manga dünyasını tek bir keşif deneyiminde buluşturan PisiBox.</p>
        </section>
      </main>



      {selectedTitle && <div className="auth-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedTitle(null)}}><div className="detail-modal"><button className="auth-close" onClick={()=>setSelectedTitle(null)}>×</button><div className="detail-poster">{selectedTitle.emoji}<strong>⭐ {selectedTitle.rating}</strong></div><div className="detail-content"><span className="section-kicker">{selectedTitle.type.toUpperCase()}</span><h2>{selectedTitle.title}</h2><small>{selectedTitle.year} · {selectedTitle.genre.join(" · ")}</small><p>{selectedTitle.desc}</p><div className="detail-actions"><button className="primary-btn" onClick={()=>toggleFavorite(selectedTitle.id)}>{favorites.includes(selectedTitle.id)?"♥ Favorilerde":"♡ Favorilere Ekle"}</button><button className="glass-btn" onClick={()=>setProfilePage(true)}>Profilim</button></div><div className="rating-row"><span>Senin puanın:</span>{[1,2,3,4,5].map(n=><button key={n} className={ratings[selectedTitle.id]>=n?"rated":""} onClick={()=>rateTitle(selectedTitle.id,n)}>★</button>)}</div></div></div></div>}

      {profilePage && <div className="auth-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setProfilePage(false)}}><div className="profile-page"><button className="auth-close" onClick={()=>setProfilePage(false)}>×</button><div className="profile-hero">{user?.user_metadata?.avatar_url?<img src={user.user_metadata.avatar_url} alt=""/>:<span>👤</span>}<div><span className="section-kicker">PISIBOX PROFİLİ</span><h2>{user?.user_metadata?.display_name}</h2><small>@{user?.user_metadata?.username}</small></div></div><h3>Favorilerim</h3><div className="title-grid">{titles.filter(x=>favorites.includes(x.id)).map(item=><article className="title-card" key={item.id} onClick={()=>{setSelectedTitle(item);setProfilePage(false)}}><div className="poster">{item.emoji}<span>⭐ {item.rating}</span></div><div className="title-card-body"><b>{item.title}</b><small>{item.type} · {item.year}</small></div></article>)}</div>{!favorites.length&&<p className="empty">Henüz favorin yok. Beğendiğin yapımları favorilere ekle.</p>}</div></div>}
\n      {profileOpen && (
        <div className="auth-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setProfileOpen(false);
        }}>
          <div className="auth-modal profile-modal">
            <button className="auth-close" onClick={() => setProfileOpen(false)} aria-label="Kapat">×</button>
            <div className="auth-logo">🐾 <span>Pisi<span>Box</span></span></div>
            <span className="section-kicker">HESABIM</span>
            <h2>Profilini düzenle</h2>
            <p className="auth-subtitle">Kendine ait bir profil fotoğrafı ve görünen ad seç.</p>
            <form onSubmit={saveProfile} className="auth-form">
              <div className="avatar-editor">
                <div className="avatar-preview">{profilePreview ? <img src={profilePreview} alt="Profil önizleme" /> : <span>👤</span>}</div>
                <label className="avatar-upload">📷 Görsel seç<input type="file" accept="image/*" onChange={handleAvatarChange} /></label>
                <small>JPG, PNG, GIF veya WebP · Maks. 5 MB</small>
              </div>
              <label>Görünen ad<input value={profileName} onChange={(e) => setProfileName(e.target.value)} maxLength={30} placeholder="Kullanıcı adın" /></label>
              {profileError && <div className="auth-error">{profileError}</div>}
              <button className="primary-btn auth-submit" disabled={profileLoading}>{profileLoading ? "Kaydediliyor..." : "Profili Kaydet"}</button>
            </form>
          </div>
        </div>
      )}

      {authMode && (
        <div className="auth-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAuthMode(null);
        }}>
          <div className="auth-modal">
            <button className="auth-close" onClick={() => setAuthMode(null)} aria-label="Kapat">×</button>
            <div className="auth-logo">🐾 <span>Pisi<span>Box</span></span></div>
            <span className="section-kicker">{authMode === "register" ? "PISIBOX'A KATIL" : "TEKRAR HOŞ GELDİN"}</span>
            <h2>{authMode === "register" ? "Hesabını oluştur" : "Giriş yap"}</h2>
            <p className="auth-subtitle">{authMode === "register" ? "Favorilerini ve keşiflerini hesabında sakla." : "PisiBox hesabına devam et."}</p>
            <form onSubmit={submitAuth} className="auth-form">
              <label>Kullanıcı adı<input value={authUsername} onChange={(e) => setAuthUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ""))} placeholder="kullaniciadi" minLength={3} maxLength={24} required /></label>
              {authMode === "register" && (
                <label>Görünen ad<input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Mete" maxLength={30} /></label>
              )}
              <label>Şifre<input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="En az 6 karakter" minLength={6} required /></label>
              {authError && <div className="auth-error">{authError}</div>}
              <button className="primary-btn auth-submit" disabled={authLoading}>{authLoading ? "Bekle..." : authMode === "register" ? "Kayıt Ol" : "Giriş Yap"}</button>
            </form>
            <button className="auth-switch" onClick={() => openAuth(authMode === "register" ? "login" : "register")}>
              {authMode === "register" ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol"}
            </button>
          </div>
        </div>
      )}

      {chatOpen ? (
        <aside className="chat" aria-label="PisiChat">
          <div className="chat-head">
            <div><b>💬 PisiChat</b><small><i /> Şu anda aktif</small></div>
            <button onClick={() => setChatOpen(false)} aria-label="Sohbeti kapat">×</button>
          </div>
          <div className="chat-body">
            <div className="chat-system">PisiBox'a hoş geldin! 👋</div>
            <div className="bubble"><b>Pisi</b><span>Bugün ne izliyorsun?</span></div>
            <div className="bubble"><b>FilmSever</b><span>Korku kategorisine bakıyorum 😱</span></div>
          </div>
          <form className="chat-compose" onSubmit={sendMessage}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mesaj yaz..." />
            <button type="submit">➤</button>
          </form>
        </aside>
      ) : (
        <button className="chat-fab" onClick={() => setChatOpen(true)} aria-label="PisiChat'i aç">💬</button>
      )}

      <footer>
        <div className="footer-brand">🐾 PisiBox</div>
        <p>Keşfet. İzle. Tekrar keşfet.</p>
        <span>© 2026 PisiBox</span>
      </footer>
    </div>
  );
}

export default App;

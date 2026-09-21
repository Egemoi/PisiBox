import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const categories = [
  { name: "Korku", count: 348, icon: "☠", tone: "red", character: "👻", tag: "Karanlık ve ürpertici" },
  { name: "Aksiyon", count: 729, icon: "⚔", tone: "blue", character: "🥷", tag: "Adrenalin dolu" },
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
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

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
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

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
    if (!supabase || !user) return;
    setProfileError("");
    setProfileLoading(true);
    try {
      let avatarUrl = typeof profileAvatar === "string" ? profileAvatar : (user.user_metadata?.avatar_url || "");
      if (profileAvatar && typeof profileAvatar !== "string") {
        const ext = profileAvatar.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = user.id + "/avatar-" + Date.now() + "." + ext;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, profileAvatar, {
          upsert: true,
          contentType: profileAvatar.type,
          cacheControl: "3600",
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = data.publicUrl;
      }
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: profileName.trim() || "PisiBox Kullanıcısı", avatar_url: avatarUrl },
      });
      if (error) throw error;
      setUser(data.user);
      setProfileAvatar(avatarUrl);
      setProfilePreview(avatarUrl);
      setProfileOpen(false);
    } catch (error) {
      setProfileError(error.message || "Profil kaydedilemedi. Avatar depolamasının kurulduğundan emin ol.");
    } finally {
      setProfileLoading(false);
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthError("");
    if (!supabase) {
      setAuthError("Giriş sistemi henüz bağlanmadı. Supabase ayarlarını eklememiz gerekiyor.");
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { display_name: authName } },
        });
        if (error) throw error;
        if (!data.session) {
          setAuthError("Kayıt başarılı! E-posta adresini doğrulaman gerekiyorsa gelen kutunu kontrol et.");
        } else {
          setAuthMode(null);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMode(null);
      }
    } catch (error) {
      setAuthError(error.message || "Bir hata oluştu.");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
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

      <main id="top">
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

        <section className="section" id="categories">
          <div className="section-head">
            <div>
              <span className="section-kicker">KEŞFET</span>
              <h2>Kategoriler</h2>
            </div>
            <button className="text-btn">Tümünü Gör <span>→</span></button>
          </div>

          <div className="category-grid">
            {filtered.map((category) => (
              <article className={`category-card tone-${category.tone}`} key={category.name}>
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
          <div className="trend-grid">
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


      {profileOpen && (
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
              {authMode === "register" && (
                <label>Ad / kullanıcı adı<input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Mete" required /></label>
              )}
              <label>E-posta<input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="ornek@mail.com" required /></label>
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

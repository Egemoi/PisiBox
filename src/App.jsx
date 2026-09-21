import { useEffect, useMemo, useState } from "react";

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
          <button className="ghost-btn">Giriş Yap</button>
          <button className="primary-btn">Kayıt Ol</button>
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

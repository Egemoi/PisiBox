import { useEffect, useMemo, useState } from "react";

import { moviesPart1 } from "./data/movies-part1";
import { moviesPart2 } from "./data/movies-part2";
import { moviesPart3 } from "./data/movies-part3";
import { moviesPart4 } from "./data/movies-part4";
import { moviesPart5 } from "./data/movies-part5";
import { moviesPart6 } from "./data/movies-part6";
import { moviesPart7 } from "./data/movies-part7";
import { moviesPart8 } from "./data/movies-part8";

const posterCache = new Map();

const posterUrl = (title, year) => {
  const params = new URLSearchParams({
    title,
    year: String(year || ""),
  });
  return `/api/omdb?${params.toString()}`;
};

const categories = ["Tamamen Rastgele","Korku","Romantik","Aksiyon","Komedi","Dram","Anime","Bilim Kurgu","Fantastik","Gizem","Gerilim","Aile"];

const platformOverrides = {
  "Sicario": ["Netflix", "Prime Video"],
  "Toy Story": ["Disney+"],
  "Spirited Away": ["MUBI"],
  "The Grand Budapest Hotel": ["MUBI"],
  "The Menu": ["BluTV", "Prime Video"],
  "The Batman": ["Prime Video"],
  "The Super Mario Bros. Movie": ["Prime Video"],
  "Encanto": ["Disney+"],
  "Coco": ["Disney+"],
  "Soul": ["Disney+"],
  "Turning Red": ["Disney+"],
  "Luca": ["Disney+"],
  "Moana": ["Disney+"],
  "Frozen": ["Disney+"],
  "Frozen II": ["Disney+"],
  "Inside Out": ["Disney+"],
  "Ratatouille": ["Disney+"],
  "Finding Nemo": ["Disney+"],
  "Finding Dory": ["Disney+"],
  "The Incredibles": ["Disney+"],
  "The Incredibles 2": ["Disney+"],
  "Up": ["Disney+"],
  "WALL-E": ["Disney+"],
  "Big Hero 6": ["Disney+"],
  "Zootopia": ["Disney+"],
  "Black Panther": ["Disney+"],
  "Avengers: Endgame": ["Disney+"],
  "Avengers: Infinity War": ["Disney+"],
  "Guardians of the Galaxy": ["Disney+"],
  "Guardians of the Galaxy Vol. 2": ["Disney+"],
  "Thor: Ragnarok": ["Disney+"],
  "Iron Man": ["Disney+"],
  "Iron Man 2": ["Disney+"],
  "Iron Man 3": ["Disney+"],
  "Captain America: The Winter Soldier": ["Disney+"],
  "Captain America: Civil War": ["Disney+"],
  "Doctor Strange": ["Disney+"],
  "Thor": ["Disney+"],
  "Thor: The Dark World": ["Disney+"],
  "The Avengers": ["Disney+"]
};

const withPlatforms = (item) => {
  const platforms = platformOverrides[item.title];
  return platforms?.length ? { ...item, platforms } : item;
};
const getMoviePlatforms = (movie) => {
  if (Array.isArray(movie?.platforms) && movie.platforms.length > 0) return movie.platforms;

  const allPlatforms = [
    ["Netflix"],
    ["Prime Video"],
    ["Netflix", "Prime Video"],
    ["BluTV"],
    ["Disney+"],
    ["Prime Video", "MUBI"]
  ];

  const title = movie?.title || movie?.Title || "film";
  const charCodeSum = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return allPlatforms[charCodeSum % allPlatforms.length];
};



const movies = Object.values(
  [...moviesPart1, ...moviesPart2, ...moviesPart3, ...moviesPart4, ...moviesPart5, ...moviesPart6, ...moviesPart7, ...moviesPart8]
    .reduce((map, item) => {
      map[item.title] = withPlatforms(item);
      return map;
    }, {})
);

const WATCHLIST_KEY = "pisibox-watchlist";
const WATCHED_KEY = "pisibox-watched";
const SOUND_KEY = "pisibox-dice-sound";
const movieKey = (item) => `${item?.title || ""}|${item?.year || ""}`;
const readStorage = (key, fallback = []) => {
  try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};
const saveStorage = (key, value) => {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.error("PisiBox localStorage yazılamadı:", error); }
};
const featuredTitles = ["Pulp Fiction","The Shawshank Redemption","The Godfather","The Dark Knight","Inception","Interstellar","Fight Club","The Prestige","The Silence of the Lambs","Spirited Away","Parasite","Goodfellas","The Shining","Whiplash","The Truman Show","Rear Window","Mad Max: Fury Road","City of God","Taxi Driver","Django Unchained","The Good, the Bad and the Ugly","Memento"];
const getDailyMovie = () => {
  const pool = featuredTitles.map((title) => movies.find((item) => item.title === title)).filter(Boolean);
  if (!pool.length) return movies[0] || null;
  const day = new Date().toDateString();
  let hash = 0;
  for (const char of day) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return pool[hash % pool.length];
};

function App() {
  const [category, setCategory] = useState("Tamamen Rastgele");
  const [movie, setMovie] = useState(null);
  const [poster, setPoster] = useState(null);
  const [posterLoading, setPosterLoading] = useState(false);
  const [infoPage, setInfoPage] = useState(null);
  const [cookieVisible, setCookieVisible] = useState(false);
  const [watchlist, setWatchlist] = useState(() => readStorage(WATCHLIST_KEY));
  const [watched, setWatched] = useState(() => readStorage(WATCHED_KEY));
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [trailerId, setTrailerId] = useState("");
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { const saved = window.localStorage.getItem(SOUND_KEY); return saved === null ? true : saved === "true"; } catch { return true; }
  });
  const [dailyPoster, setDailyPoster] = useState(null);
  const [rollMessage, setRollMessage] = useState("");
  const dailyMovie = useMemo(() => getDailyMovie(), []);

  useEffect(() => {
    const consent = window.localStorage.getItem("pisibox-cookie-consent");
    if (!consent) setCookieVisible(true);
  }, []);

  const acceptCookies = () => {
    window.localStorage.setItem("pisibox-cookie-consent", "accepted");
    setCookieVisible(false);
  };

  const watchedKeys = useMemo(() => new Set(watched.map((item) => movieKey(item))), [watched]);

  const available = useMemo(() => {
    const pool = category === "Tamamen Rastgele" ? movies : movies.filter((item) => item.categories.includes(category));
    return pool.filter((item) => !watchedKeys.has(movieKey(item)));
  }, [category, watchedKeys]);

  const fetchPoster = async (selectedMovie, updateMain = true) => {
    if (!selectedMovie?.title) {
      if (updateMain) setPosterLoading(false);
      return null;
    }

    const cacheKey = selectedMovie.title + "|" + selectedMovie.year;

    if (posterCache.has(cacheKey)) {
      const cached = posterCache.get(cacheKey);
      if (updateMain) {
        setPoster(cached);
        setPosterLoading(false);
      }
      return cached;
    }

    if (updateMain) {
      setPosterLoading(true);
      setPoster(null);
    }

    try {
      const response = await fetch(posterUrl(selectedMovie.title, selectedMovie.year));
      if (!response.ok) throw new Error("OMDb HTTP " + response.status);
      const data = await response.json();
      const url = data?.Response === "True" && data?.Poster && data.Poster !== "N/A" ? data.Poster : null;
      posterCache.set(cacheKey, url);
      if (updateMain) setPoster(url);
      return url;
    } catch (error) {
      console.warn("OMDb afiş isteği başarısız; yerel film verisi kullanılmaya devam ediyor:", error);
      if (updateMain) setPoster(null);
      return null;
    } finally {
      if (updateMain) setPosterLoading(false);
    }
  };

  useEffect(() => {
    if (dailyMovie) fetchPoster(dailyMovie, false).then(setDailyPoster);
  }, [dailyMovie]);

  const playDiceSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const now = context.currentTime;
      [0, 0.045, 0.09].forEach((offset, index) => {
        try {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = index === 1 ? "triangle" : "square";
          oscillator.frequency.setValueAtTime(index === 1 ? 95 : 125, now + offset);
          oscillator.frequency.exponentialRampToValueAtTime(55, now + offset + 0.07);
          gain.gain.setValueAtTime(0.0001, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.07, now + offset + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.075);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(now + offset);
          oscillator.stop(now + offset + 0.08);
        } catch (error) {
          console.warn("Zar sesi kanalı başlatılamadı:", error);
        }
      });
      setTimeout(() => {
        try { context.close(); } catch {}
      }, 300);
    } catch (error) {
      console.warn("Zar sesi kullanılamadı; film seçimi devam ediyor:", error);
    }
  };

  const resolveTrailerId = async (selectedMovie) => {
    if (!selectedMovie?.title) return null;

    const cacheKey = "pisibox-trailer-" + movieKey(selectedMovie);
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch {}

    try {
      if (!window.movieTrailer) {
        await new Promise((resolve, reject) => {
          const existing = document.querySelector('script[data-pisibox-movie-trailer]');
          if (existing) {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = "https://unpkg.com/movie-trailer";
          script.async = true;
          script.dataset.pisiboxMovieTrailer = "true";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (typeof window.movieTrailer !== "function") return null;

      const result = await window.movieTrailer(selectedMovie.title, {
        year: String(selectedMovie.year || ""),
        id: true
      });

      const id = Array.isArray(result) ? result.find(Boolean) : result;
      if (!id || typeof id !== "string") return null;

      try { window.localStorage.setItem(cacheKey, id); } catch {}
      return id;
    } catch (error) {
      console.warn("Fragman ID alınamadı:", error);
      return null;
    }
  };

  const openTrailer = async (selectedMovie) => {
    if (!selectedMovie) return;

    setTrailerMovie(selectedMovie);
    setTrailerId("");
    setTrailerLoading(true);

    try {
      const id = await resolveTrailerId(selectedMovie);
      setTrailerId(id || "");
    } finally {
      setTrailerLoading(false);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try { window.localStorage.setItem(SOUND_KEY, String(next)); } catch {}
  };

  const roll = (watchedList = watched, selectedCategory = category) => {
    setRollMessage("");

    try {
      const activeCategory = selectedCategory || "Tamamen Rastgele";
      const watchedSet = new Set((watchedList || []).map((item) => movieKey(item)));
      const fullPool = activeCategory === "Tamamen Rastgele"
        ? movies
        : movies.filter((item) => Array.isArray(item.categories) && item.categories.includes(activeCategory));

      let pool = fullPool.filter((item) => !watchedSet.has(movieKey(item)));

      if (!pool.length) {
        setWatched([]);
        saveStorage(WATCHED_KEY, []);
        pool = [...fullPool];
        if (!pool.length) pool = [...movies];
        setRollMessage("Bu havuzdaki filmlerin tamamı izlendi. İzleme geçmişin sıfırlandı.");
      }

      if (!pool.length) {
        setRollMessage("Film havuzu şu anda boş.");
        return;
      }

      const choices = pool.length > 1
        ? pool.filter((item) => movieKey(item) !== movieKey(movie))
        : pool;
      const selectedMovie = choices.length
        ? choices[Math.floor(Math.random() * choices.length)]
        : pool[0];

      // Filmi önce ekrana bas: OMDb, ses veya loading akışı zarı engelleyemez.
      setMovie(selectedMovie);
      setPoster(null);
      setPosterLoading(false);

      try { playDiceSound(); } catch (error) { console.warn("Zar sesi atlandı:", error); }
      void fetchPoster(selectedMovie).catch((error) => {
        console.warn("Afiş işlemi zar akışını etkilemedi:", error);
        setPosterLoading(false);
      });
    } catch (error) {
      console.error("Zar atma sırasında beklenmeyen hata:", error);

      // Filtreleme/veri tarafında hata olsa bile yerel katalogdan devam et.
      try {
        const fallbackPool = movies.filter(Boolean);
        if (!fallbackPool.length) {
          setRollMessage("Film kataloğu şu anda kullanılamıyor.");
          return;
        }

        const selectedMovie = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        setMovie(selectedMovie);
        setPoster(null);
        setPosterLoading(false);
        setRollMessage("Kategori filtresi kullanılamadı; genel film havuzundan seçim yapıldı.");

        try { playDiceSound(); } catch (soundError) { console.warn("Zar sesi atlandı:", soundError); }
        void fetchPoster(selectedMovie).catch(() => setPosterLoading(false));
      } catch (fallbackError) {
        console.error("Yerel film yedeği de başarısız:", fallbackError);
        setPosterLoading(false);
        setRollMessage("Seçilen kategori için film bulunamadı. Lütfen başka bir kategori dene.");
      }
    }
  };

  const addToWatchlist = () => {
    if (!movie) return;
    const entry = { title: movie.title, year: movie.year, poster, rating: movie.rating };
    const next = watchlist.some((item) => movieKey(item) === movieKey(movie)) ? watchlist : [...watchlist, entry];
    setWatchlist(next);
    saveStorage(WATCHLIST_KEY, next);
  };

  const removeFromWatchlist = (item) => {
    const next = watchlist.filter((saved) => movieKey(saved) !== movieKey(item));
    setWatchlist(next);
    saveStorage(WATCHLIST_KEY, next);
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    saveStorage(WATCHLIST_KEY, []);
  };

  const isInWatchlist = movie ? watchlist.some((item) => movieKey(item) === movieKey(movie)) : false;

  const markWatchedAndRoll = () => {
    if (!movie) return;
    const entry = { title: movie.title, year: movie.year, poster, rating: movie.rating };
    const next = watched.some((item) => movieKey(item) === movieKey(movie)) ? watched : [...watched, entry];
    setWatched(next);
    saveStorage(WATCHED_KEY, next);
    roll(next, category);
  };

  const trailerUrl = trailerMovie && trailerId
    ? `https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0`
    : null;
  const youtubeVideoUrl = trailerMovie && trailerId
    ? `https://www.youtube.com/watch?v=${trailerId}`
    : null;

  const icon = (item) => ({ "Tamamen Rastgele":"🎲","Korku":"💀","Romantik":"❤️","Aksiyon":"💥","Komedi":"🙂","Dram":"🎭","Anime":"🐱","Bilim Kurgu":"🪐","Fantastik":"🧙","Gizem":"🔍","Gerilim":"〽️","Aile":"👨‍👩‍👧‍👦" }[item] || "•");

  return (
    <div className="dice-app">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark">▶</div><div><div className="brand-name">Pisi<span>Box</span></div><small>FİLM HER ZAMAN İYİ BİR FİKİRDİR.</small></div></div>
        <nav><button>⌂ <span>Ana Sayfa</span></button><button onClick={() => {setCategory("Tamamen Rastgele");setMovie(null)}}>♡ <span>Rastgele</span></button><button className="watchlist-button" onClick={() => setWatchlistOpen(true)}>🔖 <span>İzleme Listem ({watchlist.length})</span></button><button className="theme-button">☾</button></nav>
      </header>
      <main>
        <section className="hero-copy"><div className="mini-kicker">NE İZLESEM DİYE DÜŞÜNME.</div><h1>ZARI AT,<br /><em>FİLMİNİ BUL.</em></h1><p>Karar vermeyi bırak. Bir kategori seç veya tamamen şansa bırak.</p></section>
        <section className="categories">{categories.map((item)=><button key={item} className={category===item?"category selected":"category"} onClick={()=>{setCategory(item);setMovie(null);setRollMessage("");}}><span>{icon(item)}</span>{item}</button>)}</section>
        <section className="dice-stage">
          <div className="scribble scribble-left">Zara bas <b>↘</b></div>
          <button className="dice" onClick={roll} aria-label="Zarı at">
            <span className="die-cube">
              <span className="die-face die-front"><i/><i/><i/><i/><i/><i/></span>
              <span className="die-face die-right"><i/><i/><i/><i/><i/><i/></span>
              <span className="die-face die-top"><i/><i/><i/><i/><i/><i/></span>
            </span>
          </button>
          <div className="scribble scribble-right"><b>↙</b> ve filmin<br/>gelsin!</div>
          <div className="dice-controls" style={{position:"absolute",bottom:22,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"min(94%,760px)",flexWrap:"wrap",zIndex:5}}>
  <button type="button" className="roll-button" style={{position:"static",transform:"none"}} onClick={roll}>🎲 <span>ZARI AT</span></button>
  <button className="watched-button" onClick={markWatchedAndRoll} disabled={!movie} style={{border:"1px solid rgba(255,255,255,.12)",borderRadius:12,padding:"12px 16px",background:"rgba(8,10,15,.82)",color:"#fff",fontWeight:800,cursor:movie?"pointer":"not-allowed",opacity:movie?1:.45,backdropFilter:"blur(14px)"}}>👁️ Bunu Zaten İzledim</button>
  <button className="sound-toggle" onClick={toggleSound} aria-label={soundEnabled?"Zar sesini kapat":"Zar sesini aç"} style={{width:46,height:46,border:"1px solid rgba(255,255,255,.12)",borderRadius:12,background:"rgba(8,10,15,.82)",color:"#fff",fontSize:18,cursor:"pointer",backdropFilter:"blur(14px)"}}>{soundEnabled?"🔊":"🔇"}</button>
</div>
        </section>
        <section className={movie?"result-panel has-result":"result-panel"}>
          {rollMessage && <div style={{maxWidth:760,margin:"0 auto 14px",padding:"10px 14px",borderRadius:10,background:"rgba(180,35,35,.12)",border:"1px solid rgba(255,100,100,.18)",color:"rgba(255,255,255,.8)",textAlign:"center",fontSize:13}}>{rollMessage}</div>}
          {movie ? <div className="movie-result"><div className="poster-art">
              {posterLoading ? (
                <div className="poster-loading"><span>🎬</span><small>Afiş yükleniyor...</small></div>
              ) : poster ? (
                <img src={poster} alt={`${movie.title} film afişi`} loading="lazy" />
              ) : (
                <div className="poster-fallback"><span>🎬</span><small>Afiş bulunamadı</small></div>
              )}
              <strong>⭐ {movie.rating}</strong>
            </div><div className="result-copy"><span className="result-kicker">{movie.categories.join(" · ")}</span><h2>{movie.title}</h2><small>{movie.year}</small><p>{movie.summary}</p>{(() => {
  const currentPlatforms = getMoviePlatforms(movie);
  return (
    <div style={{marginTop:16}}>
      <span style={{display:"block",fontSize:12,color:"rgba(255,255,255,.55)",fontWeight:500,marginBottom:8}}>Nerede İzlenir?</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {currentPlatforms.map((platform, idx) => (
          <span key={idx} style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:999,fontSize:12,fontWeight:600,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.82)"}}>
            {platform}
          </span>
        ))}
      </div>
    </div>
  );
})()}
<div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",marginTop:18}}>
  <button className="again" onClick={roll}>🎲 Bir daha at</button>
  <button onClick={isInWatchlist ? () => removeFromWatchlist(movie) : addToWatchlist} style={{padding:"10px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",color:"#fff",fontWeight:500,cursor:"pointer",transition:"all .2s ease",backdropFilter:"blur(12px)"}} onMouseEnter={(e)=>e.currentTarget.style.background="rgba(255,255,255,.16)"} onMouseLeave={(e)=>e.currentTarget.style.background="rgba(255,255,255,.08)"}>{isInWatchlist ? "🔖 Listeden Çıkar" : "🔖 Listeme Ekle"}</button>
  <button onClick={() => openTrailer(movie)} style={{padding:"10px 16px",borderRadius:12,border:"1px solid rgba(255,70,70,.2)",background:"rgba(220,38,38,.9)",color:"#fff",fontWeight:500,cursor:"pointer",transition:"all .2s ease",boxShadow:"0 10px 24px rgba(220,38,38,.2)"}} onMouseEnter={(e)=>e.currentTarget.style.background="rgba(220,38,38,1)"} onMouseLeave={(e)=>e.currentTarget.style.background="rgba(220,38,38,.9)"}>🎬 Fragmanı İzle</button>
</div></div></div> : <div className="empty-result"><div className="film-icon">▣</div><h3>Henüz film yok.</h3><p>Zarı atarak senin için bir film önerelim!</p></div>}
        </section>
{dailyMovie && (
        <section className="daily-pick" style={{margin:"24px auto 0",maxWidth:980}}>
          <div className="daily-pick-inner" style={{display:"grid",gridTemplateColumns:"minmax(150px,190px) 1fr",gap:22,alignItems:"center",padding:20,border:"1px solid rgba(255,255,255,.1)",borderRadius:22,background:"rgba(8,10,16,.68)",backdropFilter:"blur(18px)",boxShadow:"0 20px 70px rgba(0,0,0,.25)"}}>
            <div style={{position:"relative",aspectRatio:"2/3",overflow:"hidden",borderRadius:15,background:"rgba(255,255,255,.04)"}}>
              {dailyPoster ? <img src={dailyPoster} alt={dailyMovie.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} /> : <div style={{height:"100%",display:"grid",placeItems:"center",color:"rgba(255,255,255,.55)",fontSize:38}}>🎬</div>}
            </div>
            <div>
              <span className="content-kicker">⭐ GÜNÜN SEÇİMİ</span>
              <h2 style={{margin:"7px 0 4px"}}>{dailyMovie.title}</h2>
              <small style={{color:"rgba(255,255,255,.58)"}}>{dailyMovie.year} · ⭐ {dailyMovie.rating}</small>
              <p style={{color:"rgba(255,255,255,.72)",lineHeight:1.7}}>{dailyMovie.summary}</p>
              <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                <button className="again" onClick={() => {setMovie(dailyMovie);fetchPoster(dailyMovie);window.scrollTo({top:0,behavior:"smooth"});}}>🎬 Filmi Göster</button>
                <button className="watchlist-action" onClick={() => {
                  if (!watchlist.some((item) => movieKey(item) === movieKey(dailyMovie))) {
                    const next=[...watchlist,{title:dailyMovie.title,year:dailyMovie.year,poster:dailyPoster,rating:dailyMovie.rating}];
                    setWatchlist(next); saveStorage(WATCHLIST_KEY,next);
                  }
                }}>🔖 Listeme Ekle</button>
              </div>
            </div>
          </div>
        </section>
      )}

        <section className="seo-content">
          <div className="content-heading">
            <span className="content-kicker">PISIBOX HAKKINDA</span>
            <h2>Film seçimini kolaylaştıran sade bir keşif deneyimi</h2>
            <p>PisiBox, ne izleyeceğine karar vermekte zorlanan sinemaseverler için hazırlanmış bağımsız bir rastgele film öneri aracıdır. Amacımız, uzun listeler arasında kaybolmak yerine birkaç saniye içinde yeni bir film keşfetmeni sağlamaktır.</p>
          </div>

          <article className="seo-article">
            <h3>PisiBox Rastgele Film Öneri Motoru Nedir?</h3>
            <p>PisiBox Rastgele Film Öneri Motoru, film seçme sürecini eğlenceli ve pratik hale getiren bir keşif sistemidir. Kullanıcı herhangi bir kategori seçmeden tamamen rastgele bir seçim yapabilir veya korku, romantik, aksiyon, komedi, dram, anime, bilim kurgu, fantastik, gizem, gerilim ve aile gibi kategorilerden birini belirleyebilir. Ardından zar atılarak film kataloğundaki uygun seçeneklerden biri seçilir ve filmin adı, yılı, puanı, türleri, kısa açıklaması ve mevcut olduğunda afişi ekranda gösterilir. Böylece özellikle “Ne izlesem?” sorusuna saatlerce cevap arayan kullanıcılar için hızlı bir başlangıç noktası oluşur.</p>
            <p>Öneri sistemi, tek bir türe bağlı kalmak istemeyen kullanıcıların da yeni yapımlarla karşılaşabilmesine olanak tanır. Rastgele seçim yaklaşımı, daha önce karşılaşılmamış filmleri keşfetmeyi teşvik ederken kategori seçimi kullanıcının o anki izleme isteğini korur. PisiBox'ın temel fikri, film seçimini karmaşıklaştırmak yerine karar vermenin eğlenceli bir parçası haline getirmektir.</p>
          </article>

          <article className="seo-article">
            <h3>Film Seçim Algoritmamız Nasıl Çalışır?</h3>
            <p>PisiBox'ta film kataloğu farklı dönemlerden, türlerden ve sinema anlayışlarından yapımları bir araya getirir. Katalogda aksiyon ve gerilimden bilim kurguya, fantastikten dram ve romantik filmlere kadar farklı kategoriler bulunur. Sinema klasikleri, popüler yapımlar, anime filmleri ve farklı türleri bir araya getiren seçenekler aynı keşif deneyiminin içinde yer alır.</p>
            <p>Kullanıcı bir kategori seçtiğinde sistem yalnızca o kategoriyle eşleşen filmler arasından seçim yapar. “Tamamen Rastgele” seçeneğinde ise katalogdaki uygun filmler arasından seçim yapılır. Sonuç ekranında yer alan IMDb puanı, filmin değerlendirme bilgisini tanımlayan bir referans olarak gösterilir; PisiBox bu puanı kendi başına değiştirmez veya film hakkında yalnızca puana göre bir hüküm vermez. Seçilen filmin afişi ise OMDb üzerinden otomatik olarak alınır. Böylece kullanıcı, önerinin temel bilgilerini tek bir ekranda görebilir.</p>
          </article>

          <article className="seo-article">
            <h3>Neden PisiBox?</h3>
            <p>PisiBox'ın amacı, film arama sürecindeki gereksiz zaman kaybını azaltmak ve keşif deneyimini mümkün olduğunca sade tutmaktır. Uzun listeler arasında gezinmek yerine bir kategori seçip zarı atabilir, birkaç saniye içinde bir öneri alabilirsin. Kullanıcı hesabı oluşturmak veya karmaşık bir profil hazırlamak gerektirmeden doğrudan film keşfine odaklanır.</p>
            <ul className="seo-list">
              <li><strong>Hızlı keşif:</strong> Film seçmek için uzun listeler arasında dolaşmak yerine tek bir zar atışı yeterlidir.</li>
              <li><strong>Farklı türler:</strong> Korku, romantik, aksiyon, komedi, dram, anime, bilim kurgu ve daha birçok kategori arasından seçim yapabilirsin.</li>
              <li><strong>Sade arayüz:</strong> Film adı, yıl, puan, tür, açıklama ve afiş gibi temel bilgiler tek bir sonuç kartında sunulur.</li>
              <li><strong>Yeni filmler keşfet:</strong> Rastgele seçim mantığı, normalde arama listelerinde karşılaşmayabileceğin yapımlara ulaşmana yardımcı olur.</li>
            </ul>
          </article>
        </section>

        <section className="guide-content" aria-labelledby="sinema-rehberi">
          <div className="guide-intro">
            <span className="content-kicker">SİNEMA REHBERİ</span>
            <h2 id="sinema-rehberi">Film keşfini daha keyifli hale getiren PisiBox rehberi</h2>
            <p>Bir sonraki filmi seçmek bazen filmin kendisini izlemekten daha uzun sürebilir. PisiBox, bu kararsızlık anını daha kolay ve eğlenceli hale getirmek için tasarlanmış bir film tavsiye ve keşif platformudur. Aşağıdaki rehber, rastgele seçim mantığının nasıl çalıştığını ve farklı türlerde film ararken nelere dikkat edilebileceğini anlatır.</p>
          </div>

          <article className="guide-article">
            <h3>PisiBox Film Keşif Motoru</h3>
            <p>PisiBox Film Keşif Motoru, kullanıcıların geniş bir film kataloğu içinde kaybolmadan yeni yapımlar keşfetmesine yardımcı olan sade bir öneri deneyimidir. Platformun merkezindeki zar fikri, klasik arama kutularından farklı olarak karar verme yükünü azaltır. Kullanıcı bir kategori belirleyebilir ya da seçimi tamamen şansa bırakabilir. Zar atıldığında uygun film havuzu içinden bir yapım seçilir ve sonuç kartında film adı, yapım yılı, türleri, değerlendirme puanı, kısa tanıtım metni ve uygun olduğunda afiş görseli gösterilir.</p>
            <p>Bu yaklaşım özellikle belirli bir filmi aramayan, fakat farklı seçenekleri değerlendirmek isteyen sinemaseverler için kullanışlıdır. Film keşfi yalnızca popüler başlıklarla sınırlı kalmak zorunda değildir. Farklı yıllardan yapımların, çeşitli türlerin ve sinema kültüründe öne çıkan filmlerin aynı katalogda bulunması, kullanıcının alışılmış tercihleri dışına çıkmasına yardımcı olabilir. Böylece PisiBox yalnızca bir rastgele seçim düğmesi değil, aynı zamanda yeni sinema deneyimleri için bir başlangıç noktası haline gelir.</p>
            <p>Keşif deneyiminin bir diğer amacı da kullanıcıya yeterli bilgiyi tek bakışta sunmaktır. Film adı ve yılı temel bağlamı verirken tür etiketleri filmin genel karakteri hakkında fikir verir. Kısa özet, filmin konusu hakkında başlangıç bilgisi sağlar; değerlendirme puanı ise kullanıcıya ek bir referans sunar. Afiş görseli de sonucu daha kolay tanımayı sağlar. Bu bilgiler birlikte değerlendirildiğinde kullanıcı, kendisine sunulan önerinin kendi izleme beklentisine uygun olup olmadığına daha hızlı karar verebilir.</p>
          </article>

          <article className="guide-article">
            <h3>Rastgele Film Seçimi Nasıl Çalışır?</h3>
            <p>PisiBox'ın rastgele seçim sistemi basit bir mantık üzerine kuruludur: önce kullanıcının seçtiği kategoriye uygun film havuzu belirlenir, ardından bu havuzdaki seçeneklerden rastgele bir film seçilir. “Tamamen Rastgele” seçeneğinde kategori filtresi uygulanmaz. Korku, romantik, aksiyon, komedi, dram, anime, bilim kurgu, fantastik, gizem, gerilim veya aile gibi bir tür seçildiğinde ise yalnızca ilgili kategoriyle eşleşen yapımlar değerlendirilir.</p>
            <p>Rastgele seçim, bir kalite sıralaması anlamına gelmez. PisiBox herhangi bir filmi “en iyi” veya “en kötü” olarak etiketlemek yerine keşif sürecini kolaylaştırır. Sonuç kartındaki değerlendirme puanı, film hakkında bağımsız bir referans olarak sunulur. Kullanıcının kendi zevkleri ise nihai seçimde belirleyici olmaya devam eder. Aynı nedenle tür seçimi de yalnızca teknik bir filtre değildir; o anki ruh haline, izleme ortamına veya arkadaşlarla yapılacak bir film gecesine göre daha uygun seçenekler bulmayı kolaylaştırır.</p>
            <p>Sonuç seçildiğinde film afişi OMDb üzerinden otomatik olarak alınır. Böylece katalogdaki temel bilgiler ile görsel sunum aynı sonuç alanında birleşir. Afiş bulunamadığında ise kullanıcıya bunun yerine sade bir yedek görünüm gösterilir. Bu yapı, harici veri hizmetlerinde geçici bir sorun yaşansa bile film keşif deneyiminin tamamen kaybolmasını önlemek için tasarlanmıştır.</p>
          </article>

          <article className="guide-article">
            <h3>Türe Göre Film Önerileri</h3>
            <p>Film seçerken tür, en hızlı karar yardımcılarından biridir. <strong>Korku ve gerilim</strong> kategorileri daha yoğun atmosfer, gizem ve merak duygusu arayan izleyiciler için farklı seçenekler sunabilir. <strong>Aksiyon</strong> filmleri hareketli anlatımları ve yüksek tempolarıyla öne çıkarken <strong>bilim kurgu</strong> teknoloji, gelecek, uzay veya alternatif dünyalar gibi fikirleri merkeze alabilir. <strong>Fantastik</strong> yapımlar gerçek dünyanın sınırlarının dışına çıkan evrenler ve karakterlerle daha hayal gücü odaklı bir deneyim sunabilir.</p>
            <p><strong>Romantik</strong> filmler ilişkiler ve duygusal bağlar üzerinden ilerlerken <strong>dram</strong> karakter gelişimi, çatışma ve insan hikâyelerine daha fazla ağırlık verebilir. Daha hafif bir seçenek arayanlar için <strong>komedi</strong> kategorisi farklı mizah anlayışlarına sahip yapımları keşfetmeye yardımcı olur. <strong>Anime</strong> kategorisi ise animasyonun görsel anlatım gücünü farklı hikâye türleriyle birleştiren filmleri bir araya getirir. <strong>Aile</strong> kategorisi farklı yaş gruplarının birlikte değerlendirebileceği seçenekleri keşfetmek isteyenler için hazırlanmıştır.</p>
            <p>Bazen ise belirli bir türe karar vermek istememek en iyi başlangıç olabilir. Tamamen rastgele seçim bu durumda devreye girer. Kullanıcı, kategori belirlemeden zar atarak katalogdaki farklı seçeneklerden biriyle karşılaşabilir. Bu yöntem, özellikle daha önce alışılmış türlerin dışına çıkmak ve yeni bir film fikri edinmek isteyenler için eğlenceli bir keşif biçimidir. PisiBox'ın temel yaklaşımı da burada ortaya çıkar: film tavsiyesi ararken tek bir doğru cevap olmadığını kabul etmek ve kullanıcıya kendi zevkine göre değerlendirebileceği yeni seçenekler sunmak.</p>
          </article>
        </section>

        <section className="ad-grid" aria-label="Reklam alanları">
          {[1,2,3,4,5,6].map((slot) => <div className="ad-slot" key={slot}><span>Reklam</span><div className="ad-slot-inner" /></div>)}
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-quote">“İyi filmler, zor zamanları daha katlanılabilir kılar.”</div>
        <div className="footer-links">
          <button onClick={() => setInfoPage("about")}>Hakkımızda</button>
          <button onClick={() => setInfoPage("privacy")}>Gizlilik Politikası</button>
          <button onClick={() => setInfoPage("contact")}>İletişim</button>
        </div>
        <small>© 2026 PisiBox. Tüm hakları saklıdır.</small>
      </footer>

      {infoPage && (
        <div className="info-modal-backdrop" role="presentation" onClick={() => setInfoPage(null)}>
          <section className="info-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setInfoPage(null)} aria-label="Pencereyi kapat">×</button>
            {infoPage === "about" && <>
              <span className="content-kicker">PISIBOX</span>
              <h2>Hakkımızda</h2>
              <p>PisiBox, sinemaseverlerin film seçme sürecini kolaylaştırmak amacıyla oluşturulmuş bağımsız bir film keşif projesidir. Projenin temel fikri basittir: Kullanıcıların uzun öneri listeleri arasında kaybolmadan, birkaç saniye içinde izleyebilecekleri bir filmle karşılaşabilmesini sağlamak.</p>
              <p>PisiBox'ta farklı film türlerini tek bir yerde keşfetmek mümkündür. Korku, romantik, aksiyon, komedi, dram, anime, bilim kurgu, fantastik, gizem, gerilim ve aile kategorileri; farklı izleme alışkanlıklarına ve ruh hallerine göre seçim yapmayı kolaylaştırır. Tamamen rastgele seçim seçeneği ise herhangi bir kategoriye bağlı kalmadan yeni filmler keşfetmek isteyen kullanıcılar için hazırlanmıştır.</p>
              <p>Projemizin vizyonu, film keşfini daha erişilebilir, anlaşılır ve eğlenceli hale getirmektir. PisiBox bir film eleştirmeni veya yapımcı değildir; kullanıcıya seçim yapması için pratik bir keşif aracı sunar. Film bilgilerinin yanında gösterilen dış kaynaklı veriler ilgili kaynakların sunduğu bilgilere dayanır.</p>
            </>}

            {infoPage === "privacy" && <>
              <span className="content-kicker">GİZLİLİK</span>
              <h2>Gizlilik Politikası</h2>
              <p><strong>Son güncelleme: 21.09.2026</strong></p>
              <h3>1. Kapsam</h3>
              <p>Bu Gizlilik Politikası, PisiBox web sitesini ziyaret eden kişilerin gizliliğini korumak ve site kullanımı sırasında işlenebilecek bilgiler hakkında şeffaf bilgi vermek amacıyla hazırlanmıştır. PisiBox, kullanıcıların film keşfetme deneyimi için gerekli olmayan kişisel bilgileri talep etmemeyi amaçlar.</p>
              <h3>2. Teknik bilgiler ve log kayıtları</h3>
              <p>Siteyi sunan altyapı sağlayıcıları güvenlik, hata ayıklama ve hizmetin çalıştırılması amacıyla IP adresi, tarayıcı türü, işletim sistemi, istek zamanı ve ziyaret edilen kaynak gibi teknik kayıtlar tutabilir. Bu kayıtların kapsamı ve saklama süresi ilgili altyapı sağlayıcısının politikalarına tabidir.</p>
              <h3>3. Çerezler ve benzeri teknolojiler</h3>
              <p>PisiBox veya sitede kullanılan üçüncü taraf hizmetler, hizmetin çalışması, performans ölçümü ve reklamların sunulması amacıyla çerezler veya benzeri teknolojiler kullanabilir. Kullanılan reklam hizmetlerine bağlı olarak üçüncü taraf sağlayıcılar, kullanıcının ilgi alanlarına dayalı reklam göstermek veya reklam performansını ölçmek için bilgi işleyebilir. Tarayıcı ayarlarından çerezleri yönetebilir veya devre dışı bırakabilirsin; bunun bazı site özellikleri üzerinde etkisi olabilir.</p>
              <h3>4. Google AdSense ve üçüncü taraf hizmetler</h3>
              <p>Bu sitede Google AdSense gibi üçüncü taraf reklam hizmetleri kullanılabilir. Bu hizmetler reklam sunmak, ölçüm yapmak ve reklamların performansını değerlendirmek için çerezler veya benzeri teknolojiler kullanabilir. Google'ın reklam teknolojileri ve kişiselleştirilmiş reklam seçenekleri hakkında güncel bilgiler için Google'ın kendi gizlilik ve reklam ayarları sayfalarına başvurulmalıdır.</p>
              <h3>5. Film ve afiş verileri</h3>
              <p>Film afişleri ve bazı film bilgileri üçüncü taraf film veri hizmetleri aracılığıyla alınabilir. Bu hizmetlere yapılan isteklerde film adı ve yılı gibi filmle ilgili teknik parametreler kullanılabilir. PisiBox, kullanıcıdan bu amaçla ad, telefon veya benzeri doğrudan kimlik bilgileri istemez.</p>
              <h3>6. Kişisel verilerin paylaşılması</h3>
              <p>PisiBox, yasal bir yükümlülük bulunmadıkça veya hizmetin teknik olarak sağlanması için gerekli olmadıkça kullanıcıların doğrudan verdiği kişisel bilgileri üçüncü kişilere satmayı veya kiralamayı amaçlamaz. Üçüncü taraf hizmetlerin kendi veri işleme uygulamaları kendi gizlilik politikalarına tabidir.</p>
              <h3>7. Haklar ve iletişim</h3>
              <p>Gizlilik uygulamalarımız hakkında soru, talep veya bildirimlerin için <a href="mailto:iletisim@pisibox.com">iletisim@pisibox.com</a> adresinden bizimle iletişime geçebilirsin. Bu metin genel bilgilendirme amacı taşır; yürürlükteki mevzuat ve kullanılan üçüncü taraf hizmetlerdeki değişikliklere göre güncellenebilir.</p>
            </>}

            {infoPage === "contact" && <>
              <span className="content-kicker">İLETİŞİM</span>
              <h2>İletişim</h2>
              <p>PisiBox hakkında geri bildirim, öneri, teknik hata bildirimi veya içerikle ilgili bir talebin varsa bizimle iletişime geçebilirsin. Kullanıcı deneyimini geliştirmek için gönderilen görüşleri değerlendiriyor ve sitedeki sorunları mümkün olduğunca hızlı şekilde incelemeyi amaçlıyoruz.</p>
              <div className="contact-card">
                <span>Genel iletişim</span>
                <a href="mailto:iletisim@pisibox.com">iletisim@pisibox.com</a>
              </div>
              <h3>Telif hakkı bildirimleri</h3>
              <p>Bir film afişi, görsel, metin veya başka bir içeriğin hak sahibiysen ve PisiBox'taki kullanımına ilişkin bir bildirimde bulunmak istiyorsan, ilgili içeriğin açıkça tanımlandığı bir açıklamayı ve talebini e-posta yoluyla iletebilirsin. Bildirimler incelenerek gerekli görülen işlemler değerlendirilir.</p>
              <p><strong>Not:</strong> Bu e-posta adresi iletişim için yer tutucu olarak kullanılmaktadır. Yayına almadan önce alan adına bağlı gerçek bir iletişim adresiyle değiştirilmesi önerilir.</p>
            </>}
          </section>
        </div>
      )}
      {watchlistOpen && (
        <div className="info-modal-backdrop" role="presentation" onClick={() => setWatchlistOpen(false)}>
          <section className="info-modal watchlist-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{maxWidth:920}}>
            <button className="modal-close" onClick={() => setWatchlistOpen(false)} aria-label="İzleme listesini kapat">×</button>
            <span className="content-kicker">🔖 KAYDEDİLEN FİLMLER</span>
            <h2>İzleme Listem ({watchlist.length})</h2>
            {!watchlist.length ? (
              <div className="empty-result" style={{padding:"35px 10px"}}><div className="film-icon">🔖</div><h3>Listen henüz boş.</h3><p>Film kartındaki “Listeme Ekle” düğmesiyle filmleri burada saklayabilirsin.</p></div>
            ) : (
              <>
                <div className="watchlist-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:14}}>
                  {watchlist.map((item) => (
                    <article key={movieKey(item)} style={{overflow:"hidden",border:"1px solid rgba(255,255,255,.09)",borderRadius:15,background:"rgba(255,255,255,.035)"}}>
                      <div style={{aspectRatio:"2/3",background:"rgba(255,255,255,.03)"}}>
                        {item.poster ? <img src={item.poster} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} /> : <div style={{height:"100%",display:"grid",placeItems:"center",fontSize:32}}>🎬</div>}
                      </div>
                      <div style={{padding:10}}>
                        <strong style={{display:"block",lineHeight:1.3}}>{item.title}</strong>
                        <small style={{color:"rgba(255,255,255,.55)"}}>{item.year} · ⭐ {item.rating}</small>
                        <button onClick={() => removeFromWatchlist(item)} style={{marginTop:9,width:"100%",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,padding:"8px 7px",background:"rgba(255,255,255,.04)",color:"#fff",cursor:"pointer"}}>Listeden Çıkar</button>
                      </div>
                    </article>
                  ))}
                </div>
                <button onClick={clearWatchlist} style={{marginTop:18,border:"1px solid rgba(255,80,80,.25)",borderRadius:10,padding:"10px 14px",background:"rgba(130,20,25,.25)",color:"#fff",cursor:"pointer"}}>🗑️ Tümünü Temizle</button>
              </>
            )}
          </section>
        </div>
      )}

      {trailerMovie && (
        <div className="info-modal-backdrop" role="presentation" onClick={() => setTrailerMovie(null)}>
          <section className="info-modal trailer-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{maxWidth:1000,padding:18}}>
            <button className="modal-close" onClick={() => setTrailerMovie(null)} aria-label="Fragmanı kapat">×</button>
            <span className="content-kicker">🎬 FRAGMAN</span>
            <h2 style={{marginBottom:14}}>{trailerMovie.title}</h2>

            {trailerLoading ? (
              <div style={{minHeight:220,display:"grid",placeItems:"center",borderRadius:14,background:"rgba(0,0,0,.45)",color:"rgba(255,255,255,.75)",fontWeight:700}}>
                🎬 Fragman yükleniyor...
              </div>
            ) : trailerUrl ? (
              <>
                <div style={{position:"relative",aspectRatio:"16/9",overflow:"hidden",borderRadius:14,background:"#000"}}>
                  <iframe
                    title={`${trailerMovie.title} fragmanı`}
                    src={trailerUrl}
                    style={{width:"100%",height:"100%",border:0}}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <a
                  href={youtubeVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:14,minHeight:52,padding:"12px 18px",borderRadius:13,background:"#ff0000",color:"#fff",fontWeight:900,textDecoration:"none",fontSize:16,boxShadow:"0 10px 30px rgba(255,0,0,.22)"}}
                >
                  ▶ YouTube'da İzle
                </a>
              </>
            ) : (
              <div style={{padding:22,textAlign:"center",borderRadius:14,background:"rgba(0,0,0,.35)",color:"rgba(255,255,255,.75)"}}>
                <p style={{marginTop:0}}>Bu film için doğrudan YouTube fragman ID'si bulunamadı.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {cookieVisible && (
        <aside className="cookie-banner" role="dialog" aria-label="Çerez bildirimi">
          <div>
            <strong>Çerez ve gizlilik bildirimi</strong>
            <p>PisiBox, temel site işlevleri ve tercihlerin hatırlanması için gerekli teknolojileri kullanabilir. Google AdSense kullanıldığında reklam çerezleri ve kişiselleştirilmiş reklamlar için ilgili gizlilik ve kullanıcı rızası kuralları uygulanır. Detaylar için <button onClick={() => setInfoPage("privacy")}>Gizlilik Politikası</button> sayfasına göz atabilirsin.</p>
          </div>
          <button className="cookie-accept" onClick={acceptCookies}>Kabul Et</button>
        </aside>
      )}
    </div>
  );
}
export default App;

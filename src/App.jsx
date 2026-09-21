import { useMemo, useState } from "react";

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

const movies = Object.values([...moviesPart1, ...moviesPart2, ...moviesPart3, ...moviesPart4, ...moviesPart5, ...moviesPart6, ...moviesPart7, ...moviesPart8].reduce((map, item) => { map[item.title] = item; return map; }, {}));

const categories = ["Tamamen Rastgele","Korku","Romantik","Aksiyon","Komedi","Dram","Anime","Bilim Kurgu","Fantastik","Gizem","Gerilim","Aile"];

function App() {
  const [category, setCategory] = useState("Tamamen Rastgele");
  const [movie, setMovie] = useState(null);
  const [poster, setPoster] = useState(null);
  const [posterLoading, setPosterLoading] = useState(false);

  const available = useMemo(() => category === "Tamamen Rastgele" ? movies : movies.filter((item) => item.categories.includes(category)), [category]);

  const fetchPoster = async (selectedMovie) => {
    if (!selectedMovie?.title) return null;

    const cacheKey = `${selectedMovie.title}|${selectedMovie.year}`;
    if (posterCache.has(cacheKey)) {
      const cached = posterCache.get(cacheKey);
      setPoster(cached);
      return cached;
    }

    setPosterLoading(true);
    setPoster(null);

    try {
      const response = await fetch(posterUrl(selectedMovie.title, selectedMovie.year));
      const data = await response.json();
      const url = data.Response === "True" && data.Poster && data.Poster !== "N/A" ? data.Poster : null;
      posterCache.set(cacheKey, url);
      setPoster(url);
      return url;
    } catch (error) {
      console.error("OMDb poster alınamadı:", error);
      setPoster(null);
      return null;
    } finally {
      setPosterLoading(false);
    }
  };

  const roll = async () => {
    if (!available.length) return;

    const choices = available.length > 1
      ? available.filter((item) => item.title !== movie?.title)
      : available;

    const selectedMovie = choices[Math.floor(Math.random() * choices.length)];
    setMovie(selectedMovie);

    // Poster isteğini hemen başlat; film sonucu beklemeden ekrana gelir.
    fetchPoster(selectedMovie);
  };

    const choices = available.length > 1
      ? available.filter((item) => item.title !== movie?.title)
      : available;

    const selectedMovie = choices[Math.floor(Math.random() * choices.length)];
    setMovie(selectedMovie);
    await fetchPoster(selectedMovie);
  };

  const icon = (item) => ({ "Tamamen Rastgele":"🎲","Korku":"💀","Romantik":"❤️","Aksiyon":"💥","Komedi":"🙂","Dram":"🎭","Anime":"🐱","Bilim Kurgu":"🪐","Fantastik":"🧙","Gizem":"🔍","Gerilim":"〽️","Aile":"👨‍👩‍👧‍👦" }[item] || "•");

  return (
    <div className="dice-app">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark">▶</div><div><div className="brand-name">Pisi<span>Box</span></div><small>FİLM HER ZAMAN İYİ BİR FİKİRDİR.</small></div></div>
        <nav><button>⌂ <span>Ana Sayfa</span></button><button onClick={() => {setCategory("Tamamen Rastgele");setMovie(null)}}>♡ <span>Rastgele</span></button><button className="theme-button">☾</button></nav>
      </header>
      <main>
        <section className="hero-copy"><div className="mini-kicker">NE İZLESEM DİYE DÜŞÜNME.</div><h1>ZARI AT,<br /><em>FİLMİNİ BUL.</em></h1><p>Karar vermeyi bırak. Bir kategori seç veya tamamen şansa bırak.</p></section>
        <section className="categories">{categories.map((item)=><button key={item} className={category===item?"category selected":"category"} onClick={()=>setCategory(item)}><span>{icon(item)}</span>{item}</button>)}</section>
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
          <button className="roll-button" onClick={roll}>🎲 <span>ZARI AT</span></button>
        </section>
        <section className={movie?"result-panel has-result":"result-panel"}>
          {movie ? <div className="movie-result"><div className="poster-art">
              {posterLoading ? (
                <div className="poster-loading"><span>🎬</span><small>Afiş yükleniyor...</small></div>
              ) : poster ? (
                <img src={poster} alt={`${movie.title} film afişi`} loading="lazy" />
              ) : (
                <div className="poster-fallback"><span>🎬</span><small>Afiş bulunamadı</small></div>
              )}
              <strong>⭐ {movie.rating}</strong>
            </div><div className="result-copy"><span className="result-kicker">{movie.categories.join(" · ")}</span><h2>{movie.title}</h2><small>{movie.year}</small><p>{movie.summary}</p><button className="again" onClick={roll}>🎲 Bir daha at</button></div></div> : <div className="empty-result"><div className="film-icon">▣</div><h3>Henüz film yok.</h3><p>Zarı atarak senin için bir film önerelim!</p></div>}
        </section>
        <section className="ad-grid" aria-label="Reklam alanları">
          {[1,2,3,4,5,6].map((slot) => <div className="ad-slot" key={slot}><span>Reklam</span><div className="ad-slot-inner" /></div>)}
        </section>
      </main>
      <footer>“İyi filmler, zor zamanları daha katlanılabilir kılar.”</footer>
    </div>
  );
}
export default App;

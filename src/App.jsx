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

const movies = Object.values([...moviesPart1, ...moviesPart2, ...moviesPart3, ...moviesPart4, ...moviesPart5, ...moviesPart6, ...moviesPart7, ...moviesPart8].reduce((map, item) => { map[item.title] = item; return map; }, {}));

const categories = ["Tamamen Rastgele","Korku","Romantik","Aksiyon","Komedi","Dram","Anime","Bilim Kurgu","Fantastik","Gizem","Gerilim","Aile"];

function App() {
  const [category, setCategory] = useState("Tamamen Rastgele");
  const [movie, setMovie] = useState(null);
  const [poster, setPoster] = useState(null);
  const [posterLoading, setPosterLoading] = useState(false);
  const [infoPage, setInfoPage] = useState(null);
  const [cookieVisible, setCookieVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem("pisibox-cookie-consent");
    if (!consent) setCookieVisible(true);
  }, []);

  const acceptCookies = () => {
    window.localStorage.setItem("pisibox-cookie-consent", "accepted");
    setCookieVisible(false);
  };

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

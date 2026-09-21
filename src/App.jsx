import { useMemo, useState } from "react";

const movies = [
  { title:"Inception", year:2010, categories:["Bilim Kurgu","Aksiyon","Gizem"], rating:8.8, summary:"Bir hırsız, insanların rüyalarına girerek sırlarını çalabilmektedir. Bu kez ekibiyle birlikte bir fikri bir insanın zihnine yerleştirmek için imkânsız görünen bir göreve çıkar." },
  { title:"Interstellar", year:2014, categories:["Bilim Kurgu","Dram"], rating:8.7, summary:"Dünya yaşanamaz hale gelirken eski bir pilot, insanlığın yeni bir yuva bulabilmesi için uzayda tehlikeli bir yolculuğa çıkar." },
  { title:"The Dark Knight", year:2008, categories:["Aksiyon","Gerilim"], rating:9.0, summary:"Batman, Gotham'ı kaosa sürükleyen gizemli Joker ile karşı karşıya gelir. Mücadele, adalet ile kaos arasındaki sınırları zorlar." },
  { title:"Parasite", year:2019, categories:["Dram","Gerilim","Gizem"], rating:8.5, summary:"Maddi sıkıntılar yaşayan bir aile, zengin bir ailenin hayatına yavaş yavaş dahil olur. İki ailenin dünyası kesiştikçe beklenmedik gerçekler ortaya çıkar." },
  { title:"Get Out", year:2017, categories:["Korku","Gerilim","Gizem"], rating:7.8, summary:"Genç bir adam kız arkadaşının ailesiyle tanışmak için onların tenha evine gider. Başta tuhaf görünen davranışların ardında çok daha karanlık bir gerçek vardır." },
  { title:"Hereditary", year:2018, categories:["Korku","Dram"], rating:7.3, summary:"Aile büyüklerinin ölümünden sonra bir ailenin geçmişindeki karanlık sırlar açığa çıkar. Evde açıklanamayan olaylar giderek daha korkutucu bir hal alır." },
  { title:"The Conjuring", year:2013, categories:["Korku"], rating:7.5, summary:"Yeni taşındıkları evde doğaüstü olaylarla karşılaşan bir aile, yardım için paranormal araştırmacılara başvurur." },
  { title:"Scream", year:1996, categories:["Korku","Gizem"], rating:7.4, summary:"Maskeli bir katil küçük bir kasabada gençleri hedef almaya başlar. Kurbanlar, katilin kim olduğunu bulmaya çalışırken korku giderek büyür." },
  { title:"The Shining", year:1980, categories:["Korku","Gerilim"], rating:8.4, summary:"Kış boyunca izole bir otelde bekçilik yapan bir yazar, otelin karanlık geçmişinin etkisiyle gerçeklik duygusunu yavaş yavaş kaybetmeye başlar." },
  { title:"A Quiet Place", year:2018, categories:["Korku","Bilim Kurgu"], rating:7.5, summary:"Görme yetileri olmayan ancak en küçük sesi bile duyabilen yaratıkların dünyasında bir aile hayatta kalmak için sessiz yaşamak zorundadır." },
  { title:"Titanic", year:1997, categories:["Romantik","Dram"], rating:7.9, summary:"Farklı sosyal sınıflardan iki genç, Titanic'in ilk yolculuğunda birbirlerine aşık olur. Ancak geminin kaderi bu aşkı büyük bir sınava sokar." },
  { title:"The Notebook", year:2004, categories:["Romantik","Dram"], rating:7.8, summary:"Farklı hayatlara sahip iki genç yaz boyunca birbirlerine aşık olur. Yıllar geçse de aralarındaki bağ ve geçmişte yaşadıkları aşk unutulmaz." },
  { title:"La La Land", year:2016, categories:["Romantik","Komedi","Dram"], rating:8.0, summary:"Los Angeles'ta hayallerinin peşinden giden bir oyuncu ve caz piyanisti birbirlerine aşık olur. Kariyerleri ilerledikçe aşkları da sınanır." },
  { title:"About Time", year:2013, categories:["Romantik","Komedi","Fantastik"], rating:7.8, summary:"Geçmişe yolculuk yapabilen genç bir adam bu yeteneğini aşk hayatını değiştirmek için kullanır ve zamanla mutluluğun başka bir yerde olduğunu keşfeder." },
  { title:"Crazy Rich Asians", year:2018, categories:["Romantik","Komedi"], rating:6.9, summary:"Genç bir kadın sevgilisinin ailesiyle tanışmak için Singapur'a gider ve onların tahmin ettiğinden çok daha zengin olduğunu öğrenir." },
  { title:"The Hangover", year:2009, categories:["Komedi"], rating:7.7, summary:"Bir grup arkadaş bekârlığa veda gecesi için Las Vegas'a gider. Ertesi sabah damat ortadan kaybolmuştur ve gece boyunca ne olduğunu hatırlamamaktadırlar." },
  { title:"Superbad", year:2007, categories:["Komedi"], rating:7.6, summary:"Liseden mezun olmadan önce unutulmaz bir partiye gitmek isteyen iki arkadaş, planlarını gerçekleştirmeye çalışırken bir dizi komik olayın içine düşer." },
  { title:"Game Night", year:2018, categories:["Komedi","Gizem"], rating:6.9, summary:"Oyun gecesi düzenleyen bir grup arkadaş, eğlence sandıkları olayın gerçek bir kaçırılma vakasına dönüşmesiyle kendilerini beklenmedik bir maceranın içinde bulur." },
  { title:"Spirited Away", year:2001, categories:["Anime","Fantastik","Aile"], rating:8.6, summary:"Genç bir kız, ailesi gizemli bir ruhlar dünyasında kaybolunca onları kurtarmak için büyülü bir dünyada çalışmaya başlar." },
  { title:"Your Name", year:2016, categories:["Anime","Romantik","Fantastik"], rating:8.4, summary:"Birbirlerini hiç tanımayan iki genç gizemli şekilde beden değiştirmeye başlar. Aralarında oluşan bağ onları zaman ve mesafeyi aşan bir hikâyeye götürür." },
  { title:"Howl's Moving Castle", year:2004, categories:["Anime","Fantastik","Romantik"], rating:8.2, summary:"Genç bir kadın lanet sonucu yaşlı bir kadına dönüşür ve büyücü Howl'un yürüyen şatosuna sığınır. Burada hem lanetini hem de kendi geçmişini çözmeye çalışır." },
  { title:"Attack on Titan", year:2013, categories:["Anime","Aksiyon","Dram"], rating:9.1, summary:"İnsanlık devlerden korunmak için devasa duvarların arkasında yaşamaktadır. Bir saldırı, gençlerin hayatta kalma ve gerçeği öğrenme mücadelesini başlatır." },
  { title:"Harry Potter and the Philosopher's Stone", year:2001, categories:["Fantastik","Aile"], rating:7.6, summary:"Sıradan bir çocuk olduğunu sanan Harry, büyücü olduğunu öğrenir ve Hogwarts'ta yeni bir dünyaya adım atar." },
  { title:"The Lord of the Rings", year:2001, categories:["Fantastik","Aksiyon","Dram"], rating:8.9, summary:"Genç bir hobbit, dünyayı yok edebilecek güçlü bir yüzüğü yok etmek için tehlikeli bir yolculuğa çıkar ve farklı halklardan oluşan bir topluluğa katılır." },
  { title:"Knives Out", year:2019, categories:["Gizem","Komedi"], rating:7.9, summary:"Zengin bir ailenin reisi öldüğünde ünlü bir dedektif olayın peşine düşer. Evdeki herkesin bir sırrı ve cinayet için olası bir nedeni vardır." },
  { title:"Se7en", year:1995, categories:["Gerilim","Gizem","Korku"], rating:8.6, summary:"İki dedektif, cinayetlerini yedi ölümcül günah üzerinden işleyen bir seri katilin peşine düşer. Soruşturma giderek daha karanlık bir hal alır." },
  { title:"Mad Max: Fury Road", year:2015, categories:["Aksiyon","Bilim Kurgu"], rating:8.1, summary:"Çölde acımasız bir tirandan kaçan Furiosa ve tutsak kadınlar, Max ile birlikte hayatta kalmak için yüksek tempolu bir kovalamacaya girer." },
  { title:"Everything Everywhere All at Once", year:2022, categories:["Aksiyon","Komedi","Bilim Kurgu"], rating:7.7, summary:"Sıradan bir kadın, paralel evrenlerin kaderinin kendi ellerinde olduğunu öğrenir ve farklı hayatlarının yeteneklerinden yararlanarak büyük bir tehditle savaşır." },
];

const categories = ["Tamamen Rastgele","Korku","Romantik","Aksiyon","Komedi","Dram","Anime","Bilim Kurgu","Fantastik","Gizem","Gerilim","Aile"];

function App() {
  const [category, setCategory] = useState("Tamamen Rastgele");
  const [movie, setMovie] = useState(null);

  const available = useMemo(() => category === "Tamamen Rastgele" ? movies : movies.filter((item) => item.categories.includes(category)), [category]);

  const roll = () => {
    if (!available.length) return;
    const choices = available.length > 1 ? available.filter((item) => item.title !== movie?.title) : available;
    setMovie(choices[Math.floor(Math.random() * choices.length)]);
  };

  const icon = (item) => ({ "Tamamen Rastgele":"🎲","Korku":"☠","Romantik":"♥","Aksiyon":"✦","Komedi":"●","Dram":"◈","Anime":"✦","Bilim Kurgu":"◉","Fantastik":"♠","Gizem":"⌕","Gerilim":"〰","Aile":"♟" }[item] || "•");

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
            <div className="dice-face face-front"><i/><i/><i/><i/><i/></div><div className="dice-face face-side"><i/><i/><i/><i/></div><div className="dice-face face-top"><i/><i/><i/></div>
          </button>
          <div className="scribble scribble-right"><b>↙</b> ve filmin<br/>gelsin!</div>
          <button className="roll-button" onClick={roll}>🎲 <span>ZARI AT</span></button>
        </section>
        <section className={movie?"result-panel has-result":"result-panel"}>
          {movie ? <div className="movie-result"><div className="poster-art"><span>🎬</span><strong>⭐ {movie.rating}</strong></div><div className="result-copy"><span className="result-kicker">{movie.categories.join(" · ")}</span><h2>{movie.title}</h2><small>{movie.year}</small><p>{movie.summary}</p><button className="again" onClick={roll}>🎲 Bir daha at</button></div></div> : <div className="empty-result"><div className="film-icon">▣</div><h3>Henüz film yok.</h3><p>Zarı atarak senin için bir film önerelim!</p></div>}
        </section>
      </main>
      <footer>“İyi filmler, zor zamanları daha katlanılabilir kılar.”</footer>
    </div>
  );
}
export default App;

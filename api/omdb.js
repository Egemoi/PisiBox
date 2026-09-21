module.exports = async function handler(req, res) {
  const { title, year } = req.query || {};

  if (!title) {
    return res.status(400).json({ Response: "False", Error: "Film adı gerekli." });
  }

  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ Response: "False", Error: "OMDb API anahtarı Vercel'de bulunamadı." });
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    t: title,
    type: "movie",
    plot: "short",
    r: "json",
  });

  if (year && /^\d{4}$/.test(String(year))) {
    params.set("y", String(year));
  }

  try {
    const response = await fetch(`https://www.omdbapi.com/?${params.toString()}`);
    const data = await response.json();

    if (data.Response === "True" && data.Poster && data.Poster !== "N/A") {
      data.Poster = data.Poster.replace(/^http:\/\//i, "https://");
    }

    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(data);
  } catch (error) {
    console.error("OMDb request failed:", error);
    return res.status(502).json({
      Response: "False",
      Error: "OMDb servisine ulaşılamadı.",
    });
  }
};

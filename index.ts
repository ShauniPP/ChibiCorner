import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";

import MangaModel from "./models/manga";
import AuthorModel from "./models/author";

const app = express();

// EJS instellen
app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Hulpfuncties
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// MongoDB verbinden
async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI ontbreekt in je .env bestand");
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Verbonden met MongoDB Atlas");
}

// ROUTES

// Overzichtspagina
app.get("/", async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim() || "";
    const sort = (req.query.sort as string) || "title";
    const order = (req.query.order as string) === "desc" ? "desc" : "asc";

    const filter = q
      ? {
          title: { $regex: q, $options: "i" },
        }
      : {};

    const allowedSortFields = ["id", "title", "genre", "releaseDate"];
    const sortField = allowedSortFields.includes(sort) ? sort : "title";

    const sortObject: Record<string, 1 | -1> = {};
    sortObject[sortField] = order === "asc" ? 1 : -1;

    const mangas = await MangaModel.find(filter).sort(sortObject).lean();

    const simplifiedData = mangas.map((item) => ({
      id: item.id,
      title: item.title,
      genre: item.genre,
      releaseDate: item.releaseDate,
      image: item.coverImage ?? item.image,
    }));

    res.render("overview", {
      mangas: simplifiedData,
      q,
      sort: sortField,
      order,
    });
  } catch (error) {
    console.error("Fout in overzichtspagina:", error);
    res.status(500).send("Fout bij laden van de overzichtspagina");
  }
});

// Detailpagina
app.get("/detail/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).send("Ongeldig manga-ID");
    }

    const manga = await MangaModel.findOne({ id }).lean();

    if (!manga) {
      return res.status(404).send("Manga niet gevonden!");
    }

    const author = manga.authorId
      ? await AuthorModel.findOne({ authorId: manga.authorId }).lean()
      : null;

    const related = manga.authorId
      ? await MangaModel.find({
          authorId: manga.authorId,
          id: { $ne: manga.id },
        }).lean()
      : [];

    res.render("detail", { manga, author, related });
  } catch (error) {
    console.error("Fout in detailpagina:", error);
    res.status(500).send("Fout bij laden van de detailpagina");
  }
});

// Auteurpagina
app.get("/author/:authorId", async (req, res) => {
  try {
    const { authorId } = req.params;

    const author = await AuthorModel.findOne({ authorId }).lean();

    if (!author) {
      return res.status(404).send("Auteur niet gevonden!");
    }

    const mangas = await MangaModel.find({ authorId }).lean();

    res.render("author", { author, mangas });
  } catch (error) {
    console.error("Fout in auteurspagina:", error);
    res.status(500).send("Fout bij laden van de auteurspagina");
  }
});

// Genres-pagina
app.get("/genres", (req, res) => {
  const genres = {
    audiences: [
      { name: "Shōnen", desc: "Actie, avontuur, vriendschap", examples: ["One Piece", "Naruto"] },
      { name: "Shōjo", desc: "Romantiek, emoties", examples: ["Fruits Basket"] },
      { name: "Seinen", desc: "Volwassen thema's", examples: ["Berserk", "Monster"] },
      { name: "Josei", desc: "Relaties voor volwassenen", examples: ["Nana", "Paradise Kiss"] },
      { name: "Kodomomuke", desc: "Voor kinderen", examples: ["Doraemon", "Yo-Kai Watch"] },
    ],
    mains: [
      { name: "Actie / Avontuur", desc: "Gevechten, reizen", examples: ["One Piece", "Attack on Titan"] },
      { name: "Fantasy", desc: "Magie en mythische werelden", examples: ["Fairy Tail", "Made in Abyss"] },
      { name: "Sci-fi / Mecha", desc: "Robots en futuristische tech", examples: ["Gundam", "Evangelion"] },
      { name: "Romantiek", desc: "Liefdesverhalen", examples: ["Kimi ni Todoke", "Ao Haru Ride"] },
      { name: "Slice of Life", desc: "Alledaags leven", examples: ["Barakamon", "March Comes in Like a Lion"] },
      { name: "Mystery / Detective", desc: "Puzzels en onderzoek", examples: ["Detective Conan", "Death Note"] },
      { name: "Horror", desc: "Spanning en angst", examples: ["Tokyo Ghoul", "Junji Ito's works"] },
    ],
    subs: [
      { name: "Isekai", desc: "Hoofdpersoon komt in een andere wereld", examples: ["Re:Zero", "Sword Art Online"] },
      { name: "Magical Girl", desc: "Meisjes met magie", examples: ["Sailor Moon", "Cardcaptor Sakura"] },
      { name: "Yaoi / BL", desc: "Romantiek tussen mannen", examples: ["Given"] },
      { name: "Yuri", desc: "Romantiek tussen vrouwen", examples: ["Bloom Into You"] },
      { name: "Ecchi", desc: "Suggestieve fanservice", examples: ["Highschool DxD"] },
      { name: "Harem", desc: "1 hoofdpersoon, meerdere liefdes", examples: ["Nisekoi", "Ouran High School Host Club"] },
    ],
  };

  res.render("genres", { genres });
});

// About pagina
app.get("/about", (req, res) => {
  res.render("about");
});

// Contact pagina
app.get("/contact", (req, res) => {
  res.render("contact");
});

// Contactformulier versturen via Brevo
app.post("/contact", async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const message = req.body.message?.trim();

  if (!name || !email || !message) {
    return res.status(400).send("Vul alle velden in.");
  }

  if (!isValidEmail(email)) {
    return res.status(400).send("Vul een geldig e-mailadres in.");
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "ChibiCorner";
  const emailTo = process.env.EMAIL_TO;

  if (!brevoApiKey || !senderEmail || !emailTo) {
    console.error("❌ Brevo instellingen ontbreken");
    return res.status(500).send("De e-mailinstellingen ontbreken.");
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    console.log("⏳ Probeer mail te verzenden via Brevo...");

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: emailTo,
          },
        ],
        replyTo: {
          name: safeName,
          email: email,
        },
        subject: `Nieuw contactbericht van ${safeName}`,
        htmlContent: `
          <h2>Nieuw bericht via ChibiCorner</h2>
          <p><strong>Naam:</strong> ${safeName}</p>
          <p><strong>E-mail:</strong> ${safeEmail}</p>
          <p><strong>Bericht:</strong></p>
          <p>${safeMessage}</p>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo fout:", data);
      return res.status(500).send("Er ging iets mis bij het verzenden van je bericht.");
    }

    console.log("✅ Mail verzonden via Brevo:", data);

    res.send(`
      <html lang="nl">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Bericht verzonden</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #FFF5E1;
              color: #2C3E50;
              text-align: center;
              padding: 40px;
            }
            .message-box {
              max-width: 700px;
              margin: 0 auto;
              background: rgba(163, 217, 193, 0.25);
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(163, 217, 193, 0.4);
            }
            a {
              display: inline-block;
              margin-top: 20px;
              padding: 10px 18px;
              background-color: #A3D9C1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            }
            a:hover {
              background-color: #7AAE9F;
            }
          </style>
        </head>
        <body>
          <div class="message-box">
            <h1>Bedankt voor je bericht!</h1>
            <p>Je bericht werd succesvol verzonden.</p>
            <a href="/contact">Terug naar contactpagina</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Fout bij verzenden via Brevo:", error);
    res.status(500).send("Er ging iets mis bij het verzenden van je bericht.");
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send("Pagina niet gevonden");
});

// Server starten
async function startServer(): Promise<void> {
  try {
    await connectDB();

    const port = Number(process.env.PORT) || 3000;

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Fout bij opstarten:", error);
  }
}

startServer();
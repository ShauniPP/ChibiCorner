"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const manga_1 = __importDefault(require("./models/manga"));
const author_1 = __importDefault(require("./models/author"));
const app = (0, express_1.default)();
// EJS instellen
app.set("view engine", "ejs");
app.set("views", "./views");
// Middleware
app.use(express_1.default.static("public"));
app.use(express_1.default.urlencoded({ extended: true }));
// Hulpfuncties
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// MongoDB verbinden
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI ontbreekt in je .env bestand");
        }
        yield mongoose_1.default.connect(mongoUri);
        console.log("✅ Verbonden met MongoDB Atlas");
    });
}
// Mail config
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailTo = process.env.EMAIL_TO;
console.log("EMAIL_USER:", emailUser);
console.log("EMAIL_PASS aanwezig:", !!emailPass);
console.log("EMAIL_TO:", emailTo);
if (!emailUser || !emailPass || !emailTo) {
    console.warn("⚠️ EMAIL_USER, EMAIL_PASS of EMAIL_TO ontbreekt in je .env. Contactformulier zal niet correct werken.");
}
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});
// ROUTES
// Overzichtspagina
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const q = ((_a = req.query.q) === null || _a === void 0 ? void 0 : _a.trim()) || "";
        const sort = req.query.sort || "title";
        const order = req.query.order === "desc" ? "desc" : "asc";
        const filter = q
            ? {
                title: { $regex: q, $options: "i" },
            }
            : {};
        const allowedSortFields = ["id", "title", "genre", "releaseDate"];
        const sortField = allowedSortFields.includes(sort) ? sort : "title";
        const sortObject = {};
        sortObject[sortField] = order === "asc" ? 1 : -1;
        const mangas = yield manga_1.default.find(filter).sort(sortObject).lean();
        const simplifiedData = mangas.map((item) => {
            var _a;
            return ({
                id: item.id,
                title: item.title,
                genre: item.genre,
                releaseDate: item.releaseDate,
                image: (_a = item.coverImage) !== null && _a !== void 0 ? _a : item.image,
            });
        });
        res.render("overview", {
            mangas: simplifiedData,
            q,
            sort: sortField,
            order,
        });
    }
    catch (error) {
        console.error("Fout in overzichtspagina:", error);
        res.status(500).send("Fout bij laden van de overzichtspagina");
    }
}));
// Detailpagina
app.get("/detail/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).send("Ongeldig manga-ID");
        }
        const manga = yield manga_1.default.findOne({ id }).lean();
        if (!manga) {
            return res.status(404).send("Manga niet gevonden!");
        }
        const author = manga.authorId
            ? yield author_1.default.findOne({ authorId: manga.authorId }).lean()
            : null;
        const related = manga.authorId
            ? yield manga_1.default.find({
                authorId: manga.authorId,
                id: { $ne: manga.id },
            }).lean()
            : [];
        res.render("detail", { manga, author, related });
    }
    catch (error) {
        console.error("Fout in detailpagina:", error);
        res.status(500).send("Fout bij laden van de detailpagina");
    }
}));
// Auteurpagina
app.get("/author/:authorId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { authorId } = req.params;
        const author = yield author_1.default.findOne({ authorId }).lean();
        if (!author) {
            return res.status(404).send("Auteur niet gevonden!");
        }
        const mangas = yield manga_1.default.find({ authorId }).lean();
        res.render("author", { author, mangas });
    }
    catch (error) {
        console.error("Fout in auteurspagina:", error);
        res.status(500).send("Fout bij laden van de auteurspagina");
    }
}));
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
// Contactformulier versturen
app.post("/contact", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const name = (_b = req.body.name) === null || _b === void 0 ? void 0 : _b.trim();
    const email = (_c = req.body.email) === null || _c === void 0 ? void 0 : _c.trim();
    const message = (_d = req.body.message) === null || _d === void 0 ? void 0 : _d.trim();
    if (!name || !email || !message) {
        return res.status(400).send("Vul alle velden in.");
    }
    if (!isValidEmail(email)) {
        return res.status(400).send("Vul een geldig e-mailadres in.");
    }
    if (!emailUser || !emailPass || !emailTo) {
        return res
            .status(500)
            .send("De e-mailinstellingen ontbreken in het .env bestand.");
    }
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    try {
        yield transporter.sendMail({
            from: `"ChibiCorner Contact" <${emailUser}>`,
            to: emailTo,
            replyTo: email,
            subject: `Nieuw contactbericht van ${safeName}`,
            html: `
        <h2>Nieuw bericht via ChibiCorner</h2>
        <p><strong>Naam:</strong> ${safeName}</p>
        <p><strong>E-mail:</strong> ${safeEmail}</p>
        <p><strong>Bericht:</strong></p>
        <p>${safeMessage}</p>
      `,
        });
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
    }
    catch (error) {
        console.error("Fout bij verzenden van e-mail:", error);
        res.status(500).send("Er ging iets mis bij het verzenden van je bericht.");
    }
}));
// 404 fallback
app.use((req, res) => {
    res.status(404).send("Pagina niet gevonden");
});
// Server starten
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectDB();
            if (emailUser && emailPass && emailTo) {
                try {
                    yield transporter.verify();
                    console.log("✅ Mailserver is klaar om berichten te verzenden");
                }
                catch (mailError) {
                    console.error("❌ Fout bij mailconfiguratie:", mailError);
                }
            }
            const port = Number(process.env.PORT) || 3000;
            app.listen(port, () => {
                console.log(`🚀 Server is running on http://localhost:${port}`);
            });
        }
        catch (error) {
            console.error("❌ Fout bij opstarten:", error);
        }
    });
}
startServer();

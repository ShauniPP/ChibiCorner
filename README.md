# Manga Website

Dit project is een **Node.js webapplicatie** waarin gebruikers manga kunnen bekijken, zoeken en informatie over auteurs kunnen zien.
De website haalt alle data uit een **MongoDB Atlas database** en gebruikt **Express + EJS** om de pagina's te renderen.

Daarnaast bevat de website een **contactformulier** waarmee gebruikers een bericht kunnen sturen via e-mail met behulp van **Nodemailer**.

---

## Technologieën

De website is gebouwd met de volgende technologieën:

* **Node.js**
* **Express**
* **TypeScript**
* **MongoDB Atlas**
* **Mongoose**
* **EJS (Embedded JavaScript templates)**
* **Nodemailer**
* **Git & GitHub**

---

## Functionaliteiten

De website bevat de volgende features:

* Overzicht van manga's
* Zoekfunctie op titel
* Sorteren van manga's
* Detailpagina per manga
* Auteurspagina met alle manga's van een auteur
* Genres overzicht
* Contactformulier dat een e-mail verstuurt
* Data opgeslagen in MongoDB

---

## Projectstructuur

website-mangas
│
├── models
│   ├── manga.ts
│   └── author.ts
│
├── public
│   ├── css
│   └── images
│
├── views
│   ├── about.ejs
│   ├── author.ejs
│   ├── contact.ejs
│   ├── detail.ejs
│   ├── genres.ejs
│   └── overview.ejs
│
├── index.ts
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md

---

## Installatie

Volg deze stappen om het project lokaal te starten.

### 1. Clone de repository

git clone https://github.com/JOUW_GITHUB_NAAM/website-mangas.git

### 2. Ga naar de projectmap

cd website-mangas

### 3. Installeer dependencies

npm install

### 4. Maak een `.env` bestand

Maak in de root van het project een bestand genaamd `.env`.

Voorbeeld:

MONGODB_URI=your_mongodb_connection_string
PORT=3000
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=your_email_address

⚠️ Dit bestand wordt **niet op GitHub geplaatst** omdat het gevoelige informatie bevat.

### 5. Start de server

Voor development:

npm run dev

Of voor production:

npm start

De website draait dan op:

http://localhost:3000

---

## Deployment

De website kan online worden gezet via een hostingplatform zoals:

* Render
* Railway
* Vercel (met Node backend)
* Docker

Bij deployment moeten de **environment variables** ook ingesteld worden in het hostingplatform.

---

## Environment Variables

De applicatie gebruikt de volgende environment variables:

MONGODB_URI → MongoDB Atlas connection string
PORT → server port
EMAIL_USER → Gmail account dat e-mails verstuurt
EMAIL_PASS → Gmail App Password
EMAIL_TO → e-mailadres waar berichten naartoe gestuurd worden

---

## Contactformulier

Het contactformulier gebruikt **Nodemailer** om e-mails te versturen.

De e-mail wordt verstuurd via Gmail SMTP en bevat:

* naam van de gebruiker
* e-mailadres van de gebruiker
* bericht van de gebruiker

Wanneer een gebruiker het formulier verzendt, ontvangt de eigenaar van de website een e-mail met de inhoud van het bericht.

---

## Auteur

Project gemaakt door **Shauni Peeters** als onderdeel van een web development project.

---

## Licentie

Dit project is bedoeld voor educatieve doeleinden.

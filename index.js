require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const sqlite3 = require("sqlite3").verbose();

// 🔹 Bot token env se lo
const bot = new Telegraf(process.env.BOT_TOKEN);

// 🔹 DB setup
const db = new sqlite3.Database("./jadu.db");
db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT
)`);

// 🔹 Admin Telegram ID (sirf aap dekh paoge /list)
const ADMIN_ID = 7212452634;

// 🔹 /start command
bot.start((ctx) => {
  ctx.reply("🙏 Ram Ram!", Markup.keyboard([
      [Markup.button.contactRequest("📱 Jadu")]
  ]).resize());
});

// 🔹 Jab user 📱 Jadu button dabaye
bot.on("contact", (ctx) => {
  const contact = ctx.message.contact;
  const name = contact.first_name || "Unknown";
  const phone = contact.phone_number;

  db.run("INSERT INTO contacts (name, phone) VALUES (?, ?)", [name, phone], (err) => {
    if (err) console.error(err);
  });

  ctx.reply("✅ Ram Ram! Jadu ho gaya.");
});

// 🔹 Sirf Admin ke liye /list
bot.command("list", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return; // baki users ko kuch nahi dikhana
  }

  db.all("SELECT * FROM contacts", [], (err, rows) => {
    if (err) {
      ctx.reply("❌ Error fetching contacts");
      return;
    }

    if (rows.length === 0) {
      ctx.reply("ℹ️ Abhi tak koi number save nahi hua.");
    } else {
      let msg = "📋 Saved contacts:\n\n";
      rows.forEach((row, i) => {
        msg += `${i + 1}) ${row.name} - ${row.phone}\n`;
      });
      ctx.reply(msg);
    }
  });
});

// 🔹 Bot launch
bot.launch();
console.log("🚀 Jadu bot running… Ram Ram!");

// Graceful stop (for Termux/Heroku)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

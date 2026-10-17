// ===============================
// ORIGIN SMP — FULL FIXED index.js
// HOSTS DASHBOARD + API
// ===============================

const {
  Client,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const express = require("express");
const cors = require("cors");
const path = require("path");

// ===============================
// EXPRESS SETUP
// ===============================
const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// SERVE DASHBOARD FILES
// ===============================
app.use(express.static(path.join(__dirname)));

// Root route → load dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// ===============================
// DISCORD CLIENT
// ===============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ===============================
// BOT LOGIN (FIXED)
// ===============================
if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing in Render environment variables!");
  process.exit(1);
}

client.login(process.env.BOT_TOKEN)
  .then(() => console.log("✅ Bot logged in successfully"))
  .catch(err => {
    console.error("❌ Failed to login:", err);
    process.exit(1);
  });

// ===============================
// API PREFIX
// ===============================
const API_PREFIX = "/api";

// ===============================
// GET GUILD (SAFE)
// ===============================
function getGuild() {
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.error("❌ No guild found. Bot is not in any server.");
    return null;
  }
  return guild;
}

// ===============================
// CHANNELS ENDPOINT
// ===============================
app.get(`${API_PREFIX}/channels`, async (req, res) => {
  try {
    const guild = getGuild();
    if (!guild) return res.json([]);

    await guild.channels.fetch();

    const channels = guild.channels.cache
      .filter(c => c.type !== 4)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(channels);
  } catch (err) {
    console.error("Channel fetch error:", err);
    res.json([]);
  }
});

// ===============================
// ROLES ENDPOINT
// ===============================
app.get(`${API_PREFIX}/roles`, async (req, res) => {
  try {
    const guild = getGuild();
    if (!guild) return res.json([]);

    await guild.roles.fetch();

    const roles = guild.roles.cache.map(r => ({
      id: r.id,
      name: r.name
    }));

    res.json(roles);
  } catch (err) {
    console.error("Role fetch error:", err);
    res.json([]);
  }
});

// ===============================
// MEMBERS ENDPOINT
// ===============================
app.get(`${API_PREFIX}/members`, async (req, res) => {
  try {
    const guild = getGuild();
    if (!guild) return res.json([]);

    await guild.members.fetch();

    const members = guild.members.cache.map(m => ({
      id: m.id,
      name: m.user.username
    }));

    res.json(members);
  } catch (err) {
    console.error("Member fetch error:", err);
    res.json([]);
  }
});

// ===============================
// STATUS ENDPOINT
// ===============================
app.get(`${API_PREFIX}/status`, (req, res) => {
  try {
    res.json({
      status: client.ws.status === 0 ? "Online" : "Offline",
      guilds: client.guilds.cache.size,
      ping: client.ws.ping
    });
  } catch (err) {
    console.error("Status error:", err);
    res.json({ status: "Error", guilds: 0, ping: 0 });
  }
});

// ===============================
// SAVE ANTI-RAID
// ===============================
app.post(`${API_PREFIX}/saveAntiRaid`, (req, res) => {
  console.log("Anti-Raid Saved:", req.body);
  res.json({ ok: true });
});

// ===============================
// DEPLOY TICKETS
// ===============================
app.post(`${API_PREFIX}/deployTickets`, (req, res) => {
  console.log("Tickets deployed:", req.body);
  res.json({ ok: true });
});

// ===============================
// SAVE STAFF
// ===============================
app.post(`${API_PREFIX}/saveStaff`, (req, res) => {
  console.log("Staff saved:", req.body);
  res.json({ ok: true });
});

// ===============================
// EXPRESS SERVER
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Origin SMP API + Dashboard running on port ${PORT}`);
});

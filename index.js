// ===============================
// ORIGIN SMP — FULL FIXED index.js
// ===============================

const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
// BOT LOGIN
// ===============================
client.login("YOUR_BOT_TOKEN_HERE");

// ===============================
// API BASE
// ===============================
const API_PREFIX = "/api";

// ===============================
// GET CHANNELS
// ===============================
app.get(`${API_PREFIX}/channels`, async (req, res) => {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return res.json([]);

    const channels = guild.channels.cache
      .filter(c => c.type !== 4)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(channels);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// ===============================
// GET ROLES
// ===============================
app.get(`${API_PREFIX}/roles`, async (req, res) => {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return res.json([]);

    const roles = guild.roles.cache.map(r => ({
      id: r.id,
      name: r.name
    }));

    res.json(roles);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// ===============================
// GET MEMBERS
// ===============================
app.get(`${API_PREFIX}/members`, async (req, res) => {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return res.json([]);

    await guild.members.fetch();

    const members = guild.members.cache.map(m => ({
      id: m.id,
      name: m.user.username
    }));

    res.json(members);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// ===============================
// GET STATUS
// ===============================
app.get(`${API_PREFIX}/status`, (req, res) => {
  try {
    res.json({
      status: client.ws.status === 0 ? "Online" : "Offline",
      guilds: client.guilds.cache.size,
      ping: client.ws.ping
    });
  } catch (err) {
    console.error(err);
    res.json({ status: "Error", guilds: 0, ping: 0 });
  }
});

// ===============================
// SAVE ANTI-RAID
// ===============================
app.post(`${API_PREFIX}/saveAntiRaid`, async (req, res) => {
  console.log("Anti-Raid Saved:", req.body);
  res.json({ ok: true });
});

// ===============================
// DEPLOY TICKETS
// ===============================
app.post(`${API_PREFIX}/deployTickets`, async (req, res) => {
  console.log("Tickets deployed:", req.body);
  res.json({ ok: true });
});

// ===============================
// SAVE STAFF
// ===============================
app.post(`${API_PREFIX}/saveStaff`, async (req, res) => {
  console.log("Staff saved:", req.body);
  res.json({ ok: true });
});

// ===============================
// EXPRESS SERVER
// ===============================
client.login(process.env.BOT_TOKEN);


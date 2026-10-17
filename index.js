require("dotenv").config();
const express = require("express");
const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

// Serve EVERYTHING inside /public
app.use(express.static(path.join(__dirname, "public")));

// Serve dashboard.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessagePolls,
    GatewayIntentBits.MessageContent
  ]
});

const GUILD_ID = process.env.GUILD_ID;
const PORT = process.env.PORT || 3000;

// Remove # and @
function cleanName(str) {
  return str.replace(/[@#]/g, "");
}

async function getGuild() {
  const guild = await client.guilds.fetch(GUILD_ID);
  await guild.members.fetch();
  await guild.channels.fetch();
  await guild.roles.fetch();
  return guild;
}

// Members
app.get("/api/members", async (req, res) => {
  try {
    const guild = await getGuild();
    const members = guild.members.cache.map(m => ({
      id: m.id,
      name: cleanName(m.user.username)
    }));
    res.json({ ok: true, members });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Channels
app.get("/api/channels", async (req, res) => {
  try {
    const guild = await getGuild();
    const channels = guild.channels.cache
      .filter(c => c.type === 0 || c.type === 4)
      .map(c => ({
        id: c.id,
        name: cleanName(c.name),
        type: c.type
      }));
    res.json({ ok: true, channels });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Roles
app.get("/api/roles", async (req, res) => {
  try {
    const guild = await getGuild();
    const roles = guild.roles.cache.map(r => ({
      id: r.id,
      name: cleanName(r.name)
    }));
    res.json({ ok: true, roles });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Bot status
app.get("/api/status", (req, res) => {
  res.json({ ok: true, online: client.ws.status === 0 });
});

// Start server
app.listen(PORT);

// Login bot
client.login(process.env.DISCORD_TOKEN);

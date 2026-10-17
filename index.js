require("dotenv").config();
const express = require("express");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const app = express();
app.use(express.json());

// Discord bot with full intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Bot ready
client.once("clientReady", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

// Serve dashboard.html from root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Saved settings
let saved = {
  antiRaid: {},
  tickets: {},
  staff: {}
};

// Save settings
app.post("/api/save.json", (req, res) => {
  saved = req.body;
  console.log("Saved dashboard:", saved);
  res.json({ ok: true });
});

// Get saved settings
app.get("/api/save.json", (req, res) => {
  res.json(saved);
});

// REAL MEMBERS
app.get("/api/members", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const members = await guild.members.fetch();

    const list = members.map(m => ({
      id: m.id,
      name: m.user.username
    }));

    res.json(list);
  } catch (err) {
    console.error("Failed to load members:", err);
    res.status(500).json({ error: "Failed to load members" });
  }
});

// REAL ROLES
app.get("/api/roles", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    const roles = guild.roles.cache.map(r => ({
      id: r.id,
      name: r.name
    }));

    res.json(roles);
  } catch (err) {
    console.error("Failed to load roles:", err);
    res.status(500).json({ error: "Failed to load roles" });
  }
});

// REAL CHANNELS
app.get("/api/channels", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    const channels = guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(channels);
  } catch (err) {
    console.error("Failed to load channels:", err);
    res.status(500).json({ error: "Failed to load channels" });
  }
});

// REAL CATEGORIES
app.get("/api/categories", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    const categories = guild.channels.cache
      .filter(c => c.type === ChannelType.GuildCategory)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(categories);
  } catch (err) {
    console.error("Failed to load categories:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

// DEPLOY TICKET PANEL
app.post("/api/deployTickets", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const settings = saved.tickets;

    if (!settings || !settings.panelChannel) {
      return res.status(400).json({ error: "No ticket settings saved" });
    }

    const channel = guild.channels.cache.get(settings.panelChannel);
    if (!channel) {
      return res.status(400).json({ error: "Invalid panel channel" });
    }

    const embed = new EmbedBuilder()
      .setTitle(settings.panelName || "Support Tickets")
      .setDescription(settings.description || "Open a ticket for help.")
      .setColor(0xff7a18);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("Open Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });

    console.log("Ticket panel deployed!");
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to deploy ticket panel:", err);
    res.status(500).json({ error: "Failed to deploy ticket panel" });
  }
});

// BUTTON HANDLER
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const guild = await client.guilds.fetch(process.env.GUILD_ID);

  // OPEN TICKET
  if (interaction.customId === "ticket_open") {
    const settings = saved.tickets;

    const category = guild.channels.cache.get(settings.category);
    if (!category) {
      return interaction.reply({
        content: "❌ Ticket category not found.",
        ephemeral: true
      });
    }

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ["ViewChannel"]
        },
        {
          id: interaction.user.id,
          allow: ["ViewChannel", "SendMessages"]
        },
        {
          id: settings.pingRole,
          allow: ["ViewChannel", "SendMessages"]
        }
      ]
    });

    // Send welcome message
    const embed = new EmbedBuilder()
      .setTitle("Ticket Created")
      .setDescription("A staff member will be with you shortly.")
      .setColor(0xff7a18);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: `<@${interaction.user.id}> <@&${settings.pingRole}>`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ Your ticket has been created: <#${ticketChannel.id}>`,
      ephemeral: true
    });
  }

  // CLOSE TICKET
  if (interaction.customId === "ticket_close") {
    await interaction.channel.send("🔒 Ticket closed.");
    await interaction.channel.delete();
  }
});

// Start dashboard server
app.listen(process.env.PORT, () => {
  console.log(`Dashboard running at http://localhost:${process.env.PORT}/`);
});

// Start bot
client.login(process.env.DISCORD_TOKEN);

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const distube = new DisTube(client, {
  searchSongs: 5,
  emitNewSongOnly: true
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "play") {
    if (!message.member.voice.channel)
      return message.reply("🚫 لازم تكون في روم صوتي!");
    distube.play(message.member.voice.channel, args.join(" "), {
      textChannel: message.channel,
      member: message.member
    });
  }

  if (command === "stop") {
    distube.stop(message.guild);
    message.channel.send("⏹️ تم إيقاف الموسيقى");
  }
});

client.login(process.env.DISCORD_TOKEN);

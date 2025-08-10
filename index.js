const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// إعداد DisTube
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnEmpty: true,
  leaveOnFinish: false,
  leaveOnStop: false,
  nsfw: false,
  youtubeCookie: process.env.YT_COOKIE || undefined,
  plugins: [new YtDlpPlugin()]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// أمر تشغيل أغنية
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'play') {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('🎤 لازم تدخل روم صوتي الأول!');
    if (!args[0]) return message.reply('🎵 اكتب اسم الأغنية أو الرابط!');

    client.distube.play(voiceChannel, args.join(' '), {
      member: message.member,
      textChannel: message.channel,
      message
    });
  }

  if (command === 'stop') {
    client.distube.stop(message);
    message.channel.send('⏹️ تم إيقاف الموسيقى.');
  }

  if (command === 'skip') {
    client.distube.skip(message);
    message.channel.send('⏭️ تم تخطي الأغنية.');
  }
});

client.distube
  .on('playSong', (queue, song) => {
    queue.textChannel.send(`🎶 شغال: **${song.name}** - \`${song.formattedDuration}\``);
  })
  .on('addSong', (queue, song) => {
    queue.textChannel.send(`➕ تمت إضافة: **${song.name}** - \`${song.formattedDuration}\``);
  })
  .on('error', (channel, e) => {
    if (channel) channel.send(`❌ حصل خطأ: ${e.toString().slice(0, 1974)}`);
    else console.error(e);
  });

client.login(process.env.TOKEN);

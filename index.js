const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
require('dotenv').config();

// إنشاء العميل (Client)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// إعداد DisTube
const distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    plugins: [new YtDlpPlugin()]
});

// تسجيل الدخول
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// أوامر بسيطة للتشغيل
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) return message.reply('🎤 لازم تكون في روم صوتي الأول.');
        distube.play(voiceChannel, args.join(' '), { textChannel: message.channel, member: message.member });
    }

    if (command === 'stop') {
        distube.stop(message);
        message.channel.send('⏹️ تم إيقاف الموسيقى.');
    }

    if (command === 'skip') {
        distube.skip(message);
        message.channel.send('⏭️ تم تخطي الأغنية.');
    }
});

// أحداث DisTube
distube
    .on('playSong', (queue, song) => {
        queue.textChannel.send(`🎶 بيشتغل: **${song.name}** - \`${song.formattedDuration}\``);
    })
    .on('addSong', (queue, song) => {
        queue.textChannel.send(`➕ تمت إضافة: **${song.name}** - \`${song.formattedDuration}\``);
    })
    .on('error', (channel, error) => {
        console.error(error);
        channel.send('❌ حصل خطأ.');
    });

// تسجيل الدخول باستخدام التوكن من الـ.env
client.login(process.env.DISCORD_TOKEN);

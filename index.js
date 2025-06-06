const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`ログインしました: ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const allowedChannelId = "1370774836359467119"; // ここのIDを変更する、もしくはこの行を削除&下の行も一部削除(全チャンネルで有効化)
    if (content.endsWith("い") && message.channel.id === allowedChannelId) {
        message.channel.send("んぽ");
    }
});
client.login('DISCORD_TOKEN');

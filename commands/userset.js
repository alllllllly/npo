const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'user_data.json');

function saveUserData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('ユーザーデータの保存エラー:', err);
    }
}

function loadUserData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } else {
            return {};
        }
    } catch (err) {
        console.error('ユーザーデータの読込エラー:', err);
        return {};
    }
}

async function checkUserData(atcoderId) {
    const url = `https://atcoder.jp/users/${atcoderId}/history/json`;
    const res = await fetch(url);
    if (!res.ok) return false;
    const userdata = await res.json();
    return Array.isArray(userdata) && userdata.length > 0;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userset')
        .setDescription('Discord垢とAtCoder垢を結びつけます。')
        .addUserOption(option =>
            option.setName('discord_id')
                .setDescription('Discordアカウント')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('atcoder_id')
                .setDescription('AtCoderユーザー名')
                .setRequired(true)
        ),
    async execute(interaction) {
        const discordId = interaction.options.getUser('discord_id');
        const atcoderId = interaction.options.getString('atcoder_id');
        if (await checkUserData(atcoderId)) {
            const userData = loadUserData();
            userData[discordId] = atcoderId;
            saveUserData(userData);
            await interaction.reply(`Discord ID: ${discordId} と AtCoder ID: ${atcoderId} を結びつけました。`);
        }
        else await interaction.reply(`${atcoderId}さんのAtCoderアカウントが見つかりませんでした。\nユーザー名の打ち間違いをご確認ください。`);
    }
};
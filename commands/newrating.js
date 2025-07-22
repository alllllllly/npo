const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'user_data.json');

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

async function algoChange(history, guild) {
    const userdata = loadUserData();
    const grey = '1317488819355783218';
    const charcoal ='1397014784062259351';
    const brown = '1317489475625943083';
    const green = '1317489644149145650';
    const lightblue = '1317489792165871748';
    const blue = '1317489936751923220';
    const yellow = '1383634669731319860';
    const orange = '1389946467883552778';
    const red = '1389946883895463986';

    const promises = Object.entries(userdata).map(async ([discordId, atcoderId]) => {
        try {
            const url = `https://atcoder.jp/users/${atcoderId}/history/json`;
            const res = await fetch(url);
            const user = await res.json();
            if (!Array.isArray(user) || user.length === 0) return;

            const oldRate = user[user.length - 1].OldRating;
            const newRate = user[user.length - 1].NewRating;

            const oldColorRoleId =
                oldRate < 300 ? grey :
                oldRate < 500 ? charcoal :
                oldRate < 800 ? brown :
                oldRate < 1200 ? green :
                oldRate < 1600 ? lightblue :
                oldRate < 2000 ? blue :
                oldRate < 2400 ? yellow :
                oldRate < 2800 ? orange : red;

            const newColorRoleId =
                newRate < 300 ? grey :
                newRate < 500 ? charcoal :
                newRate < 800 ? brown :
                newRate < 1200 ? green :
                newRate < 1600 ? lightblue :
                newRate < 2000 ? blue :
                newRate < 2400 ? yellow :
                newRate < 2800 ? orange : red;

            if (oldColorRoleId !== newColorRoleId) {
                try {
                    const member = await guild.members.fetch(discordId.replace(/[<@!>]/g, ''));
                    await member.roles.remove(oldColorRoleId);
                    await member.roles.add(newColorRoleId);
                } catch (err) {
                    console.error(`ロール更新失敗: ${discordId} (${atcoderId})`, err);
                }
            }
        } catch (err) {
            console.error(`ユーザー処理失敗: ${discordId} (${atcoderId})`, err);
        }
    });

    await Promise.all(promises);
    return 0;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newrating')
        .setDescription('ratingの値に応じた色ロールを更新します。'),
    async execute(interaction) {
        await interaction.deferReply(); //応答猶予
        let algoHistory = [];
        const guild = interaction.guild;
        await algoChange(algoHistory, guild);
        await interaction.editReply(`連携されているユーザーのロールを更新しました。`);
    }
};

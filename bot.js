require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	/*
	console.log(`Bot がアクセスできるチャンネル一覧:`);
	client.channels.cache.forEach((channel) => {
		console.log(
			`チャンネル名: ${channel.name}, ID: ${channel.id}, タイプ: ${channel.type}`
		);
	});
	*/
});

// メッセージに応答
client.on('messageCreate', async (message) => {
	if (message.author.bot) return; // Bot のメッセージは無視

	try {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-4o-mini',
				messages: [{ role: 'user', content: message.content }],
			},
			{
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const reply = response.data.choices[0].message.content;
		message.reply(reply);
	} catch (error) {
		console.error('Error:', error);
		message.reply('エラーが発生しました...');
	}
});

client.login(DISCORD_BOT_TOKEN);

// 一定間隔ごとにランダムメッセージを送る
const CHANNEL_ID = process.env.AUTO_MESSAGE_TARGET_CHANNEL_ID;

async function sendRandomMessage() {
	const channel = await client.channels.fetch(CHANNEL_ID);
	//console.log(channel);

	if (!channel) return;

	try {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'user',
						content: '関西弁で唐突に何か話しかけてください',
					},
				],
			},
			{
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const reply = response.data.choices[0].message.content;
		channel.send(reply);
	} catch (error) {
		console.error('Error:', error);
	}
}

// 30分ごとにメッセージを送信（ミリ秒指定）
setInterval(sendRandomMessage, 30 * 60 * 1000);

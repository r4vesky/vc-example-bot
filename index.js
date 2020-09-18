require('dotenv').config();

const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const { VineCoinAPI } = require('vine-coin-plus');

const bot = new VK({
	token: process.env.TOKEN,
	pollingGroupId: process.env.GROUP_ID
});

const vinecoin = new VineCoinAPI({
	token: process.env.VINE_COIN_TOKEN
});

const hearManager = new HearManager();

bot.updates.on('message_new', hearManager.middleware);

hearManager.onFallback(async (context) => {
	await context.send(`Отправь мне монеты и получи их обратно =)\nСсылка для перевода: https://vk.cc/azJSpq`);
});

vinecoin.api.onEvent(async (event) => {

	const { type, data } = event;
	
	if (type === 'new_payment') {
		await vinecoin.api.call('sendPayment', {
			user_id: data.from_id,
			amount: data.amount
		});

		await bot.api.messages.send({
			user_id: data.from_id,
			message: `Я перевёл обратно твои ${data.amount} монет :3`,
			random_id: Math.random()
		});
	}

});

bot.updates.start().catch(console.error);
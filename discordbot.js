const Discord = require('discord.js');
const client = new Discord.Client();

const TOKEN = ''

// Server info
const BOT_CHANNEL = 'discord-bot-test'

// Bot Commands
const LOG_COMMAND = 'log'
const TOP_COMMAND = 'top'
const TOTAL_COMMAND = 'total'
const EXPECTED_LOG_ARGS = 3
const EXPECTED_TOP_ARGS = 2
const EXPECTED_TOTAL_ARGS = 1

// PR Types
const BENCH = 'Bench'
const SQUAT = 'Squat'
const DEADLIFT = 'Deadlift'
const prToArrayIndex = {   
	'Bench': 0,   
	'Squat': 1,   
	'Deadlift': 2
}

// <Person Name, [Bench, Squat, Deadlift]>
// <Harry, [225, 315, 405]>
// TODO Make PR_MAP file save
const PR_MAP = new Map()

client.login(TOKEN)


client.on('message', async message => {
	
	// Make sure bot doesn't reply to itself
	if (message.author.bot) {
		return
	}
	
	// Make sure right channel
	if (message.channel.name != BOT_CHANNEL) {
		return
	}

	// Example:  log Bench 100
	//   		 str str   int

	const lastMessage = message.content

	const stringComponentsArray = lastMessage.split(' ')

	const command = stringComponentsArray[0]

	switch (command) {
		case LOG_COMMAND: 
			logHelper(stringComponentsArray, lastMessage, message, command)
			break
		case TOP_COMMAND: 
			topHelper(stringComponentsArray, lastMessage, message, command)
			break
		case TOTAL_COMMAND: 
			totalHelper(stringComponentsArray, lastMessage, message, command)
			break
		default: 
			break
	}
});

function invalidInput(userInput, messageObject, commandType) {  
	switch (commandType) {
		case LOG_COMMAND: 
			messageObject.channel.send(userInput + ' is not valid')
			messageObject.channel.send('Please follow the following format: ')
			messageObject.channel.send(LOG_COMMAND + ' [' + BENCH + '/' + SQUAT + '/' + DEADLIFT + '] Weight (lbs)')
			messageObject.channel.send('Example: log Bench 225')
			break
		case TOP_COMMAND:
			messageObject.channel.send(userInput + ' is not valid')
			messageObject.channel.send('Please follow the following format: ')
			messageObject.channel.send(TOP_COMMAND + ' [' + BENCH + '/' + SQUAT + '/' + DEADLIFT + ']')
			messageObject.channel.send('Example: top Bench')
			break
		case TOTAL_COMMAND:
			messageObject.channel.send(userInput + ' is not valid')
			messageObject.channel.send('Please follow the following format: ')
			messageObject.channel.send(TOTAL_COMMAND)
			messageObject.channel.send('Example: total')
			break
		default: 
			break
	}
}

function logHelper(stringComponentsArray, lastMessage, message, command) {
	
	if (stringComponentsArray.length != EXPECTED_LOG_ARGS) {
		invalidInput(lastMessage, message, command)
		return
	}

	const prType = stringComponentsArray[1]
	if (prToArrayIndex[prType] == undefined) {
		invalidInput(lastMessage, message, command)
		return
	}

	let weight = stringComponentsArray[2]
	if (isNaN(weight)) {
		invalidInput(lastMessage, message, command)
		return
	} else {
		weight = Number(weight)
	}

	// TODO Assume username doesn't change

	// <Person Name, [Bench, Squat, Deadlift]>
	// <Harry, [225, 315, 405]>
	const user = message.author.username
	if (!PR_MAP.has(user)) {
		// Add beginning values then update
		PR_MAP.set(user,[0,0,0]) 
	}
	PR_MAP.get(user)[prToArrayIndex[prType]] = weight

	message.reply('logged your ' + prType + ' PR of ' + weight + '!')
}

function topHelper(stringComponentsArray, lastMessage, message, command) {

	if (stringComponentsArray.length != EXPECTED_TOP_ARGS) {
		invalidInput(lastMessage, message, command)
		return
	}

	const prType = stringComponentsArray[1]
	if (prToArrayIndex[prType] == undefined) {
		invalidInput(lastMessage, message, command)
		return
	}

	prArray = []
	
	for (let [user, prs] of PR_MAP) {
		weight = prs[prToArrayIndex[prType]]
		if (weight > 0) {
			prArray.push([user,weight])
		}
	}
	prArray.sort((a, b) => {
		b[1] - a[1] 
	}).reverse()

	message.channel.send('Top ' + prType + ' PRs')

	for (let i = 0; i < prArray.length; i++) {
		tempUser = prArray[i][0]
		tempWeight = prArray[i][1]
		message.channel.send(String(i+1) + ': ' + tempUser + ' - ' + tempWeight + 'lbs')
	}

}

function totalHelper(stringComponentsArray, lastMessage, message, command) {

	if (stringComponentsArray.length != EXPECTED_TOTAL_ARGS) {
		invalidInput(lastMessage, message, command)
		return
	}

	const user = message.author.username

	if (PR_MAP.get(user) == undefined) {
		message.channel.send('You do not have any lifts logged yet')
		return
	}

	const userLifts = PR_MAP.get(user)
	const totalLifts = userLifts[0] + userLifts[1] + userLifts[2]

	message.channel.send('Your Bench: ' + userLifts[0] + ' lbs')
	message.channel.send('Your Squat: ' + userLifts[1] + ' lbs')
	message.channel.send('Your Deadlift: ' + userLifts[2] + ' lbs')
	message.channel.send('Your 3 lifts add up to: ' + totalLifts + ' lbs')

	if (totalLifts >= 1000) {
		message.channel.send('Congrats on being in the 1000+ lbs club!')
	}
}
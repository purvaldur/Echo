// IMPORTS
import { Client, Events, GatewayIntentBits } from 'discord.js'
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	getVoiceConnection
} from '@discordjs/voice'
import { Innertube } from 'youtubei.js'
import { Server as SocketIO } from 'socket.io'
import config from './config.json' assert {type:"json"}

// INITIALIZERS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] })
const player = createAudioPlayer()
const yt = await Innertube.create()
const io = new SocketIO(3001, {
// FOR DEV PURPOSES ONLY! DISABLE CORS IN PROD!
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})

// MISC SETUP
const guild_id = "400050413153288192"
const vc_id = "415922860620644352"

// BOT CODE
client.once(Events.ClientReady, async bot => {
	console.log(`Ready! Logged in as ${bot.user.tag}`)
	
	const guild = await client.guilds.fetch(guild_id)
	const vc = await guild.channels.fetch(vc_id)

	const voicecon = joinVoiceChannel({
		channelId: vc.id,
		guildId: guild.id,
		adapterCreator: guild.voiceAdapterCreator
	})
	await entersState(voicecon, VoiceConnectionStatus.Ready, 30_000)
	voicecon.subscribe(player)
})

client.login(config.token)

// WEBSOCKET CODE
io.on('connect', async socket => {
	const id = socket.id
	const ip = socket.conn.remoteAddress
	function date() { return new Date().toLocaleTimeString() }
	console.log(`${date()}: New connection from ${ip} with ID ${id}`)

	socket.on('ping', async msg => {
		console.log(`${date()}: PING from ${id} with message "${msg}"`)
		socket.emit('pong')
	})
	socket.on('play', async msg => {
		console.log(`${date()}: Received 'play' event for song '${msg}'`)
		const song = await echo.search(msg)
		echo.play(song)
		console.log(`PLAYING: ${song.basic_info.author}: ${song.basic_info.title}`)
	})
})

// UTIL FUNCTIONS
const echo = {
    async search(input) {
        const search = await yt.music.search(input, { type: 'song'})
        const result = await yt.music.getInfo(search.results[0].id)
        return result
    },
	async play(input) {
		const initStream = await input.download({
			type: 'audio',
			quality: 'best',
			format: 'mp4'
		})
		// Buffer the stream to avoid premature end-of-stream
		const stream = []
		for await (const chunk of initStream) {
			stream.push(chunk)
		}
		const audioRes = createAudioResource(stream, {
			inputType: StreamType.Arbitrary,
		})
		player.play(audioRes)
		await entersState(player, AudioPlayerStatus.Playing, 5_000)
		return AudioPlayerStatus.Playing
	}
}

// META-CODE
process.on('SIGINT', function() {
	client.destroy()
	process.exit()
});
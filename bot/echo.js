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
function date() { return new Date().toLocaleTimeString() }

// BOT CODE
client.once(Events.ClientReady, async bot => {
	console.log(`${date()}: ON-LINE logged in as ${bot.user.tag.toUpperCase()}`)
	
	const guild = await client.guilds.fetch(guild_id)
	const vc = await guild.channels.fetch(vc_id)
    
    client.echo = {
        guilds: {
            [guild_id]: {
                queue: [],
                player: createAudioPlayer()
            }
        }
    }

	const voicecon = joinVoiceChannel({
		channelId: vc.id,
		guildId: guild.id,
		adapterCreator: guild.voiceAdapterCreator
	})

	await entersState(voicecon, VoiceConnectionStatus.Ready, 30_000)
	voicecon.subscribe(client.echo.guilds[guild_id].player)
    client.echo.guilds[guild_id].voicecon = voicecon
})

client.login(config.token)

// WEBSOCKET CODE
io.on('connect', async socket => {
	const id = socket.id
	const ip = socket.conn.remoteAddress
	console.log(`${date()}: CONNECT from ID ${id} | With IP address ${ip}`)

	socket.on('play', async msg => {
		console.log(`${date()}: REQUEST from ID ${id} | Searching for '${msg}'`)
		const song = await echo.search(msg)
        if (client.echo.guilds[guild_id].queue.length == 0) {
            echo.play(song)
            console.log(`${date()}: PLAYING from ID ${id} | ${song.basic_info.author} - ${song.basic_info.title}`)
        }
        client.echo.guilds[guild_id].queue.push(song)
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
		client.echo.guilds[guild_id].player.play(audioRes)
		await entersState(client.echo.guilds[guild_id].player, AudioPlayerStatus.Playing, 5_000)
		return
	}
}

// META-CODE
process.on('SIGINT', function() {
	client.destroy()
	process.exit()
})

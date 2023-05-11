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
const client_id = "508723276445646868"
const client_secret = process.env.BOT_TOKEN
const guild_id = "400050413153288192"
const vc_id = "415922860620644352"
function date() { return new Date().toLocaleTimeString() }

// BOT CODE
client.once(Events.ClientReady, async bot => {
	console.log(`${date()}: ON-LINE logged in as ${bot.user.tag.toUpperCase()}`)
	
	const gamer = await client.guilds.fetch(guild_id)
	const vc = await gamer.channels.fetch(vc_id)
    
    client.echo = {
        guilds: {}
    }

    for (const guild of await client.guilds.fetch()) {
        client.echo.guilds[guild[0]] = {
            id: guild[1].id,
            name: guild[1].name,
            queue: [],
            player: createAudioPlayer()
        }
        client.echo.guilds[guild[0]].player.on('stateChange', (oldState, newState) => {
            console.log(`${date()}: Audio player for ${client.echo.guilds[guild[0]].name} has changed from ${oldState.status} to ${newState.status}`);
            if (
            oldState.status == 'playing' && newState.status == 'idle') {
                client.echo.guilds[guild[0]].queue.shift()
                if (client.echo.guilds[guild[0]].queue.length > 0) {
                    echo.play(client.echo.guilds[guild[0]].queue[0])
                }
            }
        })
    }

	const voicecon = joinVoiceChannel({
		channelId: vc.id,
		guildId: gamer.id,
		adapterCreator: gamer.voiceAdapterCreator
	})

	await entersState(voicecon, VoiceConnectionStatus.Ready, 30_000)
	voicecon.subscribe(client.echo.guilds[guild_id].player)
    client.echo.guilds[guild_id].voicecon = voicecon
})

client.login(client_secret)

// WEBSOCKET CODE
io.on('connect', async socket => {
	const id = socket.id
	const ip = socket.conn.remoteAddress
	console.log(`${date()}: New connection from ID ${id} with IP address ${ip}`)

	socket.on('play', async msg => {
		console.log(`${date()}: New request from ID ${id} for '${msg}'`)
		const song = await echo.search(msg)
        song.requester = socket.id
        if (client.echo.guilds[guild_id].queue.length == 0) {
            echo.play(song)
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
        console.log(`${date()}: Now playing '${input.basic_info.author} - ${input.basic_info.title}', requested by ${input.requester}`)
		client.echo.guilds[guild_id].player.play(audioRes)
		await entersState(client.echo.guilds[guild_id].player, AudioPlayerStatus.Playing, 5_000)
		return client.echo.guilds[guild_id].player
	}
}

// META-CODE
process.on('SIGINT', function() {
	client.destroy()
	process.exit()
})

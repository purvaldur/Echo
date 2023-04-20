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
import config from './config.json' assert {type:"json"}

// INITIALIZERS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] })
const player = createAudioPlayer()
const yt = await Innertube.create()

// MISC SETUP
const guild_id = "400050413153288192"
const vc_id = "415922860620644352"

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
	
	const yt_search = await yt.search("freitag")
	const yt_song = await yt.getInfo(yt_search.results[0].id)
	const yt_initStream = await yt_song.download()
	// Buffer the stream to avoid premature end-of-stream
	const yt_stream = []
	for await (const chunk of yt_initStream) {
		yt_stream.push(chunk)
	}

	const stream = createAudioResource(yt_stream, {
		inputType: StreamType.Arbitrary,
	})

	voicecon.subscribe(player)
	player.play(stream)
	await entersState(player, AudioPlayerStatus.Playing, 5_000)

	console.log("PLAYING: " + yt_song.basic_info.author + ' - ' + yt_song.basic_info.title)
})

client.login(config.token)

process.on('SIGINT', function() {
	client.destroy()
	process.exit()
});
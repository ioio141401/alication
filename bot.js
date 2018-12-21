const token = ("NTEzNjM5ODMyOTkyMzUwMjIx.Dtg7Wg.6E_Q-zYP3b19AK7jexk62zjvs1A");
const Discord = require("discord.js");
const Util = require("discord.js");
const prefix = "?";
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");
const Spotify = require("node-spotify-api");

const bot = new Discord.Client({disableEveryone: true});
const youtube = new YouTube("AIzaSyC6WrKVP-u1MfloraNKpLNhb9vT0Im6dII"); // <= goole api key
const spotify = new Spotify({
	id: ("7499becbdece4e6d866c2e36bca501c6"),
	secret: ("7b72a6b654b341da9f974b6bd5e0e586")
});
const queue = new Map();


bot.on("ready", async () => {

	bot.user.setActivity("SAO | @Alice_" , {
			type: "STREAMING",
			url: "https://www.twitch.tv/lilypichu"
		
	});
	bot.user.setUsername("Alice_");
    console.log(`hi ${bot.user.username}`);

    bot.generateInvite(["ADMINISTRATOR"]).then(link => {
        console.log(link);
    }).catch(err => {
        console.log(err.stack);     
    });
    console.log("hhhhh");

    await bot.generateInvite(["ADMINISTRATOR"]);
    console.log("i am ready!");
});    

bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    const args = message.content.split(' ');         
    const searchString = args.slice(1).join(' ');
    const url = args[1] ? args[1].replace(/<(.*)>/g, '$1') : '';

    console.log(searchString); 
	const serverQueue = queue.get(message.guild.id);
	
	if(message.content.startsWith(`ping`)) {
	message.channel.send(new Date().getTime() - message.createdTimestamp + "` ms`");
	}
	

    if(message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)) {

    const voiceChannel = message.member.voiceChannel;  
    if(!voiceChannel) return message.channel.send(`**Join voice channel juseyo**`);
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has("CONNECT")) {
        return message.channel.send(`<:mining:524650221964230657> **Missing Permission To Connect**`);
    } 
	if(!permissions.has("SPEAK")) {
        return message.channel.send("<:mining:524650221964230657> **Missing Permission To Speak**");
    }
    if(!searchString) return message.channel.send(`**Please provide something** <a:hmm:524626668665569282>`);

    let waiting = await message.channel.send(`<a:bookss:524655979254775828> **Searching up:** \`${searchString}\``);

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
    	const playlist = await youtube.getPlaylist(url);
    	const videos = await playlist.getVideos();
    	for (const video of Object.values(videos)) {
    		const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line-no-await-in-loop
    		await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line-no-await-in-loop
    	}
    	message.channel.send(`Playlist: **${playlist.title}** has been added to the queue`);
    } else {
    	try {
        var video = await youtube.getVideo(url);
    } catch (error) {
        try {
             var videos = await youtube.searchVideos(searchString, 1);
             var video = await youtube.getVideoByID(videos[0].id);
        } catch (err) {
             console.error(err);
             return message.channel.send(`<:fml:524915113837330432> **${error}**`);
        }
      }

           return handleVideo(video, message, voiceChannel);
        }
    } else if (message.content.startsWith(`${prefix}skip`) || message.content.startsWith(`${prefix}next`)) {
    	if (!message.member.voiceChannel) return message.channel.send("<a:ani:524542913204715520> **You must be in a voice channel**");
    	if (!serverQueue) return message.channel.send(`**There is nothing to skip** <a:ani:524542913204715520>`);
    	serverQueue.connection.dispatcher.end(`skipped`);
    	return message.channel.send(`:regional_indicator_t: :regional_indicator_h: :regional_indicator_a: :regional_indicator_n: :regional_indicator_k:  :regional_indicator_u: **,** :regional_indicator_n: :regional_indicator_e: :regional_indicator_x: :regional_indicator_t:`);
    return undefined;
    
    } else if (message.content.startsWith(`${prefix}stop`) || message.content.startsWith(`${prefix}leave`)) {
    	if (!message.member.voiceChannel) return message.channel.send(`<a:ani:524542913204715520> **You must be in a voice channel**`);
    	serverQueue.songs = [];
    	serverQueue.connection.dispatcher.end(`arraseo`);
    	return message.channel.send(`**au revoir** <a:bye:524650453657452559>`);
    return undefined;

    } else if (message.content.startsWith(`${prefix}summon`)) {
 	   	if (!message.member.voiceChannel) return message.channel.send("<a:ani:524542913204715520> **You must be in a voice channel**");
 	    message.member.voiceChannel.join()
       .then(connection => console.log('Connected!'))
       .catch(console.error);
     return undefined;
    
    } else if (message.content.startsWith(`${prefix}volume`) || message.content.startsWith(`${prefix}v`)) {
    	if (!message.member.voiceChannel) return message.channel.send("<a:ani:524542913204715520> **You must be in a voice channel**");
    	if (!serverQueue) return message.channel.send("There is nothing playing dear..");
    	if (!args[1]) return message.channel.send(`The current volume is: **${serverQueue.volume}**`);
    	serverQueue.volume = args[1];
    	serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);   
    return message.channel.send(`I've set the volume to: **${args[1]}**`);

    } else if (message.content.startsWith(`${prefix}icon`)) {
    	let msg = await message.channel.send("Sketching up the logo..");

	await message.channel.send({files:  [
		{
			attachment: message.guild.iconURL,
			name: "icon.png"
		}
    ]});

	msg.delete();
    return undefined;
    	
    } else if (message.content.startsWith(`${prefix}stat`) || message.content.startsWith(`${prefix}stats`) || message.content.startsWith(`${prefix}statistics`)) {
    	let totalSeconds = (bot.uptime / 1000);
    	let day = Math.floor(totalSeconds / 8640);
        let hours = Math.floor(totalSeconds / 360);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let uptime = `${day}d ${hours}h ${minutes}m and ${seconds}s`;

    	let abc = new Discord.RichEmbed()
    	    .setAuthor("Alice_","https://66.media.tumblr.com/cf40efe92d91b418535f9b7c5925b016/tumblr_ox191oPqZA1vfcnxjo4_r4_250.gif")
    	    .setDescription(`\n <:mining:524650221964230657> *Statistics*`)
    	    .addField(`Uptime` ,
    	    	`${uptime}`)
    	    .addField(`Memory Usage` , 
    	    	`${process.memoryUsage().heapUsed / 1024 / 1024} mb`)
    	    .setTimestamp()
    	    .addField(`Guilds` ,
    	    	`${bot.guilds.size}`)
    	    .addField(`Channels` ,
    	    	`${bot.channels.size}`)
    	    .addField(`Users` ,
    	    	`${bot.users.size}`)
    	    .setColor("ffffff")
    	    .setFooter("Ξ Areum_ 🌹")
    	    .addField(`Donate` ,
    	    	`pergi masjid :)`)
    	    .setThumbnail("https://66.media.tumblr.com/9fa1f0afe6f04323d2a85edc16ec4c1c/tumblr_p6wlpyTNg21ujot02o5_r1_400.gif")


    	return message.channel.send(abc);
    	
        return undefined;  	

    } else if (message.content.startsWith(`${prefix}help`) || message.content.startsWith(`${prefix}h`)) {
    	let embed = new Discord.RichEmbed()
    	    .setAuthor("Areum_" , "https://cdn.discordapp.com/attachments/518474070615130122/524665268148895765/DVxaRqmXcAALi3f.jpg" , "https://www.google.com/search?ei=500ZXI3GFI6QvQSh0aDQBg&q=einstein&oq=ei&gs_l=psy-ab.3.1.0i67l4j0i131j0l3j0i131l2.14050.15029..17295...0.0..0.172.547.2j3......0....1..gws-wiz.....0..0i71.XFRis6vfst0")
    	    .setTitle(`Music Commands`)
    	    .setThumbnail("https://66.media.tumblr.com/de60e3cc8619d1f83c112ab7d6780636/tumblr_phx54u6EXS1w5jkuno10_r1_250.gif")
    	    .setColor("#e2c37f")
    	    .setDescription(`\`?play/p [link/search term]\` plays the specific song(s) \n \`?skip/next\` Plays the next song \n \`?queue/q\` Display the queued songs \n \`?stop/leave\` Stops the bot \n \`?now playing/np\` Display the playing track \n \`?volume/v[1-10]\` To set and displays the current volume \n \`?pause\` To pause \n \`?resume\` To resume the paused queue/track`)
    	    .addField("Else",
    	    	`\`?icon\` To displays server's icon \n \`?ping\` To check ping \n \`?stats/st\` To displays stats`)
    	    .setImage("https://pa1.narvii.com/7020/78656658c4bbc0b3fc7df498206bc747da8f9427r1-500-167_hq.gif")
    	    .setFooter("read if gay" , "https://pics.awwmemes.com/mods-r-dankmemes-av-%3C5-post-removed-for-sexualization-of-a-33955173.png")
    	    .setTimestamp()

    	return message.channel.send(embed);
    return undefined;
    } else if (message.isMentioned(bot.user)) {
    	let lel = new Discord.RichEmbed()
    	.setAuthor(bot.user.tag , ("https://cdn.discordapp.com/attachments/518472902480232474/525047780167909387/superthumb.png"))
    	.setDescription(`well... would be nice if i actually have something to write here`)
    	.setThumbnail("https://cdn.discordapp.com/emojis/506120308642545684.png?v=1")
    	.addField(`Prefix` ,
    		`?`)
    	.addField(`Help Command` ,
    		`?help`)
    	.addField(`Here's A Free Fun Fact` ,
    		`Lightning is 5 times hotter than the sun. Lighting can reach temperatures of 30,000 kelvins (53,540 degrees Fahrenheit). Compare that to the surface of the sun, 6,000 kelvins (10,340 degrees Fahrenheit)`)
    	.setTimestamp()
    	.setFooter(`Merry Christmast🎄 ${message.author.username}` , (`${message.author.avatarURL}`))
    message.reply(`what?`).then(message => message.delete(1300)).then(message => message.channel.send(`lol jk`)).then(message => message.channel.send(`here`)).then(message => message.channel.send(lel));
    return undefined;
 
    } else if (message.content.startsWith(`${prefix}np`) || message.content.startsWith(`${prefix}now playing`)) {
    	if (!serverQueue) return message.channel.send("there's nothing playing");
        return message.channel.send(`**Now Playing** <a:stolen22:524508314818838528>  | \`${serverQueue.songs[0].title}\``);
    } else if (message.content.startsWith(`${prefix}queue`) || message.content.startsWith(`${prefix}q`)) {
    	if (!serverQueue) return message.channel.send("there's nothing playing");
    	return message.channel.send(`
__**Song queue:**__

${serverQueue.songs.map(song => `**~** ${song.title}`).join(`\n`)}

**Now playing:** ${serverQueue.songs[0].title}
    		`);
    } else if (message.content.startsWith(`${prefix}pause`)) {
    	if (serverQueue && serverQueue.playing) {
    		serverQueue.playing = false;
    	    serverQueue.connection.dispatcher.pause();
    	    return message.channel.send(":pause_button:");
        } 
        return message.channel.send(`theres nothing playing`);  
    } else if (message.content.startsWith(`${prefix}resume`)) {
    	if (serverQueue && !serverQueue.playing) {
    		serverQueue.playing = true;
    		serverQueue.connection.dispatcher.resume();
    		return message.channel.send(":arrow_forward:");
    	}
    return message.channel.send(`There is nothing playing`);

    }
         
    return undefined;

});

async function handleVideo(video, message, voiceChannel, playlist = false) {
	const serverQueue = queue.get(message.guild.id);
	 console.log(video);
    const song = {	
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        duration: video.duration,
        url: `https://www.youtube.com/watch?v=${video.id}`
    }
    if (!serverQueue) {
    	const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        queue.set(message.guild.id, queueConstruct);

        queueConstruct.songs.push(song);

    try {
        var connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        play(message.guild, queueConstruct.songs[0]); 

    } catch (error) {
        console.error(`I cant join the voice channel ${error}`);
        queue.delete(message.guild.id);
        console.log(error);
        return message.channel.send(` **Urmm.. <a:hmm:524626668665569282> ${error}`);
       }
    } else {
    	serverQueue.songs.push(song);
    	if (playlist) return undefined;
    	else return message.channel.send(`<:mining:524650221964230657> || **${song.title}** has been added to the queue~`);
        console.log(serverQueue.songs);   
    }
    return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song){
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on("end", reason => {
        	if (reason === `Stream is not generating quickly enough`) console.log(`song ended`);
        	else console.log(reason)
	        serverQueue.songs.shift();
	        play(guild, serverQueue.songs[0]);        
        })
        .on(`error`, error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    serverQueue.textChannel.send(`**Start playing**  <a:stolen22:524508314818838528> ||  \`${song.title}\``);
}

bot.login(token);
import kotlin.js.*

external val process: dynamic
external fun require(module: String): dynamic

fun main(args: Array<String>) {
    println("Hello, world!")
    val config = json("json_file_store" to "./db_slack_bot_ci/")
    val customIntegration = require("../lib/custom_integrations")
    val token = process.env.TOKEN ?: process.env.SLACK_TOKEN
    val controller = customIntegration.configure(token, config, ::onInstallation)
    val database = Database()
    val amazon = Amazon(database)

    controller.on("rtm_open", {
        println("** The RTM api just connected!")
    })
    controller.on("rtm_close", {
        println("** The RTM api just closed")
    })
    controller.on("bot_channel_join", { bot, message ->
        bot.reply(message, "I'm here!")
    })
    controller.hears("hello", "direct_message", { bot, message ->
        bot.reply(message, "Hello!")
    })
    controller.hears("amazon all", "direct_message") { bot, message ->
        println("Get All Price")
        amazon.getAllPrice { bot.reply(message, it) }
    }
    controller.hears("amazon add (.*)", "direct_message") { bot, message ->
        val match = message.match[1]
        println("I heart $match")
        database.insert(json("asin" to message.match[1])) { error: String, _ ->
            if (error.isNullOrEmpty()) bot.reply(message, "Inserted $match")
            else bot.reply(message, "Error: $error")
        }
    }
}

fun onInstallation(bot: dynamic, installer: dynamic) {
    installer?.let {
        bot.startPrivateConversation(json("user" to installer), {
            err, convo ->
            if (err != null) println(err) else {
                convo.say("I am a bot that has just joined your team")
                convo.say("You must now /invite me to a channel so that I can be of use!")
            }
        })
    }
}


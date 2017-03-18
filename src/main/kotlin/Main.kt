import kotlin.js.*

external val process: dynamic
external fun require(module: String): dynamic

fun main(args: Array<String>) {
    println("Hello, world!")
    var config = json("json_file_store" to "./db_slack_bot_ci/")
    val customIntegration = require("../lib/custom_integrations")
    val token = if (process.env.TOKEN) process.env.TOKEN else process.env.SLACK_TOKEN
    val controller = customIntegration.configure(token, config, ::onInstallation)
}

fun onInstallation(bot: dynamic, installer: dynamic) {
    if (installer) {
        bot.startPrivateConversation(json("user" to installer), {
            err, convo ->
            if (err) println(err) else {
                convo.say("I am a bot that has just joined your team")
                convo.say("You must now /invite me to a channel so that I can be of use!")
            }
        })
    }
}


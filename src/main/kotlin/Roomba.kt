import kotlin.js.Json

object Roomba {
    var local: dynamic = null
    init {
        val dorita = require("dorita980")
        local = dorita.Local("user", "password", "192.168.0.xx")
        Bot.controller.hears("meido", arrayOf("direct_message", "direct_mention")) { bot, message ->
            bot.reply(message, "Getting Meido status...")
            local.getMission()
                    .then { data: Json -> bot.reply(message, data.getPhase()) }
                    .catch { error: String -> bot.reply(message, error) }
        }
    }
}

private fun  Json.getPhase(): String {
    val mission = get("cleanMissionStatus") as Json
    val phase = mission["phase"] as String
    return when (phase) {
        "charge" -> "Meido is charging!"
        else -> "Meido is $phase"
    }
}

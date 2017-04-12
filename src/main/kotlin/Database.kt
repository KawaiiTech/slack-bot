import kotlin.js.Json
import kotlin.js.json


class Database {

    var db: dynamic

    init {
        js("var Datastore = require(\"nedb\")")
        db = js("new Datastore({filename: \"datastore.db\", autoload: \"true\"})")
        //db = Datastore(json("filename" to "datastore.db", "autoload" to true))
    }

    fun insert(json: Json, callback: (error: dynamic, newDoc: dynamic) -> dynamic = { _, _ -> }) {
        db.insert(json, callback)
    }

    fun find(json: Json = json(), callback: (dynamic, dynamic) -> dynamic) {
        db.find(json, callback)
    }
}
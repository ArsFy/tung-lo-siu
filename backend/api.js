const MongoClient = require('mongodb').MongoClient;
const config = require("./config");

const client = new MongoClient(`mongodb://${config.db_user}:${config.db_pass}@${config.db_host}:${config.db_port}/`);
const db = client.db(config.db_database);
const collection = db.collection(config.db_collection)

module.exports = {
    list: async (req, res) => {
        let page = Number(req.body.page);
        if (isNaN(page)) page = 1;

        try {
            let count = await collection.countDocuments({});
            let data = []
            await collection.find().limit(20).skip((page - 1) * 20).forEach((r) => {
                data.push({
                    id: r.id,
                    title: r.name,
                    text: r["type"] == "pixiv" ? `https://pixiv.net/i/${r.id}` : `無`,
                    tags: [r.author, ...r.taglist],
                    file: r.file,
                    r18: 0
                })
            });

            res.json({ status: 200, data, count, sitename: config.site_name })
        } catch (e) {
            res.json({ status: 500, err: e })
        }
    }
}
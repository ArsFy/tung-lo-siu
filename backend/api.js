const crypto = require('crypto');
const fs = require('fs');
const path = require("path");
const query = require("./query");
const config = require("./config");

let taglist = [];
query("SELECT tags FROM pic").then(r => {
    for (let i = 0; i < r.length; i++) {
        taglist.push(...JSON.parse(r[i].tags))
    }
    taglist = Array.from(new Set(taglist));
})

const randomString = () => {
    let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678!", n = "";
    for (i = 0; i < 16; i++) n += t.charAt(Math.floor(Math.random() * t.length));
    return n;
}

module.exports = {
    list: async (req, res) => {
        let page = Number(req.body.page);
        if (isNaN(page)) page = 1;
        let tags = req.body.tags;
        try { tags = JSON.parse(tags) } catch (e) { tags = [] };

        try {
            let count, data;
            if (tags.length > 0) {
                count = await query("SELECT count(id) as count FROM pic WHERE JSON_CONTAINS(JSON_ARRAY('" + tags.join("', '") + "'), tags) AND tags <> JSON_ARRAY()");
                data = await query("SELECT * FROM pic WHERE JSON_CONTAINS(JSON_ARRAY('" + tags.join("', '") + "'), tags) AND tags <> JSON_ARRAY() ORDER BY `id` DESC LIMIT ?,20", [(page - 1) * 20]);
            } else {
                count = await query("SELECT count(id) as count FROM pic");
                data = await query("SELECT * FROM pic ORDER BY `id` DESC LIMIT ?,20", [(page - 1) * 20]);
            }

            let user = {};
            if (req.session.uid != undefined && page == 1) {
                let userinfo = await query("SELECT * FROM user WHERE `uid` = ?", [req.session.uid]);
                user = {
                    sitename: config.site_name,
                    login: true,
                    md5: crypto.createHash('md5').update(userinfo[0].email).digest('hex'),
                    username: userinfo[0].username,
                    tags: taglist
                }
            } else if (page == 1) {
                user = {
                    sitename: config.site_name,
                    login: false,
                    tags: taglist
                }
            }

            res.json({ status: 200, data, count: count[0].count, ...user })
        } catch (e) {
            res.json({ status: 500, err: e })
        }
    },
    login: async (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        if (username != '' && password != '') {
            let data = await query("SELECT * FROM user WHERE (username=? OR email=?) AND password=?", [username, username, crypto.createHash('sha256').update(password + config.key).digest('hex')])

            if (data.length > 0) {
                req.session.uid = data[0].uid;
                res.json({ status: 'ok' })
            } else {
                res.json({ status: 'user_pass' })
            }
        } else {
            res.json({ status: 'empty' })
        }
    },
    logout: async (req, res) => {
        req.session.uid = undefined;
        res.json({ status: 'ok' })
    },
    upload: async (req, res) => {
        if (req.session.uid != undefined) {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.json({ status: 'no_file' })
            }
            if (req.files.file.originalFilename.indexOf(".webp") === -1) {
                return res.json({ status: 'ext' })
            }
            let title = req.body.title;
            let tags = req.body.tags;
            let text = req.body.description;
            let r18 = Number(req.body.r18 == "true");
            if (title != '' && tags != '' && text != '' && !isNaN(r18)) {
                let filename = new Date() / 1 + "-" + randomString() + ".webp";

                fs.copyFileSync(req.files.file.path, path.join(__dirname, './image/', filename));
                await query("INSERT INTO `pic` (`title`, `tags`, `text`, `file`, `r18`) VALUES (?, ?, ?, ?, ?)", [title, tags, text, filename, r18])
                res.json({ status: 'ok' })
            } else {
                res.json({ status: 'empty' })
            }
        } else {
            res.json({ status: 'login' })
        }
    }
}
const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');
const { stdin, stdout } = require('process');

const config = require('./config.json');

const rl = readline.createInterface({ input: stdin, output: stdout });

const question = (text) => {
    return new Promise((resolve, reject) => {
        rl.question(text, (p) => { resolve(p); });
    })
}

const randomString = () => {
    let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678!", n = "";
    for (i = 0; i < 16; i++) n += t.charAt(Math.floor(Math.random() * t.length));
    return n;
}

console.log("Before the install start, make sure the database is empty.");
(async () => {
    let host = await question('MySQL Host (127.0.0.1): ');
    if (host == '') host = '127.0.0.1';

    let port = await question('MySQL Port (3306): ');
    if (port == '' || isNaN(Number(port))) port = 3306;
    else port = Number(port);

    let user = await question('MySQL User (root): ');
    if (user == '') user = 'root';

    let pass = await question('MySQL Password (123456): ');
    if (pass == '') pass = '123456';

    let database = await question('MySQL Database Name (database): ');
    if (database == '') database = 'database';

    let admin_name = await question('Admin Username (admin): ');
    if (admin_name == '') admin_name = 'admin';

    let admin_pass = await question('Admin Password (123456): ');
    if (admin_pass == '') admin_pass = '123456';

    let admin_email = await question('Admin Email (default): ');
    if (admin_email == '') admin_email = 'default';

    console.log(`\nHost: ${host}\nPort: ${port}\nUser: ${user}\nPassword: ${pass}\nDatabase: ${database}\n`)
    let r = await question('Continue? [y/N]: ');
    if (r == '' || r == 'y' || r == "Y") {
        config.db_host = host;
        config.db_user = user;
        config.db_pass = pass;
        config.db_database = database;
        config.db_port = port;
        config.key = randomString();
        config.session_keys = [randomString(), randomString()]

        fs.writeFileSync('./config.json', JSON.stringify(config));

        const query = require("./query");

        await query("CREATE TABLE `pic` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(64) NOT NULL, `tags` json NOT NULL, `text` varchar(255) NOT NULL, `file` varchar(128) NOT NULL, `r18` tinyint(1) NOT NULL, PRIMARY KEY(`id`))").then((r) => console.log("Create Pic Table...", "Ok")).catch(err => console.log("Create Pic Table...", err.sqlMessage))
        await query("CREATE TABLE `user` (`uid` int NOT NULL AUTO_INCREMENT, `username` varchar(64) NOT NULL, `password` varchar(256) NOT NULL, `email` varchar(128) NOT NULL, PRIMARY KEY (`uid`))").then((r) => console.log("Create User Table...", "Ok")).catch(err => console.log("Create User Table...", err.sqlMessage))
        await query("INSERT INTO `user` (`username`, `password`, `email`) VALUES (?, ?, ?)", [admin_name, crypto.createHash('sha256').update(admin_pass + config.key).digest('hex'), admin_email]).then((r) => console.log("Create Admin User...", "Ok")).catch(err => console.log("Create Admin User...", err.sqlMessage))
        process.exit()
    }
    rl.close()
})()

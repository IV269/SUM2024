import http from "node:http";
import { WebSocketServer } from "ws";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import fs from "fs/promises";
import process from "node:process";

const app = express();
let collection;
const clients = new Set();
//let messages = new Set();
let messages = "";

/**
app.get("/login", async (req, res) => {
    let cntx = await fs.readFile("client/login.html");
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(cntx);
});

app.get("/", (req, res, next) => {
    // res.setHeader("Content-Type", "text/html");
    // res.writeHead(200);
    res.redirect("/login");
    next();
});
*/

app.use(express.static("client"));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

let counter = 0;

async function parseMess(mess, id) {
    switch (mess.event) {
        case "new board":
            for await (let findResult of collection.find({ id: id })) {
                for (let client of clients) {
                    if (client.id != id) {
                        client.send(JSON.stringify(mess));
                    }
                }
            }
            //await collection.deleteMany({ event: c });
            break;
        default:
            console.log(`No such event: ${mess.event}`);
    }
}

wss.on("connection", (ws) => {
    ws.id = counter++;
    clients.add(ws);
    collection.insertOne({ id: ws.id });

    // wss.on("message", (message) => {
    //     console.log(message.toString());
    // });

    ws.onmessage = async (mess) => {
        // let curClient = ws.id;

        // for (let client of clients) {
        //     if (client.id != curClient) {
        //         client.send(p);
        //     }
        // }
        parseMess(JSON.parse(mess.data), ws.id);
    };
});

// const host = "localhost";
const host = "192.168.30.32";
const port = 3333;

async function main() {
    const url = "mongodb://127.0.0.1:27017";
    const client = new MongoClient(url);
    const connection = await client.connect();
    const database = "IV2";
    const db = connection.db(database);
    collection = db.collection("Chess");
}

server.listen(port, host, () => {
    console.log(`Server started on http://${host}:${port}`);
    main();
});

/*
ADD DATA
collection.insertOne({...});
replace data
collection.replaceOne({old}, {new}) 
*/

//Socket.send(JSON.stringify({}))

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Define and check serial port path
const portPath = "/dev/ttyACM0"; // replace with the actual port if different
if (!portPath) {
    throw new Error("Serial port path is not defined. Please specify the correct path.");
}

// Set up SerialPort to communicate with Arduino
const port = new SerialPort({
    path: portPath,
    baudRate: 9600,
});

// Pipe the port data to a ReadlineParser
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Serve the HTML page
app.use(express.static(__dirname));

// Handle incoming socket connections
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("sendText", (text) => {
        console.log("Text received from client:", text);
        port.write(text + "\n"); // Send text to Arduino
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const axios = require("axios");

const API_KEY = "9b8c6be72d0dc2af6d6e5c9d329d54fb"; // OpenWeatherMap API key
const PORT = 3000;
const DHT_SENSOR_PIN = 7; // DHT11 sensor pin on Arduino

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const portPath = "/dev/ttyACM0"; // Arduino port
const port = new SerialPort({
    path: portPath,
    baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Serve static files (HTML, CSS)
app.use(express.static(__dirname));

// Fetch weather data for the selected city
async function getCityWeather(city) {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        return data.main.temp; // Return city temperature in Celsius
    } catch (error) {
        console.error("Error fetching city weather:", error.message);
        return null;
    }
}

// Handle client connections
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("getWeather", async (city) => {
        const cityTemp = await getCityWeather(city);

        if (cityTemp !== null) {
            // Send city temperature and request room temperature from Arduino
            port.write(`CITY_TEMP:${cityTemp},CITY:${city}\n`);
        } else {
            console.log("Could not fetch city temperature.");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serial port setup
const port = new SerialPort({
  path: "/dev/ttyACM0", // Arduino port
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("getWeather", async (city) => {
    try {
      // Get city weather
      const apiKey = "9b8c6be72d0dc2af6d6e5c9d329d54fb"; // API key
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      const cityTemp = response.data.main.temp.toFixed(2); // City temperature in Celsius

      // Format message and send to Arduino
      const message = `CITY_TEMP:${cityTemp},CITY:${city}`;
      port.write(message + "\n");
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

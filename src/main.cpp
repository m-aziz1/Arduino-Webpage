#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <LiquidCrystal.h>

#define DHTPIN 8      // Pin connected to DHT11 data pin
#define DHTTYPE DHT11 // DHT11 sensor type

const int rs = 7, en = 6, d4 = 5, d5 = 4, d6 = 3, d7 = 2;

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

void setup()
{
  lcd.begin(16, 2);
  dht.begin();
  Serial.begin(9600);
}

void loop()
{
  if (Serial.available())
  {
    String input = Serial.readStringUntil('\n');

    // Clear the LCD for new data
    lcd.clear();

    if (input.startsWith("CITY_TEMP:"))
    {
      // Parse the city temperature and city name
      int cityTempIndex = input.indexOf(":") + 1;
      int cityIndex = input.indexOf(",CITY:") + 6;

      String cityTemp = input.substring(cityTempIndex, input.indexOf(",CITY:"));
      String city = input.substring(cityIndex).substring(0, 3);

      // Read room temperature from DHT11 sensor
      float roomTemp = dht.readTemperature();
      if (isnan(roomTemp))
      {
        roomTemp = 0.0; // Fallback if sensor reading fails
      }

      // Display city and temperature on the first line
      lcd.setCursor(0, 0);
      lcd.print(city);
      lcd.print(": ");
      lcd.print(cityTemp);
      lcd.print((char)223); // Degree symbol
      lcd.print("C");

      // Display room temperature on the second line
      lcd.setCursor(0, 1);
      lcd.print("Room: ");
      lcd.print(roomTemp, 2);
      lcd.print((char)223);
      lcd.print("C");

      delay(2000); // Delay for readability
    }
  }
}

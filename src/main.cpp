#include <Arduino.h>
#include <LiquidCrystal.h>

const int rs = 7, en = 6, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

void setup()
{
  // put your setup code here, to run once:
  lcd.begin(16, 2);
  Serial.begin(9600);
}

void loop()
{
  // put your main code here, to run repeatedly:
  if (Serial.available() > 0)
  {
    lcd.clear();
    String text = Serial.readStringUntil('\n');

    // Display text on lCD
    lcd.setCursor(0, 0);
    if (text.length() <= 16)
    {
      lcd.print(text); // Print all if it fits in one row
    }
    else
    {
      // Split text onto 2 rows
      lcd.print(text.substring(0, 16));
      lcd.setCursor(0, 1);
      lcd.print(text.substring(16));
    }
  }
}

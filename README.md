# Aplikacja Easier Reps

## Instrukcja uruchomienia aplikacji (wersja prosta, bardziej rekomendowana):

1. Zainstalowanie pliku apk na emulatorze (przeciągnięcie pliku) lub na fizycznym urządzeniu

   Plik apk powinien znajdować sie w projekcie, jeśli nie ma to poniżej jest link do pobrania

   Link do apk: https://expo.dev/accounts/banaczka/projects/EasierRepsNew/builds/103e74d3-9fa2-4120-8f19-c72f7abe4a19

## Intrukcja uruchomienia na emulatorze (wersja trudniejsza, budowanie aplikacji):

1. Instalacja zależności node w folderze projektu:

   ```bash
   npm install
   ```

2. Skopiowanie folderu auth/ do node_modules/@firebase **!!! Po zainstalowaniu zależności w punkcie 1 !!!** 

3. Zbudowanie aplikacji w android studio

   Link do dokumentacji Expo: https://docs.expo.dev/workflow/android-studio-emulator/

   Możliwe że potrzebna będzie instalacja wersji javy jdk-17 i ustawienie ścieżek (przynajmniej w systemie linux):

   ```
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
   export PATH=$JAVA_HOME/bin:$PATH
   ```

   Po wykonaniu kroków w dokumentacji powinno udać sie uruchomić poleceniem:

   ```
   npx expo run:android --device
   ```

## Instrukcja uruchomienia wersji webowej aplikacji

1. Przejście do folderu web/

2. Uruchomienie lokalnego serwera http, np. w python:

   ```
   python3 -m http.server 8000
   ```

   Lub wykorzystanie serwera http Node, instalacja w katalogu projektu:

   ```
   npm install -g http-server
   ```

   Z folderu web/ uruchomienie polecenia:

   ```
   http-server -p 8000
   ```

3. Po wejściu na localhost:8000/pages powinna pojawić sie aplikacja
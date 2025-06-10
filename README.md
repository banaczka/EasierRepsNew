# Aplikacja Easier Reps

## Instrukcja uruchomienia aplikacji (wersja prosta, bardziej rekomendowana):

1. Zainstalowanie pliku apk na emulatorze (przeciągnięcie pliku) lub na fizycznym urządzeniu

   Plik apk powinien znajdować sie w projekcie, jeśli nie ma to poniżej jest link do pobrania

   Link do apk: https://expo.dev/accounts/banaczka/projects/EasierRepsNew/builds/103e74d3-9fa2-4120-8f19-c72f7abe4a19

## Intrukcja uruchomienia na emulatorze (wersja trudniejsza, budowanie aplikacji):

1. Instalacja Node JS w katalogu projektu:

   Pobierz instalator ze strony: [https://nodejs.org/](https://nodejs.org/)
   
   Wybierz wersję LTS (zalecana)
   
   Uruchom instalator i postępuj zgodnie z instrukcjami
   
   Sprawdź instalację w CMD:

   ```
   node -v
   npm -v
   ```

2. Instalacja zależności node w folderze projektu:

   ```bash
   npm install
   ```

3. Skopiowanie folderu auth/ do node_modules/@firebase **!!! Po zainstalowaniu zależności w punkcie 1 !!!** 

4. Zbudowanie aplikacji w android studio

   Link do dokumentacji Expo: https://docs.expo.dev/workflow/android-studio-emulator/

   Możliwe że potrzebna będzie instalacja wersji javy jdk-17 i ustawienie ścieżek (przynajmniej w systemie linux):

   ```
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
   export PATH=$JAVA_HOME/bin:$PATH
   ```

5. Po wykonaniu kroków w dokumentacji powinno udać sie uruchomić poleceniem:

   ```
   npx expo run:android --device
   ```

## Instrukcja uruchomienia wersji webowej aplikacji

Instalacja Node.js
Pobierz instalator ze strony: [https://nodejs.org/](https://nodejs.org/)

Wybierz wersję LTS (zalecana)

Uruchom instalator i postępuj zgodnie z instrukcjami

Sprawdź instalację w CMD:

```
node -v
npm -v
```

Instalacja http-server

W wierszu poleceń (CMD) wykonaj:

```
npm install -g http-server
```


Uruchomienie serwera

Przejdź do folderu z projektem:

```
cd /sciezka.projektu/web
```


Uruchom serwer:

```
http-server
```


Dostęp do aplikacji

Otwórz przeglądarkę i wpisz adres:

http://localhost:8080



Dodatkowe opcje uruchamiania:

Uruchom na konkretnym porcie (np. 3000):

```
http-server -p 3000
```


Uruchom z wyłączonym buforowaniem (dla testów):
```
http-server -c-1
```

# Настройка .env файла для работы с API

## Проблема: 401 Unauthorized

Если видите ошибку `401 Unauthorized` и предупреждение `EXPO_PUBLIC_APP_KEY is not set!`, значит `.env` файл не загружается.

## Решение:

### Шаг 1: Создать файл `.env`

В папке `Runa_Finance/` (там где `package.json`) создайте файл `.env`:

**Windows PowerShell:**
```powershell
cd Runa_Finance
"EXPO_PUBLIC_API_URL=https://api.runafinance.online/api" | Out-File -FilePath .env -Encoding utf8
"EXPO_PUBLIC_APP_KEY=b1661a8ce017e081d1add4e9cd8688a8" | Out-File -FilePath .env -Append -Encoding utf8
```

**Или вручную:**
1. Создайте файл `.env` в папке `Runa_Finance/`
2. Добавьте две строки (БЕЗ пробелов вокруг `=`):
```
EXPO_PUBLIC_API_URL=https://api.runafinance.online/api
EXPO_PUBLIC_APP_KEY=b1661a8ce017e081d1add4e9cd8688a8
```

### Шаг 2: Проверить файл

```powershell
Get-Content .env
```

Должно показать:
```
EXPO_PUBLIC_API_URL=https://api.runafinance.online/api
EXPO_PUBLIC_APP_KEY=b1661a8ce017e081d1add4e9cd8688a8
```

### Шаг 3: Остановить Expo и перезапустить с очисткой

**ВАЖНО:** После создания/изменения `.env` ОБЯЗАТЕЛЬНО:

1. Остановите Expo (Ctrl+C в терминале)
2. Запустите заново:
```powershell
npx expo start --clear
```

### Шаг 4: Проверить что переменные загружены

При запуске Expo вы ДОЛЖНЫ увидеть:
```
env: load .env
env: export EXPO_PUBLIC_API_URL EXPO_PUBLIC_APP_KEY
```

Если этого НЕТ - значит `.env` не загружается!

### Шаг 5: Проверить в приложении

После запуска приложения, в логах НЕ должно быть:
```
WARN [API] WARNING: EXPO_PUBLIC_APP_KEY is not set!
WARN [API] WARNING: EXPO_PUBLIC_APP_KEY not set!
LOG [API Debug] X-Runa-App-Key header: MISSING
```

Должно быть:
```
LOG [API Debug] X-Runa-App-Key header: PRESENT
```

## Если всё ещё не работает:

### Вариант 1: Проверить расположение файла

Файл `.env` должен быть в корне проекта:
```
Runa_Finance/
  ├── .env          ← ЗДЕСЬ! (рядом с package.json)
  ├── package.json
  ├── App.tsx
  └── src/
```

### Вариант 2: Пересоздать файл

```powershell
cd Runa_Finance

# Удалить старый
Remove-Item .env -ErrorAction SilentlyContinue

# Создать заново
"EXPO_PUBLIC_API_URL=https://api.runafinance.online/api" | Out-File -FilePath .env -Encoding utf8 -NoNewline
"`nEXPO_PUBLIC_APP_KEY=b1661a8ce017e081d1add4e9cd8688a8" | Out-File -FilePath .env -Append -Encoding utf8 -NoNewline

# Проверить
Get-Content .env
```

### Вариант 3: Использовать app.json (альтернатива)

Если `.env` не работает, добавьте в `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "https://api.runafinance.online/api",
      "EXPO_PUBLIC_APP_KEY": "b1661a8ce017e081d1add4e9cd8688a8"
    }
  }
}
```

Затем в коде используйте:
```typescript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
```

## Важно:

- `.env` файл НЕ должен быть в git (уже в `.gitignore`)
- После изменения `.env` ВСЕГДА перезапускайте Expo с `--clear`
- Убедитесь что в `.env` НЕТ лишних пробелов или кавычек
- Файл должен называться именно `.env` (не `.env.local`)

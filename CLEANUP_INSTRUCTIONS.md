# Инструкция по очистке и запуску проекта (PowerShell)

## Для Windows PowerShell используйте эти команды:

### Шаг 1: Обновить код из репозитория
```powershell
git pull origin main
```

### Шаг 2: Полная очистка (PowerShell команды)
```powershell
# Удалить node_modules
Remove-Item -Recurse -Force node_modules

# Удалить .expo
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Удалить package-lock.json
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Удалить кэш node_modules
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### Шаг 3: Очистить кэш npm
```powershell
npm cache clean --force
```

### Шаг 4: Переустановить зависимости
```powershell
npm install --legacy-peer-deps
```

### Шаг 5: Запустить с полной очисткой
```powershell
npx expo start --clear
```

## Альтернативный способ (одной командой):
```powershell
Remove-Item -Recurse -Force node_modules,.expo,package-lock.json -ErrorAction SilentlyContinue; npm cache clean --force; npm install --legacy-peer-deps; npx expo start --clear
```


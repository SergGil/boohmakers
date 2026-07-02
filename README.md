# Точний рахунок

Застосунок для ставок друзів на точний рахунок матчів. React + TypeScript + Firebase (Auth + Firestore), хостинг на GitHub Pages.

## Налаштування Firebase

1. Створи проєкт на [console.firebase.google.com](https://console.firebase.google.com).
2. Додай веб-застосунок у проєкті (значок `</>`), скопіюй конфіг.
3. Увімкни **Authentication → Sign-in method → Google**.
4. Увімкни **Firestore Database** (у режимі production).
5. Задеплой правила безпеки з [firestore.rules](firestore.rules):
   ```
   firebase deploy --only firestore:rules
   ```
   (потрібен `firebase-tools`: `npm i -g firebase-tools`, `firebase login`, `firebase init` з вибором існуючого проєкту).
6. У Firebase Console → Authentication → Settings → Authorized domains — додай домен GitHub Pages, напр. `serggil.github.io`.

## Локальний запуск

```
npm install
cp .env.example .env   # заповни значеннями з Firebase Console
npm run dev
```

## Деплой на GitHub Pages

```
npm run deploy
```

Це збудує проєкт (`npm run build`) і запушить `dist/` у гілку `gh-pages` через пакет `gh-pages`. Після першого деплою потрібно в налаштуваннях репозиторію (Settings → Pages) обрати джерело **gh-pages branch**, якщо GitHub не зробив це автоматично.

Застосунок буде доступний на `https://serggil.github.io/boohmakers/`.

## Формула нарахування очок

Наразі: 3 очки за точний рахунок, 1 очко за вгаданий результат (перемога/нічия/поразка), 0 — якщо не вгадано. Логіка живе в [src/lib/scoring.ts](src/lib/scoring.ts) — заміни на свою формулу, коли визначишся.

## Як це працює

- Будь-хто, хто увійшов через Google, може створити змагання (competition) і стає його адміном.
- Адмін ділиться кодом запрошення — інші приєднуються за ним.
- Адмін додає матчі та вручну вносить фінальний рахунок.
- Учасники роблять ставки до початку матчу (`kickoff`), після чого ставка блокується.
- Очки нараховуються автоматично на основі формули в `scoring.ts` після внесення результату.

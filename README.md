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

За кожен матч, у якому зроблена ставка (максимум 6, мінімум 0 балів):

- **+1** за сам факт прогнозу (гарантований бал за участь)
- **+1** за вгаданий результат (переможець або нічия) / **−1** якщо результат не вгадано
- **+1** за вгадану різницю голів (за модулем, незалежно від того, на чию користь)
- **+1** за точний рахунок господарів
- **+1** за точний рахунок гостей
- **+1** бонусний бал, якщо одночасно вгадано і результат, і різницю голів

Якщо ставку не зроблено — 0 балів за матч. Логіка в [src/lib/scoring.ts](src/lib/scoring.ts).

## Як це працює

- Будь-хто, хто увійшов через Google, може створити змагання (competition) і стає його адміном.
- Адмін ділиться кодом запрошення — інші приєднуються за ним.
- Адмін додає матчі та вручну вносить фінальний рахунок.
- Учасники роблять ставки до початку матчу (`kickoff`), після чого ставка блокується.
- Очки нараховуються автоматично на основі формули в `scoring.ts` після внесення результату.

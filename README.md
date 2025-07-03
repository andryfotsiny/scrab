# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

scrab/
├── .expo/
│   ├── types/
│   │   └── router.d.ts
│   ├── README.md
│   └── devices.json
├── .idea/
│   ├── caches/
│   │   └── deviceStreaming.xml
│   ├── .gitignore
│   ├── misc.xml
│   ├── modules.xml
│   ├── scrab.iml
│   ├── vcs.xml
│   └── workspace.xml
├── .vscode/
│   └── settings.json
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (main)/
│   │   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── assets/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.tsx
│   │   │   ├── Logo.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── templates/
│   │   │   └── LoginTemplate.tsx
│   │   └── index.ts
│   ├── feature/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginScreen.tsx
│   │       │   └── UserInfoScreen.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       ├── services/
│   │       ├── types/
│   │       │   └── index.tsx
│   │       └── index.ts
│   ├── shared/
│   │   ├── context/
│   │   │   └── ThemeContext.tsx
│   │   └── services/
│   │       ├── api/
│   │       │   ├── auth/
│   │       │   │   └── auth.api.ts
│   │       │   └── constant-api.ts
│   │       └── helpers/
│   │           └── apiClient.ts
│   └── styles/
│       └── index.ts
├── .env
├── .gitignore
├── README.md
├── app.json
├── eslint.config.js
├── expo-env.d.ts
├── package-lock.json
├── package.json
└── tsconfig.json
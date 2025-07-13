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
│   ├── web/
│   │   └── cache/
│   │       └── production/
│   │           └── images/
│   │               └── favicon/
│   │                   └── favicon-24272cdaeff82cc5facdaccd982a6f05b60c4504704bbf94c19a6388659880bb-contain-transparent/
│   │                       └── favicon-48.png
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
│   │   │   ├── _layout.tsx
│   │   │   ├── admin.tsx
│   │   │   ├── football.tsx
│   │   │   ├── grolo.tsx
│   │   │   ├── index.tsx
│   │   │   ├── mini.tsx
│   │   │   └── other.tsx
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
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Text.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── molecules/
│   │   │   ├── Card.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── SuccessModal.tsx
│   │   │   └── TabBar.tsx
│   │   └── index.ts
│   ├── features/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── AdminProtectedRoute.tsx
│   │   │   │   ├── AdminScreen.tsx
│   │   │   │   ├── SystemStatus.tsx
│   │   │   │   └── UsersList.tsx
│   │   │   └── types/
│   │   │       └── admin.types.ts
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── UserInfoScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── types/
│   │   │   │   └── index.tsx
│   │   │   └── index.ts
│   │   └── football/
│   │       ├── components/
│   │       │   ├── tabs/
│   │       │   │   ├── AutoBetTab.tsx
│   │       │   │   ├── BetNowTab.tsx
│   │       │   │   ├── ConfigurationTab.tsx
│   │       │   │   ├── MiniAutoBetTab.tsx
│   │       │   │   ├── MiniBetNowTab.tsx
│   │       │   │   └── MiniConfigurationTab.tsx
│   │       │   ├── GroloScreen.tsx
│   │       │   └── MiniScreen.tsx
│   │       ├── context/
│   │       │   ├── FootballContext.tsx
│   │       │   └── MiniContext.tsx
│   │       └── MenuFootball.tsx
│   ├── shared/
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/
│   │   │   ├── admin/
│   │   │   │   └── useAdminQueries.ts
│   │   │   ├── auth/
│   │   │   │   └── useAuthQueries.ts
│   │   │   ├── grolo/
│   │   │   │   └── useGroloQueries.ts
│   │   │   ├── mini/
│   │   │   │   └── useMiniQueries.ts
│   │   │   └── useSessionManager.ts
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── admin/
│   │   │   │   │   └── admin.api.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── TokenRefreshManager.ts
│   │   │   │   │   └── auth.api.ts
│   │   │   │   ├── football/
│   │   │   │   │   ├── football.api.ts
│   │   │   │   │   └── mini.api.ts
│   │   │   │   └── constant-api.ts
│   │   │   ├── helpers/
│   │   │   │   └── apiClient.ts
│   │   │   └── types/
│   │   │       ├── grolo.type.ts
│   │   │       └── mini.type.ts
│   │   └── utils/
│   │       └── responsive.utils.ts
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

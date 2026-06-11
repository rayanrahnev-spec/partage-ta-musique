# Installation V10

Backend :
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Base de données :
```bash
createdb partage_ta_musique
psql -d partage_ta_musique -f database/schema.sql
cd backend
npm run db:seed
```

Frontend :
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Step 1 — stop dev server (if running)
Ctrl + C

## Step 2 — create a Vite React+TS app (once)
npm create vite@latest app -- --template react-ts

## Step 3 — enter the app
cd app

## Step 4 — install deps
npm install

## Step 5 — copy your single TSX file into src (adjust path if needed)
cp ../typing-practice.tsx ./src/

## Step 6 — make Vite render your TSX file (one command, no editor)
perl -0777 -i -pe "s/import App from '\\.\\/App\\.tsx'/import App from '.\\/typing-practice'/g" src/main.tsx

## Step 7 — start dev server
npm run dev

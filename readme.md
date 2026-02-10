## Step 1 — stop dev server (if running)
Ctrl + C

## Step 2 — go to parent directory
cd ..

## Step 3 — delete the messy folder (if it exists)
rm -rf skylar-type-it

## Step 4 — create a clean Vite React+TS project
npm create vite@latest skylar-type-it -- --template react-ts

## Step 5 — enter the project
cd skylar-type-it

## Step 6 — install deps
npm install

## Step 7 — copy your single TSX file into src (adjust path if needed)
cp ../typing-practice.tsx ./src/

## Step 8 — make Vite render your TSX file (one command, no editor)
perl -0777 -i -pe "s/import App from '\\.\\/App\\.tsx'/import App from '.\\/typing-practice'/g" src/main.tsx

## Step 9 — start dev server
npm run dev

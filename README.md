# skindiary

AI skincare recommendations sourced from Reddit communities.

## deploy to vercel (5 steps)

### 1. install vercel cli
```
npm install -g vercel
```

### 2. get your anthropic api key
Go to https://console.anthropic.com → API Keys → Create Key
Copy the key (starts with `sk-ant-...`)

### 3. push this folder to github
```
git init
git add .
git commit -m "init"
```
Create a new repo on github.com, then:
```
git remote add origin https://github.com/YOUR_USERNAME/skindiary.git
git push -u origin main
```

### 4. deploy on vercel
Go to https://vercel.com → Add New Project → Import your github repo → Deploy

### 5. add your api key as an environment variable
In your Vercel project dashboard:
Settings → Environment Variables → Add:
- Name: `ANTHROPIC_API_KEY`
- Value: `sk-ant-...your key here...`

Then go to Deployments → click the three dots on your latest deploy → Redeploy.

That's it — your site is live.

## project structure
```
skindiary/
├── api/
│   └── analyze.js      ← serverless function (keeps api key secret)
├── public/
│   └── index.html      ← the whole frontend
├── vercel.json         ← routing config
└── README.md
```

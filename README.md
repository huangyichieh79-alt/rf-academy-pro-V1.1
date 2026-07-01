# RF Academy Pro V1

180-day mobile English training PWA for RF / EMC / Safety / Certification / Interview practice.

## Features
- 180 daily lessons
- 10 vocabulary items per day
- RF, EMC, Safety, Certification, Lab Debug, Interview themes
- Browser TTS pronunciation
- Slow shadowing playback
- Daily progress saved in localStorage
- Notes per day
- Export progress JSON
- Mobile-first responsive UI
- GitHub Pages / Netlify compatible

## GitHub Pages Upload
1. Unzip this package.
2. Create a GitHub repository, for example `rf-academy-pro`.
3. Upload all files in this folder.
4. Go to Settings → Pages.
5. Source: Deploy from branch.
6. Branch: main, folder: /root.
7. Save and open the generated GitHub Pages URL.

## Local Preview
```bash
npm install
npm run dev
```

## Build
```bash
npm install
npm run build
```

For GitHub Pages with Vite, deploy the built `dist` folder or use GitHub Actions.
For simplest static hosting, use Netlify and drag-drop the entire project folder.

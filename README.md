# Zulfi — Portfolio

My personal portfolio website showcasing my homelab infrastructure, projects, and technical skills.

**Live:** [GitHub Pages](https://fhaivee.github.io/portfolio)

## Run Locally

```bash
# With Docker
docker compose up -d

# Or serve static files
npx serve . -l 3000
```

## Deploy to Docker (Dockge / Portainer)

1. Clone this repo on your server
2. Run `docker compose up -d`
3. Access at `http://your-server:8080`

## Deploy to GitHub Pages

1. Push to `main` branch
2. Go to **Settings → Pages → Source: GitHub Actions**
3. The workflow auto-deploys on every push

## Customize

- **Profile photo:** Place your image at `assets/profile.jpg` and uncomment the `<img>` tag in `index.html`
- **New services:** Copy a service card in the Homelab section of `index.html`
- **Port:** Change `8080:80` in `docker-compose.yml`

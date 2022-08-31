# Tung lo siu (銅蘿燒)

![](https://img.shields.io/badge/license-MIT-blue)
![](https://img.shields.io/badge/NodeJS-v16-green)
![](https://img.shields.io/badge/PRs-welcome-green)

![](https://ci.cncn3.cn/c8ef264a1e1b7580b540b941325bd5bd.png)

### What is it?

This is an image showcase/image hosting site.

### What can it do?

- Upload/Show pictures
- NSFW Blur
- Tag select
- Simple permission manage

## Start

> If you want to modify the frontend, you can modify `/frontend/`. (Icon: `/backend/static` or `/frontend/public`)

### Environment

- MySQL (8.0+)
- NodeJS (v16+)

### Install

1. Get
```bash
git clone https://github.com/ArsFy/tung-lo-siu
cd tung-lo-siu/backend
npm i
```

2. Install

Follow the prompts to config MySQL and create an admin user.

> If you want to create a second admin user, please refer to install.js (under dev)

```bash
npm run install
```

3. Config

Edit config.json, edit `site_name` and `http_port`

```json
{
    "site_name": "TungLoSiu",
    ...
    "http_port": 80
}
```

4. Run

Open `http://[your server ip]/`

```bash
npm start  # Or node main.js
```
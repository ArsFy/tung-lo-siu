# Tung lo siu (銅蘿燒)

![](https://img.shields.io/badge/license-MIT-blue)
![](https://img.shields.io/badge/NodeJS-v16-green)
![](https://img.shields.io/badge/PRs-welcome-green)

> Online: https://pic.arsfy.buzz

![image](https://user-images.githubusercontent.com/93700457/187623273-190089d7-a39a-4579-b186-98d7ed202b6b.png)

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

> If you want to create a second admin user, please refer to run.js (under dev)

```bash
node run.js
```

3. Config

Edit config.json, edit `site_name` and `http_port`

```js
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

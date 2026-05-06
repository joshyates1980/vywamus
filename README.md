# Vywamus website

This codebase creates the website containing:

1. Home page
1. About page
1. Repository articles
1. Repository indexes
1. Tag index pages
1. Text and XML sitemaps
1. Search facility

[Development preview...](https://vywamus.z20.web.core.windows.net/)


## Installation

Clone or [download](https://github.com/craigbuckler/vywamus/archive/refs/heads/main.zip) the [repository](https://github.com/craigbuckler/vywamus):

```bash
git clone git@github.com:craigbuckler/vywamus.git
```

Enter project directory:

```bash
cd vywamus
```

Install modules:

```bash
npm install
```


## Development

Default development settings are in `.env.dev`. You should not need to change these.

To build all files to `./build/` and start a development server:

```bash
npm start
```

then navigate to `http://localhost:8501/`

Stop the server with `Ctrl|Cmd + C`.


### Development files

* content files are defined in `src/content/`
* templates are defined in `src/templates/`
* all image, CSS, and JS assets are copied from `src/assets/`

Note:

1. Articles are in markdown format and use the name `YYYY-MM-DD_post-title.md` in the appropriate `src/content/repository/<year>` directory. When adding a new year, remember to add an `#index.html` file to create an index page.

1. Changing content or template files will automatically refresh the page.

1. Changing an image, CSS, or JS asset requires you to stop and restart the server then manually refresh the page.

1. `src/assets/css/custom.css` provides additional styles not in the original CSS.


## Production

The production build uses settings in `.env.dev` but overrides them with `.env.prod`. You should change `SITE_DOMAIN` to the live domain.

Build all minified production files to `./build/` for deployment:

```bash
npm run build
```

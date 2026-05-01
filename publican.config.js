// Publican configuration
import { Publican, tacs } from 'publican';
import { staticsearch } from 'staticsearch';

import { env } from '#lib/utils.js';
import * as fnNav from '#lib/nav.js';
import * as fnFormat from '#lib/format.js';
import * as fnHooks from './lib/hooks.js';

const
  publican = new Publican(),
  isDev = (env('NODE_ENV') === 'development');

console.log(`Building ${ isDev ? 'development' : 'production' } site`);

// directories
publican.config.dir.content = env('CONTENT_DIR', './src/content/');
publican.config.dir.template = env('TEMPLATE_DIR', './src/template/');
publican.config.dir.build = env('BUILD_DIR', './build/');
publican.config.root = env('BUILD_ROOT', '/');

// HTML templates
publican.config.defaultHTMLTemplate = env('TEMPLATE_DEFAULT', 'default.html');
publican.config.dirPages.template = env('TEMPLATE_LIST', 'list.html');
publican.config.tagPages.template = env('TEMPLATE_TAG', 'tag.html');

// slug replacement - remove YYYY-MM-DD_
publican.config.slugReplace.set(/\d{4}-\d{2}-\d{2}_/g, '');

// disable syntax highlighting
publican.config.markdownOptions.prism = false;

// disable heading anchors
publican.config.headingAnchor = false;

// sorting and pagination
publican.config.dirPages.size = 48;
publican.config.dirPages.sortBy = 'filename';
publican.config.dirPages.sortOrder = 1;
publican.config.dirPages.dir.repository = {
  sortBy: 'date',
  sortOrder: -1
};
publican.config.tagPages.size = 24;

// pass-through files
publican.config.passThrough.add({ from: './src/assets', to: './assets' });

// determine post date from filename
publican.config.processContent.add( fnHooks.processFileDate );

// processRenderStart hook: change title, descriptions, etc.
publican.config.processRenderStart.add( fnHooks.renderstartData );

// processPostRender hook: add <meta> tags
publican.config.processPostRender.add( fnHooks.postrenderMeta );

// jsTACs rendering defaults
const servePort = env('SERVE_PORT', 8501);

tacs.config = tacs.config || {};
tacs.config.isDev = isDev;
tacs.config.language = env('SITE_LANGUAGE', 'en-US');
tacs.config.domain = isDev ? `http://localhost:${ servePort }` : env('SITE_DOMAIN');
tacs.config.title = env('SITE_TITLE');
tacs.config.description = env('SITE_DESCRIPTION');
tacs.config.buildDate = new Date();

// jsTACS functions
tacs.fn = tacs.fn || {};
tacs.fn.nav = fnNav;
tacs.fn.format = fnFormat;

// replacement strings
publican.config.replace = new Map([
  [ '--ROOT--', publican.config.root ],
  [ '--COPYRIGHT--', `&copy;<time datetime="${ tacs.fn.format.dateYear() }">${ tacs.fn.format.dateYear() }</time>` ],
  [ ' style="text-align:end"', ' class="right"' ],
  [ ' style="text-align:right"', ' class="right"' ],
  [ ' style="text-align:center"', ' class="center"' ],
  [ /[^<div class="table-responsive">]<table>/gm, '<div class="table-responsive"><table class="table">' ],
  [ /<\/table>[^</div>]/gm, '</table></div>' ],
  [ /<p>(<img.+?>)<\/p>/gim, '$1' ],                                          // <p> around <img>
  [ /<p>(<svg.+?<\/svg>)<\/p>/gim, '$1' ],                                    // <p> around <svg>
  [ /<img(\b(?![^>]*\balt\s*=)[^>]*)>/gism, '<img$1 alt="illustration">' ],   // <img> alt
  [ /<img(\b(?![^>]*\bloading\s*=)[^>]*)\/>/gism, '<img$1 loading="lazy">' ], // <img> lazy loading
  [ /<img(\b(?![^>]*\bloading\s*=)[^>]*)>/gism, '<img$1 loading="lazy">' ],   // <img> lazy loading
  [ /alt=""/gim, 'alt="decoration"' ],                                        // empty alt
  [ /<\/blockquote>\s*<blockquote>/gi, '' ],                                  // multiple <blockquote>
  [ '&feedquot;', '\\"' ],                                                    // JSON feed replace
  [ '&feedtab;', '\\t' ],
  [ '&feedcr;', '\\n' ],
]);

// utils
publican.config.minify.enabled = !isDev;  // minify in production mode
publican.config.watch = isDev;            // watch in development mode
publican.config.logLevel = 2;             // output verbosity

// clear build directory
await publican.clean();

// build site
await publican.build();

// run search indexer
staticsearch.buildDir = publican.config.dir.build;
staticsearch.searchDir = publican.config.dir.build + 'search/';
staticsearch.domain = tacs.config.domain;
staticsearch.pageDOMSelectors = 'main,#mission,#statistics';
staticsearch.pageDOMExclude = 'header,nav,menu,footer';
staticsearch.stopWordsDefault = false;
staticsearch.stopWords = 'a,again,am,an,and,any,are,article,as,at,be,because,both,by,but,can,did,do,does,doing,few,for,from,had,has,have,here,her,him,his,i,if,in,into,it,its,just,least,less,me,more,most,my,of,off,on,or,other,our,over,post,repository,some,she,should,such,that,the,their,then,there,these,this,those,to,under,very,was,were,what,when,which,with,why,your';
await staticsearch.index();

// development server
if (publican.config.watch) {

  const { livelocalhost } = await import('livelocalhost');
  livelocalhost.servedir = publican.config.dir.build;
  livelocalhost.serveport = servePort;
  livelocalhost.accessLog = false;
  livelocalhost.start();

}

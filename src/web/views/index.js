const capitalize = (str) => {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const escapeText = (text) => {
  return text.replace(/"/g, '&quot;');
};

const twitterTags = (metadata, config, url) => [
  '<meta content="player" name="twitter:card" />',
  `<meta content="${escapeText(metadata.title)}" name="twitter:title" />`,
  `<meta content="${escapeText(metadata.description)}" name="twitter:text:description" />`,
  `<meta content="${escapeText(metadata.description)}" name="twitter:description" />`,
  `<meta content="${metadata.picture}" name="twitter:image" />`,
  `<meta content="${config.appName}" name="twitter:site" />`,
  `<meta content="${metadata.embed_url}" name="twitter:player" />`,
  `<meta content="${metadata.embed_url}" name="twitter:player:stream" />`,
  '<meta content="800" name="twitter:player:width" />',
  '<meta content="800" name="twitter:player:height" />',
].join('\n');

const facebookTags = (metadata, config, url) => {
  const host = metadata.permalink.replace(/(^https?:\/\/[^\/]+).*/, '$1');
  return [
    '<meta content="article" property="og:type" />',
    `<meta content="${escapeText(metadata.title)}" property="og:title" />`,
    `<meta content="${metadata.picture}" property="og:image" />`,
    `<meta content="${host}${url}" property="og:url" />`,
    `<meta content="${escapeText(metadata.description)}" property="og:description" />`,
  ].join('\n');
};

const heapAnalytics = (config) => {
  return config.heapAppId ?
    `<script type="text/javascript">
        window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
          heap.load("${config.heapAppId}");
    </script>` : '';
};

const uptimeMonitoring = (config) => {
  return config.uptimeId ?
  `<script>(function(w,d,s){w._uptime_rum2={};w._uptime_rum2.errors=[];w._uptime_rum2.uuid='${config.uptimeId}';w._uptime_rum2.url='https://rumcollector.uptime.com';s=document.createElement('script');s.async=1;s.src='https://rum.uptime.com/static/rum/compiled/v2/rum.js';d.getElementsByTagName('head')[0].appendChild(s);w.addEventListener('error',function(e){w._uptime_rum2.errors.push({t:new Date(),err:e})});})(window,document);</script>`
    : '';
};

const metaTags = (metadata, config, url) => {
  const params = url.replace(/^[^?]*/, '');
  return [
    `<meta name="description" content="${escapeText(metadata.description)}" />`,
    `<link rel="alternate" type="application/json+oembed" href="${metadata.oembed_url}${params}" title="${escapeText(metadata.title)}" />`,
  ].join('\n');
};

const socialTags = (metadata, config, url) => {
  if (!metadata) {
    return '';
  }

  return [
    metaTags(metadata, config, url),
    twitterTags(metadata, config, url),
    facebookTags(metadata, config, url),
  ].join('\n');
};

module.exports = ({ config, metadata, url }) => {
  const BUNDLE_PREFIX = process.env.BUNDLE_PREFIX ? `.${process.env.BUNDLE_PREFIX}` : '';

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${metadata ? metadata.title : capitalize(config.appName)}</title>
          ${socialTags(metadata, config, url)}
          <link href="/images/logo/${config.appName || 'favicon'}.ico" rel="icon">
          <script src="/js/config.js" defer="defer"></script>
          <script src="/js/vendor.bundle${BUNDLE_PREFIX}.js" defer="defer"></script>
          <script src="https://js.pusher.com/4.4/pusher.min.js"></script>
          <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Mono" rel="stylesheet" type="text/css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/leaflet.css" />
          ${heapAnalytics(config)}
        </head>
        <body>
          <div id="root"></div>
          ${uptimeMonitoring(config)}
        </body>
        <script src="/js/index.bundle${BUNDLE_PREFIX}.js" defer="defer"></script>
      </html>
  `;
};

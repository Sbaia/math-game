const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function client(protocol = 'https:', registrationError = false) {
  const nodes = Object.fromEntries(['pwa-install','pwa-update','pwa-status'].map(id => [id, {hidden:true, addEventListener(type, fn) {this[type] = fn;}}]));
  const events = {}, workerEvents = {};
  const messages = [];
  const registration = {waiting:{postMessage: message => messages.push(message)}, addEventListener() {}};
  let registrations = 0, reloads = 0;
  const context = {
    document:{getElementById:id => nodes[id]},
    location:{protocol, reload:() => reloads++},
    navigator:{onLine:true, serviceWorker:{controller:{}, ready:Promise.resolve(), register:() => {registrations++;return registrationError ? Promise.reject(new Error('Network unavailable')) : Promise.resolve(registration);}, addEventListener:(name, fn) => workerEvents[name] = fn}},
    window:{isSecureContext:true,matchMedia:() => ({matches:false}),addEventListener:(name,fn) => events[name] = fn}
  };
  vm.runInNewContext(fs.readFileSync(__dirname+'/pwa.js','utf8'),context);
  return {nodes,events,workerEvents,messages,get registrations(){return registrations;},get reloads(){return reloads;},context};
}
// Catches: registering a service worker on file URLs breaks local game launch.
test('file launch does not register a worker while offline status explains audio limits', () => {
  const c = client('file:');
  assert.equal(c.registrations,0);
  c.context.navigator.onLine=false;c.events.offline();
  assert.match(c.nodes['pwa-status'].textContent,/AUDIO POTREBBE RICHIEDERE INTERNET/);
});
// Catches: controller activation silently reloads a child's game without approval.
test('a waiting update reloads only after the user requests activation', async () => {
  const c=client(); await Promise.resolve();
  assert.equal(c.nodes['pwa-update'].hidden,false);
  c.workerEvents.controllerchange();assert.equal(c.reloads,0);
  c.nodes['pwa-update'].click();
  assert.equal(c.messages[0].type,'SKIP_WAITING');
  c.workerEvents.controllerchange();assert.equal(c.reloads,1);
});
// Catches: invoking a deferred install prompt twice or showing an install button after installation.
test('install action consumes the browser prompt once and hides after installation', async () => {
  const c=client();let calls=0;
  c.events.beforeinstallprompt({preventDefault(){},prompt:async()=>calls++,userChoice:Promise.resolve({outcome:'accepted'})});
  assert.equal(c.nodes['pwa-install'].hidden,false);
  await c.nodes['pwa-install'].click();await c.nodes['pwa-install'].click();
  assert.equal(calls,1);
  c.events.appinstalled();assert.equal(c.nodes['pwa-install'].hidden,true);
});
// Catches: root-absolute manifest URLs send project installations to another GitHub Pages site.
test('manifest identity start and icons stay in project scope with correct PNG sizes', () => {
  const manifest=JSON.parse(fs.readFileSync(__dirname+'/manifest.webmanifest','utf8'));
  const base='https://example.github.io/math-game/manifest.webmanifest';
  assert.equal(new URL(manifest.start_url,base).href,'https://example.github.io/math-game/#!/');
  assert.equal(new URL(manifest.scope,base).pathname,'/math-game/');
  assert.equal(new URL(manifest.id,base).pathname,'/math-game/');
  for(const icon of manifest.icons) {
    const url=new URL(icon.src,base); assert.ok(url.pathname.startsWith('/math-game/icons/'));
    const png=fs.readFileSync(__dirname+'/'+icon.src);
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(icon.sizes,`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`);
  }
  assert.ok(manifest.icons.some(icon=>icon.sizes==='192x192'));
  assert.ok(manifest.icons.some(icon=>icon.sizes==='512x512'&&icon.purpose==='maskable'));
});

// Catches: an offline update check hides readiness of the already installed app.
test('an existing active worker stays offline-ready when registration cannot reach the server', async () => {
  const c=client('https:', true);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(c.nodes['pwa-status'].textContent, 'PRONTO PER GIOCARE ANCHE OFFLINE.');
});

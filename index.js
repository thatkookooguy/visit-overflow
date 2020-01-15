const nconf = require('nconf');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const moment = require('moment');
const PushBullet = require('pushbullet');

let pusher = {
  file: () => {},
  devices: () => {}
};

nconf.argv()
   .env({ lowerCase: true })
   .file({ file: 'config.json' });

const userEmail = nconf.get('stackoverflow:email');
const userPassword = nconf.get('stackoverflow:password');
const scheduledHourOfDay = nconf.get('scheduledHourOfDay');
const pushbulletApiKey = nconf.get('pushbullet');
const timezone = nconf.get('timezone') || 'Asia/Jerusalem';
const returnUrl = nconf.get('returnUrl') || 'https://stackoverflow.com';
const returnUrlEncoded = encodeURIComponent(returnUrl);

if (pushbulletApiKey) {
  pusher = new PushBullet(pushbulletApiKey);
}

cron.schedule(`0 ${ scheduledHourOfDay } * * *`, async () => {
  console.log('running stackoverflow task twice a day');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    height: 700,
    width: 1250
  });
  
  await page.goto(`https://stackoverflow.com/users/login?ssrc=head&returnurl=${ returnUrlEncoded }`);
  await page.type('input#email', userEmail);
  await page.type('input#password', userPassword);
  await page.focus('button#submit-button');
  await page.waitFor(5000);
  await page.click('button#submit-button');
  await page.waitForNavigation();
  await page.waitFor(5000);
  const now = moment().format('YYYY-MM-DD HH[H]');
  const fileName = `${ now }-screenshot.png`;
  await page.screenshot({ path: fileName });

  const element = await page.$('.days-visited');
  const daysVisited = element ? await page.evaluate(element => element.innerText, element).trim() : 'Daily visit';
 
  await browser.close();
  
  // promisify doesn't work for some reason
  // const filePromise = util.promisify(pusher.file);
  pusher.file({}, fileName, `stackoverflow [${ now }] - ${ daysVisited }`, (err, res) => {
    if (err) {
      console.error(err);
      // fail gracefully
      return;
    }

    console.log('sent push notification', res);
  });
},{
  scheduled: true,
  timezone
});

# visit-overflow
login to stack overflow daily for the 100 consecutive days achievement

create a `config.json` file with the following attributes:
```javascript
{
  // your timezone
  "timezone": "Asia/Jerusalem",
  // redirect to this url after login:
  "returnUrl": "https://stackoverflow.com/users/1788884/thatkookooguy?tab=profile"
  // send a notification upon success to your phone
  // using PushBullet
  "pushbullet": "<pushbullet_api_token>",
  // hours to login on. this will
  // run the job at 4PM and 11PM
  "scheduledHourOfDay": "16,23",
  "stackoverflow": {
    "email": "<your_stackoverflow_email>",
    "password": "<your_stackoverflow_password>"
  }
  
}
```

then, just run `npm run start` to start the cron job.

you can also run it using nodmon to make sure it restarts on errors with
```
npm run start:monitor
```

The code will visit stack overflow when you specified, login, go to the redirect
url (or the homepage), take a screenshot, and send a push notification to
notify you (if you set up the pushbullet param).

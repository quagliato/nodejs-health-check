# nodejs-health-check

A health check ping using node.js that notifies a e-mail address when the
url is down or no responding 200 codes for a specific set of parameters.

## Instructions

Inside index.js, type you app's name, the URL to request, the HTTP method,
the body you need to and the e-mail settings (smtp host, port, user and pass)
to be reported.

Place the call in the crontab of a server and that's it!

## Support

Got doubts? E-mail me at [eduardo@quagliato.me](mailto:eduardo@quagliato.me). ;)

# nodejs-health-check

**NOT A STATE OF THE ART CODE, I'M JUST MESSING AROUND!**

A health check ping using node.js that notifies a e-mail address when the
url is down or no responding 200 codes for a specific set of parameters.

## Instructions

Copy the *config-example.json* file to *config.json* (or what other name you
want to) and set its path into the environment variable *CONFIG_FILE*.

Inside the config file, you have to fill the SMTP info (host, port, user and 
pass) in two ways:

1. One *smtp_settings* for all apps, right on the root of the object;

2. One *smtp_settings* for each app;

Master *smtp_settings* will always override app's *smtp_settings*.

You will also have to fill the array *targets* with an object containing this
properties:

* **url**: The URL you want to monitor using http:// or https://;
* **method**: The HTTP method you want to use. If nothing is provided, GET will be used;
* **app\_name**: This name will be used to the email's subject and content;
* **report\_email**: The email to which the report will be sent;
* **body**: If the response should have any specific body, fill it here.

Place the call in the crontab of a server and that's it!

## Support

Got doubts? E-mail me at [eduardo@quagliato.me](mailto:eduardo@quagliato.me). ;)

# nodejs-health-check

**NOT A STATE OF THE ART CODE, I'M JUST MESSING AROUND!**

A health check ping using node.js that notifies a e-mail address when the
url is down or no responding 200 codes for a specific set of parameters.

## Instructions

### Create a configuration JSON

You can use the `config-example.json` file as an example to you configuration
JSON.

In the JSON, you need to fill the SMTP info (host, port, user and password).
There is 2 ways to do it:

1. One `smtp_settings` for all apps, right on the root of the object;

2. One `smtp_settings` for each app;

App's `smtp_settings` will always override root's `smtp_settings`.

You also need to fill the array `targets` with objects containing the following
properties:

* **url**: The URL you want to monitor using http:// or https://;
* **method**: The HTTP method you want to use. If nothing is provided, GET will be used;
* **app\_name**: This name will be used to the email's subject and content;
* **report\_email**: The email to which the report will be sent;
* **body**: If the response should have any specific body, fill it here.

Place the call in the crontab of a server and that's it!

### Setting your configuration

There are 3 ways to inject your JSON configuration to the app:

1. Set an environment variable ` HEALTH_CHECK_CONFIG_FILE` with the path to the
file;

2. Set an environment variable `HEALTH_CHECK_CONFIG` with the whole 
configuration JSON;

3. Set an environment variable `HEALTH_CHECK_CONFIG_URL` with and URL to a plain
text configuration JSON, the app will request it via GET and parse it;

### Run

Simple as `$ npm start`.

## Support

Got doubts? E-mail me at [eduardo@quagliato.me](mailto:eduardo@quagliato.me). ;)

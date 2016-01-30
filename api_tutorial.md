# First steps with elastic.io API

This tutorial will show you how you can create, start and stop integration on elastic.io platform.
You only need a ``curl`` and [elastic.io account](http://www.elastic.io) for that. 

## Prepare an empty request bin

Create new request bin, we'll going to use it in our integration sample to push the data.

```
curl -X POST  http://requestb.in/api/v1/bins
```

you'll ge a response that would looks like this:

```json
{
  "private": false,
  "name": "xuhpomxu",
  "request_count": 0,
  "color": [
    210,
    60,
    170
  ]
}
```

Remember the ``name`` of your bin. You can also check it's empty now:

```
curl http://requestb.in/api/v1/bins/xuhpomxu
```

Make sure the ``request_count`` is 0.

## Check your API access

Now you need your e-mail and API key from elastic.io account, you can find it in your profile. 
API calls to elastic.io api should be authenticated using basic auth where your e-mail is a username and API key
is a password.

```
curl -u your-email:your-api-key https://api.elastic.io/v1/users
```
Should return you something like this:

```json
{
  "id": "123456789",
  "first_name": "Renat",
  "last_name": "Zubairov",
  "email": "foo@bar.com",
  "company": "elastic.io"
}
```

## Create new task

For our sample we'll create a simple task 'Timer' -> 'Webhook' that will simply push a data to the webhook every minute. 
First create a new file called ``task.json`` with following content:

```json
{
  "name": "Embedded Tutorial",
  "nodes": [
    {
      "action": "elasticio/timer:timer",
      "config": {
        "interval": "minute"
      }
    },
    {
      "action": "elasticio/webhook:post",
      "config": {
        "url": "http://requestb.in/xuhpomxu"
      }
    }
  ]
}
```

As you can see above it's a simple integraiton flow with two components. Don't forget to replace the URL inside the webhook configuration with the request bin URL you had created in the first step.

Now post the contents of this file to ``/v1/tasks`` like this:

```
curl -u your-email:your-api-key \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d @task.json \
  https://api.elastic.io/v1/tasks
```

And you'll see the result like this:

```
{"id":"123456789"}
```

We just created a new task. Now we can start it.

## Start integration flow

Now as we have a Task ID we can easily start it using [start task](http://api.elastic.io/docs/#start-a-task) API:

```
curl -u your-email:your-api-key \
  -X POST \
  https://api.elastic.io/v1/tasks/start/{TASK_ID}
```

As a response you'll see something like this:

```json
{
  "id": "123456789",
  "status": "active",
  "message": "Your task has been successfully activated."
}
```

## See your integration flow working



https://www.dropbox.com/s/3u8kqc58b8v24z9/Screenshot%202016-01-30%2012.50.48.png?dl=0

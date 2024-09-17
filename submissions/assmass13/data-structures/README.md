# Stack & LinkedList http-server implementation.
## Run server
`node server.js` creates server on `localhost:3000`
## Stack
1. Push: `POST /stack`\
 Accepts JSON: `{ "add": <int> or <str> }` 
1. Pop: `DELETE /stack`\
 Removes item from the top and return its value.
 
## LinkedList

1. Show list: `GET /linked-list`\
 Shows current LinkedList values.
1. Insert/Remove: `PATCH /linked-list`\
 Accepts JSON: `{ "add": <int> or <str>, "successor": <int> or <str>, "remove": <int> or <str> }`\
  Inserts `'add'` before each `'successor'` if provided, appends to list's head otherwise.\
  Removes `'remove'` values.
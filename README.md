Settlers of Catan, as implemented by the contributors which can be seen on the right.

All rights reserved, except of course, the game idea.


This project runs with `bun`. To use the project, clone it, then
```sh
bun install
cd server
bun run migrate-dev
cd ..
bun run dev
```

The three steps in the middle are to ensure that you have a valid database where persitent data is stored for the server.
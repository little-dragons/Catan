# Settlers of Catan

## Current state

The game is fully playable:

![A game in progress](meta/FullGame.png)

Graphically, a lot could be improved, but that is fine-tuning. The implementation works very well and is easily extensible. Currently, a scenario editor as well as bots are being worked on.

![An example of the scenario editor](meta/ScenarioEditorIdea.png)

The scenario editor needs a little bit more thought, but the concept of scenarios works wonderfully already (and is in fact used to generate the default board).

Bots are interesting to implement as their weights are very expressive and the developer can be very creative on which metrics to implement and how to weigh them.

Member registration is done, and even the SQL queries are statically typed using [Kysely](https://github.com/kysely-org/kysely).

![An example of logging in with a user account](meta/LoginModal.png).


## Running this project

This project runs with `bun`. To use the project, clone it, then
```sh
bun install
cd server
bun run migrate-dev
cd ..
bun run dev
```

The three steps in the middle are to ensure that you have a valid database where persitent data is stored for the server.

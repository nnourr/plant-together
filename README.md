# Plant Together: A simple, collaborative PlantUML Editor

For one of my courses, we needed to use PlantUML to create usecase and sequence diagrams. To facilitate easier collaboration, I created Plant Together, allowing any number of people to work on the same PlantUML diagram together! Check it out on [plant-together.nnourr.tech](https://plant-together.nnourr.tech/)

<div align="center">
  <a href="https://plant-together.nnourr.tech/" target="__blank">
<img src="https://github.com/user-attachments/assets/da3f8110-1472-4918-bdb8-4ff2a881cf8b" width="700">
  </a>
</div>

## Features
- Collaboratively create a PlantUML diagram in Rooms.
- See an updated PlantUML diagram preview in real time.
- Zoom and pan around the diagram preview.
- Export the PlantUML diagram as an SVG.
- Sync offline changes if disconnected from the internet.

## Running Plant Together with Docker Compose
To run the Plant Together application using Docker Compose, follow these steps:

### Prerequisites
- Docker installed on your machine
- Docker Compose installed on your machine

### Steps
#### Clone the Repository
Clone the Plant Together repository to your local machine:

```sh
git clone https://github.com/yourusername/plant-together.git
cd plant-together
```

### Configure Environment Variables in your .env file
Refer to [Environment Variables](#environment-variables)

#### Build and Run the Containers
Use Docker Compose to build and run the containers:

```sh
docker compose up --build
```

This command will build the Docker images and start the containers defined in the docker-compose.yaml file.

### Access the Application
- **React Application**: Open your browser and navigate to [http://localhost:4173](http://localhost:4173) (or the port you specified in the .env file).
- **Express Server**: The Express server will be running on [http://localhost:3000](http://localhost:3000) (or the port you specified in the .env file).
- **PgAdmin**: Access PgAdmin (Web DMBS) at [http://localhost:1007](http://localhost:1007) (or the port you specified in the .env file).

### Environment Variables
The following environment variables are required to be defined in a .env file in the root directory:

- `FIREBASE_API_KEY`: Firebase API Key
- `FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain
- `FIREBASE_PROJECT_ID`: Firebase Project ID

You can [optionally change](#create-a-env-file-optional) the following environment variables to customize the setup:

- `VITE_PORT`: Port for the React application (default: 4173)
- `VITE_SERVER_HTTP_URL`: React app's URL to the express server (default: http://plant-together-express)
- `VITE_SERVER_WS_URL`: React app's URL to the Y-Redis server (default: ws://plant-together-yredis)
- `PORT`: Port for the Express server (default: 3000)
- `DB_NAME`: Connection database name used by express and y-redis (default: postgres)
- `DB_HOST`: Connection database host used by express and y-redis (if POSTGRES not specified) (default: database-psql)
- `DB_PORT`: Connection database port used by express and y-redis (if POSTGRES not specified) (default: 5432)
- `DB_USER`: Connection database user used by express and y-redis (if POSTGRES not specified) (default: postgres)
- `DB_PASS`: Connection database password used by express and y-redis (if POSTGRES not specified) (default: 1234)
- `YREDIS_PORT`: Port for the YRedis server (default: 3003)
- `REDIS_PORT`: Port for the Redis instance (default: 6379)
- `PSQL_PORT`: Port for the PostgreSQL instance (default: 5432)
- `ADMIN_EMAIL`: Email for PgAdmin login (default: developer@plant-together.com)
- `ADMIN_PASS`: Password for PgAdmin login (default: 1234)
- `PGADMIN_PORT`: Port for PgAdmin (default: 1007)
- `LOG`: Log level for y-redis (default: *)
- `REDIS`: Redis instance URL (default: 1007)
- `POSTGRES`: Postgres connection string used by y-redis (default: postgres://${DB_USER:}:${DB_PASS}@${DB_HOST}/${DB_NAME})

#### Create a .env File [Optional]
Create a .env file in the root directory of the project to set environment variables. Here is an example of the .env file:

```env
# React Env Variables
VITE_PORT=4173
VITE_SERVER_HTTP_URL=http://plant-together-express
VITE_SERVER_WS_URL=ws://plant-together-yredis

# DB Env Variables
DB_NAME=postgres
DB_HOST=database-psql
DB_PORT=5432
DB_USER=postgres
DB_PASS=1234
PSQL_PORT=5432

# Express Env Variables
PORT=3000

# Y-Redis Env Variables
YREDIS_PORT=3003

# Redis Env Variables
REDIS_PORT=6379

# PGAdmin Env Variables
ADMIN_EMAIL=developer@plant-together.com
ADMIN_PASS=1234
PGADMIN_PORT=1007
```

### Stopping the Containers
To stop the running containers, use the following command:

```sh
docker-compose down
```

This will stop and remove the containers defined in the docker-compose.yaml file.

## Tech
### Websocket Framework: Yjs
Part of building a collaborative editor means handling multiple users editing the same data, and merging seemlessley. There are 2 main techniques to accomplish this: **Operational Transformation** and **Conflict-Free Replicated Data Types**. I won't go into the details, but you can read about them [here](https://medium.com/coinmonks/operational-transformations-as-an-algorithm-for-automatic-conflict-resolution-3bf8920ea447) and [here](https://medium.com/@amberovsky/crdt-conflict-free-replicated-data-types-b4bfc8459d26). [Yjs](https://yjs.dev/) is CRDT implementation, facilitating collaboration with _shared data types_, allowing text to be distributed and merged without conficts. 

Yjs was specifically chosen for it's extensive library support and its fallbacks, such as cross-tab communication, allowing sessions to persist cross browser is my central websocket server is down.  

### Text Editor: Monaco Code Editor
The [Monaco Editor](https://www.npmjs.com/package/@monaco-editor/react) is a fork of the VSCode editor made to work for the web. It was chosen for it's familiar interface, built-in shortcuts and native Yjs binding. 

### PlantUML: plantuml-core
PlantUML was written in Java, meaning it cannot normally run in the browser. This would force me to create a server for rendering PlantUML digrams, handle all that complex, multi-client traffic, and reduce the responsiveness of my application. I wanted to avoid this, and luckily I found [plantuml-core](https://github.com/plantuml/plantuml-core), a pure Javascript implementation of PlantUML. It achieves this using [Cheerpj](https://cheerpj.com/), which complies Java bytecode into WebAssembly and Javascript, meaning PlantUML can run natively on the browser!

Specifically, my implementation is heavily based off [plantuml.js](https://github.com/plantuml/plantuml.js) by the talented [@sakirtemel](https://github.com/sakirtemel), with some modification to work with react and support SVGs over PNG output.

### Websocket Server: Y-Websocket and Compute Engine
Starting a websocket server that's compatible with Yjs is as simple as running `npx y-websocket`. Well, it wasn't actually that simple. First, I had to get the server running on the cloud, so I ran the command on a Compute Engine instance on Google Cloud and connected it to my subdomain. So far, so good! Until I found out I needed a Websocket Secure (WSS) connection if I wanted to connect from a HTTPS website...

**Step 1**: Obtain a TLS certificate:
In order to upgrade to a WSS connection, I need to obtain a signed, browser-trusted certificate. This was pretty easy, I ran [certbot](https://certbot.eff.org/) and followed all the steps to obtain a certificate from the [Lets Encrypt Certificate Authority](https://letsencrypt.org/).

**Step 2**: Run my Y-Websocket server with a TLS certificate
To configure your server to run with your brand new shiny TLS certificate, you would usually set up [NGINX](https://nginx.org/). Unfortunately, I didn't know how to do that. Fortunatley, there's a [fork of y-websocket](https://github.com/rozek/y-websocket) by the incredible [Andreas Rozek](https://github.com/rozek) that nativley supported TLS certificates! After fiddling a little with linux file permissions, I was able to get a WSS connection! 

### Web Framework: React
I chose React because I'm quite familiar with it now 🤷‍♂️

<div align="center">
  <a href="https://plant-together.nnourr.tech/" target="__blank">
<img width="700" src="https://github.com/user-attachments/assets/b69e2123-487d-4cd8-855f-f7d2a859d249">
  </a>
</div>

## Limitations
This was just a quick weekend project, so there are some limitations I want to address:
- ~~Cross Browser Editing Bug: If one peer is connected with a Windows device, but another peer is connected with MacOS/iOS/Android, the edits will not be merged gracefully (e.g 3 characters behind where it's supposed to be).~~
  - ~~This is not the case with Windows->Windows or MacOS->Android.~~
  - ~~It seems to be related to [this issue with y-webrtc](https://github.com/yjs/y-monaco/issues/6).~~
  - Fixed as of 9/19/2024 🎉
- ~~Room persistence: Right now rooms are persisted in memory, meaning it's difficult to control how long they retain data after all users have been disconnected.~~
  - Thanks to [Kevin Jahns](https://github.com/dmonad) for creating y-redis, a persisted extension of y-websocket, we're able to store the rooms in a persisted database! 
- Room access: Anyone can access any room if they know the room name, or even enter the same room name coincidentally. A system to seperate room codes and room names, or even a password protected implementation would help avoid this.
- User Cursors: When someone else is editing the same PlantUml text, it looks like text is magically manifesting on screen. It would be pretty helpful to see which user is editing what and where.

# Thank You! 👋


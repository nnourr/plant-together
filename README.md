# Plant Together: A simple, collaborative PlantUML Editor
## ⚠️ Plant Together is undergoing a large infastructure change. Collaboration features are currently limited to within browser.
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
- Room persistence: Right now rooms are persisted in memory, meaning it's difficult to control how long they retain data after all users have been disconnected.
- Room access: Anyone can access any room if they know the room name, or even enter the same room name coincidentally. A system to seperate room codes and room names, or even a password protected implementation would help avoid this.
- User Cursors: When someone else is editing the same PlantUml text, it looks like text is magically manifesting on screen. It would be pretty helpful to see which user is editing what and where.

# Thank You! 👋
  

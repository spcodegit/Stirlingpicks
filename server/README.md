# How it Works
- Clone the repository https://github.com/47hamza/nodejs-server-template.git
- Run command `npm init` to initialize the project and create <b>package.json</b> file.
- Run command `npm install -g nodemon yarn` to install <b>nodemon</b> and <b>yarn</b> globally.
- Run command `yarn add bcryptjs body-parser cors dotenv express express-fileupload http-status-codes jsonwebtoken mongoose nodemailer nodemailer-smtp-transport nanoid` to install basic packages.
- Create `.env` file from `.env.example` file and add your environment variables.
- Run command `yarn seed` to seed the database.
- Run command `yarn dev` to start the development server or `yarn start` to start the production server.

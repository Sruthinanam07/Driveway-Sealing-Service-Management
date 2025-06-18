# Getting Started with the project first we have done with the backend code.

## In which At C:\xampp\htdocs, run git clone https://github.com/shiyonglu/database_javascript.git to copy the whole sample code to the current directory.

### You can configure parameters directly in dbServices.js and app.js. Here, we achieve this by configuring parameters using the .env file. Configure the MySql database according to C:\xampp\htdocs\database_javascript\project1\Backend\dotenv, that is, to create a database called web_app and a user project1 with password Test123 via the Admin interface http://localhost/phpmyadmin/. The user Project1 will be granted with all priviledges for the web_app database. To get started, you might also change the dotenv file as follows to only use the Project1 user:
PORT=5050
DB_USER=project2
PASSWORD=Test123
DATABASE=customer
DB_PORT=3306
HOST=localhost

### You need to rename dotenv to .env by command move dotenv .env.

### Under the database web_app, create an empty table as follows:

### Go the Backend directory C:\xampp\htdocs\database_javascript\project2\Backend.

### `npm init -y` 

### `npm install express mysql cors nodemon dotenv` 

### Modify the scripts section of the Backend/package.json as follows:
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon app.js"
  },

### Modify the app.js and dbService.js accordingly write code for app.js link it to the dbService.js(write required queries such that able to fetch).

### Start the Backend by running npm start.

###Open your localhost 5050 which is `http://localhost:5050\...(route call)`

#For frontend Getting Started with Create React App
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

##npm install react-router-dom

###create components in src store all the required pages to deploy the frontend.

###complete and call the routes through App.js and import all the pages that are created in components in app.js

###Now after completion open terminal and add required path and now run npm start in frontend.

###It will run in http://localhost/3000

###Deployment:
Now open XAMPP FOLDER in which start apache and mysql such that open admin in mysql redirect you to phpmyadmin.
Now open two terminals run npm start in both frontend and backend.
route accordingly.

###Run:
npm start.
Happy Coding :)

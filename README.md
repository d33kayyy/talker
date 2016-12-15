
# Installation #

Install npm (Node package manager)


    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs


Install create-react-app


    sudo npm install -g create-react-app


Create react app


    create-react-app [app_name]


Install Firebase: go to project directory


    npm install firebase --save



If you see this:

    npm ERR! UpScore@0.6.0 start: `react-scripts start`
    npm ERR! spawn ENOENT

It just means something went wrong when dependencies were installed the first time.

I suggest doing these three steps:

    - to update npm because it is sometimes buggy.

        npm install -g npm@latest

    - to remove the existing modules.

        rm -rf node_modules

    - to re-install the project dependencies.

        npm install

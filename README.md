# umerx-blackdog-configurator-backend

## Local Development

-   Copy `.devcontainer/.env.example` to `.devcontainer/.env` and fill in the values
    -   `BLACKDOG_CONFIGURATOR_BACKEND_HOST_PORT`
        -   This is the port that the backend will be running on on your local machine
        -   Recommended to leave this as the default value
-   Start the dev container using VSCode
    -   Open the command palette (`Ctrl+Shift+P`)
    -   Type `Remote-Containers: Reopen in Container` and select it
    -   Wait for the dev container to start
-   Open a terminal in the dev container
-   Run `npm run dev:start`

## Postman

-   Postman collection at: [https://umerx-postman.postman.co/workspace/Umerx~fe041bb1-59f0-4274-8d72-900367822f6b/collection/26570872-8386c9a7-a5d4-4168-88e3-1273b04f7de8](https://umerx-postman.postman.co/workspace/Umerx~fe041bb1-59f0-4274-8d72-900367822f6b/collection/26570872-8386c9a7-a5d4-4168-88e3-1273b04f7de8)

## To Do

-   [x] Make it so creating a new sell order decrements the quantity of the position in the database
-   [x] Make it so cancelling a sell order increments the quantity of the position in the database
    -   [x] Add a "/cancel" route
-   [x] Remove other routes like patch, put, delete, etc. that are not needed.
-   [ ] Add Types for /cancel params and route

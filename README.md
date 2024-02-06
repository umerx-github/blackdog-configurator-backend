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

-   Make it so a position can be created/added to quantity in a single route - even if it doesn't exist in the database yet
    -   So there are not timing issues
    -   The route cannot contain the position Id
    -   It would have to contain the position's symbol and the quantity
    -   The HTTP method would have to be POST

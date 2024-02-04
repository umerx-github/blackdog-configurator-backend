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

## To Do

-   Strategy
    -   Make it impossible to change a strategy's template

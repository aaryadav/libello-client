#!/bin/bash

# Start the Jupyter server and get its PID
jupyter server &
JUPYTER_PID=$!

# Define a function to kill the Jupyter server
kill_jupyter() {
 echo "Killing Jupyter server..."
 kill -9 $JUPYTER_PID
}

# Use trap to call the kill_jupyter function when the script receives SIGINT
trap kill_jupyter SIGINT

# Wait for the server to start and get the URL and token
sleep 2
URL_TOKEN=$(jupyter server list | grep http)

# Extract the URL and token
URL=$(echo $URL_TOKEN | awk '{print $1}')
TOKEN=$(echo $URL_TOKEN | awk -F'token=' '{print $2}' | awk -F' ' '{print $1}')

# Overwrite the URL and token in .env file
echo "NEXT_PUBLIC_JUPYTER_URL=$URL" > .env
echo "NEXT_PUBLIC_JUPYTER_TOKEN=$TOKEN" >> .env

npm run dev &

xdg-open http://localhost:3000

# Wait for the Jupyter server to finish
wait $JUPYTER_PID
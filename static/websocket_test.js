// const socket = io();

async function initialize() {
    try {
        // Send request for game state
        // playerClear();
        socket.send("request-game-state", "get-game-state");

        // Define a promise to handle the game state response
        const gameStatePromise = new Promise((resolve, reject) => {
            // Set up an event listener for the 'new-gamestate' event
            socket.on('new-gamestate', function(data) {
                console.log("Received game state from server:", data);
                // Resolve the promise with the received game state data
                addPlayerstoDOM(data);
                resolve(data);
                console.log("adding listener");
                addUserListener();
                console.log("finished adding listener");
                
            });
        });
        
        // Wait for the game state promise to resolve
        const gameStateData = await gameStatePromise;
        console.log("Game state data received:", gameStateData);
        


        // Proceed with the rest of the initialization
        // ...
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// Call the initialize function to start the initialization process
initialize();

// handleInit();
// socket.on('init', handleInit);

socket.on('new-gamestate', function(data){ // NEW GAMESTATE
    console.log("Data From Server: ", data);
    playerClear();
    addPlayerstoDOM(data);
    
    console.log("adding listener");
    addUserListener();
    console.log("finished adding listener");

});

function addPlayerstoDOM(gameStateData){
    for (let key in gameStateData) {
        // console.log(key, userData[key]);
        // if (key != username){
            addPlayer(key, gameStateData[key]);
        // }
    }
}

function playerHTML(player, playerDict){
    let playerHTML = '<div id="' + player +'" style="left: '+ playerDict["location"][1] +'px; top: '+ playerDict["location"][0] +'px;">' + player + '</div>';
    return playerHTML;
}

function playerClear(){
    const playerArea = document.getElementsByClassName("player-area");
    // console.log("PlayerArea",playerArea);
    // console.log("Inner Player", playerArea.innerHTML);
    Array.from(playerArea).forEach(pA => {
            pA.innerHTML = "";
        });
}

function addPlayer(player, playerDict){
    const playerArea = document.getElementsByClassName("player-area");
    // console.log("PlayerArea",playerArea);
    // console.log("Inner Player", playerArea.innerHTML);
    Array.from(playerArea).forEach(pA => {
        // console.log("NEWPLAYERAREA",pA.innerHTML);
        const existingPlayer = pA.querySelector("#" + player); // Check if a player with the same id already exists
        console.log("ExistingPlayer",existingPlayer);
        if (existingPlayer) {
            // Player already exists, update specific values
            existingPlayer.style.left = playerDict["location"][1];
            existingPlayer.style.top = playerDict["location"][0];
            
        } else {
            // Player doesn't exist, add new player HTML
            pA.innerHTML += playerHTML(player, playerDict);
        }
    })
}

function addUserListener(){
    const player = document.getElementById(username);
    if (player != null){
        document.addEventListener('keydown', function(e) {
            const gameArea = document.querySelector('.game-area');
            console.log("PLAYER",player)
            const playerRect = player.getBoundingClientRect();
            let playerCenterX = playerRect.left + playerRect.width / 2;
            let playerCenterY = playerRect.top + playerRect.height / 2;
            
            const playerRadius = Math.min(playerRect.width, playerRect.height) / 2;
            
            const baseSpeed = 200; // Base speed
            const speedMultiplier = 1 / playerRadius; // Speed multiplier
            
            const keyW = 'w';
            const keyA = 'a';
            const keyS = 's';
            const keyD = 'd';
            
            let dx = 0;
            let dy = 0;
            
            if (e.key === keyW) {
                dy = -1; // Move up
            } else if (e.key === keyA) {
                dx = -1; // Move left
            } else if (e.key === keyS) {
                dy = 1; // Move down
            } else if (e.key === keyD) {
                dx = 1; // Move right
            }
            
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            
            const normalizedDx = dx / magnitude;
            const normalizedDy = dy / magnitude;
            
            const speed = baseSpeed * speedMultiplier;
            
            // Calculate the potential new position
            const newPlayerCenterX = playerCenterX + normalizedDx * speed;
            const newPlayerCenterY = playerCenterY + normalizedDy * speed;
            
            // Check if the potential new position is within the boundaries
            const minX = 0;
            const minY = 0;
            const maxX = gameArea.offsetWidth - playerRect.width;
            const maxY = gameArea.offsetHeight - playerRect.height;
            
            if (newPlayerCenterX >= minX && newPlayerCenterX <= maxX &&
                newPlayerCenterY >= minY && newPlayerCenterY <= maxY) {
                playerCenterX = newPlayerCenterX;
                playerCenterY = newPlayerCenterY;
            }
            
            player.style.left = playerCenterX - playerRect.width / 2 + 'px';
            player.style.top = playerCenterY - playerRect.height / 2 + 'px';
            socket.send("update-game-state",JSON.stringify({"username": {"username":username, "location":[parseInt(player.style.top),parseInt(player.style.left)], "width":10}}))
        });
    }
        
}
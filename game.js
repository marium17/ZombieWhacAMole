let currWitchTile;
let currZombieTile;
let score = 0;
let gameOver = false;

let witchInterval = 1000; // Initial witch appearance time (1 second)
let zombieInterval = 2000; // Initial zombie appearance time (2 seconds)

let witchIntervalID; // ID to clear and reset witch interval
let zombieIntervalID; // ID to clear and reset zombie interval

let level = 1; // Track the current level

let audioPlayed = false; // Flag to check if the audio has been played


window.onload = function() {
    setupTitleScreen();
    setGame();
    // Add an event listener for the first user interaction
    window.addEventListener("click", function() {
        if (!audioPlayed) {
            playBackgroundMusic();
            audioPlayed = true; // Ensure the music plays only once
        }
    });
};

function setupTitleScreen() {
    const startGameBtn = document.getElementById("startGameBtn");
    startGameBtn.addEventListener("click", startGame);
}

function startGame() {
    // Hide the title screen
    document.getElementById("titleScreen").style.display = "none";
    
    // Show the scoreboard and game board
    document.getElementById("scoreboard").style.display = "block";
    document.getElementById("board").style.display = "flex"; // Change display to flex to show the board
    
    setGame(); // Start the game logic
}

function playBackgroundMusic() {
    const backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.volume = 0.5; // Adjust volume as needed
    backgroundMusic.play().catch(function(error) {
        console.error("Error playing background music:", error);
    });
}

function setGame() {
    const board = document.getElementById("board");
    // Clear previous tiles to avoid duplicates on restart
    board.innerHTML = ""; 

    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.className = "tile"; // Add a class for CSS styling
        tile.addEventListener("click", selectTile);
        board.appendChild(tile);
    }
    startIntervals();
}

function startIntervals() {
    witchIntervalID = setInterval(setWitch, witchInterval);
    zombieIntervalID = setInterval(setZombie, zombieInterval);
}

function getRandomTile() {
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function setWitch() {
    if (gameOver) {
        return;
    }
    if (currWitchTile) {
        currWitchTile.innerHTML = "";
    }
    let witch = document.createElement("img");
    witch.src = "./witch.png"; // Ensure this path is correct

    let num = getRandomTile();
    if (currZombieTile && currZombieTile.id == num) {
        return;
    }
    currWitchTile = document.getElementById(num);
    currWitchTile.appendChild(witch);
}

function setZombie() {
    if (gameOver) {
        return;
    }
    if (currZombieTile) {
        currZombieTile.innerHTML = "";
    }
    let zombie = document.createElement("img");
    zombie.src = "./zombie.png"; // Ensure this path is correct

    let num = getRandomTile();
    if (currWitchTile && currWitchTile.id == num) {
        return;
    }
    currZombieTile = document.getElementById(num);
    currZombieTile.appendChild(zombie);
}

let crosshair = document.getElementById("crosshair");

function setupCrosshair() {
    let board = document.getElementById("board"); // Get the board element
    let boardRect = board.getBoundingClientRect(); // Get board dimensions and position

    document.addEventListener("mousemove", function(e) {
        let mouseX = e.pageX;
        let mouseY = e.pageY;

        let crosshairX = mouseX - (crosshair.offsetWidth / 2);
        let crosshairY = mouseY - (crosshair.offsetHeight / 2);

        if (crosshairX < boardRect.left) {
            crosshairX = boardRect.left;
        } else if (crosshairX + crosshair.offsetWidth > boardRect.right) {
            crosshairX = boardRect.right - crosshair.offsetWidth;
        }

        if (crosshairY < boardRect.top) {
            crosshairY = boardRect.top;
        } else if (crosshairY + crosshair.offsetHeight > boardRect.bottom) {
            crosshairY = boardRect.bottom - crosshair.offsetHeight;
        }

        crosshair.style.left = crosshairX + "px";
        crosshair.style.top = crosshairY + "px";
        crosshair.style.display = "block"; // Show the crosshair when the mouse moves
    });

    board.addEventListener("mouseleave", function() {
        crosshair.style.display = "none"; // Hide crosshair when mouse is outside
    });
}

function selectTile() {
    if (gameOver) {
        return;
    }

    if (this == currWitchTile) {
        score += 10;
        document.getElementById("score").innerText = "Score: " + score.toString();
        
        // Play shooting sound
        document.getElementById("shootSound").play();
        
        // Position the crosshair at the mole and briefly show it
        showCrosshairAt(this);

        // Add shooting animation to the mole
        currWitchTile.firstChild.classList.add("shoot");

        // Remove witch after animation ends
        setTimeout(() => {
            currWitchTile.innerHTML = "";
        }, 400); // Match CSS animation time

        increaseDifficulty();
    } else if (this == currZombieTile) {
        document.getElementById("score").innerText = "GAME OVER: " + score.toString();
        gameOver = true;

        // Play shooting sound and game over sound
        document.getElementById("shootSound").play();
        document.getElementById("gameOverSound").play(); // Play game over sound

        showCrosshairAt(this);
        currZombieTile.firstChild.classList.add("shoot");

        setTimeout(() => {
            currZombieTile.innerHTML = "";
        }, 400); // Match CSS animation time

        makeZombieFall();

        // Update the final score in the popup
        document.getElementById("finalScore").innerText = "Final Score: " + score.toString();

        setTimeout(() => {
            document.getElementById("gameOverPopup").style.display = "block";
        }, 800); // Adjust this time as needed for the animation duration

        clearIntervals(); // Stop intervals on game over
    }
}


function closePopup() {
    document.getElementById("gameOverPopup").style.display = "none";
}

function restartGame() {
    score = 0;
    gameOver = false;
    document.getElementById("score").innerText = "Score: 0";
    setGame(); // Reset the game state
    document.getElementById("gameOverPopup").style.display = "none"; // Hide the popup
    audioPlayed = false; // Allow background music to play again
    setupCrosshair(); // Re-setup crosshair if needed
}

function makeZombieFall() {
    if (currZombieTile) {
        const zombieImg = currZombieTile.firstChild; // Get the plant image
        if (zombieImg) {
            zombieImg.classList.add("falling"); // Add falling animation
            setTimeout(() => {
                currZombieTile.innerHTML = ""; // Remove zombie after falling
            }, 1000); // Match animation duration
        }
    }
}

function showCrosshairAt(tile) {
    let rect = tile.getBoundingClientRect();
    crosshair.style.left = rect.left + (rect.width / 2) - (crosshair.offsetWidth / 2) + "px";
    crosshair.style.top = rect.top + (rect.height / 2) - (crosshair.offsetHeight / 2) + "px";
    
    crosshair.style.display = "block";
    setTimeout(() => {
        crosshair.style.display = "none"; // Hide the crosshair after 0.4 seconds
    }, 400);
}

function increaseDifficulty() {
    if (score === 50) {
        level++;
        witchInterval = 800; // Reduce witch appearance time (faster mole)
        zombieInterval = 1800; // Reduce zombie appearance time (faster plant)
        updateLevelDisplay();
        resetIntervals();
    } else if (score === 100) {
        level++;
        witchInterval = 600;
        zombieInterval = 1500;
        updateLevelDisplay();
        resetIntervals();
    } else if (score === 150) {
        level++;
        witchInterval = 400;
        zombieInterval = 1200;
        updateLevelDisplay();
        resetIntervals();
    }
}

function updateLevelDisplay() {
    document.getElementById("level").innerText = "Level: " + level.toString();
}

function resetIntervals() {
    clearIntervals();
    startIntervals();
}

function clearIntervals() {
    clearInterval(witchIntervalID);
    clearInterval(zombieIntervalID);
}

// Set up crosshair movement when the window loads
setupCrosshair();


document.getElementById("playAgainBtn").addEventListener("click", function() {
    // Reset the game state
    score = 0;
    level = 1; // Reset level to 1
    gameOver = false;

    document.getElementById("score").innerText = "Score: " + score.toString();
    document.getElementById("level").innerText = "Level: " + level.toString(); // Reset level display

    // Reset witch and zombie appearance intervals
    witchInterval = 1000; // Reset to initial witch appearance time
    zombieInterval = 2000; // Reset to initial zombie appearance time

    document.getElementById("gameOverPopup").style.display = "none"; // Hide the popup

    // Clear the board (optional)
    document.getElementById("board").innerHTML = ""; // Clear any remaining tiles

    setGame(); // Reinitialize the game
});
var board = [];
var rows = 8;
var columns = 8;
const click = new Audio("https://www.fesliyanstudios.com/play-mp3/387");

const bomb = new Audio("./explosion.wav");
bomb.volume = 0.5;
var minesCount = 10;
var minesLocation = []; // "2-2", "3-4", "2-1"
let timer;
var tilesClicked = 0; //goal to click all tiles except the ones containing mines
var flagEnabled = false;
var gameStarted = false;


var gameOver = false;
var gameWon = false;
var timeInSeconds = 0;
var resetButton = document.querySelector('#reset-game-button');
resetButton.style.display = "none";
resetButton.addEventListener("click", function() {
    location.reload();
});

var startGameButton = document.querySelector('#start-game-button');
startGameButton.addEventListener("click", startGame);

function formatTime(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = timeInSeconds % 60;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return {minutes: minutes, seconds: seconds};
}


function setMines() {
    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}


function startGame() {
    timeInSeconds = 0;
    gameStarted = true;
    gameWon = false;
    gameOver = false;
    document.getElementById("start-game-button").style.display = "none";
    document.getElementById("mines-count").innerText = minesCount;
    document.getElementById("flag-button").addEventListener("click", setFlag);
    resetButton.style.display = "block";
    setMines();

    //populate our board
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    // start the timer
    timer = setInterval(function() {
        timeInSeconds += 1;
        let time = formatTime(timeInSeconds);
        document.getElementById("timer-minutes").innerText = time.minutes;
        document.getElementById("timer-seconds").innerText = time.seconds;
    }, 1000);

    console.log(board);
}

async function postToServer() {
    const data = {
        time: timeInSeconds,
        gameWon: gameWon
    }
    const status = document.getElementById("status");  
    $('#gameModal').modal('show');
    if (gameWon) {
        status.innerText =`You won! 🥳 in ${timeInSeconds}`;
    }
    else {
        status.innerText = "You lost! 😢";
    }
    console.log("Sending data to server",gameWon,timeInSeconds)
    const res = await axios.post('http://localhost:3000/user/gameOver', data).catch(function(error) {
        console.log(error);
    });
    console.log("Response from server:");
}


function setFlag() {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
    }
    else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgray";
    }
}

async function clickTile() {
    click.play();
    if (gameOver || this.classList.contains("tile-clicked")) {
    return;
    }

    let tile = this;
    if (flagEnabled) {
        if (tile.innerText == "") {
            tile.innerText = "🚩";
        }
        else if (tile.innerText == "🚩") {
            tile.innerText = "";
        }
        return;
    }

    if (minesLocation.includes(tile.id)) {
        await bomb.play().catch(function(error) {
            console.log('Playback failed because of ' + error);
        });
        gameOver = true;
        revealMines();
        clearInterval(timer);
        document.getElementById("mines-count").innerText = "Game Over";
        postToServer();
        return;
    }

    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

}

function revealMines() {
    for (let r= 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";                
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    //top 3
    minesFound += checkTile(r-1, c-1);      //top left
    minesFound += checkTile(r-1, c);        //top 
    minesFound += checkTile(r-1, c+1);      //top right

    //left and right
    minesFound += checkTile(r, c-1);        //left
    minesFound += checkTile(r, c+1);        //right

    //bottom 3
    minesFound += checkTile(r+1, c-1);      //bottom left
    minesFound += checkTile(r+1, c);        //bottom 
    minesFound += checkTile(r+1, c+1);      //bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        //top 3
        checkMine(r-1, c-1);    //top left
        checkMine(r-1, c);      //top
        checkMine(r-1, c+1);    //top right

        //left and right
        checkMine(r, c-1);      //left
        checkMine(r, c+1);      //right

        //bottom 3
        checkMine(r+1, c-1);    //bottom left
        checkMine(r+1, c);      //bottom
        checkMine(r+1, c+1);    //bottom right
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = `You won in ${timeInSeconds} seconds!`
        clearInterval(timer);
        gameWon = true;
        console.log(gameWon);
        gameOver = true;
        postToServer();
    }

}


function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}
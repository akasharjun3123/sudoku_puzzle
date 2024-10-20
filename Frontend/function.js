var numOfWrongInputs = 0                                            // COUNTER
const sudokuGrid = document.querySelector(".sudoku-grid");          // SUDOKU GRID
const dbutns = document.querySelectorAll(".btn");                   // DIFFICULTY BUTTONS
const numPad = document.querySelectorAll(".num-pad")                // NUMPAD
const counter = document.querySelector(".mistakes-counter-change"); // MISTAKES COUNTER
const eraseButton = document.querySelector(".erase-cell");          // ERASE BUTTON
const clearButton = document.querySelector(".clear-cell");          // CLEAR BUTTON
const reset = document.querySelector(".reset-cell");                // RESET PUZZLE
const set = document.querySelector(".set-cell");                    // RESET PUZZLE
const solve = document.querySelector(".solve-cell");                // BACKTRACK SOLVING 
const newGame = document.querySelector(".third-sub-grid");          // NEW GAME BUTTON
const uploadImage = document.getElementById('uploadForm')           // IMAGE SUBMIT BUTTON

for(let row=0;row<9;row++){
    for(let col=0;col<9;col++){
        const cell = document.createElement("div");
        cell.setAttribute("id",`C${row}${col}`);
        cell.classList.add("sudoku-cell");
        cell.setAttribute('tabindex', (row*9)+col)
        sudokuGrid.appendChild(cell);
    }
}

const sudokuCells = document.querySelectorAll(".sudoku-cell")

getDifficultyLevel(dbutns)
// Function to close the dialog
function closeDialog() {
document.getElementById('sudoku-complete-dialog').style.display = 'none';
}
  
  
  

//Primary Event Handling:
function mainFunction(unsolvedSudoku, originalUnsolvedSudoku, solvedSudoku){

    fillUnsolvedPuzzleData(unsolvedSudoku)
    highlighitingCells(0,0)
    sudokuCells.forEach(currCell=>{  
        currCell.addEventListener("focus", function(event){
            let rowNum = getRowColNumber(currCell.id).row
            let colNum = getRowColNumber(currCell.id).col
            highlighitingCells(rowNum, colNum)
            sameNumberHighlighting(this.textContent)
              
        })
        

        currCell.addEventListener("keydown", function(event){
            if(event.key = "Backspace") manageBackSpace()
            const pressedKeyVal = parseInt(event.key)
            let rowNum = getRowColNumber(currCell.id).row
            let colNum = getRowColNumber(currCell.id).col
            fillPressedKey(unsolvedSudoku,solvedSudoku, currCell, pressedKeyVal, rowNum, colNum)
        })
    })

    numPad.forEach(key =>{
        key.addEventListener("click", function(){
            const currCell = document.querySelector(".focused-sudoku-cell")
            let rowNum = getRowColNumber(currCell.id).row
            let colNum = getRowColNumber(currCell.id).col
            fillPressedKey(unsolvedSudoku, solvedSudoku, currCell, key.textContent, rowNum, colNum)
        })

    })

    eraseButton.addEventListener("click", manageBackSpace)
    clearButton.addEventListener("click",removeHighlighting)
    solve.addEventListener("click", () => manageBacktrack(unsolvedSudoku, solvedSudoku))
    newGame.addEventListener("click", () => {
        sudokuGrid.classList.add('hide');
        setTimeout(() => location.reload(), 500); // Reload after the fade-out animation
    });
    
    reset.addEventListener("click", ()=> resetPuzzle(originalUnsolvedSudoku, unsolvedSudoku))
    
   
}


// JSON Extraction and Its Functions:

function getDifficultyLevel(dbutns){
    dbutns.forEach(button =>{
        button.addEventListener('click', function(){
            const getLevel = button.textContent;
            document.querySelector(".game-mode").classList.add("throw-model");
            document.getElementById(getLevel).classList.add("active-lev");
            getPuzzleDataMongo(getLevel)
        })
    })
}

async function getPuzzleDataMongo(getLevel) {
    const apiUrl = `https://sudoku-puzzle-quest-server.onrender.com/getpuzzles/${getLevel}`;
    const loadingAlert = document.getElementById("loading-alert");

    // Show the loading alert
    loadingAlert.style.display = "block";

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log("Connected to MongoDB Successfully");
            return response.json();
        })
        .then(data => {
            sudokuId = data._id;
            unsolvedSudoku = data["unsolved"];
            solvedSudoku = data["solved"];
            const copyArray = unsolvedSudoku.map(row => [...row]);
            console.log("This current puzzle data is of " + getLevel + " Level with ID of " + sudokuId);
            console.log("Unsolved Sudoku: ", unsolvedSudoku);
            console.log("Solved Sudoku: ", solvedSudoku);
            mainFunction(copyArray, unsolvedSudoku, solvedSudoku);
        })
        .catch(error => {
            console.error('Error fetching puzzle data:', error);
        })
        .finally(() => {
            // Hide the loading alert when data is fetched or in case of error
            loadingAlert.style.display = "none";
        });
}



// Solver and Backtracking Functions:

function manageBacktrack(unsolvedSudoku){
    const copiedArray = unsolvedSudoku.map(row => [...row]);
    let s = 0;
    let countObj = { 
        count: 0,
        backTrackCount :0
     };

    sudokuSolver(sudokuCells, copiedArray, s, 0, 0, countObj).then(() => {
        console.log("Number of times function being called: " + countObj.count);  
    });
    const duration = 15 * 1000,
    animationEnd = Date.now() + duration;

    let skew = 1;

    function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
    }

    (function frame() {
    const timeLeft = animationEnd - Date.now(),
        ticks = Math.max(400, 500 * (timeLeft / duration));

    skew = Math.max(0.8, skew - 0.001);

    confetti({
        particleCount: 2,
        startVelocity: 0,
        ticks: ticks,
        origin: {
        x: Math.random(),
        // since particles fall down, skew start toward the top
        y: Math.random() * skew - 0.2,
        },
        colors: ["#ffffff"],
        shapes: ["circle"],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(0.4, 1),
        drift: randomInRange(-0.4, 0.4),
    });

    if (timeLeft > 0) {
        requestAnimationFrame(frame);
    }
    })();

    
    const emptyCells = document.querySelectorAll(".empty-cell");
        emptyCells.forEach(cell=>{
            cell.classList.add("fixed-cell-color")
            cell.classList.remove("empty-cell")
        })
}

function triggerConfetti() {
    const defaults = {
        spread: 400,
        ticks: 100,
        gravity: 0,
        decay: 0.97,
        startVelocity: 20,
        shapes: ["heart"],
        colors: ["FFC0CB", "FF69B4", "FF1493", "C71585"],
    };
    confetti({ ...defaults, particleCount: 70, scalar: 2 });
    confetti({ ...defaults, particleCount: 50, scalar: 3 });
    confetti({ ...defaults, particleCount: 60, scalar: 4 });
    
    // Continuous confetti animation
    const duration = 15 * 1000;
    let animationEnd = Date.now() + duration;

    const continuousDefaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0
    };

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        const particleCount = 40 * (timeLeft / duration);
        confetti(Object.assign({}, continuousDefaults, { particleCount, origin: { x: Math.random() - 0.2, y: Math.random() - 0.2 } }));
    }, 250);
}

function showCompletionDialog() {
    // const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    // document.getElementById('congrats-message').innerText = randomMessage;
    document.getElementById('sudoku-complete-dialog').style.display = 'flex';
}



  function sudokuSolver(sudokuCells, unsolvedSudoku, s, row, col, countObj) {
    return new Promise(async (resolve, reject) => {
        if (col == 9) {
            row++;
            col = 0;
        }
        if (row == 9) {
            resolve(true);
            return;
        }
        const cell = document.getElementById(`C${row}${col}`);
        if (unsolvedSudoku[row][col] == 0) {
            for (let i = 1; i <= 9; i++) {
                if (isSafe(unsolvedSudoku, row, col, i)) {
                    unsolvedSudoku[row][col] = i;
                    cell.textContent = unsolvedSudoku[row][col];
                    cell.classList.add("solving-cell");
                    
                    if (s != 0) {
                        await delay(500); // Half-second delay to show the solving process visually
                        sameNumberHighlighting(i);
                    }

                    countObj.count += 1;
                    if (await sudokuSolver(sudokuCells, unsolvedSudoku, s, row, col + 1, countObj)) {
                        resolve(true);
                        return;
                    }
                    cell.textContent = "";
                    unsolvedSudoku[row][col] = 0;
                    cell.classList.remove("solving-cell");
                }
            }
        } else {
            if (await sudokuSolver(sudokuCells, unsolvedSudoku, s, row, col + 1, countObj)) {
                resolve(true);
                return;
            }
        }
        resolve(false);
    });
}



function isSafe(board, row, col, set){
    for(let i=0;i<9;i++) if(board[row][i] == set || board[i][col] == set) return false;
        let newRow = Math.floor(row/3)*3, newCol = Math.floor(col/3)*3;
        for(let i=newRow;i<newRow+3;i++)for(let j=newCol;j<newCol+3;j++) if(board[i][j] == set) return false;
        return true;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Primary Utility and Pre Processing Functions:



function fillUnsolvedPuzzleData(unsolvedSudoku){
    for(let row=0;row<9;row++){
        for(let col=0;col<9;col++){
            const cell = document.getElementById(`C${row}${col}`);
            if(unsolvedSudoku[row][col] != 0){
                cell.classList.add("fixed-cell");
                cell.textContent = unsolvedSudoku[row][col];} 
            else {
                cell.classList.add("empty-cell");
                cell.textContent = ""; }
            cell.tabIndex = 0;
        }
    }
}

function showMistakeDialog(message) {
    document.getElementById('mistake-message').innerText = message;
    document.getElementById('mistake-dialog').style.display = 'flex'; // Show the dialog
}

function closeMistakeDialog() {
    document.getElementById('mistake-dialog').style.display = 'none'; // Close the dialog
}

function fillPressedKey(unsolvedSudoku, solvedSudoku, currCell, pressedKeyVal, rowNum, colNum) {
    if (currCell.classList.contains("wrong-input")) currCell.classList.remove("wrong-input");
    if (!currCell.classList.contains("filled-cell") && !currCell.classList.contains("fixed-cell")) {
        if (!isNaN(pressedKeyVal)) {
            currCell.innerHTML = pressedKeyVal;
            if (pressedKeyVal != solvedSudoku[rowNum][colNum]) {
                currCell.classList.add("wrong-input", "shake");
                setTimeout(() => currCell.classList.remove("shake"), 300); // Shake animation for wrong input
                numOfWrongInputs += 1;
                if (numOfWrongInputs == 8) {
                    showMistakeDialog("Game Aipoindhi...");
                    setTimeout(() => location.reload(), 2000); // Reload after the dialog closes
                }
                if (numOfWrongInputs == 5) {
                    showMistakeDialog("Nandu kosam 3 extra chances...");
                    counter.textContent = "Mistakes: " + numOfWrongInputs + "/8";
                }

                counter.textContent = "Mistakes: " + numOfWrongInputs + "/5";
                
                
            } else {
                unsolvedSudoku[rowNum][colNum] = pressedKeyVal;
                triggerCellConfetti(currCell);
                currCell.classList.add("fixed-cell-color", "filled-cell");
                currCell.classList.remove("empty-cell");
                sameNumberHighlighting(pressedKeyVal);

            }
        }
    }

    // Check if Sudoku is solved
    if (checkIfSolved(unsolvedSudoku)) {
        triggerConfetti();
        showCompletionDialog();
    }
}

function showQRModal() {
    document.getElementById("qrModal").style.display = "flex";
}

function closeQRModal() {
    document.getElementById("qrModal").style.display = "none";
}

function triggerCellConfetti(cell) {
    const rect = cell.getBoundingClientRect();  // Get the position of the cell
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

    confetti({
        particleCount: 20,  // Fewer particles for more visibility
        spread: 70,         // Spread of the confetti
        origin: { x: x, y: y },
        shapes: ['heart'],  // Use heart shapes
        colors: ['#FFC0CB', '#FF69B4', '#FF1493', '#C71585'],  // Pink and red colors for hearts
        scalar: 1.5,        // Larger size for the hearts
        gravity: 0.5,       // Hearts will fall more slowly for better visibility
        ticks: 200          // Hearts will stay on screen longer
    });
}



function checkIfSolved(unsolvedSudoku) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (unsolvedSudoku[row][col] === 0) {
                return false;  // The Sudoku is not solved yet
            }
        }
    }
    return true;
}


function editCells(PreUnSolvedSudoku, currCell, pressedKeyVal, rowNum, colNum){
    if(!isNaN(pressedKeyVal)){
        currCell.innerHTML = pressedKeyVal
        PreUnSolvedSudoku[rowNum][colNum] = pressedKeyVal;
        sameNumberHighlighting(pressedKeyVal)  
    }
}

function resetPuzzle(originalUnsolvedSudoku, unsolvedSudoku){
    numOfWrongInputs = 0;
    counter.innerHTML="Mistakes: "+numOfWrongInputs+"/5";
    removeSameNumHigh()
    sudokuCells.forEach(cell =>{
        if(cell.classList.contains("filled-cell")) cell.classList.remove("filled-cell")
        if(cell.classList.contains("fixed-cell-color")) cell.classList.remove("fixed-cell-color")
        if(cell.classList.contains("fixed-cell")) cell.classList.remove("fixed-cell")

        let rowNum = getRowColNumber(cell.id).row
        let colNum = getRowColNumber(cell.id).col
        let currVal = originalUnsolvedSudoku[rowNum][colNum]
        unsolvedSudoku[rowNum][colNum] = currVal
        if(currVal != 0) {
            cell.classList.add("fixed-cell")
            cell.textContent = currVal
        }
        else {
            cell.textContent = "";
            cell.classList.add("empty-cell")
        }

    })
    highlighitingCells(0,0)
}

// Utility Helper Functions:

function getIndex(puzzles){
    return Math.floor(Math.random()*(puzzles.length-1) +1)
}

function getRowColNumber(cellID){
    let rowNum = Math.floor(parseInt(cellID.substring(1))/10)
    let colNum = Math.floor(parseInt(cellID.substring(1))%10)
    return {
        "row": rowNum,
        "col": colNum
    }
}

function manageBackSpace(){
    const focusedCell = document.querySelector(".focused-sudoku-cell")
    if(!focusedCell.classList.contains("filled-cell") && !focusedCell.classList.contains("fixed-cell")) focusedCell.innerHTML = "";
    if(focusedCell.classList.contains("wrong-input")) focusedCell.classList.remove("wrong-input")
}




//Presentation of UI Functions:


function highlighitingCells(row, col){
    const prevCell = document.querySelector(".focused-sudoku-cell")
    if (prevCell !== null ) prevCell.classList.remove("focused-sudoku-cell")
    const currCell = document.getElementById(`C${row}${col}`);
    currCell.classList.add("focused-sudoku-cell")

    const highCells = document.querySelectorAll(".rcg");
    highCells.forEach(hcell => hcell.classList.remove("rcg"));


    for(let i=0;i<9;i++){
        const r = document.getElementById(`C${row}${i}`);
        const c = document.getElementById(`C${i}${col}`);
        if(!r.classList.contains("rcg")) r.classList.add("rcg");
        if(!c.classList.contains("rcg")) c.classList.add("rcg");
    }

    let sr = Math.floor(row/3)*3;
    let sc = Math.floor(col/3)*3;
    for(i=sr;i<sr+3;i++){
        for(j=sc;j<sc+3;j++){
            const g = document.getElementById(`C${i}${j}`);
            if(!g.classList.contains("rcg")) g.classList.add("rcg");
        }
    }
}

function sameNumberHighlighting(fixedNumber){
    const prevHighCells = document.querySelectorAll(".same-num-high");  // highlighting the cells with the same number as focused cell number
    prevHighCells.forEach(sameNumHighCell => sameNumHighCell.classList.remove("same-num-high"));
    if(!isNaN(fixedNumber)) sudokuCells.forEach(cell => {if(parseInt(cell.textContent) == fixedNumber) cell.classList.add("same-num-high")});
}

function removeHighlighting(){
    sudokuCells.forEach(cell =>{
        removeSameNumHigh()
        if(cell.classList.contains("rcg")) cell.classList.remove("rcg");
        if(cell.classList.contains("focused-sudoku-cell")) cell.classList.remove("focused-sudoku-cell");
        })
}

function removeSameNumHigh(){
    const cells = document.querySelectorAll(".same-num-high");
    cells.forEach(cell =>{
        cell.classList.remove("same-num-high")
    })
}

function printSudoku(sudoku) {
    for (let i = 0; i < sudoku.length; i++) {
        if (i > 0 && i % 3 === 0) {
            console.log("------+-------+------");
        }
        for (let j = 0; j < sudoku[i].length; j++) {
            if (j > 0 && j % 3 === 0) {
                process.stdout.write("| ");
            }
            process.stdout.write(sudoku[i][j] + " ");
        }
        console.log();
    }
}

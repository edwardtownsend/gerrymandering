const grid = document.getElementById('grid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gridSize = 5;  // 5x5 grid
const dotSize = 50;  // Diameter of the dot
const gridGap = 100; // Gap between the dots

// Adjust canvas size based on grid size and gap
canvas.width = (dotSize + gridGap) * (gridSize - 1) + dotSize;
canvas.height = (dotSize + gridGap) * (gridSize - 1) + dotSize;

// Create the 5x5 grid of dots
const dots = [];
for (let i = 0; i < 25; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    grid.appendChild(dot);
    dots.push(dot);
}

function changeColors() {
    // Reset all dots to lightgray
    dots.forEach(dot => dot.style.backgroundColor = 'lightgray');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous links

    // Randomly select 5 dots and color them
    const coloredDots = [];
    while (coloredDots.length < 5) {
        const randomIndex = Math.floor(Math.random() * 25);
        if (!coloredDots.includes(randomIndex)) {
            coloredDots.push(randomIndex);
            dots[randomIndex].style.backgroundColor = 'blue';
        }
    }

    // Create links from uncolored dots to the closest colored dot
    dots.forEach((dot, index) => {
        if (!coloredDots.includes(index)) {
            const closestColoredDot = findClosestColoredDot(index, coloredDots);
            drawLink(index, closestColoredDot);
        }
    });
}

// Calculate the closest colored dot to a given uncolored dot
function findClosestColoredDot(index, coloredDots) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    let minDistance = Infinity;
    let closestDot = null;

    coloredDots.forEach(coloredIndex => {
        const coloredRow = Math.floor(coloredIndex / gridSize);
        const coloredCol = coloredIndex % gridSize;
        const distance = Math.max(Math.abs(coloredRow - row), Math.abs(coloredCol - col)); // Diagonal distance metric

        if (distance < minDistance) {
            minDistance = distance;
            closestDot = coloredIndex;
        } else if (distance === minDistance) {
            // Randomly choose if two distances are the same
            if (Math.random() > 0.5) {
                closestDot = coloredIndex;
            }
        }
    });

    return closestDot;
}

// Draw a link between two dots
function drawLink(fromIndex, toIndex) {
    const fromRow = Math.floor(fromIndex / gridSize);
    const fromCol = fromIndex % gridSize;
    const toRow = Math.floor(toIndex / gridSize);
    const toCol = toIndex % gridSize;

    const fromX = fromCol * (dotSize + gridGap) + dotSize / 2;
    const fromY = fromRow * (dotSize + gridGap) + dotSize / 2;
    const toX = toCol * (dotSize + gridGap) + dotSize / 2;
    const toY = toRow * (dotSize + gridGap) + dotSize / 2;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

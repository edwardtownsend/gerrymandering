const grid = document.getElementById('grid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gridSize = 10;
const popSize = 15;
const dotSize = 50;  // Diameter of the dot
const gridGap = 100; // Gap between the dots

// Adjust canvas size based on grid size and gap
canvas.width = (dotSize + gridGap) * (gridSize - 1) + dotSize;
canvas.height = (dotSize + gridGap) * (gridSize - 1) + dotSize;

// Create the grid of dots
const dots = [];
for (let i = 0; i < gridSize**2; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    grid.appendChild(dot);
    dots.push(dot);
}

// Generate an array of distinct colors
const colors = Array.from({ length: popSize }, (_, i) => {
    const hue = (i * 360 / popSize) % 360; // Evenly spaced hue
    return `hsl(${hue}, 100%, 50%)`;
});

function changeColors() {
    // Reset all dots to lightgray and clear previous content
    dots.forEach(dot => {
        dot.style.backgroundColor = 'lightgray';
        dot.textContent = ''; // Clear previous distance text
        dot.style.fontSize = '36px'; // Adjust text size
        dot.style.display = 'flex';
        dot.style.alignItems = 'center';
        dot.style.justifyContent = 'center';
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous links and circles

    // Track color counts
    const colorCounts = {};

    // Randomly select popSize dots and assign them unique colors
    const coloredDots = [];
    const usedColors = [];
    while (coloredDots.length < popSize) {
        const randomIndex = Math.floor(Math.random() * gridSize**2);
        if (!coloredDots.includes(randomIndex)) {
            coloredDots.push(randomIndex);
            let color;
            do {
                color = colors[Math.floor(Math.random() * colors.length)];
            } while (usedColors.includes(color));
            usedColors.push(color);
            // Assign color to the colored dots
            dots[randomIndex].style.backgroundColor = color;
        }
    }

    // Assign each uncolored dot the color of its closest colored dot and display distance
    dots.forEach((dot, index) => {
        if (!coloredDots.includes(index)) {
            const closestColoredDot = findClosestColoredDot(index, coloredDots);
            const color = dots[closestColoredDot].style.backgroundColor;
            dot.style.backgroundColor = color;

            // Calculate and display distance
            const dotRow = Math.floor(index / gridSize);
            const dotCol = index % gridSize;
            const closestRow = Math.floor(closestColoredDot / gridSize);
            const closestCol = closestColoredDot % gridSize;
            const distance = Math.sqrt((dotRow - closestRow) ** 2 + (dotCol - closestCol) ** 2); // Euclidean distance

            dot.textContent = Math.round(distance); // Display rounded distance inside the dot

            // Update color count
            colorCounts[color] = (colorCounts[color] || 0) + 1;
            drawLink(index, closestColoredDot); // Draw link to the closest colored dot
        }
    });

    // Update color counts display
    updateColorCounts(colorCounts);
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
        const distance = Math.sqrt((coloredRow - row) ** 2 + (coloredCol - col) ** 2); // Euclidean distance

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
    ctx.strokeStyle = 'red';  // Color of the link
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Function to update the color counts display
function updateColorCounts(colorCounts) {
    const colorCountsDiv = document.getElementById('color-counts');
    colorCountsDiv.innerHTML = ''; // Clear previous counts

    Object.entries(colorCounts).forEach(([color, count]) => {
        const colorDiv = document.createElement('div');
        colorDiv.innerHTML = `<span style="color: ${color};">Color ${color}</span>: <span style="color: black;">${count} dots</span>`;
        colorCountsDiv.appendChild(colorDiv);
    });
}

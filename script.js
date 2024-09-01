const grid = document.getElementById('grid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gridSize = 10;
const popSize = 10;
const dotSize = 50;  // Diameter of the dot
const gridGap = 100; // Gap between the dots

// Adjust canvas size based on grid size and gap
canvas.width = (dotSize + gridGap) * (gridSize - 1) + dotSize;
canvas.height = (dotSize + gridGap) * (gridSize - 1) + dotSize;

// Create the grid of dots
const dots = [];
for (let i = 0; i < gridSize ** 2; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.position = 'relative'; // Position for the population label
    dot.dataset.population = Math.floor(Math.random() * 100) + 1; // Random population value between 1 and 100
    grid.appendChild(dot);
    dots.push(dot);
}

// Generate an array of distinct RGB colors
const colors = Array.from({ length: popSize }, (_, i) => {
    // Calculate hue to ensure distinct colors
    const hue = (i * 360 / popSize) % 360;
    // Convert HSL to RGB (unchanged as per your request)
    const hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r, g, b;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
    };

    return hslToRgb(hue, 100, 50); // Use full saturation and lightness for vivid colors
});

// Track color counts and populations
const colorPopulations = {};
const currDir = {};
const localBestPos = {};
let globalBestPos = [[-1,-1], -Infinity];

// Randomly select popSize dots and assign them unique colors
const coloredDots = [];
while (coloredDots.length < popSize) {
    const randomIndex = Math.floor(Math.random() * gridSize ** 2);
    if (!coloredDots.includes(randomIndex)) {
        const color = colors[coloredDots.length];
        coloredDots.push(randomIndex);

        dots[randomIndex].style.backgroundColor = color;

        // Initialize currDir and localBestPos
        colorPopulations[color] = parseInt(dots[randomIndex].dataset.population, 10);
        currDir[color] = [0, 0];
        const row = Math.floor(randomIndex / gridSize);
        const col = randomIndex % gridSize;
        localBestPos[color] = [[row, col], colorPopulations[color]];
    }
}

function nextIteration() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous links

    // Reset color populations at the beginning of each iteration
    Object.keys(colorPopulations).forEach(color => {
        colorPopulations[color] = 0;
    });

    for (const [pos, pop] of Object.values(localBestPos)) {
        if (pop > globalBestPos[1]) {
            globalBestPos = [pos, pop];
        }
    }
    coloredDots.forEach((i, index) => {
        const color = dots[i].style.backgroundColor;

        const currPos = [Math.floor(i / gridSize), i % gridSize];
        const [localBestRow, localBestCol] = localBestPos[color][0];
        const [globalBestRow, globalBestCol] = globalBestPos[0];

        const localBestPosDir = [localBestRow - currPos[0], localBestCol - currPos[1]];
        const globalBestPosDir = [globalBestRow - currPos[0], globalBestCol - currPos[1]];
        const moveDirection = [currDir[color][0] + 8*localBestPosDir[0] + globalBestPosDir[0], currDir[color][1] + 8*localBestPosDir[1] + globalBestPosDir[1]];

        const constrainedMove = moveDirection.map(val => Math.max(-1, Math.min(1, val)));
        const newIndex = (currPos[0] + constrainedMove[0]) * gridSize + (currPos[1] + constrainedMove[1]);

        if (newIndex >= 0 && newIndex < gridSize ** 2 && !coloredDots.includes(newIndex)) {
            coloredDots[index] = newIndex;
            dots[newIndex].style.backgroundColor = color;
        }
        currDir[color] = constrainedMove;
    });

    // Assign each uncolored dot the color of its closest colored dot, display distance, and update populations
    dots.forEach((dot, index) => {
        if (!coloredDots.includes(index)) {
            const closestColoredDot = findClosestColoredDot(index, coloredDots);
            const color = dots[closestColoredDot].style.backgroundColor;
            dot.style.backgroundColor = color;

            const dotRow = Math.floor(index / gridSize);
            const dotCol = index % gridSize;
            const closestRow = Math.floor(closestColoredDot / gridSize);
            const closestCol = closestColoredDot % gridSize;
            const distance = Math.sqrt((dotRow - closestRow) ** 2 + (dotCol - closestCol) ** 2);

            dot.textContent = `${Math.round(distance * 10) / 10}`;  // Display rounded distance inside the dot

            colorPopulations[color] += parseInt(dot.dataset.population, 10);
            drawLink(index, closestColoredDot);
        } else {
            dot.textContent = `0`;
            colorPopulations[dots[index].style.backgroundColor] += parseInt(dot.dataset.population, 10);
        }
    });
    updateColorCounts(colorPopulations);

    // Update localBestPos
    coloredDots.forEach((i, _) => {
        const color = dots[i].style.backgroundColor;
        const pop = colorPopulations[color];
        if (pop > localBestPos[color][1]) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            localBestPos[color] = [[row, col], pop]; // Update only for this color
        }
    });
}

function findClosestColoredDot(index, coloredDots) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    let minDistance = Infinity;
    let closestDot = null;

    coloredDots.forEach(coloredIndex => {
        const coloredRow = Math.floor(coloredIndex / gridSize);
        const coloredCol = coloredIndex % gridSize;
        const distance = Math.sqrt((coloredRow - row) ** 2 + (coloredCol - col) ** 2);

        if (distance < minDistance) {
            minDistance = distance;
            closestDot = coloredIndex;
        } else if (distance === minDistance && Math.random() > 0.5) {
            closestDot = coloredIndex;
        }
    });

    return closestDot;
}

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

function updateColorCounts(colorPopulations) {
    const colorCountsDiv = document.getElementById('color-counts');
    colorCountsDiv.innerHTML = ''; // Clear previous counts

    Object.entries(colorPopulations).forEach(([color, population]) => {
        const colorDiv = document.createElement('div');
        colorDiv.innerHTML = `<span style="color: ${color}; font-weight: bold; font-size: 16px;">Color ${color}</span>: <span style="color: black; font-size: 16px;">${population} total population</span>`;
        colorCountsDiv.appendChild(colorDiv);
    });
}

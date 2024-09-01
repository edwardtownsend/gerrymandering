const grid = document.getElementById('grid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gridSize = 10;
const popSize = 8;
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
    dot.style.position = 'relative'; // Position for the population label
    dot.dataset.population = Math.floor(Math.random() * 100) + 1; // Random population value between 1 and 100
    grid.appendChild(dot);
    dots.push(dot);
}

// Generate an array of distinct RGB colors
const colors = Array.from({ length: popSize }, (_, i) => {
    // Calculate hue to ensure distinct colors
    const hue = (i * 360 / popSize) % 360;
    // Convert HSL to RGB
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

function changeColors() {
    // Reset all dots to lightgray and clear previous content
    dots.forEach(dot => {
        dot.style.backgroundColor = 'lightgray';
        dot.textContent = '';
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous links and circles

    // Track color counts and populations
    const colorCounts = {};
    const colorPopulations = {};

    // Randomly select popSize dots and assign them unique colors
    const coloredDots = [];
    let i = 0;
    while (coloredDots.length < popSize) {
        const randomIndex = Math.floor(Math.random() * gridSize**2);
        if (!coloredDots.includes(randomIndex)) {
            coloredDots.push(randomIndex);
            const color = colors[i];
            i += 1;
            // Assign color to the colored dots
            dots[randomIndex].style.backgroundColor = color;

            // Initialize population count for this color
            colorPopulations[color] = 0;
        }
    }

    // Assign each uncolored dot the color of its closest colored dot, display distance, and update populations
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

            dot.textContent = `${Math.round(distance)}`; // Display rounded distance inside the dot

            // Update color count and population
            colorCounts[color] = (colorCounts[color] || 0) + 1;
            colorPopulations[color] += parseInt(dot.dataset.population, 10); // Sum of populations
            drawLink(index, closestColoredDot); // Draw link to the closest colored dot
        } else {
            // Update population for colored dots
            colorPopulations[dots[index].style.backgroundColor] += parseInt(dots[index].dataset.population, 10);
        }
    });

    // Update color counts display
    updateColorCounts(colorPopulations);
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
function updateColorCounts(colorPopulations) {
    const colorCountsDiv = document.getElementById('color-counts');
    colorCountsDiv.innerHTML = ''; // Clear previous counts

    Object.entries(colorPopulations).forEach(([color, population]) => {
        const colorDiv = document.createElement('div');
        colorDiv.innerHTML = `<span style="color: ${color}; font-weight: bold; font-size: 16px;">Color ${color}</span>: <span style="color: black; font-size: 16px;">${population} total population</span>`;
        colorCountsDiv.appendChild(colorDiv);
    });
}

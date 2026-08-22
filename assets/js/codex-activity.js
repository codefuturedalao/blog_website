(() => {
  const canvas = document.querySelector("[data-codex-activity-canvas]");
  if (!canvas) return;

  const panel = canvas.closest(".codex-activity-panel");
  const source = canvas.dataset.source;
  const cells = [];
  const columns = 53;
  const rows = 7;
  const snakeLength = 7;
  const stepDuration = 70;
  let animationFrame = 0;
  let activity = new Map();
  let pathCells = [];
  let startTime = 0;
  let layout = null;

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(date, amount) {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + amount);
    return shifted;
  }

  function isDark() {
    return document.documentElement.classList.contains("dark") || document.body.classList.contains("dark");
  }

  function roundedCell(context, x, y, size, radius, color) {
    context.beginPath();
    context.roundRect(x, y, size, size, radius);
    context.fillStyle = color;
    context.fill();
  }

  function prepareCells() {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const start = addDays(today, -(52 * 7 + today.getDay()));
    cells.length = 0;
    pathCells = [];

    for (let column = 0; column < columns; column += 1) {
      const rowOrder = column % 2 === 0
        ? [...Array(rows).keys()]
        : [...Array(rows).keys()].reverse();

      for (let row = 0; row < rows; row += 1) {
        const date = addDays(start, column * 7 + row);
        const cell = {
          column,
          row,
          date: dateKey(date),
          future: date > today,
          tokens: activity.get(dateKey(date)) ?? 0,
        };
        cells.push(cell);
      }

      for (const row of rowOrder) {
        pathCells.push(cells.find((cell) => cell.column === column && cell.row === row));
      }
    }
  }

  function prepareCanvas() {
    const width = Math.max(260, Math.floor(canvas.getBoundingClientRect().width));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const gap = Math.max(1, width * 0.0032);
    const cellSize = Math.max(3, (width - gap * (columns - 1)) / columns);
    const height = Math.ceil(cellSize * rows + gap * (rows - 1));

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    layout = { context, width, height, gap, cellSize };
  }

  function palette() {
    return isDark()
      ? {
          empty: "#2f3542",
          future: "#252a34",
          levels: ["#244d64", "#1f7180", "#149a91", "#18bfa2"],
          snake: ["#7dd3fc", "#38bdf8", "#2563eb", "#1d4ed8"],
        }
      : {
          empty: "#e9edf2",
          future: "#f3f4f6",
          levels: ["#bcebdc", "#75d8bc", "#2fbf9d", "#098a75"],
          snake: ["#93c5fd", "#60a5fa", "#2962ff", "#1d4ed8"],
        };
  }

  function tokenLevel(tokens, activeValues) {
    if (!tokens || !activeValues.length) return -1;
    const rank = activeValues.findIndex((value) => tokens <= value);
    const percentile = (rank === -1 ? activeValues.length - 1 : rank) / Math.max(1, activeValues.length - 1);
    return Math.min(3, Math.floor(percentile * 4));
  }

  function draw(progress = -1) {
    if (!layout) return;
    const { context, gap, cellSize } = layout;
    const colors = palette();
    const activeValues = cells
      .filter((cell) => cell.tokens > 0)
      .map((cell) => cell.tokens)
      .sort((a, b) => a - b);
    const eaten = new Set(pathCells.slice(0, Math.max(0, progress + 1)));

    context.clearRect(0, 0, layout.width, layout.height);
    for (const cell of cells) {
      const x = cell.column * (cellSize + gap);
      const y = cell.row * (cellSize + gap);
      const level = tokenLevel(cell.tokens, activeValues);
      const color = cell.future
        ? colors.future
        : eaten.has(cell)
          ? colors.empty
          : level === -1
            ? colors.empty
            : colors.levels[level];
      roundedCell(context, x, y, cellSize, Math.max(1, cellSize * 0.24), color);
    }

    if (progress < 0) return;
    for (let offset = snakeLength - 1; offset >= 0; offset -= 1) {
      const cell = pathCells[progress - offset];
      if (!cell) continue;
      const x = cell.column * (cellSize + gap);
      const y = cell.row * (cellSize + gap);
      const colorIndex = Math.min(
        colors.snake.length - 1,
        Math.floor(((snakeLength - offset) / snakeLength) * colors.snake.length),
      );
      roundedCell(context, x, y, cellSize, Math.max(1, cellSize * 0.28), colors.snake[colorIndex]);
    }
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const totalSteps = pathCells.length + snakeLength;
    const elapsed = timestamp - startTime;
    const progress = Math.floor(elapsed / stepDuration);

    if (progress > totalSteps) {
      if (elapsed > totalSteps * stepDuration + 1250) {
        startTime = timestamp;
      }
      draw(totalSteps);
    } else {
      draw(progress);
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  function restart() {
    window.cancelAnimationFrame(animationFrame);
    prepareCells();
    prepareCanvas();
    startTime = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(-1);
    } else {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  function updateTimestamp(generatedAt) {
    const element = panel.querySelector("[data-codex-updated]");
    if (!element) return;
    const date = new Date(generatedAt);
    if (Number.isNaN(date.getTime())) return;
    element.textContent = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
    element.dateTime = date.toISOString();
  }

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      activity = new Map(data.days.map((day) => [day.date, day.tokens]));
      updateTimestamp(data.generatedAt);
      restart();

      const resizeObserver = new ResizeObserver(restart);
      resizeObserver.observe(canvas);

      const themeObserver = new MutationObserver(() => draw(-1));
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    })
    .catch(() => {
      panel.classList.add("codex-activity-unavailable");
      const status = panel.querySelector("[data-codex-status]");
      if (status) status.textContent = "Activity data unavailable";
    });
})();

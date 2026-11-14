"use strict";

(function () {
  const SQRT3_OVER_2 = Math.sqrt(3) / 2;
  const VIEWPORT_RECORD_BUDGET = 90000;
  const MAX_ZOOM_OUT_FACTOR = 12;
  const BILLIARDS_MAX_LABEL_LIMIT = 3000;
  const MATRIX_N_LIMIT = 30;
  const CHARACTER_FORMULA_DISPLAY_LIMIT = 80;
  // Exclusive endpoints of the independently checked cached ASLoc wall runs.
  const VERIFIED_WALL_LIMITS = { 3: 24, 5: 60, 7: 31 };
  const BILLIARDS_DIRECTIONS = [
    [1, 0],
    [-1, 1],
    [0, -1],
  ];

  const STATUS = {
    unknown: {
      key: "unknown",
      color: "#9ca3af",
      label: "not currently classified",
    },
    donkinBase: {
      key: "donkin-base",
      color: "#38bdf8",
      label: "Donkin recursion from finite base data",
    },
    elementary: {
      key: "elementary",
      color: "#2563eb",
      label: "elementary alcove or facet",
    },
    wallSafe: {
      key: "wall-safe",
      color: "#059669",
      label: "Billiards wall data inside expected range",
    },
    wallOut: {
      key: "wall-out",
      color: "#f97316",
      label: "Billiards wall data outside expected range",
    },
    shiftedBox: {
      key: "shifted-box",
      color: "#7c3aed",
      label: "shifted box base region",
    },
  };

  const STATUS_ORDER = [
    STATUS.unknown.key,
    STATUS.donkinBase.key,
    STATUS.elementary.key,
    STATUS.wallSafe.key,
    STATUS.wallOut.key,
    STATUS.shiftedBox.key,
  ];

  const PALETTE_BY_STATUS = Object.fromEntries(
    Object.values(STATUS).map((status) => [status.key, status])
  );

  const canvas = document.getElementById("range-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const rangeHoverCanvas = document.getElementById("range-hover-canvas");
  const rangeHoverCtx = rangeHoverCanvas.getContext("2d");
  const primeSelect = document.getElementById("prime-select");
  const windowSelect = document.getElementById("window-select");
  const maxCoordinateInput = document.getElementById("max-coordinate");
  const maxCoordinateNumber = document.getElementById("max-coordinate-number");
  const dotSizeInput = document.getElementById("dot-size");
  const dotSizeValue = document.getElementById("dot-size-value");
  const showWeightGridInput = document.getElementById("show-weight-grid");
  const showAlcovesInput = document.getElementById("show-alcoves");
  const showShiftedBoxInput = document.getElementById("show-shifted-box");
  const showAxisLabelsInput = document.getElementById("show-axis-labels");
  const resetViewButton = document.getElementById("reset-view");
  const rangeWarning = document.getElementById("range-warning");
  const caption = document.getElementById("range-caption");
  const legend = document.getElementById("range-legend");
  const tiltingCanvas = document.getElementById("tilting-canvas");
  const tiltingCtx = tiltingCanvas.getContext("2d", { alpha: false });
  const tiltingPrimeSelect = document.getElementById("tilting-prime-select");
  const tiltingMaxCoordinateInput = document.getElementById("tilting-max-coordinate");
  const tiltingMaxCoordinateNumber = document.getElementById("tilting-max-coordinate-number");
  const tiltingStepCircleSizeInput = document.getElementById("tilting-step-circle-size");
  const tiltingStepCircleSizeValue = document.getElementById("tilting-step-circle-size-value");
  const tiltingShowWeightGridInput = document.getElementById("tilting-show-weight-grid");
  const tiltingShowAlcovesInput = document.getElementById("tilting-show-alcoves");
  const tiltingShowShiftedBoxInput = document.getElementById("tilting-show-shifted-box");
  const tiltingShowStepLabelsInput = document.getElementById("tilting-show-step-labels");
  const tiltingResetViewButton = document.getElementById("tilting-reset-view");
  const tiltingCaption = document.getElementById("tilting-caption");
  const tiltingDetails = document.getElementById("tilting-details");
  const characterCanvas = document.getElementById("character-canvas");
  const characterCtx = characterCanvas.getContext("2d", { alpha: false });
  const characterHoverCanvas = document.getElementById("character-hover-canvas");
  const characterHoverCtx = characterHoverCanvas.getContext("2d");
  const characterPrimeSelect = document.getElementById("character-prime-select");
  const characterMaxCoordinateInput = document.getElementById("character-max-coordinate");
  const characterMaxCoordinateNumber = document.getElementById("character-max-coordinate-number");
  const characterShowWeightGridInput = document.getElementById("character-show-weight-grid");
  const characterShowAlcovesInput = document.getElementById("character-show-alcoves");
  const characterShowShiftedBoxInput = document.getElementById("character-show-shifted-box");
  const characterColourByCoefficientInput = document.getElementById("character-colour-by-coefficient");
  const characterShowCoefficientLabelsInput = document.getElementById("character-show-coefficient-labels");
  const characterShowFormulaInput = document.getElementById("character-show-formula");
  const characterResetViewButton = document.getElementById("character-reset-view");
  const characterCaption = document.getElementById("character-caption");
  const characterDetails = document.getElementById("character-details");
  const partitionPrimeSelect = document.getElementById("partition-prime-select");
  const partitionLambdaInput = document.getElementById("partition-lambda-input");
  const partitionMuInput = document.getElementById("partition-mu-input");
  const partitionLambdaSlider = document.getElementById("partition-lambda-slider");
  const partitionLambdaSliderTicks = document.getElementById("partition-lambda-slider-ticks");
  const partitionLambdaSliderReadout = document.getElementById("partition-lambda-slider-readout");
  const partitionMuSlider = document.getElementById("partition-mu-slider");
  const partitionMuSliderTicks = document.getElementById("partition-mu-slider-ticks");
  const partitionMuSliderReadout = document.getElementById("partition-mu-slider-readout");
  const partitionDetails = document.getElementById("partition-details");
  const matrixPrimeSelect = document.getElementById("matrix-prime-select");
  const matrixNInput = document.getElementById("matrix-n-input");
  const matrixComputeButton = document.getElementById("matrix-compute");
  const matrixFixedReadout = document.getElementById("matrix-fixed-readout");
  const matrixOutput = document.getElementById("matrix-output");
  const billiardsCanvas = document.getElementById("billiards-canvas");
  const billiardsCtx = billiardsCanvas.getContext("2d", { alpha: false });
  const billiardsPrimeSelect = document.getElementById("billiards-prime-select");
  const billiardsMaxLabelInput = document.getElementById("billiards-max-label");
  const billiardsMaxLabelNumber = document.getElementById("billiards-max-label-number");
  const billiardsWallIndexInput = document.getElementById("billiards-wall-index");
  const billiardsWallIndexNumber = document.getElementById("billiards-wall-index-number");
  const billiardsSpeedInput = document.getElementById("billiards-speed");
  const billiardsSpeedValue = document.getElementById("billiards-speed-value");
  const billiardsShowWallGraphInput = document.getElementById("billiards-show-wall-graph");
  const billiardsShowAllInput = document.getElementById("billiards-show-all");
  const billiardsShowLabelsInput = document.getElementById("billiards-show-labels");
  const billiardsPowerSizeModeInput = document.getElementById("billiards-power-size-mode");
  const billiardsShowDetailsInput = document.getElementById("billiards-show-details");
  const billiardsPlayButton = document.getElementById("billiards-play");
  const billiardsResetViewButton = document.getElementById("billiards-reset-view");
  const billiardsCaption = document.getElementById("billiards-caption");
  const billiardsLegend = document.getElementById("billiards-legend");
  const billiardsReadout = document.getElementById("billiards-readout");
  const billiardsDetails = document.getElementById("billiards-details");
  let characterRequestId = 0;
  let partitionRequestId = 0;
  let partitionMatrixRequestId = 0;
  let billiardsBaseDataPromise = null;
  let billiardsAnimationFrame = null;
  let billiardsLastAnimationTime = 0;

  const state = {
    p: 3,
    windowMode: "local",
    maxCoordinate: 120,
    dotSize: 3,
    showWeightGrid: true,
    showAlcoves: true,
    showShiftedBox: true,
    showAxisLabels: false,
    width: 1100,
    height: 820,
    scale: 1,
    minScale: 0.01,
    offsetX: 0,
    offsetY: 0,
    records: [],
    recordMap: new Map(),
    counts: new Map(),
    bounds: { maxCoordinate: 18, maxX: 27, maxY: 15.588 },
    requestedMaxCoordinate: 18,
    viewportStride: 1,
    viewportDominantPointEstimate: 0,
    visibleBounds: { minA: 0, maxA: 18, minB: 0, maxB: 18 },
    classificationMemos: new Map(),
    hoverWeight: null,
    viewNeedsReset: true,
    dragging: false,
    lastPointer: null,
  };

  const tiltingState = {
    p: 3,
    maxCoordinate: 60,
    stepCircleSize: 7,
    showWeightGrid: true,
    showAlcoves: true,
    showShiftedBox: true,
    showStepLabels: false,
    width: 1100,
    height: 760,
    scale: 1,
    minScale: 0.01,
    offsetX: 0,
    offsetY: 0,
    bounds: { maxCoordinate: 60, maxX: 90, maxY: 51.962 },
    selected: null,
    trace: null,
    pinned: false,
    visibleBounds: { minA: 0, maxA: 60, minB: 0, maxB: 60 },
    viewNeedsReset: true,
    dragging: false,
    moved: false,
    lastPointer: null,
  };

  const characterState = {
    p: 3,
    maxCoordinate: 18,
    showWeightGrid: true,
    showAlcoves: true,
    showShiftedBox: true,
    colourByCoefficient: false,
    showCoefficientLabels: false,
    showFormula: true,
    width: 1100,
    height: 760,
    scale: 1,
    minScale: 0.01,
    offsetX: 0,
    offsetY: 0,
    bounds: { maxCoordinate: 18, maxX: 27, maxY: 15.588 },
    selected: null,
    hoverWeight: null,
    characterResult: null,
    characterError: null,
    characterLoading: false,
    characterCaches: new Map(),
    hoverTimer: null,
    pendingHoverWeight: null,
    detailsHtml: "",
    pinned: false,
    visibleBounds: { minA: 0, maxA: 18, minB: 0, maxB: 18 },
    viewNeedsReset: true,
    dragging: false,
    moved: false,
    lastPointer: null,
  };

  const partitionState = {
    p: 3,
    lambda: null,
    mu: null,
    lambdaWeight: null,
    muWeight: null,
    dominance: null,
    classification: null,
    hasLambda: false,
    valid: false,
    reasons: [],
    muReasons: [],
    lambdaReasons: [],
    computationHtml: null,
    lambdaSliderCandidates: [],
    muSliderCandidates: [],
  };

  const partitionMatrixState = {
    p: 3,
    n: 11,
    rows: [],
    columns: [],
    entries: [],
    columnResults: [],
    status: "empty",
    message: "Choose n and compute the three-row matrix.",
  };

  const billiardsState = {
    p: 3,
    maxLabel: 23,
    wallIndex: 21,
    speedMs: 300,
    showWallGraph: false,
    showAll: false,
    showLabels: false,
    powerSizeMode: true,
    showDetails: true,
    width: 1100,
    height: 760,
    scale: 1,
    minScale: 0.01,
    offsetX: 0,
    offsetY: 0,
    bounds: { maxA: 24, maxB: 24, maxX: 36, maxY: 20.785 },
    data: null,
    visibleRecords: [],
    viewNeedsReset: true,
    dragging: false,
    moved: false,
    lastPointer: null,
    playing: false,
  };

  function triangularXY(a, b) {
    return {
      x: a + 0.5 * b,
      y: SQRT3_OVER_2 * b,
    };
  }

  function triangularToWeight(point) {
    const b = point.y / SQRT3_OVER_2;
    return {
      a: point.x - 0.5 * b,
      b,
    };
  }

  function clamp(minimum, maximum, value) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function integerInputValue(input, fallback, minimum, maximum) {
    const parsed = Number.parseInt(input.value, 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return clamp(minimum, maximum, parsed);
  }

  function renderLatex(scope) {
    if (typeof window.renderMathInElement !== "function") {
      return;
    }
    window.renderMathInElement(scope, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function weightKey(a, b) {
    return `${a},${b}`;
  }

  function expectedWallLimit(p) {
    return 2 * p * (p + 1);
  }

  function pointCounterKey(point) {
    return `${point.a},${point.b},${point.n},${point.k}`;
  }

  function clonePoint(point) {
    return { a: point.a, b: point.b, n: point.n, k: point.k };
  }

  function addBilliardsPoint(counter, point, count, source) {
    if (!count) {
      return;
    }
    const key = pointCounterKey(point);
    const existing = counter.get(key);
    if (existing) {
      existing.count += count;
      if (source && count > 0) {
        existing.sources.add(source);
      }
      if (existing.count <= 0) {
        counter.delete(key);
      }
      return;
    }
    if (count <= 0) {
      return;
    }
    counter.set(key, {
      a: point.a,
      b: point.b,
      n: point.n,
      k: point.k,
      count,
      sources: new Set(source ? [source] : []),
    });
  }

  function addBilliardsCounter(target, source, countScale, sourceName) {
    for (const point of source.values()) {
      addBilliardsPoint(target, point, point.count * countScale, sourceName);
    }
  }

  function billiardsCounterValues(counter) {
    return Array.from(counter.values()).sort((left, right) => {
      if (left.n !== right.n) {
        return left.n - right.n;
      }
      if (left.a !== right.a) {
        return left.a - right.a;
      }
      if (left.b !== right.b) {
        return left.b - right.b;
      }
      return left.k - right.k;
    });
  }

  function billiardsAddWeight(weight, direction, scale = 1) {
    return [weight[0] + scale * direction[0], weight[1] + scale * direction[1]];
  }

  function billiardsDominant(weight) {
    return weight[0] >= 0 && weight[1] >= 0;
  }

  function billiardsWallResidues(weight, p) {
    const values = [weight[0], weight[0] + weight[1], weight[1]];
    const residues = [];
    for (let index = 0; index < values.length; index += 1) {
      if (values[index] % p === 0) {
        residues.push(index);
      }
    }
    return residues;
  }

  function billiardsIsOnWall(weight, p) {
    return billiardsDominant(weight) && billiardsWallResidues(weight, p).length > 0;
  }

  function billiardsIsRegular(weight, p) {
    return billiardsDominant(weight) && billiardsWallResidues(weight, p).length === 0;
  }

  function billiardsIsCorner(weight, p) {
    return billiardsDominant(weight) &&
      weight[0] % p === 0 &&
      weight[1] % p === 0 &&
      (weight[0] + weight[1]) % p === 0;
  }

  function billiardsIsDominantBoundary(weight) {
    return billiardsDominant(weight) && (weight[0] === 0 || weight[1] === 0);
  }

  function billiardsIsGammaWallVertex(weight, p) {
    if (!billiardsIsOnWall(weight, p)) {
      return false;
    }
    const [a, b] = weight;
    if (a === 0 && b === 0) {
      return true;
    }
    if (a === 0) {
      return b % p === 0;
    }
    if (b === 0) {
      return a % p === 0;
    }
    return true;
  }

  function billiardsEdgeExists(source, direction, p) {
    const target = billiardsAddWeight(source, direction);
    if (!billiardsIsGammaWallVertex(source, p) || !billiardsIsGammaWallVertex(target, p)) {
      return false;
    }
    const sourceResidues = new Set(billiardsWallResidues(source, p));
    return billiardsWallResidues(target, p).some((residue) => sourceResidues.has(residue));
  }

  function billiardsSuccessors(weight, p) {
    return BILLIARDS_DIRECTIONS
      .map((direction) => ({ target: billiardsAddWeight(weight, direction), direction }))
      .filter((record) => billiardsEdgeExists(weight, record.direction, p));
  }

  function billiardsGraphSuccessors(weight) {
    return BILLIARDS_DIRECTIONS
      .map((direction) => ({ target: billiardsAddWeight(weight, direction), direction }))
      .filter((record) => billiardsDominant(record.target));
  }

  function billiardsUniqueSuccessor(weight, p) {
    const successors = billiardsSuccessors(weight, p);
    if (successors.length !== 1) {
      return null;
    }
    return successors[0];
  }

  function billiardsIsAlmostCorner(weight, p) {
    if (!billiardsIsGammaWallVertex(weight, p) || billiardsIsCorner(weight, p)) {
      return false;
    }
    return BILLIARDS_DIRECTIONS.some((direction) => {
      const possibleCorner = billiardsAddWeight(weight, direction, -1);
      return billiardsIsCorner(possibleCorner, p) &&
        billiardsEdgeExists(possibleCorner, direction, p);
    });
  }

  function billiardsSmallStep(point, p) {
    const successor = billiardsUniqueSuccessor([point.a, point.b], p);
    if (!successor) {
      return null;
    }
    return {
      a: successor.target[0],
      b: successor.target[1],
      n: point.n + 2,
      k: point.k,
    };
  }

  function billiardsRest(point) {
    return { a: point.a, b: point.b, n: point.n + 3, k: point.k + 1 };
  }

  function billiardsInitialSeeds(maxK, p) {
    const out = new Map();
    for (let k = 1; k <= maxK; k += 1) {
      addBilliardsPoint(out, { a: k * p, b: 0, n: 2 * k * p, k: 0 }, 1, "seed");
    }
    return out;
  }

  function billiardsInitialWall(maxK) {
    const out = new Map();
    for (let k = 0; k <= maxK; k += 1) {
      addBilliardsPoint(out, { a: k, b: 0, n: 2 * k, k: 0 }, 1, "initial-wall");
    }
    return out;
  }

  function billiardsExpandSeed(seed, p) {
    const weight = [seed.a, seed.b];
    if (billiardsIsCorner(weight, p)) {
      const produced = [];
      let current = clonePoint(seed);
      for (let step = 0; step < p - 1; step += 1) {
        current = billiardsSmallStep(current, p);
        if (!current) {
          break;
        }
        produced.push(current);
      }
      if (current) {
        current = billiardsRest(current);
        produced.push(current);
      }
      return { operation: "rest_once", produced, seeds: current ? [current] : [], targetCorner: null, merged: false };
    }

    if (billiardsIsAlmostCorner(weight, p)) {
      const produced = [];
      let current = billiardsRest(seed);
      produced.push(current);
      for (let step = 0; step < p - 2; step += 1) {
        current = billiardsSmallStep(current, p);
        if (!current) {
          break;
        }
        produced.push(current);
      }
      if (current) {
        current = billiardsRest(current);
        produced.push(current);
      }
      return { operation: "rest_twice", produced, seeds: current ? [current] : [], targetCorner: null, merged: false };
    }

    const successor = billiardsUniqueSuccessor(weight, p);
    if (!successor) {
      return { operation: "blocked", produced: [], seeds: [], targetCorner: null, merged: false };
    }
    let currentWeight = weight;
    let stepsToCorner = 0;
    while (!billiardsIsCorner(currentWeight, p) && stepsToCorner < p - 1) {
      currentWeight = billiardsAddWeight(currentWeight, successor.direction);
      stepsToCorner += 1;
    }
    if (!billiardsIsCorner(currentWeight, p)) {
      return { operation: "blocked", produced: [], seeds: [], targetCorner: null, merged: false };
    }

    const corner = currentWeight;
    const remainingSteps = p - 1 - stepsToCorner;
    const seeds = [];
    for (const direction of BILLIARDS_DIRECTIONS) {
      if (direction[0] === successor.direction[0] && direction[1] === successor.direction[1]) {
        continue;
      }
      const target = billiardsAddWeight(corner, direction, remainingSteps);
      if (billiardsIsGammaWallVertex(target, p) && !billiardsIsDominantBoundary(target)) {
        seeds.push({
          a: target[0],
          b: target[1],
          n: seed.n + 2 * p + 1,
          k: seed.k + 1,
        });
      }
    }
    return { operation: "giant_leap", produced: seeds, seeds, targetCorner: corner, merged: false };
  }

  function billiardsNextGeneration(previousSeeds, number, p) {
    const rawPoints = new Map();
    const rawSeeds = new Map();
    const events = [];
    const leapSeedsByCorner = new Map();

    for (const seedRecord of previousSeeds.values()) {
      for (let copy = 0; copy < seedRecord.count; copy += 1) {
        const seed = clonePoint(seedRecord);
        const event = billiardsExpandSeed(seed, p);
        events.push({ ...event, source: seed });
        for (const point of event.produced) {
          addBilliardsPoint(rawPoints, point, 1, "wall");
        }
        for (const point of event.seeds) {
          addBilliardsPoint(rawSeeds, point, 1, "seed");
        }
        if (event.operation === "giant_leap" && event.targetCorner) {
          const cornerKey = weightKey(event.targetCorner[0], event.targetCorner[1]);
          if (!leapSeedsByCorner.has(cornerKey)) {
            leapSeedsByCorner.set(cornerKey, { corner: event.targetCorner, seeds: new Map() });
          }
          const bucket = leapSeedsByCorner.get(cornerKey).seeds;
          for (const point of event.seeds) {
            addBilliardsPoint(bucket, point, 1, "seed");
          }
        }
      }
    }

    for (const bucketRecord of leapSeedsByCorner.values()) {
      const superposed = new Map();
      for (const point of bucketRecord.seeds.values()) {
        if (point.count >= 2) {
          addBilliardsPoint(superposed, point, 1, "merged");
        }
      }
      if (!superposed.size) {
        continue;
      }
      addBilliardsCounter(rawPoints, bucketRecord.seeds, -1, "wall");
      addBilliardsCounter(rawSeeds, bucketRecord.seeds, -1, "seed");
      addBilliardsCounter(rawPoints, superposed, 1, "merged");
      addBilliardsCounter(rawSeeds, superposed, 1, "merged");
      events.push({
        operation: "giant_leap",
        produced: billiardsCounterValues(superposed),
        seeds: billiardsCounterValues(superposed),
        targetCorner: bucketRecord.corner,
        merged: true,
      });
    }

    return { number, points: rawPoints, seeds: rawSeeds, events };
  }

  function billiardsGenerateUpTo(maxLabel, p) {
    const maxSeedK = Math.floor(maxLabel / (2 * p));
    let previous = billiardsInitialSeeds(maxSeedK, p);
    const generations = [];
    if (previous.size) {
      generations.push({ number: 0, points: new Map(previous), seeds: new Map(previous), events: [] });
    }

    for (let number = 1; number <= maxLabel + 2; number += 1) {
      const active = new Map();
      for (const seed of previous.values()) {
        if (seed.n <= maxLabel) {
          addBilliardsPoint(active, seed, seed.count, "seed");
        }
      }
      if (!active.size) {
        break;
      }
      const generation = billiardsNextGeneration(active, number, p);
      generations.push(generation);
      previous = generation.seeds;
    }
    return generations;
  }

  function billiardsReflectDirection(direction, wallIndex) {
    const [x, y] = direction;
    if (wallIndex === 0) {
      return [-x, x + y];
    }
    if (wallIndex === 1) {
      return [-y, -x];
    }
    return [x + y, -y];
  }

  function billiardsAlcoveStartDirections(seed, p) {
    const weight = [seed.a, seed.b];
    if (billiardsIsCorner(weight, p) || billiardsIsAlmostCorner(weight, p)) {
      return [];
    }
    return billiardsGraphSuccessors(weight)
      .filter((record) => billiardsIsRegular(record.target, p))
      .map((record) => record.direction);
  }

  function billiardsAlcovePath(seed, startDirection, maxLabel, p) {
    let currentPoint = [seed.a, seed.b];
    let currentLabel = { n: seed.n, k: seed.k };
    let currentDirection = startDirection;
    let currentSign = 1;
    const points = [];

    for (let guard = 0; guard < 10000; guard += 1) {
      const newPoint = billiardsAddWeight(currentPoint, currentDirection);
      if (billiardsIsRegular(newPoint, p)) {
        const nextLabel = { n: currentLabel.n + 2, k: currentLabel.k };
        if (nextLabel.n > maxLabel) {
          break;
        }
        currentLabel = nextLabel;
        currentPoint = newPoint;
        points.push({ a: currentPoint[0], b: currentPoint[1], n: currentLabel.n, k: currentLabel.k });
        continue;
      }

      if (billiardsIsRegular(currentPoint, p) && billiardsIsOnWall(newPoint, p)) {
        const residues = billiardsWallResidues(newPoint, p);
        if (residues.length !== 1) {
          break;
        }
        const nextLabel = { n: currentLabel.n + 3, k: currentLabel.k + currentSign };
        if (nextLabel.n > maxLabel) {
          break;
        }
        currentLabel = nextLabel;
        currentDirection = billiardsReflectDirection(currentDirection, residues[0]);
        currentSign = -currentSign;
        points.push({ a: currentPoint[0], b: currentPoint[1], n: currentLabel.n, k: currentLabel.k });
        continue;
      }
      break;
    }
    return points;
  }

  function billiardsInteriorFromSeeds(seeds, maxLabel, p) {
    const out = new Map();
    for (const seed of seeds.values()) {
      const directions = billiardsAlcoveStartDirections(seed, p);
      for (let copy = 0; copy < seed.count; copy += 1) {
        for (const direction of directions) {
          for (const point of billiardsAlcovePath(seed, direction, maxLabel, p)) {
            addBilliardsPoint(out, point, 1, "interior");
          }
        }
      }
    }
    return out;
  }

  function billiardsBuildData(p, maxLabel) {
    const generations = billiardsGenerateUpTo(maxLabel, p);
    const wallPoints = new Map();
    const seeds = new Map();
    let mergedEvents = 0;
    for (const generation of generations) {
      addBilliardsCounter(wallPoints, generation.points, 1, "wall");
      addBilliardsCounter(seeds, generation.seeds, 1, "seed");
      mergedEvents += generation.events.filter((event) => event.merged).length;
    }

    const interior = billiardsInteriorFromSeeds(seeds, maxLabel, p);
    const zTilde = new Map();
    addBilliardsCounter(zTilde, wallPoints, 1, "wall");
    addBilliardsCounter(zTilde, interior, 1, "interior");
    addBilliardsCounter(zTilde, billiardsInitialWall(Math.floor(maxLabel / 2) + 1), -1, "initial-wall");

    const records = billiardsCounterValues(zTilde)
      .filter((point) => point.count > 0 && point.n <= maxLabel)
      .map((point) => ({
        ...point,
        sourceList: Array.from(point.sources).sort(),
      }));
    return { generations, wallPoints, seeds, interior, records, mergedEvents };
  }

  function terminalWallIndex(a, b, p) {
    const record = window.BILLIARDS_BASE_CHARACTERS?.primes?.[String(p)]?.wall_strip?.[weightKey(a, b)];
    if (record?.wall_indices?.length) {
      return Math.max(...record.wall_indices);
    }
    // In a terminal strip, inclusive floors choose the maximal adjacent alcove
    // at a singular facet, rather than the alcove immediately to its left.
    return Math.floor((a + 1) / p) + Math.floor((b + 1) / p) + Math.floor((a + b + 2) / p);
  }

  function shiftedBoxContains(a, b, p) {
    return p - 1 <= a && a <= 2 * p - 2 && p - 1 <= b && b <= 2 * p - 2;
  }

  function isElementary(a, b, p) {
    if ((a === p - 1 && b < p - 1) || (b === p - 1 && a < p - 1)) {
      return true;
    }
    if (a + b <= p - 2) {
      return true;
    }
    if (0 <= a && a <= p - 2 && 0 <= b && b <= p - 2 && a + b >= p - 1) {
      return true;
    }
    return a === p - 1 && b === p - 1;
  }

  function classifyWeight(a, b, p, memo) {
    const key = weightKey(a, b);
    const cached = memo.get(key);
    if (cached) {
      return cached;
    }

    let result;
    if (a < 0 || b < 0) {
      result = {
        status: STATUS.unknown.key,
        reason: "not dominant",
        wallIndex: null,
      };
    } else if (shiftedBoxContains(a, b, p)) {
      result = {
        status: STATUS.shiftedBox.key,
        reason: "shifted-box base region",
        wallIndex: null,
      };
    } else if (isElementary(a, b, p)) {
      result = {
        status: STATUS.elementary.key,
        reason: "bottom, first-adjacent, or Steinberg elementary case",
        wallIndex: null,
      };
    } else if (a >= p - 1 && b >= p - 1) {
      const quotientA = Math.floor((a - (p - 1)) / p);
      const quotientB = Math.floor((b - (p - 1)) / p);
      const quotient = classifyWeight(quotientA, quotientB, p, memo);
      if (quotient.status === STATUS.unknown.key) {
        result = {
          status: STATUS.unknown.key,
          reason: "Donkin quotient is not classified",
          wallIndex: quotient.wallIndex,
        };
      } else if (quotient.status === STATUS.wallOut.key) {
        result = {
          status: STATUS.wallOut.key,
          reason: "Donkin recursion reaches out-of-range wall data",
          wallIndex: quotient.wallIndex,
        };
      } else if (quotient.status === STATUS.wallSafe.key) {
        result = {
          status: STATUS.wallSafe.key,
          reason: "Donkin recursion reaches in-range wall data",
          wallIndex: quotient.wallIndex,
        };
      } else {
        result = {
          status: STATUS.donkinBase.key,
          reason: `Donkin recursion to (${quotientA},${quotientB})`,
          wallIndex: null,
        };
      }
    } else if (a < p || b < p) {
      const wallIndex = terminalWallIndex(a, b, p);
      result = {
        status: wallIndex < expectedWallLimit(p)
          ? STATUS.wallSafe.key
          : STATUS.wallOut.key,
        reason: "terminal wall-strip reduction to Billiards wall data",
        wallIndex,
      };
    } else {
      result = {
        status: STATUS.unknown.key,
        reason: "outside implemented browser-side range model",
        wallIndex: null,
      };
    }

    memo.set(key, result);
    return result;
  }

  function memoForPrime(p) {
    let memo = state.classificationMemos.get(p);
    if (!memo) {
      memo = new Map();
      state.classificationMemos.set(p, memo);
    }
    return memo;
  }

  function classifyRecord(a, b) {
    return classifyRecordForPrime(a, b, state.p);
  }

  function classifyRecordForPrime(a, b, p) {
    const classification = classifyWeight(a, b, p, memoForPrime(p));
    return {
      a,
      b,
      key: weightKey(a, b),
      status: classification.status,
      reason: classification.reason,
      wallIndex: classification.wallIndex,
    };
  }

  function configureInitialView() {
    const p = state.p;
    const requestedMaxCoordinate = state.windowMode === "local"
      ? 6 * p
      : state.maxCoordinate;
    let maxCoordinate;
    if (state.windowMode === "local") {
      maxCoordinate = 6 * p;
    } else if (state.windowMode === "strips") {
      maxCoordinate = Math.max(6 * p, state.maxCoordinate);
    } else {
      maxCoordinate = state.maxCoordinate;
    }

    const maxX = 1.5 * maxCoordinate;
    const maxY = SQRT3_OVER_2 * maxCoordinate;
    state.records = [];
    state.recordMap = new Map();
    state.counts = new Map();
    state.bounds = { maxCoordinate, maxX, maxY };
    state.requestedMaxCoordinate = requestedMaxCoordinate;
    const displayedCoordinate = state.maxCoordinate;
    maxCoordinateNumber.value = String(displayedCoordinate);
    maxCoordinateInput.value = String(
      clamp(
        Number(maxCoordinateInput.min),
        Number(maxCoordinateInput.max),
        displayedCoordinate
      )
    );
    const coordinateDisabled = state.windowMode === "local";
    maxCoordinateInput.disabled = coordinateDisabled;
    maxCoordinateNumber.disabled = coordinateDisabled;
  }

  function visibleWeightBounds() {
    const margin = 12;
    const corners = [
      triangularToWeight(screenToWorld(-margin, -margin)),
      triangularToWeight(screenToWorld(state.width + margin, -margin)),
      triangularToWeight(screenToWorld(-margin, state.height + margin)),
      triangularToWeight(screenToWorld(state.width + margin, state.height + margin)),
    ];
    return {
      minA: Math.max(0, Math.floor(Math.min(...corners.map((point) => point.a))) - 2),
      maxA: Math.max(0, Math.ceil(Math.max(...corners.map((point) => point.a))) + 2),
      minB: Math.max(0, Math.floor(Math.min(...corners.map((point) => point.b))) - 2),
      maxB: Math.max(0, Math.ceil(Math.max(...corners.map((point) => point.b))) + 2),
    };
  }

  function computeVisibleRecords() {
    const bounds = visibleWeightBounds();
    const width = Math.max(0, bounds.maxA - bounds.minA + 1);
    const height = Math.max(0, bounds.maxB - bounds.minB + 1);
    const estimate = width * height;
    const stride = Math.max(1, Math.ceil(Math.sqrt(estimate / VIEWPORT_RECORD_BUDGET)));
    const records = [];
    const recordMap = new Map();
    const counts = new Map();

    for (let a = bounds.minA; a <= bounds.maxA; a += stride) {
      for (let b = bounds.minB; b <= bounds.maxB; b += stride) {
        const screen = worldToScreen(triangularXY(a, b));
        if (
          screen.x < -8 ||
          screen.x > state.width + 8 ||
          screen.y < -8 ||
          screen.y > state.height + 8
        ) {
          continue;
        }
        const record = classifyRecord(a, b);
        records.push(record);
        recordMap.set(record.key, record);
        counts.set(record.status, (counts.get(record.status) || 0) + 1);
      }
    }

    state.records = records;
    state.recordMap = recordMap;
    state.counts = counts;
    state.viewportStride = stride;
    state.viewportDominantPointEstimate = estimate;
    state.visibleBounds = bounds;
  }

  function tiltingTraceForWeight(a, b, p) {
    const steps = [];
    const highlighted = new Map();
    let current = { a, b };
    const seen = new Set();

    for (let depth = 0; depth < 24; depth += 1) {
      const key = weightKey(current.a, current.b);
      if (seen.has(key)) {
        steps.push({
          type: "stop",
          weight: current,
          text: `stop at (${current.a},${current.b}); recursion repeated`,
        });
        break;
      }
      seen.add(key);
      highlighted.set(key, { ...current, role: depth === 0 ? "selected" : "recursive", index: depth + 1 });

      const classification = classifyRecordForPrime(current.a, current.b, p);
      if (classification.status === STATUS.shiftedBox.key) {
        steps.push({
          type: "base",
          weight: current,
          text: `T(${current.a},${current.b}) is shifted-box input.`,
        });
        break;
      }
      if (classification.status === STATUS.elementary.key) {
        steps.push({
          type: "base",
          weight: current,
          text: `T(${current.a},${current.b}) is elementary alcove/facet data.`,
        });
        break;
      }

      if (current.a >= p - 1 && current.b >= p - 1) {
        const r1 = (current.a - (p - 1)) % p;
        const r2 = (current.b - (p - 1)) % p;
        const shifted = { a: p - 1 + r1, b: p - 1 + r2 };
        const quotient = {
          a: Math.floor((current.a - (p - 1)) / p),
          b: Math.floor((current.b - (p - 1)) / p),
        };
        highlighted.set(weightKey(shifted.a, shifted.b), {
          ...shifted,
          role: "shifted",
          index: depth + 1,
        });
        steps.push({
          type: "donkin",
          weight: current,
          shifted,
          quotient,
          text: `Donkin split: (${current.a},${current.b})=(${shifted.a},${shifted.b})+${p}(${quotient.a},${quotient.b}).`,
        });
        current = quotient;
        continue;
      }

      if (current.a < p || current.b < p) {
        const wallIndex = terminalWallIndex(current.a, current.b, p);
        const safe = wallIndex < expectedWallLimit(p);
        steps.push({
          type: "wall",
          weight: current,
          wallIndex,
          safe,
          text: `Terminal wall strip: reduce T(${current.a},${current.b}) to Billiards wall data ζ_${wallIndex}; ${safe ? "inside" : "outside"} i<${expectedWallLimit(p)}.`,
        });
        break;
      }

      steps.push({
        type: "unknown",
        weight: current,
        text: `No browser-side reduction rule applied to (${current.a},${current.b}).`,
      });
      break;
    }

    return {
      selected: { a, b },
      steps,
      highlighted: Array.from(highlighted.values()),
    };
  }

  function syncControls() {
    state.p = Number(primeSelect.value);
    state.windowMode = windowSelect.value;
    state.maxCoordinate = integerInputValue(maxCoordinateNumber, 120, 1, 10000);
    state.dotSize = Number(dotSizeInput.value);
    state.showWeightGrid = showWeightGridInput.checked;
    state.showAlcoves = showAlcovesInput.checked;
    state.showShiftedBox = showShiftedBoxInput.checked;
    state.showAxisLabels = showAxisLabelsInput.checked;
    primeSelect.value = String(state.p);
    maxCoordinateNumber.value = String(state.maxCoordinate);
    dotSizeValue.textContent = String(state.dotSize);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      state.width = width;
      state.height = height;
      state.viewNeedsReset = true;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (rangeHoverCanvas.width !== pixelWidth || rangeHoverCanvas.height !== pixelHeight) {
      rangeHoverCanvas.width = pixelWidth;
      rangeHoverCanvas.height = pixelHeight;
    }
    rangeHoverCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function fitView() {
    const pad = 34;
    const usableWidth = Math.max(1, state.width - 2 * pad);
    const usableHeight = Math.max(1, state.height - 2 * pad);
    const scaleX = usableWidth / Math.max(1, state.bounds.maxX);
    const scaleY = usableHeight / Math.max(1, state.bounds.maxY);
    const fittedScale = Math.max(0.01, Math.min(scaleX, scaleY));
    state.minScale = Math.max(0.01, fittedScale / MAX_ZOOM_OUT_FACTOR);
    state.scale = fittedScale;
    state.offsetX = pad;
    state.offsetY = state.height - pad;
    state.viewNeedsReset = false;
  }

  function worldToScreen(point) {
    return {
      x: state.offsetX + point.x * state.scale,
      y: state.offsetY - point.y * state.scale,
    };
  }

  function screenToWorld(x, y) {
    return {
      x: (x - state.offsetX) / state.scale,
      y: (state.offsetY - y) / state.scale,
    };
  }

  function drawWeightLine(a0, b0, a1, b1, style) {
    const start = worldToScreen(triangularXY(a0, b0));
    const end = worldToScreen(triangularXY(a1, b1));
    ctx.save();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.setLineDash(style.dash || []);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawWeightLatticeGrid() {
    const margin = 80;
    const corners = [
      triangularToWeight(screenToWorld(-margin, -margin)),
      triangularToWeight(screenToWorld(state.width + margin, -margin)),
      triangularToWeight(screenToWorld(-margin, state.height + margin)),
      triangularToWeight(screenToWorld(state.width + margin, state.height + margin)),
    ];
    const minA = Math.min(...corners.map((point) => point.a));
    const maxA = Math.max(...corners.map((point) => point.a));
    const minB = Math.min(...corners.map((point) => point.b));
    const maxB = Math.max(...corners.map((point) => point.b));
    const minTotal = Math.min(...corners.map((point) => point.a + point.b));
    const maxTotal = Math.max(...corners.map((point) => point.a + point.b));
    const span = Math.max(maxA - minA, maxB - minB, maxTotal - minTotal, 1);
    const extra = span + 8;
    const targetSpacing = 8;
    const stride = Math.max(1, Math.ceil(targetSpacing / Math.max(state.scale, 0.1)));
    const lineStyle = { color: "#e8ebf1", width: 0.65 };

    for (
      let a = Math.floor(minA / stride) * stride;
      a <= Math.ceil(maxA);
      a += stride
    ) {
      drawWeightLine(a, minB - extra, a, maxB + extra, lineStyle);
    }

    for (
      let b = Math.floor(minB / stride) * stride;
      b <= Math.ceil(maxB);
      b += stride
    ) {
      drawWeightLine(minA - extra, b, maxA + extra, b, lineStyle);
    }

    for (
      let total = Math.floor(minTotal / stride) * stride;
      total <= Math.ceil(maxTotal);
      total += stride
    ) {
      drawWeightLine(
        minA - extra,
        total - (minA - extra),
        maxA + extra,
        total - (maxA + extra),
        lineStyle
      );
    }
  }

  function drawAlcoveGrid() {
    const p = state.p;
    const wallStyle = { color: "#c5c9d3", width: 1.6 };
    const axisStyle = { color: "#202020", width: 1.6 };
    const margin = 80;
    const corners = [
      triangularToWeight(screenToWorld(-margin, -margin)),
      triangularToWeight(screenToWorld(state.width + margin, -margin)),
      triangularToWeight(screenToWorld(-margin, state.height + margin)),
      triangularToWeight(screenToWorld(state.width + margin, state.height + margin)),
    ];
    const minA = Math.min(...corners.map((point) => point.a));
    const maxA = Math.max(...corners.map((point) => point.a));
    const minB = Math.min(...corners.map((point) => point.b));
    const maxB = Math.max(...corners.map((point) => point.b));
    const minTotal = Math.min(...corners.map((point) => point.a + point.b));
    const maxTotal = Math.max(...corners.map((point) => point.a + point.b));
    const span = Math.max(maxA - minA, maxB - minB, maxTotal - minTotal, 1);
    const extra = span + 8;

    if (minB - extra <= 0 && 0 <= maxB + extra) {
      drawWeightLine(minA - extra, 0, maxA + extra, 0, axisStyle);
    }
    if (minA - extra <= 0 && 0 <= maxA + extra) {
      drawWeightLine(0, minB - extra, 0, maxB + extra, axisStyle);
    }

    const firstA = Math.floor((minA + 1) / p) - 1;
    const lastA = Math.ceil((maxA + 1) / p) + 1;
    for (let level = firstA; level <= lastA; level += 1) {
      const a = p * level - 1;
      if (a !== 0) {
        drawWeightLine(a, minB - extra, a, maxB + extra, wallStyle);
      }
    }

    const firstB = Math.floor((minB + 1) / p) - 1;
    const lastB = Math.ceil((maxB + 1) / p) + 1;
    for (let level = firstB; level <= lastB; level += 1) {
      const b = p * level - 1;
      if (b !== 0) {
        drawWeightLine(minA - extra, b, maxA + extra, b, wallStyle);
      }
    }

    const firstTotal = Math.floor((minTotal + 2) / p) - 1;
    const lastTotal = Math.ceil((maxTotal + 2) / p) + 1;
    for (let level = firstTotal; level <= lastTotal; level += 1) {
      const total = p * level - 2;
      if (total !== 0) {
        drawWeightLine(
          minA - extra,
          total - (minA - extra),
          maxA + extra,
          total - (maxA + extra),
          wallStyle
        );
      }
    }
  }

  function drawDominantAxes() {
    const axisStyle = { color: "#202020", width: 1.8, dash: [] };
    const margin = 80;
    const corners = [
      triangularToWeight(screenToWorld(-margin, -margin)),
      triangularToWeight(screenToWorld(state.width + margin, -margin)),
      triangularToWeight(screenToWorld(-margin, state.height + margin)),
      triangularToWeight(screenToWorld(state.width + margin, state.height + margin)),
    ];
    const minA = Math.min(...corners.map((point) => point.a));
    const maxA = Math.max(...corners.map((point) => point.a));
    const minB = Math.min(...corners.map((point) => point.b));
    const maxB = Math.max(...corners.map((point) => point.b));
    const span = Math.max(maxA - minA, maxB - minB, 1);
    const extra = span + 8;

    if (minB - extra <= 0 && 0 <= maxB + extra) {
      drawWeightLine(minA - extra, 0, maxA + extra, 0, axisStyle);
    }
    if (minA - extra <= 0 && 0 <= maxA + extra) {
      drawWeightLine(0, minB - extra, 0, maxB + extra, axisStyle);
    }
  }

  function drawShiftedBox() {
    const p = state.p;
    const lo = p - 1;
    const hi = 2 * p - 2;
    const corners = [
      triangularXY(lo, lo),
      triangularXY(hi, lo),
      triangularXY(hi, hi),
      triangularXY(lo, hi),
    ].map(worldToScreen);

    ctx.save();
    ctx.fillStyle = "rgba(124, 58, 237, 0.08)";
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i += 1) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function rangeDotRadius() {
    return Math.max(0.6, Math.min(
      state.scale * 0.24,
      state.dotSize * Math.sqrt(clamp(0.65, 2.25, state.scale / 8)),
      state.records.length > 65000 ? 1.5 : 12
    ));
  }

  function drawRecords() {
    const radius = rangeDotRadius();

    for (const statusKey of STATUS_ORDER) {
      const status = PALETTE_BY_STATUS[statusKey];
      if (!status) {
        continue;
      }
      ctx.save();
      ctx.fillStyle = status.color;
      ctx.globalAlpha = statusKey === STATUS.unknown.key ? 0.52 : 1;
      ctx.beginPath();

      for (const record of state.records) {
        if (record.status !== statusKey) {
          continue;
        }
        const screen = worldToScreen(triangularXY(record.a, record.b));
        if (
          screen.x < -8 ||
          screen.x > state.width + 8 ||
          screen.y < -8 ||
          screen.y > state.height + 8
        ) {
          continue;
        }
        ctx.moveTo(screen.x + radius, screen.y);
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }
  }

  function drawAxisLabels() {
    const origin = worldToScreen(triangularXY(0, 0));
    const omega1Tip = worldToScreen(triangularXY(1.65, 0));
    const omega2Tip = worldToScreen(triangularXY(0, 1.65));
    const arrowLength = 36;

    function drawArrow(start, end) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.hypot(dx, dy);
      if (length < 1) {
        return;
      }
      const ux = dx / length;
      const uy = dy / length;
      const tip = {
        x: start.x + ux * Math.min(length, arrowLength),
        y: start.y + uy * Math.min(length, arrowLength),
      };
      const size = 5;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(
        tip.x - ux * size - uy * size * 0.55,
        tip.y - uy * size + ux * size * 0.55
      );
      ctx.lineTo(
        tip.x - ux * size + uy * size * 0.55,
        tip.y - uy * size - ux * size * 0.55
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.save();
    ctx.fillStyle = "#151515";
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = 1.25;
    drawArrow(origin, omega1Tip);
    drawArrow(origin, omega2Tip);
    ctx.font = "16px 'Libertinus Serif', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("ω₁", origin.x + 44, origin.y + 10);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("ω₂", origin.x - 11, origin.y - 39);
    ctx.restore();
  }

  function draw() {
    resizeCanvas();
    if (state.viewNeedsReset) {
      fitView();
    }
    computeVisibleRecords();
    updateLegend();
    updateCaption();
    updateRangeWarning();

    ctx.save();
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.restore();

    if (state.showWeightGrid) {
      drawWeightLatticeGrid();
    }
    if (state.showAlcoves) {
      drawAlcoveGrid();
    }
    if (state.showShiftedBox) {
      drawShiftedBox();
    }
    drawRecords();
    drawDominantAxes();
    if (state.showAxisLabels) {
      drawAxisLabels();
    }
  }

  function updateLegend() {
    const parts = [];
    for (const statusKey of STATUS_ORDER) {
      const count = state.counts.get(statusKey) || 0;
      if (!count) {
        continue;
      }
      const status = PALETTE_BY_STATUS[statusKey];
      parts.push(
        `<span class="legend-item"><span class="swatch" style="background:${status.color}"></span>` +
        `<span>${status.label} (${count})</span></span>`
      );
    }
    legend.innerHTML = parts.join("");
  }

  function drawHoverWeight() {
    rangeHoverCtx.clearRect(0, 0, state.width, state.height);
    if (!state.hoverWeight || state.dragging) {
      return;
    }
    const { a, b } = state.hoverWeight;
    const screen = worldToScreen(triangularXY(a, b));
    rangeHoverCtx.save();
    rangeHoverCtx.fillStyle = "rgba(34,197,94,0.12)";
    rangeHoverCtx.strokeStyle = "#16a34a";
    rangeHoverCtx.lineWidth = 2.4;
    rangeHoverCtx.beginPath();
    rangeHoverCtx.arc(screen.x, screen.y, Math.max(8.5, state.dotSize + 3), 0, Math.PI * 2);
    rangeHoverCtx.fill();
    rangeHoverCtx.stroke();
    rangeHoverCtx.restore();
  }

  function updateCaption() {
    drawHoverWeight();
    const p = state.p;
    if (state.hoverWeight) {
      const { a, b } = state.hoverWeight;
      const record = state.recordMap.get(weightKey(a, b)) || classifyRecord(a, b);
      const status = PALETTE_BY_STATUS[record.status];
      const wallText = record.wallIndex === null
        ? "no Billiards wall index"
        : `Billiards wall index \\(i=${record.wallIndex}\\)`;
      caption.innerHTML = `\\((${a},${b})\\): ${escapeHtml(status.label)}; ${wallText}; ${escapeHtml(record.reason)}.`;
      renderLatex(caption);
      return;
    }
    const modeText = {
      local: `reset view \\(0 \\leq a,b \\leq ${state.bounds.maxCoordinate}\\)`,
      strips: `reset view is scaled to terminal strips up to coordinate ${state.bounds.maxCoordinate}`,
      square: `reset view \\(0 \\leq a,b \\leq ${state.bounds.maxCoordinate}\\)`,
    }[state.windowMode];
    const wallIndices = state.records
      .map((record) => record.wallIndex)
      .filter((index) => index !== null);
    const maxWallIndex = wallIndices.length ? Math.max(...wallIndices) : "-";
    const maxWallText = wallIndices.length ? `\\(i=${maxWallIndex}\\)` : "none";
    const samplingText = state.viewportStride > 1
      ? `sampled every ${state.viewportStride} lattice steps`
      : "exact visible lattice points";
    caption.innerHTML = `\\(p=${p}\\); ${modeText}; ${samplingText}; expected Billiards wall-index range \\(i < ${expectedWallLimit(p)}\\); max visible ${maxWallText}.`;
    renderLatex(caption);
  }

  function updateRangeWarning() {
    const notes = [];
    if (state.p >= 11) {
      notes.push("For large visual checks, smaller primes such as \\(p=3,5,7\\) usually show the structure more clearly.");
    }
    if (state.requestedMaxCoordinate >= 1000) {
      notes.push("Large coordinate windows can be slow; use moderate coordinate bounds first.");
    }
    if (state.viewportStride > 1) {
      notes.push(`The current viewport contains about ${state.viewportDominantPointEstimate.toLocaleString()} dominant lattice points, so the display is sampled.`);
    }
    if (!notes.length) {
      rangeWarning.classList.add("is-hidden");
      rangeWarning.textContent = "";
      return;
    }
    rangeWarning.classList.remove("is-hidden");
    rangeWarning.innerHTML = notes.join(" ");
    renderLatex(rangeWarning);
  }

  function updateCaptionFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const world = screenToWorld(x, y);
    const b = Math.round(world.y / SQRT3_OVER_2);
    const a = Math.round(world.x - 0.5 * b);
    if (x < 0 || y < 0 || x > rect.width || y > rect.height || a < 0 || b < 0) {
      if (state.hoverWeight) {
        state.hoverWeight = null;
        updateCaption();
      }
      return;
    }
    if (state.hoverWeight && state.hoverWeight.a === a && state.hoverWeight.b === b) {
      return;
    }
    state.hoverWeight = { a, b };
    updateCaption();
  }

  function tiltingSyncControls() {
    tiltingState.p = Number(tiltingPrimeSelect.value);
    tiltingState.maxCoordinate = integerInputValue(
      tiltingMaxCoordinateNumber,
      60,
      1,
      2000
    );
    tiltingState.stepCircleSize = Number(tiltingStepCircleSizeInput.value);
    tiltingState.showWeightGrid = tiltingShowWeightGridInput.checked;
    tiltingState.showAlcoves = tiltingShowAlcovesInput.checked;
    tiltingState.showShiftedBox = tiltingShowShiftedBoxInput.checked;
    tiltingState.showStepLabels = tiltingShowStepLabelsInput.checked;
    tiltingPrimeSelect.value = String(tiltingState.p);
    tiltingMaxCoordinateNumber.value = String(tiltingState.maxCoordinate);
    tiltingStepCircleSizeValue.textContent = String(tiltingState.stepCircleSize);
  }

  function tiltingConfigureInitialView() {
    const maxCoordinate = tiltingState.maxCoordinate;
    tiltingState.bounds = {
      maxCoordinate,
      maxX: 1.5 * maxCoordinate,
      maxY: SQRT3_OVER_2 * maxCoordinate,
    };
    tiltingMaxCoordinateInput.value = String(
      clamp(
        Number(tiltingMaxCoordinateInput.min),
        Number(tiltingMaxCoordinateInput.max),
        maxCoordinate
      )
    );
  }

  function tiltingResizeCanvas() {
    const rect = tiltingCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (tiltingCanvas.width !== pixelWidth || tiltingCanvas.height !== pixelHeight) {
      tiltingCanvas.width = pixelWidth;
      tiltingCanvas.height = pixelHeight;
      tiltingState.width = width;
      tiltingState.height = height;
      tiltingState.viewNeedsReset = true;
    }
    tiltingCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function tiltingFitView() {
    const pad = 34;
    const usableWidth = Math.max(1, tiltingState.width - 2 * pad);
    const usableHeight = Math.max(1, tiltingState.height - 2 * pad);
    const scaleX = usableWidth / Math.max(1, tiltingState.bounds.maxX);
    const scaleY = usableHeight / Math.max(1, tiltingState.bounds.maxY);
    const fittedScale = Math.max(0.01, Math.min(scaleX, scaleY));
    tiltingState.minScale = Math.max(0.01, fittedScale / MAX_ZOOM_OUT_FACTOR);
    tiltingState.scale = fittedScale;
    tiltingState.offsetX = pad;
    tiltingState.offsetY = tiltingState.height - pad;
    tiltingState.viewNeedsReset = false;
  }

  function tiltingWorldToScreen(point) {
    return {
      x: tiltingState.offsetX + point.x * tiltingState.scale,
      y: tiltingState.offsetY - point.y * tiltingState.scale,
    };
  }

  function tiltingScreenToWorld(x, y) {
    return {
      x: (x - tiltingState.offsetX) / tiltingState.scale,
      y: (tiltingState.offsetY - y) / tiltingState.scale,
    };
  }

  function tiltingVisibleWeightBounds() {
    const margin = 12;
    const corners = [
      triangularToWeight(tiltingScreenToWorld(-margin, -margin)),
      triangularToWeight(tiltingScreenToWorld(tiltingState.width + margin, -margin)),
      triangularToWeight(tiltingScreenToWorld(-margin, tiltingState.height + margin)),
      triangularToWeight(tiltingScreenToWorld(tiltingState.width + margin, tiltingState.height + margin)),
    ];
    return {
      minA: Math.max(0, Math.floor(Math.min(...corners.map((point) => point.a))) - 2),
      maxA: Math.max(0, Math.ceil(Math.max(...corners.map((point) => point.a))) + 2),
      minB: Math.max(0, Math.floor(Math.min(...corners.map((point) => point.b))) - 2),
      maxB: Math.max(0, Math.ceil(Math.max(...corners.map((point) => point.b))) + 2),
    };
  }

  function tiltingDrawWeightLine(a0, b0, a1, b1, style) {
    const start = tiltingWorldToScreen(triangularXY(a0, b0));
    const end = tiltingWorldToScreen(triangularXY(a1, b1));
    tiltingCtx.save();
    tiltingCtx.strokeStyle = style.color;
    tiltingCtx.lineWidth = style.width;
    tiltingCtx.setLineDash(style.dash || []);
    tiltingCtx.beginPath();
    tiltingCtx.moveTo(start.x, start.y);
    tiltingCtx.lineTo(end.x, end.y);
    tiltingCtx.stroke();
    tiltingCtx.restore();
  }

  function tiltingViewportCorners(margin) {
    const corners = [
      triangularToWeight(tiltingScreenToWorld(-margin, -margin)),
      triangularToWeight(tiltingScreenToWorld(tiltingState.width + margin, -margin)),
      triangularToWeight(tiltingScreenToWorld(-margin, tiltingState.height + margin)),
      triangularToWeight(tiltingScreenToWorld(tiltingState.width + margin, tiltingState.height + margin)),
    ];
    const minA = Math.min(...corners.map((point) => point.a));
    const maxA = Math.max(...corners.map((point) => point.a));
    const minB = Math.min(...corners.map((point) => point.b));
    const maxB = Math.max(...corners.map((point) => point.b));
    const minTotal = Math.min(...corners.map((point) => point.a + point.b));
    const maxTotal = Math.max(...corners.map((point) => point.a + point.b));
    const span = Math.max(maxA - minA, maxB - minB, maxTotal - minTotal, 1);
    return { minA, maxA, minB, maxB, minTotal, maxTotal, extra: span + 8 };
  }

  function tiltingDrawWeightGrid() {
    const bounds = tiltingViewportCorners(80);
    const targetSpacing = 8;
    const stride = Math.max(1, Math.ceil(targetSpacing / Math.max(tiltingState.scale, 0.1)));
    const style = { color: "#e8ebf1", width: 0.65 };
    for (let a = Math.floor(bounds.minA / stride) * stride; a <= Math.ceil(bounds.maxA); a += stride) {
      tiltingDrawWeightLine(a, bounds.minB - bounds.extra, a, bounds.maxB + bounds.extra, style);
    }
    for (let b = Math.floor(bounds.minB / stride) * stride; b <= Math.ceil(bounds.maxB); b += stride) {
      tiltingDrawWeightLine(bounds.minA - bounds.extra, b, bounds.maxA + bounds.extra, b, style);
    }
    for (let total = Math.floor(bounds.minTotal / stride) * stride; total <= Math.ceil(bounds.maxTotal); total += stride) {
      tiltingDrawWeightLine(
        bounds.minA - bounds.extra,
        total - (bounds.minA - bounds.extra),
        bounds.maxA + bounds.extra,
        total - (bounds.maxA + bounds.extra),
        style
      );
    }
  }

  function tiltingDrawAlcoves() {
    const p = tiltingState.p;
    const bounds = tiltingViewportCorners(80);
    const wallStyle = { color: "#c5c9d3", width: 1.6, dash: [] };
    const axisStyle = { color: "#202020", width: 1.6, dash: [] };
    if (bounds.minB - bounds.extra <= 0 && 0 <= bounds.maxB + bounds.extra) {
      tiltingDrawWeightLine(bounds.minA - bounds.extra, 0, bounds.maxA + bounds.extra, 0, axisStyle);
    }
    if (bounds.minA - bounds.extra <= 0 && 0 <= bounds.maxA + bounds.extra) {
      tiltingDrawWeightLine(0, bounds.minB - bounds.extra, 0, bounds.maxB + bounds.extra, axisStyle);
    }
    for (let level = Math.floor((bounds.minA + 1) / p) - 1; level <= Math.ceil((bounds.maxA + 1) / p) + 1; level += 1) {
      const a = p * level - 1;
      if (a !== 0) {
        tiltingDrawWeightLine(a, bounds.minB - bounds.extra, a, bounds.maxB + bounds.extra, wallStyle);
      }
    }
    for (let level = Math.floor((bounds.minB + 1) / p) - 1; level <= Math.ceil((bounds.maxB + 1) / p) + 1; level += 1) {
      const b = p * level - 1;
      if (b !== 0) {
        tiltingDrawWeightLine(bounds.minA - bounds.extra, b, bounds.maxA + bounds.extra, b, wallStyle);
      }
    }
    for (let level = Math.floor((bounds.minTotal + 2) / p) - 1; level <= Math.ceil((bounds.maxTotal + 2) / p) + 1; level += 1) {
      const total = p * level - 2;
      if (total !== 0) {
        tiltingDrawWeightLine(
          bounds.minA - bounds.extra,
          total - (bounds.minA - bounds.extra),
          bounds.maxA + bounds.extra,
          total - (bounds.maxA + bounds.extra),
          wallStyle
        );
      }
    }
  }

  function tiltingDrawDominantAxes() {
    const bounds = tiltingViewportCorners(80);
    const axisStyle = { color: "#202020", width: 1.8, dash: [] };
    if (bounds.minB - bounds.extra <= 0 && 0 <= bounds.maxB + bounds.extra) {
      tiltingDrawWeightLine(bounds.minA - bounds.extra, 0, bounds.maxA + bounds.extra, 0, axisStyle);
    }
    if (bounds.minA - bounds.extra <= 0 && 0 <= bounds.maxA + bounds.extra) {
      tiltingDrawWeightLine(0, bounds.minB - bounds.extra, 0, bounds.maxB + bounds.extra, axisStyle);
    }
  }

  function tiltingDrawShiftedBox() {
    const p = tiltingState.p;
    const lo = p - 1;
    const hi = 2 * p - 2;
    const corners = [
      triangularXY(lo, lo),
      triangularXY(hi, lo),
      triangularXY(hi, hi),
      triangularXY(lo, hi),
    ].map(tiltingWorldToScreen);
    tiltingCtx.save();
    tiltingCtx.fillStyle = "rgba(124, 58, 237, 0.08)";
    tiltingCtx.strokeStyle = "#7c3aed";
    tiltingCtx.lineWidth = 1.8;
    tiltingCtx.setLineDash([]);
    tiltingCtx.lineJoin = "miter";
    tiltingCtx.beginPath();
    tiltingCtx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i += 1) {
      tiltingCtx.lineTo(corners[i].x, corners[i].y);
    }
    tiltingCtx.closePath();
    tiltingCtx.fill();
    tiltingCtx.stroke();
    tiltingCtx.restore();
  }

  function tiltingDrawLatticePoints() {
    const bounds = tiltingVisibleWeightBounds();
    const estimate = Math.max(0, bounds.maxA - bounds.minA + 1) * Math.max(0, bounds.maxB - bounds.minB + 1);
    const stride = Math.max(1, Math.ceil(Math.sqrt(estimate / 25000)));
    tiltingState.visibleBounds = bounds;
    tiltingCtx.save();
    tiltingCtx.fillStyle = "#cbd5e1";
    for (let a = bounds.minA; a <= bounds.maxA; a += stride) {
      for (let b = bounds.minB; b <= bounds.maxB; b += stride) {
        const screen = tiltingWorldToScreen(triangularXY(a, b));
        if (
          screen.x < -4 ||
          screen.x > tiltingState.width + 4 ||
          screen.y < -4 ||
          screen.y > tiltingState.height + 4
        ) {
          continue;
        }
        tiltingCtx.fillRect(screen.x - 1, screen.y - 1, 2, 2);
      }
    }
    tiltingCtx.restore();
  }

  function tiltingDrawTrace() {
    if (!tiltingState.trace) {
      return;
    }
    const palette = {
      selected: tiltingState.pinned ? "#dc2626" : "#0891b2",
      shifted: "#7c3aed",
      recursive: "#0369a1",
    };
    const stepCount = Math.max(
      1,
      ...tiltingState.trace.highlighted.map((point) => point.index)
    );
    tiltingCtx.save();
    tiltingCtx.textAlign = "center";
    tiltingCtx.textBaseline = "middle";
    for (const point of tiltingState.trace.highlighted) {
      const screen = tiltingWorldToScreen(triangularXY(point.a, point.b));
      const color = palette[point.role] || "#111827";
      const baseRadius = tiltingState.stepCircleSize;
      let radius = Math.max(
        3.5,
        baseRadius + 0.35 * (stepCount - point.index) - 0.75 * (point.index - 1)
      );
      if (tiltingState.showStepLabels) {
        radius = Math.max(radius, 6.2);
      }
      tiltingCtx.fillStyle = color;
      tiltingCtx.strokeStyle = color;
      tiltingCtx.lineWidth = point.role === "selected" ? 3 : 2.2;
      tiltingCtx.beginPath();
      tiltingCtx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
      tiltingCtx.fill();
      tiltingCtx.stroke();
      if (tiltingState.showStepLabels) {
        const digits = String(point.index);
        const labelSize = Math.min(10, Math.max(7, radius * (digits.length > 1 ? 0.78 : 0.95)));
        tiltingCtx.font = `${labelSize}px 'Fira Mono', monospace`;
        tiltingCtx.fillStyle = "#ffffff";
        tiltingCtx.fillText(digits, screen.x, screen.y + 0.5);
      }
    }
    tiltingCtx.restore();
  }

  function tiltingModuleFactorLatex(weight, twist) {
    const base = `T(${weight.a},${weight.b})`;
    return twist > 0 ? `${base}^{[${twist}]}` : base;
  }

  function tiltingDonkinFormulaHtml(trace) {
    const donkinSteps = trace.steps.filter((step) => step.type === "donkin");
    if (!donkinSteps.length) {
      return "";
    }
    const splitLines = donkinSteps.map((step) => (
      `T(${step.weight.a},${step.weight.b})` +
      `\\cong T(${step.shifted.a},${step.shifted.b})\\otimes ` +
      `T(${step.quotient.a},${step.quotient.b})^{[1]}`
    ));
    const finalStep = trace.steps[trace.steps.length - 1];
    const factors = donkinSteps.map((step, index) => (
      tiltingModuleFactorLatex(step.shifted, index)
    ));
    if (finalStep && finalStep.type !== "donkin" && finalStep.weight) {
      factors.push(tiltingModuleFactorLatex(finalStep.weight, donkinSteps.length));
    }
    const collapsed = factors.length > 1
      ? `T(${trace.selected.a},${trace.selected.b})\\cong ${factors.join("\\otimes ")}`
      : "";
    return [
      "<strong>Donkin tensor product formula</strong>",
      "<p>Here \\((-)^{[1]}\\) denotes Frobenius twist.</p>",
      ...splitLines.map((line) => `<div class="character-formula">\\[${line}\\]</div>`),
      collapsed
        ? `<p>Therefore, iterating the reduction steps gives</p><div class="character-formula">\\[${collapsed}\\]</div>`
        : "",
    ].join("");
  }

  function tiltingUpdateDetails() {
    if (!tiltingState.trace) {
      tiltingCaption.textContent = "Move over a lattice point to preview a computation.";
      tiltingDetails.textContent = "Move over a weight in the picture.";
      return;
    }
    const selected = tiltingState.trace.selected;
    const mode = tiltingState.pinned ? "Fixed" : "Preview";
    const action = tiltingState.pinned
      ? "Click this weight again to unfix it, or click another weight."
      : "Move over another weight to update; click to fix this computation.";
    tiltingCaption.innerHTML = `${mode} \\((a,b)=(${selected.a},${selected.b})\\). ${action}`;
    renderLatex(tiltingCaption);
    tiltingDetails.innerHTML = [
      `<strong>T(${selected.a},${selected.b})</strong>`,
      tiltingDonkinFormulaHtml(tiltingState.trace),
      "<strong>Reduction route</strong>",
      "<ol>",
      ...tiltingState.trace.steps.map((step) => `<li>${escapeHtml(step.text)}</li>`),
      "</ol>",
    ].join("");
    renderLatex(tiltingDetails);
  }

  function tiltingDraw() {
    tiltingResizeCanvas();
    if (tiltingState.viewNeedsReset) {
      tiltingFitView();
    }
    tiltingCtx.save();
    tiltingCtx.clearRect(0, 0, tiltingState.width, tiltingState.height);
    tiltingCtx.fillStyle = "#ffffff";
    tiltingCtx.fillRect(0, 0, tiltingState.width, tiltingState.height);
    tiltingCtx.restore();
    if (tiltingState.showWeightGrid) {
      tiltingDrawWeightGrid();
    }
    if (tiltingState.showAlcoves) {
      tiltingDrawAlcoves();
    }
    if (tiltingState.showShiftedBox) {
      tiltingDrawShiftedBox();
    }
    tiltingDrawLatticePoints();
    tiltingDrawTrace();
    tiltingDrawDominantAxes();
    tiltingUpdateDetails();
  }

  function tiltingPointerPoint(event) {
    const rect = tiltingCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function tiltingWeightFromPointer(point) {
    const world = tiltingScreenToWorld(point.x, point.y);
    const raw = triangularToWeight(world);
    return {
      a: Math.max(0, Math.round(raw.a)),
      b: Math.max(0, Math.round(raw.b)),
    };
  }

  function tiltingSetTrace(weight, pinned) {
    if (
      pinned &&
      tiltingState.pinned &&
      tiltingState.selected &&
      tiltingState.selected.a === weight.a &&
      tiltingState.selected.b === weight.b
    ) {
      tiltingState.pinned = false;
      tiltingState.trace = tiltingTraceForWeight(weight.a, weight.b, tiltingState.p);
      tiltingDraw();
      return;
    }
    if (
      tiltingState.selected &&
      tiltingState.selected.a === weight.a &&
      tiltingState.selected.b === weight.b &&
      tiltingState.pinned === pinned
    ) {
      return;
    }
    tiltingState.selected = weight;
    tiltingState.trace = tiltingTraceForWeight(weight.a, weight.b, tiltingState.p);
    tiltingState.pinned = pinned;
    tiltingDraw();
  }

  function tiltingRefresh(resetView) {
    tiltingSyncControls();
    tiltingConfigureInitialView();
    if (tiltingState.selected) {
      tiltingState.trace = tiltingTraceForWeight(
        tiltingState.selected.a,
        tiltingState.selected.b,
        tiltingState.p
      );
    }
    tiltingState.viewNeedsReset = Boolean(resetView);
    tiltingDraw();
  }

  function installTiltingEventHandlers() {
    const controls = [
      tiltingPrimeSelect,
      tiltingMaxCoordinateInput,
      tiltingMaxCoordinateNumber,
      tiltingStepCircleSizeInput,
      tiltingShowWeightGridInput,
      tiltingShowAlcovesInput,
      tiltingShowShiftedBoxInput,
      tiltingShowStepLabelsInput,
    ];
    for (const control of controls) {
      control.addEventListener("input", () => {
        if (control === tiltingMaxCoordinateInput) {
          tiltingMaxCoordinateNumber.value = tiltingMaxCoordinateInput.value;
        }
        if (control === tiltingMaxCoordinateNumber) {
          tiltingMaxCoordinateInput.value = String(
            clamp(
              Number(tiltingMaxCoordinateInput.min),
              Number(tiltingMaxCoordinateInput.max),
              integerInputValue(tiltingMaxCoordinateNumber, tiltingState.maxCoordinate, 1, 2000)
            )
          );
        }
        const resetView = control === tiltingPrimeSelect ||
          control === tiltingMaxCoordinateInput ||
          control === tiltingMaxCoordinateNumber;
        tiltingRefresh(resetView);
      });
    }
    tiltingResetViewButton.addEventListener("click", () => {
      tiltingState.viewNeedsReset = true;
      tiltingDraw();
    });
    tiltingCanvas.addEventListener("pointerdown", (event) => {
      tiltingState.dragging = true;
      tiltingState.moved = false;
      tiltingState.lastPointer = tiltingPointerPoint(event);
      tiltingCanvas.setPointerCapture(event.pointerId);
    });
    tiltingCanvas.addEventListener("pointermove", (event) => {
      const point = tiltingPointerPoint(event);
      if (tiltingState.dragging && tiltingState.lastPointer) {
        const dx = point.x - tiltingState.lastPointer.x;
        const dy = point.y - tiltingState.lastPointer.y;
        if (Math.hypot(dx, dy) > 2) {
          tiltingState.moved = true;
        }
        tiltingState.offsetX += dx;
        tiltingState.offsetY += dy;
        tiltingState.lastPointer = point;
        tiltingDraw();
      } else if (!tiltingState.pinned) {
        tiltingSetTrace(tiltingWeightFromPointer(point), false);
      }
    });
    tiltingCanvas.addEventListener("pointerup", (event) => {
      const point = tiltingPointerPoint(event);
      tiltingState.dragging = false;
      tiltingState.lastPointer = null;
      tiltingCanvas.releasePointerCapture(event.pointerId);
      if (!tiltingState.moved) {
        tiltingSetTrace(tiltingWeightFromPointer(point), true);
      }
    });
    tiltingCanvas.addEventListener("pointercancel", () => {
      tiltingState.dragging = false;
      tiltingState.lastPointer = null;
    });
    tiltingCanvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      const point = tiltingPointerPoint(event);
      const before = tiltingScreenToWorld(point.x, point.y);
      const sensitivity = event.deltaY > 0 ? 0.00035 : 0.001;
      const factor = Math.exp(-event.deltaY * sensitivity);
      tiltingState.scale = Math.max(
        tiltingState.minScale,
        Math.min(80, tiltingState.scale * factor)
      );
      const after = tiltingWorldToScreen(before);
      tiltingState.offsetX += point.x - after.x;
      tiltingState.offsetY += point.y - after.y;
      tiltingDraw();
    }, { passive: false });
    window.addEventListener("resize", () => {
      tiltingState.viewNeedsReset = true;
      tiltingDraw();
    });
  }

  function characterSyncControls() {
    characterState.p = Number(characterPrimeSelect.value);
    characterState.maxCoordinate = integerInputValue(
      characterMaxCoordinateNumber,
      characterState.maxCoordinate,
      1,
      10000
    );
    characterState.showWeightGrid = characterShowWeightGridInput.checked;
    characterState.showAlcoves = characterShowAlcovesInput.checked;
    characterState.showShiftedBox = characterShowShiftedBoxInput.checked;
    characterState.colourByCoefficient = characterColourByCoefficientInput.checked;
    characterState.showCoefficientLabels = characterShowCoefficientLabelsInput.checked;
    characterState.showFormula = characterShowFormulaInput.checked;
    characterPrimeSelect.value = String(characterState.p);
    characterMaxCoordinateNumber.value = String(characterState.maxCoordinate);
  }

  function characterConfigureInitialView() {
    const maxCoordinate = characterState.maxCoordinate;
    characterState.bounds = {
      maxCoordinate,
      maxX: 1.5 * maxCoordinate,
      maxY: SQRT3_OVER_2 * maxCoordinate,
    };
    characterMaxCoordinateInput.value = String(
      clamp(
        Number(characterMaxCoordinateInput.min),
        Number(characterMaxCoordinateInput.max),
        maxCoordinate
      )
    );
  }

  function characterResizeCanvas() {
    const rect = characterCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (characterCanvas.width !== pixelWidth || characterCanvas.height !== pixelHeight) {
      characterCanvas.width = pixelWidth;
      characterCanvas.height = pixelHeight;
      characterState.width = width;
      characterState.height = height;
      characterState.viewNeedsReset = true;
    }
    characterCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (characterHoverCanvas.width !== pixelWidth || characterHoverCanvas.height !== pixelHeight) {
      characterHoverCanvas.width = pixelWidth;
      characterHoverCanvas.height = pixelHeight;
    }
    characterHoverCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function characterFitView() {
    const pad = 34;
    const usableWidth = Math.max(1, characterState.width - 2 * pad);
    const usableHeight = Math.max(1, characterState.height - 2 * pad);
    const scaleX = usableWidth / Math.max(1, characterState.bounds.maxX);
    const scaleY = usableHeight / Math.max(1, characterState.bounds.maxY);
    const fittedScale = Math.max(0.01, Math.min(scaleX, scaleY));
    characterState.minScale = Math.max(0.01, fittedScale / MAX_ZOOM_OUT_FACTOR);
    characterState.scale = fittedScale;
    characterState.offsetX = pad;
    characterState.offsetY = characterState.height - pad;
    characterState.viewNeedsReset = false;
  }

  function characterWorldToScreen(point) {
    return {
      x: characterState.offsetX + point.x * characterState.scale,
      y: characterState.offsetY - point.y * characterState.scale,
    };
  }

  function characterScreenToWorld(x, y) {
    return {
      x: (x - characterState.offsetX) / characterState.scale,
      y: (characterState.offsetY - y) / characterState.scale,
    };
  }

  function characterViewportCorners(margin) {
    const corners = [
      triangularToWeight(characterScreenToWorld(-margin, -margin)),
      triangularToWeight(characterScreenToWorld(characterState.width + margin, -margin)),
      triangularToWeight(characterScreenToWorld(-margin, characterState.height + margin)),
      triangularToWeight(characterScreenToWorld(characterState.width + margin, characterState.height + margin)),
    ];
    const minA = Math.min(...corners.map((point) => point.a));
    const maxA = Math.max(...corners.map((point) => point.a));
    const minB = Math.min(...corners.map((point) => point.b));
    const maxB = Math.max(...corners.map((point) => point.b));
    const minTotal = Math.min(...corners.map((point) => point.a + point.b));
    const maxTotal = Math.max(...corners.map((point) => point.a + point.b));
    const span = Math.max(maxA - minA, maxB - minB, maxTotal - minTotal, 1);
    return { minA, maxA, minB, maxB, minTotal, maxTotal, extra: span + 8 };
  }

  function characterVisibleWeightBounds() {
    const corners = characterViewportCorners(12);
    return {
      minA: Math.max(0, Math.floor(corners.minA) - 2),
      maxA: Math.max(0, Math.ceil(corners.maxA) + 2),
      minB: Math.max(0, Math.floor(corners.minB) - 2),
      maxB: Math.max(0, Math.ceil(corners.maxB) + 2),
    };
  }

  function characterDrawWeightLine(a0, b0, a1, b1, style) {
    const start = characterWorldToScreen(triangularXY(a0, b0));
    const end = characterWorldToScreen(triangularXY(a1, b1));
    characterCtx.save();
    characterCtx.strokeStyle = style.color;
    characterCtx.lineWidth = style.width;
    characterCtx.setLineDash(style.dash || []);
    characterCtx.beginPath();
    characterCtx.moveTo(start.x, start.y);
    characterCtx.lineTo(end.x, end.y);
    characterCtx.stroke();
    characterCtx.restore();
  }

  function characterDrawWeightGrid() {
    const bounds = characterViewportCorners(80);
    const stride = Math.max(1, Math.ceil(8 / Math.max(characterState.scale, 0.1)));
    const style = { color: "#e8ebf1", width: 0.65 };
    for (let a = Math.floor(bounds.minA / stride) * stride; a <= Math.ceil(bounds.maxA); a += stride) {
      characterDrawWeightLine(a, bounds.minB - bounds.extra, a, bounds.maxB + bounds.extra, style);
    }
    for (let b = Math.floor(bounds.minB / stride) * stride; b <= Math.ceil(bounds.maxB); b += stride) {
      characterDrawWeightLine(bounds.minA - bounds.extra, b, bounds.maxA + bounds.extra, b, style);
    }
    for (let total = Math.floor(bounds.minTotal / stride) * stride; total <= Math.ceil(bounds.maxTotal); total += stride) {
      characterDrawWeightLine(
        bounds.minA - bounds.extra,
        total - (bounds.minA - bounds.extra),
        bounds.maxA + bounds.extra,
        total - (bounds.maxA + bounds.extra),
        style
      );
    }
  }

  function characterDrawAlcoves() {
    const p = characterState.p;
    const bounds = characterViewportCorners(80);
    const wallStyle = { color: "#c5c9d3", width: 1.6, dash: [] };
    const axisStyle = { color: "#202020", width: 1.6, dash: [] };
    if (bounds.minB - bounds.extra <= 0 && 0 <= bounds.maxB + bounds.extra) {
      characterDrawWeightLine(bounds.minA - bounds.extra, 0, bounds.maxA + bounds.extra, 0, axisStyle);
    }
    if (bounds.minA - bounds.extra <= 0 && 0 <= bounds.maxA + bounds.extra) {
      characterDrawWeightLine(0, bounds.minB - bounds.extra, 0, bounds.maxB + bounds.extra, axisStyle);
    }
    for (let level = Math.floor((bounds.minA + 1) / p) - 1; level <= Math.ceil((bounds.maxA + 1) / p) + 1; level += 1) {
      const a = p * level - 1;
      if (a !== 0) {
        characterDrawWeightLine(a, bounds.minB - bounds.extra, a, bounds.maxB + bounds.extra, wallStyle);
      }
    }
    for (let level = Math.floor((bounds.minB + 1) / p) - 1; level <= Math.ceil((bounds.maxB + 1) / p) + 1; level += 1) {
      const b = p * level - 1;
      if (b !== 0) {
        characterDrawWeightLine(bounds.minA - bounds.extra, b, bounds.maxA + bounds.extra, b, wallStyle);
      }
    }
    for (let level = Math.floor((bounds.minTotal + 2) / p) - 1; level <= Math.ceil((bounds.maxTotal + 2) / p) + 1; level += 1) {
      const total = p * level - 2;
      if (total !== 0) {
        characterDrawWeightLine(
          bounds.minA - bounds.extra,
          total - (bounds.minA - bounds.extra),
          bounds.maxA + bounds.extra,
          total - (bounds.maxA + bounds.extra),
          wallStyle
        );
      }
    }
  }

  function characterDrawDominantAxes() {
    const bounds = characterViewportCorners(80);
    const axisStyle = { color: "#202020", width: 1.8, dash: [] };
    if (bounds.minB - bounds.extra <= 0 && 0 <= bounds.maxB + bounds.extra) {
      characterDrawWeightLine(bounds.minA - bounds.extra, 0, bounds.maxA + bounds.extra, 0, axisStyle);
    }
    if (bounds.minA - bounds.extra <= 0 && 0 <= bounds.maxA + bounds.extra) {
      characterDrawWeightLine(0, bounds.minB - bounds.extra, 0, bounds.maxB + bounds.extra, axisStyle);
    }
  }

  function characterDrawShiftedBox() {
    const p = characterState.p;
    const lo = p - 1;
    const hi = 2 * p - 2;
    const corners = [
      triangularXY(lo, lo),
      triangularXY(hi, lo),
      triangularXY(hi, hi),
      triangularXY(lo, hi),
    ].map(characterWorldToScreen);
    characterCtx.save();
    characterCtx.fillStyle = "rgba(124, 58, 237, 0.08)";
    characterCtx.strokeStyle = "#7c3aed";
    characterCtx.lineWidth = 1.8;
    characterCtx.setLineDash([]);
    characterCtx.lineJoin = "miter";
    characterCtx.beginPath();
    characterCtx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i += 1) {
      characterCtx.lineTo(corners[i].x, corners[i].y);
    }
    characterCtx.closePath();
    characterCtx.fill();
    characterCtx.stroke();
    characterCtx.restore();
  }

  function characterDrawLatticePoints() {
    const bounds = characterVisibleWeightBounds();
    const estimate = Math.max(0, bounds.maxA - bounds.minA + 1) * Math.max(0, bounds.maxB - bounds.minB + 1);
    const stride = Math.max(1, Math.ceil(Math.sqrt(estimate / 25000)));
    characterState.visibleBounds = bounds;
    characterCtx.save();
    characterCtx.fillStyle = "#cbd5e1";
    for (let a = bounds.minA; a <= bounds.maxA; a += stride) {
      for (let b = bounds.minB; b <= bounds.maxB; b += stride) {
        const screen = characterWorldToScreen(triangularXY(a, b));
        if (
          screen.x < -4 ||
          screen.x > characterState.width + 4 ||
          screen.y < -4 ||
          screen.y > characterState.height + 4
        ) {
          continue;
        }
        characterCtx.fillRect(screen.x - 1, screen.y - 1, 2, 2);
      }
    }
    characterCtx.restore();
  }

  function characterSummandRecords() {
    const result = characterState.characterResult;
    if (!result || result.status !== "computed" || !result.character || result.outsideExpectedRange) {
      return [];
    }
    return Array.from(result.character.entries())
      .map(([key, coefficient]) => ({ weight: parseWeightKey(key), coefficient }))
      .filter((record) => record.coefficient)
      .sort((left, right) => {
        if (left.weight[0] !== right.weight[0]) {
          return left.weight[0] - right.weight[0];
        }
        return left.weight[1] - right.weight[1];
      });
  }

  function coefficientCircleStyle(coefficient) {
    const magnitude = Math.max(1, Math.abs(coefficient));
    if (!characterState.colourByCoefficient) {
      return {
        fill: "rgba(37, 99, 235, 0.48)",
        stroke: "#111827",
        text: "#111827",
      };
    }
    const hue = coefficient < 0
      ? 350
      : (220 + 43 * (magnitude - 1)) % 360;
    return {
      fill: `hsla(${hue}, 78%, 48%, 0.28)`,
      stroke: `hsl(${hue}, 78%, 38%)`,
      text: `hsl(${hue}, 78%, 30%)`,
    };
  }

  function characterDrawWeylSummands() {
    const summands = characterSummandRecords();
    if (!summands.length) {
      return;
    }
    characterCtx.save();
    characterCtx.font = "11px 'Fira Mono', monospace";
    characterCtx.textAlign = "left";
    characterCtx.textBaseline = "middle";
    for (const summand of summands) {
      const [a, b] = summand.weight;
      const screen = characterWorldToScreen(triangularXY(a, b));
      if (
        screen.x < -20 ||
        screen.x > characterState.width + 20 ||
        screen.y < -20 ||
        screen.y > characterState.height + 20
      ) {
        continue;
      }
      const coefficientMagnitude = Math.max(1, Math.abs(summand.coefficient));
      const radius = Math.min(18, 2.4 + 1.2 * (coefficientMagnitude - 1));
      const style = coefficientCircleStyle(summand.coefficient);
      characterCtx.fillStyle = style.fill;
      characterCtx.strokeStyle = style.stroke;
      characterCtx.lineWidth = 1.05;
      characterCtx.beginPath();
      characterCtx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
      characterCtx.fill();
      characterCtx.stroke();
      if (characterState.showCoefficientLabels && summand.coefficient !== 1) {
        characterCtx.fillStyle = style.text;
        characterCtx.fillText(String(summand.coefficient), screen.x + radius + 2, screen.y - radius);
      }
    }
    characterCtx.restore();
  }

  function sameCharacterWeight(left, right) {
    return Boolean(left && right && left.a === right.a && left.b === right.b);
  }

  function characterHoverMultiplicity(weight) {
    if (!weight || !characterState.selected) {
      return { state: "none", value: null };
    }
    if (characterState.characterLoading) {
      return { state: "loading", value: null };
    }
    const result = characterState.characterResult;
    if (!result || result.status !== "computed" || !result.character) {
      return { state: "unavailable", value: null };
    }
    return {
      state: "computed",
      value: result.character.get(weightKey(weight.a, weight.b)) || 0,
    };
  }

  function characterHoverText() {
    const hover = characterState.hoverWeight;
    if (!hover) {
      return "";
    }
    const multiplicity = characterHoverMultiplicity(hover);
    if (multiplicity.state === "computed") {
      return `Hover \\((${hover.a},${hover.b})\\), multiplicity \\(${multiplicity.value}\\).`;
    }
    if (multiplicity.state === "loading") {
      return `Hover \\((${hover.a},${hover.b})\\), multiplicity loading.`;
    }
    return `Hover \\((${hover.a},${hover.b})\\).`;
  }

  function characterDrawHoverWeight() {
    characterHoverCtx.clearRect(0, 0, characterState.width, characterState.height);
    const hover = characterState.hoverWeight;
    if (!hover || sameCharacterWeight(hover, characterState.selected)) {
      return;
    }
    const screen = characterWorldToScreen(triangularXY(hover.a, hover.b));
    characterHoverCtx.save();
    characterHoverCtx.fillStyle = "rgba(34,197,94,0.12)";
    characterHoverCtx.strokeStyle = "#16a34a";
    characterHoverCtx.lineWidth = 2.4;
    characterHoverCtx.beginPath();
    characterHoverCtx.arc(screen.x, screen.y, 8.5, 0, Math.PI * 2);
    characterHoverCtx.fill();
    characterHoverCtx.stroke();
    characterHoverCtx.restore();
  }

  function characterDrawSelectedWeight() {
    if (!characterState.selected) {
      return;
    }
    const screen = characterWorldToScreen(triangularXY(characterState.selected.a, characterState.selected.b));
    characterCtx.save();
    characterCtx.fillStyle = characterState.pinned ? "rgba(220,38,38,0.16)" : "rgba(34,197,94,0.12)";
    characterCtx.strokeStyle = characterState.pinned ? "#dc2626" : "#16a34a";
    characterCtx.lineWidth = 3;
    characterCtx.beginPath();
    characterCtx.arc(screen.x, screen.y, 9, 0, Math.PI * 2);
    characterCtx.fill();
    characterCtx.stroke();
    characterCtx.fillStyle = characterState.pinned ? "#b91c1c" : "#15803d";
    characterCtx.font = "13px 'Fira Mono', monospace";
    characterCtx.fillText(`T(${characterState.selected.a},${characterState.selected.b})`, screen.x + 11, screen.y - 11);
    characterCtx.restore();
  }

  function characterRangeWarningHtml(result, p = characterState.p) {
    if (!result || !result.outsideExpectedRange) {
      return "";
    }
    const wallText = result.wallIndex === null || result.wallIndex === undefined
      ? "the required terminal wall-strip input"
      : `Corresponding Billiards wall index \\(i=${result.wallIndex}\\)`;
    return [
      "<p class=\"computation-warning\">",
      `${wallText} is outside the expected Billiards range `,
      `\\(i<${expectedWallLimit(p)}\\).`,
      "</p>",
    ].join("");
  }

  function characterExportButtonHtml() {
    return [
      "<p>",
      "<button id=\"character-export-full\" type=\"button\" class=\"inline-action\">",
      "Export full character",
      "</button>",
      "</p>",
    ].join("");
  }

  function characterExportFull() {
    const selected = characterState.selected;
    const result = characterState.characterResult;
    if (!selected || !result || result.status !== "computed" || !result.character) {
      return;
    }
    const terms = sortedWeylCharacterTerms(result.character).map(({ weight, coefficient }) => ({
      delta: `Delta(${weight[0]},${weight[1]})`,
      weight,
      coefficient,
    }));
    const payload = {
      prime: characterState.p,
      tilting_weight: [selected.a, selected.b],
      basis: "Weyl characters Delta(a,b)",
      term_count: terms.length,
      computation: resultProvenance(result, characterState.p),
      formula: `ch T(${selected.a},${selected.b}) = ${formatWeylCharacterJs(result.character, null)}`,
      terms,
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tilting_character_p${characterState.p}_T_${selected.a}_${selected.b}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function characterUpdateDetails() {
    if (!characterState.selected) {
      const hoverText = characterHoverText();
      const htmlKey = `none:${hoverText}`;
      if (characterState.detailsHtml !== htmlKey) {
        characterCaption.innerHTML = hoverText || "Move over a lattice point to preview a tilting character.";
        characterDetails.innerHTML = hoverText || "Move over a weight in the picture.";
        characterState.detailsHtml = htmlKey;
        if (hoverText) {
          renderLatex(characterCaption);
          renderLatex(characterDetails);
        }
      }
      return;
    }
    const selected = characterState.selected;
    const mode = characterState.pinned ? "Fixed" : "Preview";
    const action = characterState.pinned
      ? "Click this weight again to unfix it, or click another weight."
      : "Move over another weight to update; click to fix this character.";
    let characterHtml = "<p>Computing Weyl summands from static Billiards data...</p>";
    if (characterState.characterError) {
      characterHtml = `<p>${escapeHtml(characterState.characterError)}</p>`;
    } else if (characterState.characterResult && !characterState.characterLoading) {
      const result = characterState.characterResult;
      const rangeWarning = characterRangeWarningHtml(result);
      if (rangeWarning) {
        characterHtml = rangeWarning;
      } else if (result.character && !characterState.showFormula) {
        characterHtml = [
          "<p>Tilting-character formula display is switched off.</p>",
          characterExportButtonHtml(),
        ].join("");
      } else if (result.character) {
        const termCount = result.character.size;
        const truncated = termCount > CHARACTER_FORMULA_DISPLAY_LIMIT;
        const exportHtml = characterExportButtonHtml();
        if (characterState.pinned) {
          characterHtml = [
            `<div class="character-formula">\\[\\operatorname{ch} T(${selected.a},${selected.b})=${formatWeylCharacterLatex(result.character, CHARACTER_FORMULA_DISPLAY_LIMIT)}\\]</div>`,
            truncated
              ? `<p>Showing the first ${CHARACTER_FORMULA_DISPLAY_LIMIT} of ${termCount} non-zero Weyl summands.</p>`
              : "",
            exportHtml,
          ].join("");
        } else {
          characterHtml = [
            `<p>${termCount} non-zero Weyl summands. Click to fix this character and show the formula.</p>`,
            truncated
              ? `<p>The displayed formula will be truncated at ${CHARACTER_FORMULA_DISPLAY_LIMIT} summands.</p>`
              : "",
            exportHtml,
          ].join("");
        }
      } else {
        const reasons = (result.reasons || [])
          .map((reason) => `<li>${escapeHtml(reason)}</li>`)
          .join("");
        characterHtml = [
          "<p>Tilting character unavailable for the current browser cache.</p>",
          reasons ? `<ol>${reasons}</ol>` : "",
        ].join("");
      }
    }
    const captionHtml = characterState.pinned
      ? `${mode} \\(T(${selected.a},${selected.b})\\). ${action} ${characterHoverText()}`
      : `${mode} T(${selected.a},${selected.b}). ${action} ${characterHoverText()}`;
    const detailsHtml = [
      `<strong>T(${selected.a},${selected.b})</strong>`,
      characterState.characterResult && !characterState.characterResult.outsideExpectedRange
        ? computationProvenanceHtml(characterState.characterResult, characterState.p)
        : "",
      characterHoverText() ? `<p>${characterHoverText()}</p>` : "",
      characterHtml,
    ].join("");
    const htmlKey = `${captionHtml}\n${detailsHtml}`;
    if (characterState.detailsHtml === htmlKey) {
      return;
    }
    characterCaption.innerHTML = captionHtml;
    characterDetails.innerHTML = detailsHtml;
    characterState.detailsHtml = htmlKey;
    if (captionHtml.includes("\\(") || captionHtml.includes("\\[")) {
      renderLatex(characterCaption);
    }
    if (detailsHtml.includes("\\(") || detailsHtml.includes("\\[")) {
      renderLatex(characterDetails);
    }
  }

  function characterDraw() {
    characterResizeCanvas();
    if (characterState.viewNeedsReset) {
      characterFitView();
    }
    characterCtx.save();
    characterCtx.clearRect(0, 0, characterState.width, characterState.height);
    characterCtx.fillStyle = "#ffffff";
    characterCtx.fillRect(0, 0, characterState.width, characterState.height);
    characterCtx.restore();
    if (characterState.showWeightGrid) {
      characterDrawWeightGrid();
    }
    if (characterState.showAlcoves) {
      characterDrawAlcoves();
    }
    if (characterState.showShiftedBox) {
      characterDrawShiftedBox();
    }
    characterDrawLatticePoints();
    characterDrawWeylSummands();
    characterDrawHoverWeight();
    characterDrawSelectedWeight();
    characterDrawDominantAxes();
    characterUpdateDetails();
  }

  function characterPointerPoint(event) {
    const rect = characterCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function characterWeightFromPointer(point) {
    const world = characterScreenToWorld(point.x, point.y);
    const raw = triangularToWeight(world);
    return {
      a: Math.max(0, Math.round(raw.a)),
      b: Math.max(0, Math.round(raw.b)),
    };
  }

  function characterCacheForPrime(p) {
    let cache = characterState.characterCaches.get(p);
    if (!cache) {
      cache = new Map();
      characterState.characterCaches.set(p, cache);
    }
    return cache;
  }

  function characterCancelHoverSchedule() {
    if (characterState.hoverTimer !== null) {
      window.clearTimeout(characterState.hoverTimer);
      characterState.hoverTimer = null;
    }
    characterState.pendingHoverWeight = null;
  }

  function characterSetHoverWeight(weight) {
    if (sameCharacterWeight(characterState.hoverWeight, weight)) {
      return;
    }
    characterState.hoverWeight = weight;
    characterState.detailsHtml = "";
    characterDrawHoverWeight();
    characterUpdateDetails();
  }

  function characterClearHoverWeight() {
    if (!characterState.hoverWeight) {
      return;
    }
    characterState.hoverWeight = null;
    characterState.detailsHtml = "";
    characterDrawHoverWeight();
    characterUpdateDetails();
  }

  function characterScheduleHoverWeight(weight) {
    characterState.pendingHoverWeight = weight;
    if (characterState.hoverTimer !== null) {
      return;
    }
    characterState.hoverTimer = window.setTimeout(() => {
      const pending = characterState.pendingHoverWeight;
      characterState.hoverTimer = null;
      characterState.pendingHoverWeight = null;
      if (!pending || characterState.pinned || characterState.dragging) {
        return;
      }
      characterSetWeight(pending, false);
    }, 90);
  }

  function characterSetWeight(weight, pinned) {
    if (pinned) {
      characterCancelHoverSchedule();
    }
    if (
      pinned &&
      characterState.pinned &&
      characterState.selected &&
      characterState.selected.a === weight.a &&
      characterState.selected.b === weight.b
    ) {
      characterState.pinned = false;
      characterDraw();
      return;
    }
    if (
      characterState.selected &&
      characterState.selected.a === weight.a &&
      characterState.selected.b === weight.b &&
      characterState.pinned === pinned
    ) {
      return;
    }
    characterState.selected = weight;
    characterState.pinned = pinned;
    characterComputeCharacter(weight);
    characterDraw();
  }

  async function characterComputeCharacter(weight) {
    const requestId = ++characterRequestId;
    const p = characterState.p;
    const key = weightKey(weight.a, weight.b);
    const cache = characterCacheForPrime(p);
    if (cache.has(key)) {
      characterState.characterLoading = false;
      characterState.characterResult = cache.get(key);
      characterState.characterError = null;
      return;
    }
    characterState.characterLoading = true;
    characterState.characterResult = null;
    characterState.characterError = null;
    try {
      const baseData = await loadBilliardsBaseData();
      if (requestId !== characterRequestId) {
        return;
      }
      const primeData = baseData.primes && baseData.primes[String(p)];
      if (!primeData) {
        const exported = Object.keys(baseData.primes || {}).join(", ") || "none";
        throw new Error(`No static Billiards base data is loaded for p=${p}. Exported primes: ${exported}.`);
      }
      const result = tiltingCharacterBrowser([weight.a, weight.b], p, primeData, cache, 0);
      if (
        requestId !== characterRequestId ||
        !characterState.selected ||
        characterState.selected.a !== weight.a ||
        characterState.selected.b !== weight.b
      ) {
        return;
      }
      characterState.characterResult = result;
    } catch (error) {
      if (requestId !== characterRequestId) {
        return;
      }
      characterState.characterError = `${String(error)}.`;
    } finally {
      if (requestId === characterRequestId) {
        characterState.characterLoading = false;
        characterDraw();
      }
    }
  }

  function characterRefresh(resetView) {
    characterCancelHoverSchedule();
    characterState.hoverWeight = null;
    characterSyncControls();
    characterConfigureInitialView();
    if (characterState.selected) {
      characterComputeCharacter(characterState.selected);
    } else {
      characterState.characterResult = null;
      characterState.characterError = null;
      characterState.characterLoading = false;
    }
    characterState.detailsHtml = "";
    characterState.viewNeedsReset = Boolean(resetView);
    characterDraw();
  }

  function installCharacterEventHandlers() {
    const controls = [
      characterPrimeSelect,
      characterMaxCoordinateInput,
      characterMaxCoordinateNumber,
      characterShowWeightGridInput,
      characterShowAlcovesInput,
      characterShowShiftedBoxInput,
      characterColourByCoefficientInput,
      characterShowCoefficientLabelsInput,
      characterShowFormulaInput,
    ];
    for (const control of controls) {
      control.addEventListener("input", () => {
        if (control === characterPrimeSelect) {
          const localCoordinate = 6 * Number(characterPrimeSelect.value);
          characterMaxCoordinateNumber.value = String(localCoordinate);
          characterMaxCoordinateInput.value = String(
            clamp(
              Number(characterMaxCoordinateInput.min),
              Number(characterMaxCoordinateInput.max),
              localCoordinate
            )
          );
        }
        if (control === characterMaxCoordinateInput) {
          characterMaxCoordinateNumber.value = characterMaxCoordinateInput.value;
        }
        if (control === characterMaxCoordinateNumber) {
          characterMaxCoordinateInput.value = String(
            clamp(
              Number(characterMaxCoordinateInput.min),
              Number(characterMaxCoordinateInput.max),
              integerInputValue(characterMaxCoordinateNumber, characterState.maxCoordinate, 1, 10000)
            )
          );
        }
        const resetView = control === characterPrimeSelect ||
          control === characterMaxCoordinateInput ||
          control === characterMaxCoordinateNumber;
        characterRefresh(resetView);
      });
    }
    characterResetViewButton.addEventListener("click", () => {
      characterState.viewNeedsReset = true;
      characterDraw();
    });
    characterDetails.addEventListener("click", (event) => {
      if (event.target && event.target.id === "character-export-full") {
        characterExportFull();
      }
    });
    characterCanvas.addEventListener("pointerdown", (event) => {
      characterState.dragging = true;
      characterState.moved = false;
      characterState.lastPointer = characterPointerPoint(event);
      characterCanvas.setPointerCapture(event.pointerId);
    });
    characterCanvas.addEventListener("pointermove", (event) => {
      const point = characterPointerPoint(event);
      if (characterState.dragging && characterState.lastPointer) {
        const dx = point.x - characterState.lastPointer.x;
        const dy = point.y - characterState.lastPointer.y;
        if (Math.hypot(dx, dy) > 2) {
          characterState.moved = true;
        }
        characterState.offsetX += dx;
        characterState.offsetY += dy;
        characterState.lastPointer = point;
        characterDraw();
      } else {
        const weight = characterWeightFromPointer(point);
        characterSetHoverWeight(weight);
        if (!characterState.pinned) {
          characterScheduleHoverWeight(weight);
        }
      }
    });
    characterCanvas.addEventListener("pointerup", (event) => {
      const point = characterPointerPoint(event);
      characterState.dragging = false;
      characterState.lastPointer = null;
      characterCanvas.releasePointerCapture(event.pointerId);
      if (!characterState.moved) {
        characterCancelHoverSchedule();
        characterSetWeight(characterWeightFromPointer(point), true);
      }
    });
    characterCanvas.addEventListener("pointercancel", () => {
      characterState.dragging = false;
      characterState.lastPointer = null;
      characterCancelHoverSchedule();
      characterClearHoverWeight();
    });
    characterCanvas.addEventListener("pointerleave", () => {
      if (!characterState.dragging) {
        characterCancelHoverSchedule();
        characterClearHoverWeight();
      }
    });
    characterCanvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      const point = characterPointerPoint(event);
      const before = characterScreenToWorld(point.x, point.y);
      const sensitivity = event.deltaY > 0 ? 0.00035 : 0.001;
      const factor = Math.exp(-event.deltaY * sensitivity);
      characterState.scale = Math.max(
        characterState.minScale,
        Math.min(80, characterState.scale * factor)
      );
      const after = characterWorldToScreen(before);
      characterState.offsetX += point.x - after.x;
      characterState.offsetY += point.y - after.y;
      characterDraw();
    }, { passive: false });
    window.addEventListener("resize", () => {
      characterState.viewNeedsReset = true;
      characterDraw();
    });
  }

  function formatPartition(parts) {
    return `(${parts.join(",")})`;
  }

  function formatSpecht(parts) {
    return `S^{${formatPartition(parts)}}`;
  }

  function formatSimple(parts) {
    return `D^{${formatPartition(parts)}}`;
  }

  function formatWeight(weight) {
    return `(${weight.a},${weight.b})`;
  }

  function weightArrayKey(weight) {
    return `${weight[0]},${weight[1]}`;
  }

  function objectWeightKey(weight) {
    return `${weight.a},${weight.b}`;
  }

  function addToCounter(counter, key, value) {
    if (!value) {
      return;
    }
    const next = (counter.get(key) || 0) + value;
    if (next) {
      counter.set(key, next);
    } else {
      counter.delete(key);
    }
  }

  function parseWeightKey(key) {
    const [a, b] = key.split(",").map((part) => Number.parseInt(part, 10));
    return [a, b];
  }

  const weylMonomialCache = new Map();
  const horizontalStripCache = new Map();
  const schurProductCache = new Map();
  const weylTensorLrCache = new Map();
  const frobeniusBasisCache = new Map();
  const PERMUTATIONS_3 = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];

  function weylModule(weight) {
    return new Map([[weightArrayKey(weight), 1]]);
  }

  function partitionKey(partition) {
    return `${partition[0]},${partition[1]},${partition[2]}`;
  }

  function parsePartitionKey(key) {
    return key.split(",").map((part) => Number.parseInt(part, 10));
  }

  function minimalPartitionForWeightArray(weight) {
    return [weight[0] + weight[1], weight[1], 0];
  }

  function weightFromPartition(partition) {
    return [partition[0] - partition[1], partition[1] - partition[2]];
  }

  function permutationSign(permutation) {
    let inversions = 0;
    for (let i = 0; i < permutation.length; i += 1) {
      for (let j = i + 1; j < permutation.length; j += 1) {
        if (permutation[i] > permutation[j]) {
          inversions += 1;
        }
      }
    }
    return inversions % 2 ? -1 : 1;
  }

  function horizontalStripExtensions(partition, degree) {
    if (degree < 0) {
      return [];
    }
    if (degree === 0) {
      return [partition];
    }
    const cacheKey = `${partitionKey(partition)}|${degree}`;
    const cached = horizontalStripCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const [first, second, third] = partition;
    const total = first + second + third + degree;
    const out = [];
    for (let newThird = third; newThird <= second; newThird += 1) {
      for (let newSecond = Math.max(second, newThird); newSecond <= first; newSecond += 1) {
        const newFirst = total - newSecond - newThird;
        if (newFirst < first || newFirst < newSecond) {
          continue;
        }
        out.push([newFirst, newSecond, newThird]);
      }
    }
    horizontalStripCache.set(cacheKey, out);
    return out;
  }

  function multiplyPartitionCharacterByH(character, degree) {
    if (degree < 0) {
      return new Map();
    }
    if (degree === 0) {
      return new Map(character);
    }
    const out = new Map();
    for (const [key, coefficient] of character.entries()) {
      const partition = parsePartitionKey(key);
      for (const target of horizontalStripExtensions(partition, degree)) {
        addToCounter(out, partitionKey(target), coefficient);
      }
    }
    return out;
  }

  function schurProductPartitions(left, right) {
    const cacheKey = `${partitionKey(left)}|${partitionKey(right)}`;
    const cached = schurProductCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const out = new Map();
    for (const permutation of PERMUTATIONS_3) {
      const sign = permutationSign(permutation);
      let character = new Map([[partitionKey(left), 1]]);
      for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
        const degree = right[rowIndex] - rowIndex + permutation[rowIndex];
        character = multiplyPartitionCharacterByH(character, degree);
        if (!character.size) {
          break;
        }
      }
      for (const [key, coefficient] of character.entries()) {
        addToCounter(out, key, sign * coefficient);
      }
    }
    schurProductCache.set(cacheKey, out);
    return out;
  }

  function weylBasisTensorLrTerms(leftWeight, rightWeight) {
    const cacheKey = `${weightArrayKey(leftWeight)}|${weightArrayKey(rightWeight)}`;
    const cached = weylTensorLrCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const leftPartition = minimalPartitionForWeightArray(leftWeight);
    const rightPartition = minimalPartitionForWeightArray(rightWeight);
    const out = new Map();
    for (const [partitionKeyValue, coefficient] of schurProductPartitions(leftPartition, rightPartition).entries()) {
      const weight = weightFromPartition(parsePartitionKey(partitionKeyValue));
      addToCounter(out, weightArrayKey(weight), coefficient);
    }
    weylTensorLrCache.set(cacheKey, out);
    return out;
  }

  function weylModuleMonomialTerms(weight) {
    const key = weightArrayKey(weight);
    const cached = weylMonomialCache.get(key);
    if (cached) {
      return cached;
    }
    const [a, b] = weight;
    const lam1 = a + b;
    const lam2 = b;
    const lam3 = 0;
    const total = lam1 + lam2 + lam3;
    const out = new Map();
    for (let mid1 = lam2; mid1 <= lam1; mid1 += 1) {
      for (let mid2 = lam3; mid2 <= lam2; mid2 += 1) {
        for (let low = mid2; low <= mid1; low += 1) {
          const content1 = low;
          const content2 = mid1 + mid2 - low;
          const content3 = total - mid1 - mid2;
          addToCounter(out, `${content1 - content2},${content2 - content3}`, 1);
        }
      }
    }
    weylMonomialCache.set(key, out);
    return out;
  }

  function isDominantWeightArray(weight) {
    return weight[0] >= 0 && weight[1] >= 0;
  }

  function dominanceGeqArray(left, right) {
    const delta0 = left[0] - right[0];
    const delta1 = left[1] - right[1];
    const alpha1Numerator = 2 * delta0 + delta1;
    const alpha2Numerator = delta0 + 2 * delta1;
    return alpha1Numerator >= 0 &&
      alpha2Numerator >= 0 &&
      alpha1Numerator % 3 === 0 &&
      alpha2Numerator % 3 === 0;
  }

  function maximalDominantWeight(terms) {
    const dominant = Array.from(terms.entries())
      .filter(([_key, coefficient]) => coefficient)
      .map(([key]) => parseWeightKey(key))
      .filter(isDominantWeightArray);
    if (!dominant.length) {
      return null;
    }
    const maximals = dominant.filter((weight) => !dominant.some(
      (other) => (
        (other[0] !== weight[0] || other[1] !== weight[1]) &&
        dominanceGeqArray(other, weight)
      )
    ));
    maximals.sort((left, right) => {
      const height = (right[0] + right[1]) - (left[0] + left[1]);
      if (height) {
        return height;
      }
      if (right[0] !== left[0]) {
        return right[0] - left[0];
      }
      return right[1] - left[1];
    });
    return maximals[0];
  }

  function weylToMonomial(character) {
    const out = new Map();
    for (const [key, coefficient] of character.entries()) {
      const moduleTerms = weylModuleMonomialTerms(parseWeightKey(key));
      for (const [weightKeyValue, multiplicity] of moduleTerms.entries()) {
        addToCounter(out, weightKeyValue, coefficient * multiplicity);
      }
    }
    return out;
  }

  function tensorMonomial(left, right) {
    const out = new Map();
    for (const [leftKey, leftCoefficient] of left.entries()) {
      const leftWeight = parseWeightKey(leftKey);
      for (const [rightKey, rightCoefficient] of right.entries()) {
        const rightWeight = parseWeightKey(rightKey);
        addToCounter(
          out,
          `${leftWeight[0] + rightWeight[0]},${leftWeight[1] + rightWeight[1]}`,
          leftCoefficient * rightCoefficient
        );
      }
    }
    return out;
  }

  function frobeniusTwistMonomial(character, p) {
    const out = new Map();
    for (const [key, coefficient] of character.entries()) {
      const weight = parseWeightKey(key);
      addToCounter(out, `${p * weight[0]},${p * weight[1]}`, coefficient);
    }
    return out;
  }

  function expandMonomialCharacter(character) {
    const remaining = new Map(character);
    const out = new Map();
    for (let guard = 0; guard < 10000; guard += 1) {
      if (!remaining.size) {
        return out;
      }
      const target = maximalDominantWeight(remaining);
      if (!target) {
        throw new Error("cannot Weyl-expand a character with no dominant remaining weight");
      }
      const targetKey = weightArrayKey(target);
      const coefficient = remaining.get(targetKey) || 0;
      addToCounter(out, targetKey, coefficient);
      const moduleTerms = weylModuleMonomialTerms(target);
      for (const [key, multiplicity] of moduleTerms.entries()) {
        addToCounter(remaining, key, -coefficient * multiplicity);
      }
    }
    throw new Error("Weyl expansion did not terminate");
  }

  function tensorWeylViaMonomial(left, right) {
    return expandMonomialCharacter(tensorMonomial(weylToMonomial(left), weylToMonomial(right)));
  }

  function tensorWeyl(left, right) {
    const out = new Map();
    for (const [leftKey, leftCoefficient] of left.entries()) {
      const leftWeight = parseWeightKey(leftKey);
      for (const [rightKey, rightCoefficient] of right.entries()) {
        const rightWeight = parseWeightKey(rightKey);
        const scalar = leftCoefficient * rightCoefficient;
        if (!scalar) {
          continue;
        }
        for (const [weightKeyValue, coefficient] of weylBasisTensorLrTerms(leftWeight, rightWeight).entries()) {
          addToCounter(out, weightKeyValue, scalar * coefficient);
        }
      }
    }
    return out;
  }

  function frobeniusTwistWeylViaMonomial(character, p) {
    return expandMonomialCharacter(frobeniusTwistMonomial(weylToMonomial(character), p));
  }

  function frobeniusTwistBasisWeyl(weight, p) {
    const cacheKey = `${weightArrayKey(weight)}|${p}`;
    const cached = frobeniusBasisCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const twisted = frobeniusTwistWeylViaMonomial(weylModule(weight), p);
    frobeniusBasisCache.set(cacheKey, twisted);
    return twisted;
  }

  function frobeniusTwistWeyl(character, p) {
    const out = new Map();
    for (const [key, coefficient] of character.entries()) {
      const twisted = frobeniusTwistBasisWeyl(parseWeightKey(key), p);
      for (const [twistedKey, twistedCoefficient] of twisted.entries()) {
        addToCounter(out, twistedKey, coefficient * twistedCoefficient);
      }
    }
    return out;
  }

  function charactersEqual(left, right) {
    if (left.size !== right.size) {
      return false;
    }
    for (const [key, coefficient] of left.entries()) {
      if (right.get(key) !== coefficient) {
        return false;
      }
    }
    return true;
  }

  function runWeylArithmeticSelfTest() {
    for (let leftA = 0; leftA <= 4; leftA += 1) {
      for (let leftB = 0; leftB <= 4; leftB += 1) {
        for (let rightA = 0; rightA <= 4; rightA += 1) {
          for (let rightB = 0; rightB <= 4; rightB += 1) {
            const left = weylModule([leftA, leftB]);
            const right = weylModule([rightA, rightB]);
            const lr = tensorWeyl(left, right);
            const monomial = tensorWeylViaMonomial(left, right);
            if (!charactersEqual(lr, monomial)) {
              throw new Error(
                `LR tensor self-test failed for (${leftA},${leftB}) x (${rightA},${rightB})`
              );
            }
          }
        }
      }
    }
    const virtual = new Map();
    addToCounter(virtual, weightArrayKey([2, 1]), 1);
    addToCounter(virtual, weightArrayKey([0, 2]), 2);
    addToCounter(virtual, weightArrayKey([1, 0]), -1);
    const twist = frobeniusTwistWeyl(virtual, 5);
    const twistMonomial = frobeniusTwistWeylViaMonomial(virtual, 5);
    if (!charactersEqual(twist, twistMonomial)) {
      throw new Error("cached Frobenius twist self-test failed");
    }
  }

  function characterFromJsonTerms(terms) {
    const out = new Map();
    for (const term of terms) {
      addToCounter(out, `${term[0]},${term[1]}`, term[2]);
    }
    return out;
  }

  function characterCoefficient(character, weight) {
    return character.get(weightArrayKey(weight)) || 0;
  }

  function sortedWeylCharacterTerms(character) {
    return Array.from(character.entries())
      .map(([key, coefficient]) => ({ weight: parseWeightKey(key), coefficient }))
      .sort((left, right) => {
        if (left.weight[0] !== right.weight[0]) {
          return left.weight[0] - right.weight[0];
        }
        return left.weight[1] - right.weight[1];
      });
  }

  function formatWeylCharacterJs(character, maxTerms) {
    if (!character.size) {
      return "0";
    }
    const terms = sortedWeylCharacterTerms(character);
    const visible = maxTerms ? terms.slice(0, maxTerms) : terms;
    const pieces = visible.map(({ weight, coefficient }) => {
      const basis = `Delta(${weight[0]},${weight[1]})`;
      if (coefficient === 1) {
        return basis;
      }
      if (coefficient === -1) {
        return `-${basis}`;
      }
      return `${coefficient}*${basis}`;
    });
    if (maxTerms && terms.length > maxTerms) {
      pieces.push(`... ${terms.length - maxTerms} more`);
    }
    return pieces.join(" + ").replace("+ -", "- ");
  }

  function formatWeylCharacterLatex(character, maxTerms) {
    if (!character || !character.size) {
      return "0";
    }
    const terms = sortedWeylCharacterTerms(character);
    const visible = maxTerms ? terms.slice(0, maxTerms) : terms;
    const pieces = visible.map(({ weight, coefficient }, index) => {
      const sign = coefficient < 0 ? "-" : index === 0 ? "" : "+";
      const absolute = Math.abs(coefficient);
      const scalar = absolute === 1 ? "" : `${absolute}`;
      return `${sign} ${scalar}\\Delta(${weight[0]},${weight[1]})`.trim();
    });
    if (maxTerms && terms.length > maxTerms) {
      pieces.push("+ \\cdots");
    }
    return pieces.join(" ");
  }

  function parsePartitionInput(text, label) {
    const raw = text.trim();
    if (!raw) {
      return { valid: false, reasons: [`${label} is empty.`], parts: null };
    }

    const cleaned = raw.replace(/[()[\]{}]/g, " ").replace(/,/g, " ");
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const reasons = [];
    if (tokens.length === 0) {
      reasons.push(`${label} is empty.`);
    }
    if (tokens.length > 3) {
      reasons.push(`${label} has more than three parts.`);
    }

    const parts = [];
    for (const token of tokens) {
      if (!/^\d+$/.test(token)) {
        reasons.push(`${label} contains a non-negative integer parse error near "${token}".`);
        continue;
      }
      parts.push(Number.parseInt(token, 10));
    }

    if (parts.some((part) => !Number.isSafeInteger(part))) {
      reasons.push(`${label} contains an integer too large for browser-side arithmetic.`);
    }

    while (parts.length < 3) {
      parts.push(0);
    }
    const truncated = parts.slice(0, 3);
    for (let i = 0; i < truncated.length - 1; i += 1) {
      if (truncated[i] < truncated[i + 1]) {
        reasons.push(`${label} must be weakly decreasing.`);
        break;
      }
    }
    if (truncated.reduce((sum, part) => sum + part, 0) <= 0) {
      reasons.push(`${label} must have positive size.`);
    }

    return {
      valid: reasons.length === 0,
      reasons,
      parts: truncated,
    };
  }

  function partitionSize(parts) {
    return parts.reduce((sum, part) => sum + part, 0);
  }

  function isPRegularPartition(parts, p) {
    const counts = new Map();
    for (const part of parts) {
      if (part === 0) {
        continue;
      }
      counts.set(part, (counts.get(part) || 0) + 1);
    }
    return Array.from(counts.values()).every((count) => count < p);
  }

  function partitionToWeight(parts) {
    return {
      a: parts[0] - parts[1],
      b: parts[1] - parts[2],
    };
  }

  function dominanceDifference(lambdaWeight, muWeight) {
    const da = muWeight.a - lambdaWeight.a;
    const db = muWeight.b - lambdaWeight.b;
    const alpha1Numerator = 2 * da + db;
    const alpha2Numerator = da + 2 * db;
    const integral = alpha1Numerator % 3 === 0 && alpha2Numerator % 3 === 0;
    const alpha1 = integral ? alpha1Numerator / 3 : null;
    const alpha2 = integral ? alpha2Numerator / 3 : null;
    return {
      possible: integral && alpha1 >= 0 && alpha2 >= 0,
      integral,
      alpha1,
      alpha2,
      da,
      db,
    };
  }

  function partitionDominates(left, right) {
    return partitionSize(left) === partitionSize(right) &&
      left[0] >= right[0] &&
      left[0] + left[1] >= right[0] + right[1];
  }

  function partitionDominanceComparator(left, right) {
    const leftDominates = partitionDominates(left, right);
    const rightDominates = partitionDominates(right, left);
    if (leftDominates && !rightDominates) {
      return -1;
    }
    if (rightDominates && !leftDominates) {
      return 1;
    }
    for (let index = 0; index < 3; index += 1) {
      if (left[index] !== right[index]) {
        return right[index] - left[index];
      }
    }
    return 0;
  }

  function threeRowPartitionsOf(n) {
    const partitions = [];
    for (let first = n; first >= 0; first -= 1) {
      const maxSecond = Math.min(first, n - first);
      for (let second = maxSecond; second >= 0; second -= 1) {
        const third = n - first - second;
        if (third < 0 || third > second) {
          continue;
        }
        partitions.push([first, second, third]);
      }
    }
    partitions.sort(partitionDominanceComparator);
    return partitions;
  }

  function partitionArrayKey(parts) {
    return parts.join(",");
  }

  function partitionValidate() {
    const p = Number(partitionPrimeSelect.value);
    const lambda = parsePartitionInput(partitionLambdaInput.value, "lambda");
    const mu = parsePartitionInput(partitionMuInput.value, "mu");
    const reasons = [...lambda.reasons, ...mu.reasons];
    let lambdaWeight = null;
    let muWeight = null;
    let dominance = null;
    let classification = null;

    if (lambda.valid && mu.valid) {
      if (partitionSize(lambda.parts) !== partitionSize(mu.parts)) {
        reasons.push(
          `lambda and mu must label the same symmetric group: ${partitionSize(lambda.parts)} != ${partitionSize(mu.parts)}.`
        );
      }
      if (!isPRegularPartition(mu.parts, p)) {
        reasons.push(`mu=${formatPartition(mu.parts)} is not p-regular, so D^mu is not a simple label.`);
      }
    }

    if (lambda.valid && mu.valid && reasons.length === 0) {
      lambdaWeight = partitionToWeight(lambda.parts);
      muWeight = partitionToWeight(mu.parts);
      dominance = dominanceDifference(lambdaWeight, muWeight);
      classification = classifyRecordForPrime(muWeight.a, muWeight.b, p);
    }

    partitionState.p = p;
    partitionState.lambda = reasons.length === 0 ? lambda.parts : null;
    partitionState.mu = reasons.length === 0 ? mu.parts : null;
    partitionState.lambdaWeight = lambdaWeight;
    partitionState.muWeight = muWeight;
    partitionState.dominance = dominance;
    partitionState.classification = classification;
    partitionState.hasLambda = Boolean(partitionState.lambda);
    partitionState.valid = reasons.length === 0;
    partitionState.muReasons = mu.reasons;
    partitionState.lambdaReasons = lambda.reasons;
    partitionState.reasons = reasons;
  }

  function partitionUpdateDetails() {
    if (!partitionState.valid) {
      partitionDetails.innerHTML = [
        "<strong>Invalid input</strong>",
        "<ol>",
        ...partitionState.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`),
        "</ol>",
      ].join("");
      renderLatex(partitionDetails);
      return;
    }

    const mu = partitionState.mu;
    const n = partitionSize(mu);

    partitionDetails.innerHTML = [
      `<p>Valid input for \\(S_{${n}}\\). Since tilting characters have been computed, we read the coefficient of \\(\\Delta(\\lambda)\\) in \\(T(\\mu)\\).</p>`,
      `<div id="partition-output" class="api-output compact-output">${partitionState.computationHtml || "Press Enter to compute this entry from static Billiards data."}</div>`,
    ].join("");
    renderLatex(partitionDetails);
  }

  function loadBilliardsBaseData() {
    if (!billiardsBaseDataPromise) {
      billiardsBaseDataPromise = new Promise((resolve, reject) => {
        if (window.BILLIARDS_BASE_CHARACTERS) {
          resolve(window.BILLIARDS_BASE_CHARACTERS);
          return;
        }
        reject(new Error("base-character data script did not load"));
      });
    }
    return billiardsBaseDataPromise;
  }

  function isBottomAlcove(weight, p) {
    return weight[0] >= 0 && weight[1] >= 0 && weight[0] + weight[1] <= p - 2;
  }

  function isFirstAdjacentAlcove(weight, p) {
    return 0 <= weight[0] &&
      weight[0] <= p - 2 &&
      0 <= weight[1] &&
      weight[1] <= p - 2 &&
      weight[0] + weight[1] >= p - 1;
  }

  function reflectedBottomSumWall(weight, p) {
    return [p - weight[1] - 2, p - weight[0] - 2];
  }

  function donkinSplitArray(weight, p) {
    const shift = p - 1;
    if (weight[0] < shift || weight[1] < shift) {
      return null;
    }
    const restrictedDigit = [
      (weight[0] - shift) % p,
      (weight[1] - shift) % p,
    ];
    const quotient = [
      Math.floor((weight[0] - shift) / p),
      Math.floor((weight[1] - shift) / p),
    ];
    const shifted = [
      shift + restrictedDigit[0],
      shift + restrictedDigit[1],
    ];
    return { shifted, quotient, restrictedDigit };
  }

  function baseCharacterFromRecord(record) {
    const wallIndices = Array.isArray(record.wall_indices)
      ? record.wall_indices
      : record.wall_index === null || record.wall_index === undefined ? [] : [record.wall_index];
    const provenanceComplete = record.dependency_provenance_complete === true ||
      record.source.startsWith("asloc-") || record.source.startsWith("andersen-") ||
      record.source === "singular-wall-strip-minimal-facet" || wallIndices.length > 0;
    const wallIndex = wallIndices.length ? Math.max(...wallIndices) : null;
    return {
      status: provenanceComplete ? "computed" : "unknown",
      source: record.source,
      baseSources: [record.source],
      wallIndices,
      provenanceComplete,
      trusted: Boolean(record.trusted),
      character: provenanceComplete ? characterFromJsonTerms(record.terms) : null,
      reasons: provenanceComplete ? record.reasons || [] : ["wall-input dependency provenance is missing"],
      steps: [],
      wallIndex,
      outsideExpectedRange: false,
    };
  }

  function mergeOutsideExpectedRange(...results) {
    return results.some((result) => result && result.outsideExpectedRange);
  }

  function combinedDependencies(...results) {
    const wallIndices = [...new Set(results.flatMap((result) => result.wallIndices || []))].sort((a, b) => a - b);
    return {
      baseSources: [...new Set(results.flatMap((result) => result.baseSources || [result.source]))],
      wallIndices,
      wallIndex: wallIndices.length ? Math.max(...wallIndices) : null,
      provenanceComplete: results.every((result) => result.provenanceComplete !== false),
      outsideExpectedRange: mergeOutsideExpectedRange(...results),
    };
  }

  function resultProvenance(result, p) {
    const wallIndices = result.wallIndices || [];
    const sources = result.baseSources || [result.source];
    const outside = result.outsideExpectedRange || wallIndices.some((index) => index >= expectedWallLimit(p));
    const conjectural = wallIndices.length > 0;
    const hasASLocBase = sources.some((source) => source.startsWith("asloc-"));
    const verified = result.status === "computed" && !outside && result.provenanceComplete !== false && (
      conjectural ? wallIndices.every((index) => index < (VERIFIED_WALL_LIMITS[p] || 0)) : hasASLocBase
    );
    const status = outside ? "Outside stated Billiards range"
      : result.status !== "computed" ? "Unavailable (missing base data or provenance)"
      : verified ? "Verified with p-canonical basis computations"
      : conjectural ? "Conjectural"
      : "Computed without Billiards input";
    const labels = new Set(sources.map((source) => {
      if (source.startsWith("asloc-")) return "precomputed ASLoc-derived shifted-box data";
      if (source.startsWith("andersen-")) return "precomputed theoretical shifted-box formula";
      if (source === "singular-wall-strip-minimal-facet") return "theoretical minimal-facet formula";
      if (source.includes("wall-strip")) return "precomputed Billiards wall-strip data and translation";
      return "elementary theoretical formula";
    }));
    return {
      mathematical_status: status,
      billiards_dependent: conjectural,
      wall_indices: wallIndices,
      expected_wall_limit: expectedWallLimit(p),
      outside_expected_range: Boolean(outside),
      dependency_provenance_complete: result.provenanceComplete !== false,
      base_sources: sources,
      verified_with_pcanonical_computations: verified,
      source_description: [...labels].join("; ") + (result.source === "donkin-recursion" ? "; browser-side Donkin recursion and character arithmetic" : ""),
    };
  }

  function computationProvenanceHtml(result, p) {
    const info = resultProvenance(result, p);
    if (result.status !== "computed" || info.outside_expected_range) return "";
    if (info.verified_with_pcanonical_computations) {
      return "<p class=\"result-status\">Verified with \\(p\\)-canonical basis computations.</p>";
    }
    return info.billiards_dependent ? "<p class=\"result-status\">Conjectural.</p>" : "";
  }

  function tiltingCharacterBrowser(weight, p, primeData, cache, depth) {
    const key = weightArrayKey(weight);
    if (cache.has(key)) {
      return cache.get(key);
    }
    if (depth > 40) {
      return {
        status: "unknown",
        source: "recursion-limit",
        trusted: false,
        character: null,
        reasons: ["maximum browser recursion depth reached"],
        steps: [`weight (${key}): recursion limit reached`],
        wallIndex: null,
        outsideExpectedRange: false,
      };
    }

    const shiftedRecord = primeData.shifted_box && primeData.shifted_box[key];
    if (shiftedRecord) {
      const result = baseCharacterFromRecord(shiftedRecord);
      result.steps = [`weight (${key}): shifted-box base data (${result.source})`];
      cache.set(key, result);
      return result;
    }

    if (isBottomAlcove(weight, p)) {
      const result = {
        status: "computed",
        source: "bottom-alcove",
        trusted: true,
        character: weylModule(weight),
        reasons: ["bottom alcove: T(lambda)=Delta(lambda)"],
        steps: [`weight (${key}): bottom alcove base case`],
        wallIndex: null,
        outsideExpectedRange: false,
      };
      cache.set(key, result);
      return result;
    }

    if (isFirstAdjacentAlcove(weight, p)) {
      const reflected = reflectedBottomSumWall(weight, p);
      const character = new Map(weylModule(weight));
      for (const [termKey, coefficient] of weylModule(reflected).entries()) {
        addToCounter(character, termKey, coefficient);
      }
      const result = {
        status: "computed",
        source: "first-adjacent-alcove",
        trusted: true,
        character,
        reasons: [`reflected bottom-alcove weight: (${reflected[0]},${reflected[1]})`],
        steps: [`weight (${key}): first adjacent alcove, add reflected term (${reflected[0]},${reflected[1]})`],
        wallIndex: null,
        outsideExpectedRange: false,
      };
      cache.set(key, result);
      return result;
    }

    if (weight[0] === p - 1 && weight[1] === p - 1) {
      const result = {
        status: "computed",
        source: "steinberg",
        trusted: true,
        character: weylModule(weight),
        reasons: ["Steinberg module is simple tilting"],
        steps: [`weight (${key}): Steinberg base case`],
        wallIndex: null,
        outsideExpectedRange: false,
      };
      cache.set(key, result);
      return result;
    }

    const split = donkinSplitArray(weight, p);
    if (split) {
      if (split.shifted[0] === weight[0] && split.shifted[1] === weight[1]) {
        const result = {
          status: "unknown",
          source: "shifted-box-missing",
          trusted: false,
          character: null,
          reasons: ["weight lies in the shifted restricted box, but no JSON character is available"],
          steps: [`weight (${key}): shifted-box character missing`],
          wallIndex: null,
          outsideExpectedRange: false,
        };
        cache.set(key, result);
        return result;
      }
      const shifted = tiltingCharacterBrowser(split.shifted, p, primeData, cache, depth + 1);
      const quotient = tiltingCharacterBrowser(split.quotient, p, primeData, cache, depth + 1);
      if (shifted.status !== "computed" || quotient.status !== "computed" || shifted.outsideExpectedRange || quotient.outsideExpectedRange) {
        const result = {
          status: "unknown",
          source: "donkin-recursion-blocked",
          trusted: false,
          character: null,
          reasons: ["one Donkin factor is missing or outside the expected Billiards range"],
          steps: [
            `weight (${key}): Donkin split (${split.shifted[0]},${split.shifted[1]}) + ${p}*(${split.quotient[0]},${split.quotient[1]})`,
            ...shifted.steps.map((step) => `  ${step}`),
            ...quotient.steps.map((step) => `  ${step}`),
          ],
          ...combinedDependencies(shifted, quotient),
        };
        cache.set(key, result);
        return result;
      }
      const character = tensorWeyl(shifted.character, frobeniusTwistWeyl(quotient.character, p));
      const result = {
        status: "computed",
        source: "donkin-recursion",
        trusted: shifted.trusted && quotient.trusted,
        ...combinedDependencies(shifted, quotient),
        character,
        reasons: ["Donkin tensor product theorem in type A2 (all primes)"],
        steps: [
          `weight (${key}): Donkin split (${split.shifted[0]},${split.shifted[1]}) + ${p}*(${split.quotient[0]},${split.quotient[1]})`,
          ...shifted.steps.map((step) => `  shifted factor: ${step}`),
          ...quotient.steps.map((step) => `  quotient: ${step}`),
          `weight (${key}): tensor shifted character with Frobenius twist of quotient character`,
        ],
      };
      cache.set(key, result);
      return result;
    }

    if (weight[0] < p || weight[1] < p) {
      const wallRecord = primeData.wall_strip && primeData.wall_strip[key];
      if (wallRecord) {
        const result = baseCharacterFromRecord(wallRecord);
        const wallIndex = result.wallIndices.length ? Math.max(...result.wallIndices) : null;
        const outsideExpectedRange = result.wallIndices.some((index) => index >= expectedWallLimit(p));
        const wallText = wallIndex === null
          ? ""
          : `, wall index i=${wallIndex}`;
        result.steps = [`weight (${key}): terminal wall-strip base data (${result.source}${wallText})`];
        result.wallIndex = wallIndex;
        result.outsideExpectedRange = outsideExpectedRange;
        if (outsideExpectedRange) {
          result.reasons = [
            ...(result.reasons || []),
            `terminal Billiards wall index i=${wallIndex} is outside expected range i<${expectedWallLimit(p)}`,
          ];
        }
        cache.set(key, result);
        return result;
      }
      const missingWallIndex = terminalWallIndex(weight[0], weight[1], p);
      const missingOutsideExpectedRange = missingWallIndex >= expectedWallLimit(p);
      const result = {
        status: "unknown",
        source: "wall-strip-missing",
        trusted: false,
        character: null,
        reasons: [
          `terminal wall-strip weight (${key}) is outside the loaded JSON cache`,
          missingOutsideExpectedRange
            ? `required Billiards wall index i=${missingWallIndex} is outside expected range i<${expectedWallLimit(p)}`
            : `required Billiards wall index i=${missingWallIndex} is inside the expected range but not loaded`,
          `loaded wall-strip coordinate bound: ${primeData.wall_strip_max_coordinate ?? "unknown"}`,
          `full conjectural range coordinate bound: ${primeData.expected_wall_range_max_coordinate ?? "unknown"}`,
        ],
        steps: [`weight (${key}): terminal wall-strip character missing from JSON`],
        wallIndex: missingWallIndex,
        outsideExpectedRange: missingOutsideExpectedRange,
      };
      cache.set(key, result);
      return result;
    }

    const result = {
      status: "unknown",
      source: "unclassified",
      trusted: false,
      character: null,
      reasons: ["weight is outside the browser engine cases"],
      steps: [`weight (${key}): unclassified`],
      wallIndex: null,
      outsideExpectedRange: false,
    };
    cache.set(key, result);
    return result;
  }

  function partitionSetComputationOutput(html) {
    partitionState.computationHtml = html;
    const output = document.getElementById("partition-output");
    if (output) {
      output.innerHTML = html;
      renderLatex(output);
    }
  }

  function partitionRenderBrowserResult(result) {
    const valueText = result.status === "computed"
      ? String(characterCoefficient(result.character, [
        partitionState.lambdaWeight.a,
        partitionState.lambdaWeight.b,
      ]))
      : "unknown";
    const computedInExpectedRange = result.status === "computed" && !result.outsideExpectedRange;
    const equalityHtml = computedInExpectedRange
      ? [
        "<p class=\"decomposition-value\">",
        "\\([T(\\mu):\\Delta(\\lambda)]",
        `=[${formatSpecht(partitionState.lambda)}:${formatSimple(partitionState.mu)}]`,
        `=${escapeHtml(valueText)}\\)`,
        "</p>",
      ].join("")
      : "";
    const rangeWarning = result.outsideExpectedRange
      ? characterRangeWarningHtml(result, partitionState.p)
      : "";
    const compactHtml = computedInExpectedRange
      ? equalityHtml + computationProvenanceHtml(result, partitionState.p)
      : [
        rangeWarning,
        result.outsideExpectedRange ? "" : "<p class=\"result-status\">Unavailable: required base data is not bundled, or its dependency provenance is incomplete.</p>",
      ].join("");
    partitionState.computationHtml = compactHtml;
    partitionDraw();
  }

  function partitionRenderComputationError(message) {
    partitionSetComputationOutput([
      "<strong>Browser Billiards computation unavailable</strong>",
      `<p>${escapeHtml(message)}</p>`,
    ].join(""));
  }

  function partitionSliderData(targetLabel) {
    const p = Number(partitionPrimeSelect.value);
    const fixedLabel = targetLabel === "lambda" ? "mu" : "lambda";
    const fixedInput = fixedLabel === "lambda" ? partitionLambdaInput : partitionMuInput;
    const movingInput = targetLabel === "lambda" ? partitionLambdaInput : partitionMuInput;
    const fixed = parsePartitionInput(fixedInput.value, fixedLabel);
    const moving = parsePartitionInput(movingInput.value, targetLabel);
    const reasons = [...fixed.reasons];

    if (fixed.valid && fixedLabel === "mu" && !isPRegularPartition(fixed.parts, p)) {
      reasons.push(`fixed mu=${formatPartition(fixed.parts)} is not p-regular.`);
    }

    if (!fixed.valid || reasons.length) {
      return {
        valid: false,
        p,
        targetLabel,
        fixedLabel,
        fixed: fixed.parts,
        moving: moving.parts,
        candidates: [],
        reasons,
      };
    }

    const n = partitionSize(fixed.parts);
    const fixedWeight = partitionToWeight(fixed.parts);
    let candidates;
    if (targetLabel === "lambda") {
      candidates = threeRowPartitionsOf(n).filter((lambda) =>
        dominanceDifference(partitionToWeight(lambda), fixedWeight).possible
      );
    } else {
      candidates = threeRowPartitionsOf(n).filter((mu) =>
        isPRegularPartition(mu, p) &&
        dominanceDifference(fixedWeight, partitionToWeight(mu)).possible
      );
    }

    return {
      valid: true,
      p,
      targetLabel,
      fixedLabel,
      fixed: fixed.parts,
      moving: moving.valid && partitionSize(moving.parts) === n ? moving.parts : null,
      candidates,
      reasons: [],
    };
  }

  function partitionSliderIndex(data) {
    if (!data.valid || !data.candidates.length || !data.moving) {
      return 0;
    }
    const movingKey = partitionArrayKey(data.moving);
    const index = data.candidates.findIndex((parts) => partitionArrayKey(parts) === movingKey);
    return index >= 0 ? index : 0;
  }

  function partitionSliderElements(targetLabel) {
    return targetLabel === "lambda"
      ? {
        slider: partitionLambdaSlider,
        ticks: partitionLambdaSliderTicks,
        readout: partitionLambdaSliderReadout,
      }
      : {
        slider: partitionMuSlider,
        ticks: partitionMuSliderTicks,
        readout: partitionMuSliderReadout,
      };
  }

  function partitionRenderSliderTicks(ticks, count, activeIndex) {
    ticks.style.setProperty("--tick-count", String(Math.max(1, count)));
    if (count <= 0) {
      ticks.innerHTML = "";
      return;
    }
    const dots = [];
    for (let index = 0; index < count; index += 1) {
      dots.push(`<span class="${index === activeIndex ? "is-active" : ""}"></span>`);
    }
    ticks.innerHTML = dots.join("");
  }

  function partitionSliderRender(targetLabel, data, index) {
    const { slider, ticks, readout } = partitionSliderElements(targetLabel);
    const candidates = data.candidates || [];
    if (targetLabel === "lambda") {
      partitionState.lambdaSliderCandidates = candidates;
    } else {
      partitionState.muSliderCandidates = candidates;
    }
    const maximum = Math.max(0, candidates.length - 1);
    const activeIndex = clamp(0, maximum, index);
    slider.max = String(maximum);
    slider.value = String(activeIndex);
    slider.disabled = !data.valid || candidates.length === 0;
    partitionRenderSliderTicks(ticks, candidates.length, activeIndex);

    if (!data.valid) {
      readout.innerHTML = [
        "<p>Slider unavailable:</p>",
        "<ol>",
        ...data.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`),
        "</ol>",
      ].join("");
      renderLatex(readout);
      return;
    }

    if (!candidates.length) {
      const heldLabel = data.fixedLabel === "lambda" ? "\\lambda" : "\\mu";
      readout.innerHTML = `No possible ${escapeHtml(targetLabel)} labels for the current \\(${heldLabel}\\).`;
      renderLatex(readout);
      return;
    }

    const label = targetLabel === "lambda" ? "\\lambda" : "\\mu";
    readout.innerHTML = [
      `<p>${candidates.length} possible \\(${label}\\) labels, `,
      `position ${activeIndex + 1}/${candidates.length}.</p>`,
    ].join("");
    renderLatex(readout);
  }

  function partitionSyncSliderToInputs() {
    for (const targetLabel of ["lambda", "mu"]) {
      const data = partitionSliderData(targetLabel);
      const index = partitionSliderIndex(data);
      partitionSliderRender(targetLabel, data, index);
    }
  }

  function partitionApplySliderSelection(targetLabel, compute = true) {
    const data = partitionSliderData(targetLabel);
    const { slider } = partitionSliderElements(targetLabel);
    if (!data.valid || !data.candidates.length) {
      partitionSliderRender(targetLabel, data, 0);
      return;
    }
    const maximum = data.candidates.length - 1;
    const index = clamp(0, maximum, Number.parseInt(slider.value, 10) || 0);
    const selected = data.candidates[index];
    if (targetLabel === "lambda") {
      partitionLambdaInput.value = selected.join(",");
    } else {
      partitionMuInput.value = selected.join(",");
    }
    partitionSliderRender(targetLabel, data, index);
    partitionRefresh(compute);
  }

  function partitionMatrixSyncLists() {
    const p = Number(matrixPrimeSelect.value);
    const n = integerInputValue(matrixNInput, partitionMatrixState.n, 1, MATRIX_N_LIMIT);
    matrixNInput.value = String(n);
    partitionMatrixState.p = p;
    partitionMatrixState.n = n;
    partitionMatrixState.rows = threeRowPartitionsOf(n);
    partitionMatrixState.columns = partitionMatrixState.rows.filter((parts) => isPRegularPartition(parts, p));
  }

  function partitionMatrixRenderFixedReadout() {
    matrixFixedReadout.innerHTML = [
      `<p>Matrix controls are independent of the single-entry input. `,
      `Rows: ${partitionMatrixState.rows.length}; `,
      `\\(p\\)-regular columns: ${partitionMatrixState.columns.length}.</p>`,
    ].join("");
    renderLatex(matrixFixedReadout);
  }

  function partitionMatrixEntryClass(entry, rowIndex, columnIndex) {
    void rowIndex;
    void columnIndex;
    return `matrix-entry-${entry.status}`;
  }

  function partitionMatrixHeaderClass(columnIndex) {
    void columnIndex;
    return "";
  }

  function partitionMatrixRowClass(rowIndex) {
    void rowIndex;
    return "";
  }

  function partitionMatrixRenderTable() {
    const headerCells = partitionMatrixState.columns.map((mu, columnIndex) => [
      `<th scope="col" class="${partitionMatrixHeaderClass(columnIndex)}">`,
      `\\(${formatPartition(mu)}\\)`,
      "</th>",
    ].join(""));
    const rows = partitionMatrixState.rows.map((lambda, rowIndex) => {
      const entries = partitionMatrixState.entries[rowIndex] || [];
      const cells = partitionMatrixState.columns.map((mu, columnIndex) => {
        const entry = entries[columnIndex] || {
          text: "?",
          status: "unknown",
          title: "entry was not computed",
        };
        return [
          `<td class="${partitionMatrixEntryClass(entry, rowIndex, columnIndex)}" title="${escapeHtml(entry.title || "")}">`,
          escapeHtml(entry.text),
          "</td>",
        ].join("");
      });
      return [
        `<tr class="${partitionMatrixRowClass(rowIndex)}">`,
        `<th scope="row">\\(${formatPartition(lambda)}\\)</th>`,
        ...cells,
        "</tr>",
      ].join("");
    });
    return [
      "<div class=\"decomposition-matrix-wrap\">",
      "<table class=\"decomposition-matrix\">",
      "<thead><tr><th scope=\"col\">\\(\\lambda\\backslash\\mu\\)</th>",
      ...headerCells,
      "</tr></thead>",
      "<tbody>",
      ...rows,
      "</tbody>",
      "</table>",
      "</div>",
    ].join("");
  }

  function partitionMatrixRender() {
    partitionMatrixRenderFixedReadout();
    if (partitionMatrixState.status === "computed") {
      matrixOutput.innerHTML = [
        `<p>${escapeHtml(partitionMatrixState.message)}</p>`,
        partitionMatrixRenderTable(),
      ].join("");
    } else {
      matrixOutput.innerHTML = `<p>${escapeHtml(partitionMatrixState.message)}</p>`;
    }
    renderLatex(matrixOutput);
  }

  function partitionMatrixResetForControls() {
    partitionMatrixSyncLists();
    partitionMatrixState.entries = [];
    partitionMatrixState.columnResults = [];
    partitionMatrixState.status = "stale";
    partitionMatrixState.message = [
      `Ready to compute the three-row matrix for S_${partitionMatrixState.n} at p=${partitionMatrixState.p}.`,
      `This has ${partitionMatrixState.rows.length} Specht rows and ${partitionMatrixState.columns.length} p-regular simple columns.`,
    ].join(" ");
    partitionMatrixRender();
  }

  function partitionMatrixEntry(lambda, mu, result) {
    const lambdaWeight = partitionToWeight(lambda);
    const muWeight = partitionToWeight(mu);
    const dominance = dominanceDifference(lambdaWeight, muWeight);
    if (!dominance.possible) {
      return {
        text: "0",
        status: "triangular-zero",
        title: "zero by dominance/unitriangularity",
      };
    }
    if (lambda.every((part, index) => part === mu[index])) {
      return { text: "1", status: "computed", title: "one by unitriangularity; independent of Billiards" };
    }
    if (!result || result.status !== "computed") {
      return {
        text: "?",
        status: "unknown",
        title: result && result.reasons ? result.reasons.join("; ") : "tilting character unavailable",
      };
    }
    if (result.outsideExpectedRange) {
      return {
        text: "?",
        status: "out-of-range",
        title: `requires Billiards wall index outside the expected range i<${expectedWallLimit(partitionMatrixState.p)}`,
      };
    }
    const value = characterCoefficient(result.character, [lambdaWeight.a, lambdaWeight.b]);
    return {
      text: String(value),
      status: value === 0 ? "computed-zero" : "computed",
      title: `[T(${formatPartition(mu)}):Delta(${formatPartition(lambda)})]=${value}. ${resultProvenance(result, partitionMatrixState.p).mathematical_status}.`,
    };
  }

  async function partitionMatrixCompute() {
    const requestId = ++partitionMatrixRequestId;
    partitionMatrixSyncLists();
    partitionMatrixState.entries = [];
    partitionMatrixState.columnResults = [];
    partitionMatrixState.status = "computing";
    partitionMatrixState.message = `Computing ${partitionMatrixState.columns.length} tilting characters from static Billiards data...`;
    partitionMatrixRender();

    try {
      const baseData = await loadBilliardsBaseData();
      if (requestId !== partitionMatrixRequestId) {
        return;
      }
      const primeData = baseData.primes && baseData.primes[String(partitionMatrixState.p)];
      if (!primeData) {
        const exported = Object.keys(baseData.primes || {}).join(", ") || "none";
        partitionMatrixState.status = "error";
        partitionMatrixState.message = `No static Billiards base data is loaded for p=${partitionMatrixState.p}. Exported primes: ${exported}.`;
        partitionMatrixRender();
        return;
      }

      const cache = characterCacheForPrime(partitionMatrixState.p);
      const columnResults = partitionMatrixState.columns.map((mu) => {
        const weight = partitionToWeight(mu);
        return tiltingCharacterBrowser([weight.a, weight.b], partitionMatrixState.p, primeData, cache, 0);
      });
      if (requestId !== partitionMatrixRequestId) {
        return;
      }

      partitionMatrixState.columnResults = columnResults;
      partitionMatrixState.entries = partitionMatrixState.rows.map((lambda) =>
        partitionMatrixState.columns.map((mu, columnIndex) =>
          partitionMatrixEntry(lambda, mu, columnResults[columnIndex])
        )
      );
      const unavailable = columnResults.filter((result) =>
        result.status !== "computed" || result.outsideExpectedRange
      ).length;
      partitionMatrixState.status = "computed";
      partitionMatrixState.message = unavailable === 0
        ? `Computed the three-row matrix for S_${partitionMatrixState.n} at p=${partitionMatrixState.p}.`
        : `Computed the in-range part for S_${partitionMatrixState.n} at p=${partitionMatrixState.p}; ${unavailable} column(s) require missing or out-of-range Billiards data and are marked ?.`;
      partitionMatrixRender();
    } catch (error) {
      if (requestId !== partitionMatrixRequestId) {
        return;
      }
      partitionMatrixState.status = "error";
      partitionMatrixState.message = `${String(error)}. Make sure data/billiards_base_characters.js is loaded before range.js.`;
      partitionMatrixRender();
    }
  }

  async function partitionComputeDecomposition() {
    const requestId = ++partitionRequestId;
    if (!partitionState.valid) {
      return;
    }
    const samePartition = partitionState.lambda.every((part, index) => part === partitionState.mu[index]);
    if (!partitionState.dominance.possible || samePartition) {
      const value = samePartition ? 1 : 0;
      partitionState.computationHtml = [
        `<p class="decomposition-value">\\([${formatSpecht(partitionState.lambda)}:${formatSimple(partitionState.mu)}]=${value}\\)</p>`,
        `<p class="result-status">${samePartition ? "One" : "Zero"} by dominance/unitriangularity; independent of Billiards.</p>`,
      ].join("");
      partitionDraw();
      return;
    }
    partitionSetComputationOutput("Computing in the browser from static Billiards data...");
    try {
      const baseData = await loadBilliardsBaseData();
      if (requestId !== partitionRequestId) {
        return;
      }
      const primeData = baseData.primes && baseData.primes[String(partitionState.p)];
      if (!primeData) {
        const exported = Object.keys(baseData.primes || {}).join(", ") || "none";
        partitionRenderComputationError(
          `No static Billiards base data is loaded for p=${partitionState.p}. Exported primes: ${exported}.`
        );
        return;
      }
      const result = tiltingCharacterBrowser(
        [partitionState.muWeight.a, partitionState.muWeight.b],
        partitionState.p,
        primeData,
        characterCacheForPrime(partitionState.p),
        0
      );
      partitionRenderBrowserResult(result);
    } catch (error) {
      if (requestId !== partitionRequestId) {
        return;
      }
      partitionRenderComputationError(
        `${String(error)}. Regenerate data/billiards_base_characters.js and make sure index.html includes it before range.js.`
      );
    }
  }

  function partitionDraw() {
    partitionUpdateDetails();
  }

  function partitionRefresh(compute = true) {
    partitionValidate();
    partitionState.computationHtml = partitionState.valid
      ? "Press Enter to compute this entry from static Billiards data."
      : null;
    partitionDraw();
    partitionSyncSliderToInputs();
    if (compute) {
      partitionComputeDecomposition();
    }
  }

  function installPartitionEventHandlers() {
    partitionPrimeSelect.addEventListener("input", () => {
      partitionRefresh();
    });
    for (const input of [partitionLambdaInput, partitionMuInput]) {
      input.addEventListener("input", () => {
        partitionSyncSliderToInputs();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          partitionRefresh();
        }
      });
    }
    partitionLambdaSlider.addEventListener("input", () => {
      partitionApplySliderSelection("lambda");
    });
    partitionMuSlider.addEventListener("input", () => {
      partitionApplySliderSelection("mu");
    });
    matrixPrimeSelect.addEventListener("input", () => {
      partitionMatrixResetForControls();
    });
    matrixComputeButton.addEventListener("click", () => {
      partitionMatrixCompute();
    });
    matrixNInput.addEventListener("change", () => {
      partitionMatrixResetForControls();
    });
    matrixNInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        partitionMatrixCompute();
      }
    });
  }

  function billiardsFrameDelay(value, minimum = 120, maximum = 1200) {
    return minimum + maximum - value;
  }

  function billiardsSyncControls() {
    billiardsState.p = Number(billiardsPrimeSelect.value);
    const expectedMaxLabel = expectedWallLimit(billiardsState.p) - 1;
    billiardsState.maxLabel = integerInputValue(
      billiardsMaxLabelNumber,
      expectedMaxLabel,
      1,
      BILLIARDS_MAX_LABEL_LIMIT
    );
    billiardsState.wallIndex = integerInputValue(
      billiardsWallIndexNumber,
      Math.min(21, billiardsState.maxLabel),
      0,
      billiardsState.maxLabel
    );
    billiardsState.speedMs = billiardsFrameDelay(Number(billiardsSpeedInput.value), Number(billiardsSpeedInput.min), Number(billiardsSpeedInput.max));
    billiardsState.showWallGraph = billiardsShowWallGraphInput.checked;
    billiardsState.showAll = billiardsShowAllInput.checked;
    billiardsState.showLabels = billiardsShowLabelsInput.checked;
    billiardsState.powerSizeMode = billiardsPowerSizeModeInput.checked;
    billiardsState.showDetails = billiardsShowDetailsInput.checked;
    billiardsPrimeSelect.value = String(billiardsState.p);
    billiardsMaxLabelNumber.value = String(billiardsState.maxLabel);
    billiardsMaxLabelInput.value = String(
      clamp(
        Number(billiardsMaxLabelInput.min),
        Number(billiardsMaxLabelInput.max),
        billiardsState.maxLabel
      )
    );
    billiardsWallIndexNumber.value = String(billiardsState.wallIndex);
    billiardsWallIndexInput.max = String(billiardsState.maxLabel);
    billiardsWallIndexNumber.max = String(BILLIARDS_MAX_LABEL_LIMIT);
    billiardsWallIndexInput.value = String(billiardsState.wallIndex);
    billiardsSpeedValue.textContent = `${billiardsState.speedMs} ms`;
    billiardsPlayButton.textContent = billiardsState.playing ? "Pause" : "Play";
  }

  function billiardsRebuildData() {
    billiardsState.data = billiardsBuildData(billiardsState.p, billiardsState.maxLabel);
    const points = billiardsState.data.records;
    const maxWallA = Math.floor(billiardsState.maxLabel / 2);
    const framePoints = [
      { a: 0, b: 0 },
      { a: maxWallA, b: 0 },
      ...points,
    ];
    const frameXY = framePoints.map((point) => triangularXY(point.a, point.b));
    const maxA = Math.max(maxWallA, ...points.map((point) => point.a), 1);
    const maxB = Math.max(...points.map((point) => point.b), 1);
    const maxX = Math.max(...frameXY.map((point) => point.x), 1);
    const maxY = Math.max(...frameXY.map((point) => point.y), SQRT3_OVER_2);
    const xPadWorld = Math.max(1.4, 0.03 * maxX);
    const yPadWorld = Math.max(1.4, 0.05 * maxY);
    billiardsState.bounds = {
      maxA: maxA + 2,
      maxB: maxB + 2,
      maxX: maxX + xPadWorld,
      maxY: maxY + yPadWorld,
    };
  }

  function billiardsResizeCanvas() {
    const rect = billiardsCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (billiardsCanvas.width !== pixelWidth || billiardsCanvas.height !== pixelHeight) {
      billiardsCanvas.width = pixelWidth;
      billiardsCanvas.height = pixelHeight;
      billiardsState.width = width;
      billiardsState.height = height;
      billiardsState.viewNeedsReset = true;
    }
    billiardsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function billiardsFitView() {
    const pad = 34;
    const usableWidth = Math.max(1, billiardsState.width - 2 * pad);
    const usableHeight = Math.max(1, billiardsState.height - 2 * pad);
    const scaleX = usableWidth / Math.max(1, billiardsState.bounds.maxX);
    const scaleY = usableHeight / Math.max(1, billiardsState.bounds.maxY);
    const fittedScale = Math.max(0.01, Math.min(scaleX, scaleY));
    billiardsState.minScale = Math.max(0.01, fittedScale / MAX_ZOOM_OUT_FACTOR);
    billiardsState.scale = fittedScale;
    billiardsState.offsetX = Math.max(
      pad,
      billiardsState.width - pad - billiardsState.bounds.maxX * fittedScale
    );
    billiardsState.offsetY = billiardsState.height - pad;
    billiardsState.viewNeedsReset = false;
  }

  function billiardsWorldToScreen(point) {
    return {
      x: billiardsState.offsetX + point.x * billiardsState.scale,
      y: billiardsState.offsetY - point.y * billiardsState.scale,
    };
  }

  function billiardsScreenToWorld(x, y) {
    return {
      x: (x - billiardsState.offsetX) / billiardsState.scale,
      y: (billiardsState.offsetY - y) / billiardsState.scale,
    };
  }

  function billiardsViewportCorners(margin) {
    const corners = [
      triangularToWeight(billiardsScreenToWorld(-margin, -margin)),
      triangularToWeight(billiardsScreenToWorld(billiardsState.width + margin, -margin)),
      triangularToWeight(billiardsScreenToWorld(-margin, billiardsState.height + margin)),
      triangularToWeight(billiardsScreenToWorld(billiardsState.width + margin, billiardsState.height + margin)),
    ];
    const minA = Math.min(...corners.map((point) => point.a));
    const maxA = Math.max(...corners.map((point) => point.a));
    const minB = Math.min(...corners.map((point) => point.b));
    const maxB = Math.max(...corners.map((point) => point.b));
    const minTotal = Math.min(...corners.map((point) => point.a + point.b));
    const maxTotal = Math.max(...corners.map((point) => point.a + point.b));
    const span = Math.max(maxA - minA, maxB - minB, maxTotal - minTotal, 1);
    return { minA, maxA, minB, maxB, minTotal, maxTotal, extra: span + 8 };
  }

  function billiardsDrawWeightLine(a0, b0, a1, b1, style) {
    const start = billiardsWorldToScreen(triangularXY(a0, b0));
    const end = billiardsWorldToScreen(triangularXY(a1, b1));
    billiardsCtx.save();
    billiardsCtx.strokeStyle = style.color;
    billiardsCtx.lineWidth = style.width;
    billiardsCtx.setLineDash(style.dash || []);
    billiardsCtx.beginPath();
    billiardsCtx.moveTo(start.x, start.y);
    billiardsCtx.lineTo(end.x, end.y);
    billiardsCtx.stroke();
    billiardsCtx.restore();
  }

  function billiardsDrawAlcoveGrid() {
    const p = billiardsState.p;
    const bounds = billiardsViewportCorners(80);
    const latticeStyle = { color: "#edf0f5", width: 0.55 };
    const wallStyle = { color: "#d4d8e1", width: 1.6 };
    const axisStyle = { color: "#202020", width: 1.6 };
    const aLines = Math.max(0, Math.ceil(bounds.maxA) - Math.floor(bounds.minA) + 1);
    const bLines = Math.max(0, Math.ceil(bounds.maxB) - Math.floor(bounds.minB) + 1);
    const totalLines = Math.max(
      0,
      Math.ceil(bounds.maxTotal) - Math.floor(bounds.minTotal) + 1
    );
    const stride = Math.max(1, Math.ceil((aLines + bLines + totalLines) / 7000));

    for (let a = Math.floor(bounds.minA / stride) * stride; a <= Math.ceil(bounds.maxA); a += stride) {
      billiardsDrawWeightLine(a, bounds.minB - bounds.extra, a, bounds.maxB + bounds.extra, latticeStyle);
    }
    for (let b = Math.floor(bounds.minB / stride) * stride; b <= Math.ceil(bounds.maxB); b += stride) {
      billiardsDrawWeightLine(bounds.minA - bounds.extra, b, bounds.maxA + bounds.extra, b, latticeStyle);
    }
    for (let total = Math.floor(bounds.minTotal / stride) * stride; total <= Math.ceil(bounds.maxTotal); total += stride) {
      billiardsDrawWeightLine(
        bounds.minA - bounds.extra,
        total - (bounds.minA - bounds.extra),
        bounds.maxA + bounds.extra,
        total - (bounds.maxA + bounds.extra),
        latticeStyle
      );
    }

    if (bounds.minB - bounds.extra <= 0 && 0 <= bounds.maxB + bounds.extra) {
      billiardsDrawWeightLine(bounds.minA - bounds.extra, 0, bounds.maxA + bounds.extra, 0, axisStyle);
    }
    if (bounds.minA - bounds.extra <= 0 && 0 <= bounds.maxA + bounds.extra) {
      billiardsDrawWeightLine(0, bounds.minB - bounds.extra, 0, bounds.maxB + bounds.extra, axisStyle);
    }
    for (let level = Math.floor(bounds.minA / p) - 1; level <= Math.ceil(bounds.maxA / p) + 1; level += 1) {
      const a = p * level;
      if (a !== 0) {
        billiardsDrawWeightLine(a, bounds.minB - bounds.extra, a, bounds.maxB + bounds.extra, wallStyle);
      }
    }
    for (let level = Math.floor(bounds.minB / p) - 1; level <= Math.ceil(bounds.maxB / p) + 1; level += 1) {
      const b = p * level;
      if (b !== 0) {
        billiardsDrawWeightLine(bounds.minA - bounds.extra, b, bounds.maxA + bounds.extra, b, wallStyle);
      }
    }
    for (let level = Math.floor(bounds.minTotal / p) - 1; level <= Math.ceil(bounds.maxTotal / p) + 1; level += 1) {
      const total = p * level;
      if (total !== 0) {
        billiardsDrawWeightLine(
          bounds.minA - bounds.extra,
          total - (bounds.minA - bounds.extra),
          bounds.maxA + bounds.extra,
          total - (bounds.maxA + bounds.extra),
          wallStyle
        );
      }
    }
  }

  function billiardsDrawDominantAxes() {
    const bounds = billiardsViewportCorners(80);
    const axisStyle = { color: "#202020", width: 1.8, dash: [] };
    if (bounds.minB - bounds.extra <= 0 && 0 <= bounds.maxB + bounds.extra) {
      billiardsDrawWeightLine(bounds.minA - bounds.extra, 0, bounds.maxA + bounds.extra, 0, axisStyle);
    }
    if (bounds.minA - bounds.extra <= 0 && 0 <= bounds.maxA + bounds.extra) {
      billiardsDrawWeightLine(0, bounds.minB - bounds.extra, 0, bounds.maxB + bounds.extra, axisStyle);
    }
  }

  function billiardsDrawWallGraph() {
    const p = billiardsState.p;
    const bounds = billiardsViewportCorners(80);
    const minA = Math.max(0, Math.floor(bounds.minA) - 2);
    const maxA = Math.ceil(bounds.maxA) + 2;
    const minB = Math.max(0, Math.floor(bounds.minB) - 2);
    const maxB = Math.ceil(bounds.maxB) + 2;
    billiardsCtx.save();
    billiardsCtx.strokeStyle = "rgba(88, 96, 110, 0.36)";
    billiardsCtx.lineWidth = 1.15;
    for (let a = minA; a <= maxA; a += 1) {
      for (let b = minB; b <= maxB; b += 1) {
        const source = [a, b];
        if (!billiardsIsGammaWallVertex(source, p)) {
          continue;
        }
        for (const direction of BILLIARDS_DIRECTIONS) {
          const target = billiardsAddWeight(source, direction);
          if (!billiardsDominant(target) || !billiardsEdgeExists(source, direction, p)) {
            continue;
          }
          const start = billiardsWorldToScreen(triangularXY(a, b));
          const end = billiardsWorldToScreen(triangularXY(target[0], target[1]));
          billiardsCtx.beginPath();
          billiardsCtx.moveTo(start.x, start.y);
          billiardsCtx.lineTo(end.x, end.y);
          billiardsCtx.stroke();
        }
      }
    }
    billiardsCtx.restore();
  }

  function billiardsCurrentRecords() {
    const data = billiardsState.data;
    if (!data) {
      return [];
    }
    const allowed = new Set([
      billiardsState.wallIndex,
      billiardsState.wallIndex - 1,
      billiardsState.wallIndex - 2,
    ]);
    return data.records
      .filter((record) => (
        billiardsState.showAll
          ? record.n <= billiardsState.wallIndex
          : allowed.has(record.n)
      ))
      .map((record) => ({
        ...record,
        zetaRole: allowed.has(record.n)
          ? `label ${billiardsState.wallIndex - record.n === 0 ? "i" : `i-${billiardsState.wallIndex - record.n}`}`
          : "past",
      }));
  }

  function billiardsCurrentWallPoint() {
    return { a: Math.floor(billiardsState.wallIndex / 2), b: 0 };
  }

  function billiardsHeatmapColor(value) {
    const t = clamp(0, 1, value);
    if (t < 1 / 3) {
      const local = t * 3;
      return `hsl(${217 - 75 * local}, ${91 - 18 * local}%, ${60 - 11 * local}%)`;
    }
    if (t < 2 / 3) {
      const local = (t - 1 / 3) * 3;
      return `hsl(${142 - 94 * local}, ${73 + 23 * local}%, ${49 + 14 * local}%)`;
    }
    const local = (t - 2 / 3) * 3;
    return `hsl(${48 - 48 * local}, ${96 - 22 * local}%, ${63 - 15 * local}%)`;
  }

  function billiardsZoomCappedRadius(radius) {
    return Math.min(radius, Math.max(0.85, billiardsState.scale * 0.34));
  }

  function billiardsPointStyle(record, context) {
    if (billiardsState.powerSizeMode) {
      const power = Math.abs(record.k);
      const heat = context.maxPower ? power / context.maxPower : 0;
      return {
        fill: billiardsHeatmapColor(heat),
        stroke: "#111827",
        alpha: record.n >= billiardsState.wallIndex - 2 ? 0.92 : 0.48,
        radius: Math.max(3.2, 10.5 - 1.35 * power),
      };
    }

    const age = billiardsState.wallIndex - record.n;
    if (age === 0) {
      return { fill: "#dc2626", stroke: "#991b1b", alpha: 0.9, radius: 9.5 };
    }
    if (age === 1) {
      return { fill: "#f59e0b", stroke: "#92400e", alpha: 0.9, radius: 8.4 };
    }
    if (age === 2) {
      return { fill: "#2563eb", stroke: "#1e3a8a", alpha: 0.9, radius: 7.4 };
    }
    return { fill: "#9ca3af", stroke: "#6b7280", alpha: 0.38, radius: 4.8 };
  }

  function billiardsLabelText(record) {
    const power = record.k === 0 ? "" : `v^${record.k}`;
    return `${record.n}${power}`;
  }

  function billiardsDrawPoint(record, style) {
    const screen = billiardsWorldToScreen(triangularXY(record.a, record.b));
    if (
      screen.x < -20 ||
      screen.x > billiardsState.width + 20 ||
      screen.y < -20 ||
      screen.y > billiardsState.height + 20
    ) {
      return;
    }
    const radius = billiardsState.powerSizeMode
      ? style.radius
      : style.radius + Math.max(0, record.count - 1) * 1.4;
    const visibleRadius = billiardsZoomCappedRadius(radius);
    billiardsCtx.save();
    billiardsCtx.globalAlpha = style.alpha;
    billiardsCtx.fillStyle = style.fill;
    billiardsCtx.beginPath();
    billiardsCtx.arc(screen.x, screen.y, visibleRadius, 0, Math.PI * 2);
    billiardsCtx.fill();
    if (!billiardsState.powerSizeMode) {
      billiardsCtx.strokeStyle = style.stroke;
      billiardsCtx.lineWidth = 1.1;
      billiardsCtx.stroke();
    }
    billiardsCtx.restore();
    return { record, screen, radius: visibleRadius };
  }

  function billiardsDrawCurrentWallPoint() {
    const wall = billiardsCurrentWallPoint();
    const screen = billiardsWorldToScreen(triangularXY(wall.a, wall.b));
    if (
      screen.x < -24 ||
      screen.x > billiardsState.width + 24 ||
      screen.y < -24 ||
      screen.y > billiardsState.height + 24
    ) {
      return;
    }
    const radius = billiardsZoomCappedRadius(3.2);
    billiardsCtx.save();
    billiardsCtx.fillStyle = "#111827";
    billiardsCtx.beginPath();
    billiardsCtx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    billiardsCtx.fill();
    billiardsCtx.fillStyle = "#111827";
    billiardsCtx.font = "12px 'Fira Mono', monospace";
    billiardsCtx.textAlign = "center";
    billiardsCtx.textBaseline = "top";
    billiardsCtx.fillText(`x${billiardsState.wallIndex}`, screen.x, screen.y + radius + 5);
    billiardsCtx.restore();
  }

  function billiardsDrawLabels(drawRecords) {
    if (!billiardsState.showLabels) {
      return;
    }
    const groups = new Map();
    for (const drawRecord of drawRecords) {
      const { record, screen, radius } = drawRecord;
      if (record.n < billiardsState.wallIndex - 2) {
        continue;
      }
      const key = `${record.a},${record.b}`;
      const existing = groups.get(key);
      if (existing) {
        existing.texts.push(billiardsLabelText(record));
        existing.radius = Math.max(existing.radius, radius);
      } else {
        groups.set(key, {
          x: screen.x,
          y: screen.y,
          radius,
          texts: [billiardsLabelText(record)],
        });
      }
    }
    billiardsCtx.save();
    billiardsCtx.globalAlpha = 1;
    billiardsCtx.fillStyle = "#111827";
    billiardsCtx.font = "11px 'Fira Mono', monospace";
    billiardsCtx.textAlign = "left";
    billiardsCtx.textBaseline = "middle";
    for (const group of groups.values()) {
      const text = group.texts.join("+");
      billiardsCtx.fillText(text, group.x + group.radius + 3, group.y - group.radius);
    }
    billiardsCtx.restore();
  }

  function billiardsDrawPoints() {
    const records = billiardsCurrentRecords();
    billiardsState.visibleRecords = records;
    const powers = records.map((record) => Math.abs(record.k));
    const context = {
      maxPower: powers.length ? Math.max(...powers) : 0,
    };
    const styledRecords = records.map((record) => ({
      record,
      style: billiardsPointStyle(record, context),
    }));
    if (billiardsState.powerSizeMode) {
      styledRecords.sort((left, right) => right.style.radius - left.style.radius);
    }
    const drawn = [];
    for (const { record, style } of styledRecords) {
      const drawRecord = billiardsDrawPoint(record, style);
      if (drawRecord) {
        drawn.push(drawRecord);
      }
    }
    billiardsDrawLabels(drawn);
  }

  function billiardsUpdateLegend() {
    const entries = billiardsState.powerSizeMode
      ? [
        `<span class="legend-item"><span class="swatch gradient"></span><span>gradient: increasing \\(|k|\\) in \\(v^k\\)</span></span>`,
        `<span class="legend-item"><span class="swatch" style="background:#ffffff"></span><span>larger balls: lower \\(|k|\\)</span></span>`,
      ]
      : [
        `<span class="legend-item"><span class="swatch" style="background:#dc2626"></span><span>label \\(i\\)</span></span>`,
        `<span class="legend-item"><span class="swatch" style="background:#f59e0b"></span><span>label \\(i-1\\)</span></span>`,
        `<span class="legend-item"><span class="swatch" style="background:#2563eb"></span><span>label \\(i-2\\)</span></span>`,
        `<span class="legend-item"><span class="swatch" style="background:#9ca3af"></span><span>earlier \\(\\widetilde Z\\)</span></span>`,
      ];
    entries.push(
      `<span class="legend-item"><span class="swatch" style="background:#111827"></span><span>black dot: \\(x_i\\)</span></span>`
    );
    billiardsLegend.innerHTML = entries.join("");
    renderLatex(billiardsLegend);
  }

  function billiardsUpdateCaptionAndDetails() {
    const data = billiardsState.data;
    if (!data) {
      billiardsCaption.textContent = "No billiards data.";
      billiardsDetails.textContent = "No billiards data.";
      return;
    }
    const allowed = new Set([
      billiardsState.wallIndex,
      billiardsState.wallIndex - 1,
      billiardsState.wallIndex - 2,
    ]);
    const contributors = data.records.filter((record) => allowed.has(record.n));
    const shown = contributors.slice(0, 18);
    const rows = shown.map((record) => {
      const multiplicity = record.count === 1 ? "" : ` x${record.count}`;
      return `<li>\\((${record.a},${record.b})\\), label \\(${record.n}(v^{${record.k}})\\)${escapeHtml(multiplicity)}</li>`;
    });
    if (contributors.length > shown.length) {
      rows.push(`<li>... ${contributors.length - shown.length} more contributors</li>`);
    }
    const rangeText = billiardsState.wallIndex < expectedWallLimit(billiardsState.p)
      ? "inside"
      : "outside";
    billiardsCaption.innerHTML = `\\(p=${billiardsState.p}\\), \\(i=${billiardsState.wallIndex}\\), \\(x_i\\) at \\((${Math.floor(billiardsState.wallIndex / 2)},0)\\); ${contributors.length} visible \\({}^p\\zeta_i\\) contributors; ${rangeText} expected range \\(i<${expectedWallLimit(billiardsState.p)}\\).`;
    if (!billiardsState.showDetails) {
      billiardsDetails.innerHTML = "";
      billiardsDetails.hidden = true;
      renderLatex(billiardsCaption);
      return;
    }
    billiardsDetails.hidden = false;
    billiardsDetails.innerHTML = [
      `<strong>Wall element \\({}^p\\zeta_{${billiardsState.wallIndex}}\\)</strong>`,
      `<p>The black dot marks the current wall element \\(x_{${billiardsState.wallIndex}}\\), drawn at \\((\\lfloor i/2\\rfloor,0)=(${Math.floor(billiardsState.wallIndex / 2)},0)\\). The basis element starts with \\(n_{x_{${billiardsState.wallIndex}}}\\), and the other balls show finite \\(\\widetilde Z\\) contributions with label indices \\(i,i-1,i-2\\). In this lattice-point view, \\(x_{2m}\\) and \\(x_{2m+1}\\) sit at the same displayed wall point \\((m,0)\\); the slider index distinguishes them. Overlapping labels are written as a sum.</p>`,
      billiardsState.powerSizeMode
        ? `<p>In power-size mode, colour follows a continuous heatmap gradient for the absolute exponent \\(|k|\\) in \\(v^k\\), and ball size also decreases as \\(|k|\\) grows. Records at the same lattice point are drawn on top of each other.</p>`
        : "",
      `<ol>${rows.join("") || "<li>No finite \\(\\widetilde Z\\) contributors at this index.</li>"}</ol>`,
      `<p>Generated ${data.generations.length} wall generations; Jensen merge events in the truncation: ${data.mergedEvents}.</p>`,
    ].join("");
    renderLatex(billiardsCaption);
    renderLatex(billiardsDetails);
  }

  function billiardsDraw() {
    billiardsResizeCanvas();
    if (!billiardsState.data) {
      billiardsRebuildData();
    }
    if (billiardsState.viewNeedsReset) {
      billiardsFitView();
    }
    billiardsCtx.save();
    billiardsCtx.clearRect(0, 0, billiardsState.width, billiardsState.height);
    billiardsCtx.fillStyle = "#ffffff";
    billiardsCtx.fillRect(0, 0, billiardsState.width, billiardsState.height);
    billiardsCtx.restore();
    billiardsDrawAlcoveGrid();
    if (billiardsState.showWallGraph) {
      billiardsDrawWallGraph();
    }
    billiardsDrawPoints();
    billiardsDrawCurrentWallPoint();
    billiardsDrawDominantAxes();
    billiardsUpdateLegend();
    billiardsUpdateCaptionAndDetails();
  }

  function billiardsRefresh(options = {}) {
    const oldP = billiardsState.p;
    const oldMaxLabel = billiardsState.maxLabel;
    billiardsSyncControls();
    if (options.rebuild || oldP !== billiardsState.p || oldMaxLabel !== billiardsState.maxLabel) {
      billiardsRebuildData();
      billiardsState.viewNeedsReset = Boolean(options.resetView);
    } else {
      billiardsState.viewNeedsReset = Boolean(options.resetView);
    }
    billiardsDraw();
  }

  function billiardsPointerPoint(event) {
    const rect = billiardsCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function billiardsUpdateReadout(event) {
    const point = billiardsPointerPoint(event);
    const wall = billiardsCurrentWallPoint();
    const wallScreen = billiardsWorldToScreen(triangularXY(wall.a, wall.b));
    if (Math.hypot(wallScreen.x - point.x, wallScreen.y - point.y) <= 15) {
      billiardsReadout.textContent = `x${billiardsState.wallIndex} at (${wall.a},${wall.b}), the leading wall term n_x${billiardsState.wallIndex}.`;
      return;
    }
    let best = null;
    let bestDistance = Infinity;
    for (const record of billiardsState.visibleRecords) {
      const screen = billiardsWorldToScreen(triangularXY(record.a, record.b));
      const distance = Math.hypot(screen.x - point.x, screen.y - point.y);
      if (distance < bestDistance) {
        best = record;
        bestDistance = distance;
      }
    }
    if (!best || bestDistance > 14) {
      billiardsReadout.textContent = "No labelled point under cursor.";
      return;
    }
    const multiplicity = best.count === 1 ? "" : `, multiplicity ${best.count}`;
    billiardsReadout.textContent = `(${best.a},${best.b}), label ${best.n}(v^${best.k})${multiplicity}.`;
  }

  function billiardsZoomAround(point, factor) {
    const before = billiardsScreenToWorld(point.x, point.y);
    billiardsState.scale = Math.max(
      billiardsState.minScale,
      Math.min(80, billiardsState.scale * factor)
    );
    const after = billiardsWorldToScreen(before);
    billiardsState.offsetX += point.x - after.x;
    billiardsState.offsetY += point.y - after.y;
    billiardsDraw();
  }

  function billiardsAnimationStep(timestamp) {
    if (!billiardsState.playing) {
      billiardsAnimationFrame = null;
      return;
    }
    if (!billiardsLastAnimationTime || timestamp - billiardsLastAnimationTime >= billiardsState.speedMs) {
      billiardsLastAnimationTime = timestamp;
      const nextIndex = billiardsState.wallIndex >= billiardsState.maxLabel
        ? 0
        : billiardsState.wallIndex + 1;
      billiardsWallIndexInput.value = String(nextIndex);
      billiardsWallIndexNumber.value = String(nextIndex);
      billiardsRefresh({ resetView: false });
    }
    billiardsAnimationFrame = window.requestAnimationFrame(billiardsAnimationStep);
  }

  function billiardsSetPlaying(playing) {
    billiardsState.playing = playing;
    billiardsPlayButton.textContent = playing ? "Pause" : "Play";
    if (playing && billiardsAnimationFrame === null) {
      billiardsLastAnimationTime = 0;
      billiardsAnimationFrame = window.requestAnimationFrame(billiardsAnimationStep);
    }
  }

  function billiardsSetDefaultMovieLengthForPrime() {
    const defaultMaxLabel = expectedWallLimit(Number(billiardsPrimeSelect.value)) - 1;
    billiardsMaxLabelNumber.value = String(defaultMaxLabel);
    billiardsMaxLabelInput.value = String(
      clamp(Number(billiardsMaxLabelInput.min), Number(billiardsMaxLabelInput.max), defaultMaxLabel)
    );
    if (Number(billiardsWallIndexNumber.value) > defaultMaxLabel) {
      billiardsWallIndexNumber.value = String(defaultMaxLabel);
      billiardsWallIndexInput.value = String(defaultMaxLabel);
    }
  }

  function installBilliardsEventHandlers() {
    billiardsPrimeSelect.addEventListener("input", () => {
      billiardsSetDefaultMovieLengthForPrime();
      billiardsRefresh({ rebuild: true, resetView: true });
    });
    billiardsMaxLabelInput.addEventListener("input", () => {
      billiardsMaxLabelNumber.value = billiardsMaxLabelInput.value;
      if (Number(billiardsWallIndexNumber.value) > Number(billiardsMaxLabelInput.value)) {
        billiardsWallIndexNumber.value = billiardsMaxLabelInput.value;
      }
      billiardsRefresh({ rebuild: true, resetView: true });
    });
    billiardsMaxLabelNumber.addEventListener("input", () => {
      const value = integerInputValue(
        billiardsMaxLabelNumber,
        billiardsState.maxLabel,
        1,
        BILLIARDS_MAX_LABEL_LIMIT
      );
      billiardsMaxLabelInput.value = String(
        clamp(Number(billiardsMaxLabelInput.min), Number(billiardsMaxLabelInput.max), value)
      );
      if (Number(billiardsWallIndexNumber.value) > value) {
        billiardsWallIndexNumber.value = String(value);
      }
      billiardsRefresh({ rebuild: true, resetView: true });
    });
    billiardsWallIndexInput.addEventListener("input", () => {
      billiardsWallIndexNumber.value = billiardsWallIndexInput.value;
      billiardsRefresh({ resetView: false });
    });
    billiardsWallIndexNumber.addEventListener("input", () => {
      billiardsWallIndexInput.value = String(
        clamp(
          0,
          billiardsState.maxLabel,
          integerInputValue(
            billiardsWallIndexNumber,
            billiardsState.wallIndex,
            0,
            BILLIARDS_MAX_LABEL_LIMIT
          )
        )
      );
      billiardsRefresh({ resetView: false });
    });
    for (const control of [
      billiardsSpeedInput,
      billiardsShowWallGraphInput,
      billiardsShowAllInput,
      billiardsShowLabelsInput,
      billiardsPowerSizeModeInput,
      billiardsShowDetailsInput,
    ]) {
      control.addEventListener("input", () => billiardsRefresh({ resetView: false }));
    }
    billiardsPlayButton.addEventListener("click", () => {
      billiardsSetPlaying(!billiardsState.playing);
    });
    billiardsResetViewButton.addEventListener("click", () => {
      billiardsState.viewNeedsReset = true;
      billiardsDraw();
    });
    billiardsCanvas.addEventListener("pointerdown", (event) => {
      billiardsState.dragging = true;
      billiardsState.moved = false;
      billiardsState.lastPointer = billiardsPointerPoint(event);
      billiardsCanvas.setPointerCapture(event.pointerId);
    });
    billiardsCanvas.addEventListener("pointermove", (event) => {
      const point = billiardsPointerPoint(event);
      if (billiardsState.dragging && billiardsState.lastPointer) {
        const dx = point.x - billiardsState.lastPointer.x;
        const dy = point.y - billiardsState.lastPointer.y;
        if (Math.hypot(dx, dy) > 2) {
          billiardsState.moved = true;
        }
        billiardsState.offsetX += dx;
        billiardsState.offsetY += dy;
        billiardsState.lastPointer = point;
        billiardsDraw();
      } else {
        billiardsUpdateReadout(event);
      }
    });
    billiardsCanvas.addEventListener("pointerup", (event) => {
      billiardsState.dragging = false;
      billiardsState.lastPointer = null;
      billiardsCanvas.releasePointerCapture(event.pointerId);
    });
    billiardsCanvas.addEventListener("pointercancel", () => {
      billiardsState.dragging = false;
      billiardsState.lastPointer = null;
    });
    billiardsCanvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      const point = billiardsPointerPoint(event);
      const sensitivity = event.deltaY > 0 ? 0.00035 : 0.001;
      const factor = Math.exp(-event.deltaY * sensitivity);
      billiardsZoomAround(point, factor);
    }, { passive: false });
    window.addEventListener("resize", () => {
      billiardsState.viewNeedsReset = true;
      billiardsDraw();
    });
  }

  function refreshData(resetView) {
    syncControls();
    configureInitialView();
    state.viewNeedsReset = Boolean(resetView);
    draw();
  }

  function pointerPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function installEventHandlers() {
    const controlEvents = [
      primeSelect,
      windowSelect,
      dotSizeInput,
      showWeightGridInput,
      showAlcovesInput,
      showShiftedBoxInput,
      showAxisLabelsInput,
    ];
    for (const element of controlEvents) {
      element.addEventListener("input", () => {
        const resetView = element === primeSelect || element === windowSelect;
        refreshData(resetView);
      });
    }

    maxCoordinateInput.addEventListener("input", () => {
      maxCoordinateNumber.value = maxCoordinateInput.value;
      refreshData(true);
    });

    maxCoordinateNumber.addEventListener("input", () => {
      const value = integerInputValue(maxCoordinateNumber, state.maxCoordinate, 1, 10000);
      maxCoordinateInput.value = String(
        clamp(
          Number(maxCoordinateInput.min),
          Number(maxCoordinateInput.max),
          value
        )
      );
      refreshData(true);
    });

    resetViewButton.addEventListener("click", () => {
      state.viewNeedsReset = true;
      draw();
    });

    canvas.addEventListener("pointerdown", (event) => {
      state.dragging = true;
      state.lastPointer = pointerPoint(event);
      state.hoverWeight = null;
      updateCaption();
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", (event) => {
      const point = pointerPoint(event);
      if (state.dragging && state.lastPointer) {
        state.offsetX += point.x - state.lastPointer.x;
        state.offsetY += point.y - state.lastPointer.y;
        state.lastPointer = point;
        draw();
      } else {
        updateCaptionFromEvent(event);
      }
    });

    canvas.addEventListener("pointerup", (event) => {
      state.dragging = false;
      state.lastPointer = null;
      canvas.releasePointerCapture(event.pointerId);
      updateCaptionFromEvent(event);
    });

    canvas.addEventListener("pointercancel", () => {
      state.dragging = false;
      state.lastPointer = null;
      state.hoverWeight = null;
      updateCaption();
    });

    canvas.addEventListener("pointerleave", () => {
      state.hoverWeight = null;
      updateCaption();
    });

    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      const point = pointerPoint(event);
      const before = screenToWorld(point.x, point.y);
      const sensitivity = event.deltaY > 0 ? 0.00035 : 0.001;
      const factor = Math.exp(-event.deltaY * sensitivity);
      state.scale = Math.max(state.minScale, Math.min(80, state.scale * factor));
      const after = worldToScreen(before);
      state.offsetX += point.x - after.x;
      state.offsetY += point.y - after.y;
      draw();
    }, { passive: false });

    window.addEventListener("resize", () => {
      state.viewNeedsReset = true;
      draw();
    });
  }

  installEventHandlers();
  installTiltingEventHandlers();
  installCharacterEventHandlers();
  installPartitionEventHandlers();
  installBilliardsEventHandlers();
  if (window.BILLIARDS_LR_SELF_TEST) {
    runWeylArithmeticSelfTest();
  }
  refreshData(true);
  tiltingRefresh(true);
  characterRefresh(true);
  partitionRefresh();
  partitionMatrixResetForControls();
  billiardsRefresh({ rebuild: true, resetView: true });
  renderLatex(document.body);
}());

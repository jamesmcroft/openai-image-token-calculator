const numberFormat = new Intl.NumberFormat();

const currencyFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

/**
 * Build a plain-text summary of the calculation results suitable for
 * pasting into documents, messages, or cost analyses.
 *
 * @param {{ model: object, images: object[], imageResults: object[], totalTokens: number, totalCost: string|number, requestsPerDay?: number }} params
 * @returns {string}
 */
export function formatResultsAsText({
  model,
  images,
  imageResults,
  totalTokens,
  totalCost,
  requestsPerDay,
}) {
  const isPatch = model?.tokenizationType === "patch";
  const lines = ["Azure OpenAI Image Token Calculator"];

  // Model header
  const tokenLabel = isPatch ? "Patch-based" : "Tile-based";
  lines.push(`Model: ${model?.name ?? "Unknown"} [${tokenLabel}]`);

  if (model?.retirementDate) {
    lines.push(`Note: This model retires ${model.retirementDate}`);
  }

  if (model?.comment) {
    lines.push(`Note: ${model.comment}`);
  }

  lines.push(""); // blank separator

  // Per-image lines - carry original index through filtering
  const paired = (imageResults ?? []).map((result, i) => ({
    result,
    image: (images ?? [])[i],
    originalIndex: i,
  }));

  const validPairs = paired.filter(
    ({ result }) =>
      result &&
      typeof result.resizedHeight === "number" &&
      typeof result.resizedWidth === "number" &&
      result.tokenization,
  );

  validPairs.forEach(({ result, image, originalIndex }) => {
    const origW = image?.width ?? "?";
    const origH = image?.height ?? "?";
    const qty = image?.multiplier ?? 1;
    const resized = `${result.resizedWidth}x${result.resizedHeight}`;
    const tokens = numberFormat.format(result.tokenization.imageTokens);

    let detail;
    if (isPatch) {
      const patches = numberFormat.format(result.tokenization.totalPatches);
      detail = `${patches} patches`;
    } else {
      const tiles = numberFormat.format(result.tokenization.totalTiles);
      detail = `${tiles} tiles`;
    }

    lines.push(
      `Image ${originalIndex + 1}: ${origW}x${origH}, Qty ${qty} - Resized to ${resized} - ${detail} - ${tokens} tokens`,
    );
  });

  lines.push(""); // blank separator

  // Totals
  const formattedTokens = numberFormat.format(totalTokens);
  const formattedCost = currencyFormat.format(Number(totalCost));
  const costRate = `$${model?.costPerMillionTokens ?? "?"}/1M tokens`;

  lines.push(`Total tokens: ${formattedTokens}`);
  lines.push(`Estimated cost: ${formattedCost} (${costRate})`);

  // Cost projection (only when requestsPerDay > 0 and cost is positive)
  const unitCost = Number.parseFloat(totalCost ?? "0");
  if (requestsPerDay > 0 && Number.isFinite(unitCost) && unitCost > 0) {
    const dailyCost = unitCost * requestsPerDay;
    const monthlyCost = dailyCost * 30;
    lines.push("");
    lines.push("Cost Projection");
    lines.push(`Requests per day: ${numberFormat.format(requestsPerDay)}`);
    lines.push(`Daily: ${currencyFormat.format(dailyCost)}`);
    lines.push(`Monthly (30 days): ${currencyFormat.format(monthlyCost)}`);
  }

  return lines.join("\n");
}

/**
 * Build a plain-text comparison table of multiple model results suitable
 * for pasting into documents, messages, or cost analyses.
 *
 * @param {{ images: object[], comparisonResults: { model: object, totalTokens: number, totalCost: string|number, imageResults: object[] }[], requestsPerDay?: number }} params
 * @returns {string}
 */
export function formatComparisonAsText({ images, comparisonResults, requestsPerDay }) {
  const lines = [
    "Azure OpenAI Image Token Calculator - Model Comparison",
    "",
  ];

  // Image summary
  const validImages = (images ?? []).filter(
    (img) => img && img.width > 0 && img.height > 0,
  );
  if (validImages.length > 0) {
    const descriptions = validImages.map((img) => {
      const qty = img.multiplier ?? 1;
      return `${img.width}x${img.height}${qty > 1 ? ` (Qty ${qty})` : ""}`;
    });
    lines.push(`Images: ${descriptions.join(", ")}`);
    lines.push("");
  }

  if (!comparisonResults || comparisonResults.length === 0) {
    lines.push("No comparison results.");
    return lines.join("\n");
  }

  // Build table rows
  const rows = comparisonResults.map((r) => {
    const tokenType =
      r.model?.tokenizationType === "patch" ? "Patch" : "Tile";
    const tokens = numberFormat.format(r.totalTokens);
    const cost = currencyFormat.format(Number(r.totalCost));
    const rate = `$${r.model?.costPerMillionTokens ?? "?"}/1M tokens`;
    const name = r.model?.name ?? "Unknown";
    const retirement = r.model?.retirementDate
      ? `Retires ${r.model.retirementDate}`
      : "";
    return { name, tokenType, tokens, cost, rate, retirement };
  });

  // Calculate column widths for alignment
  const headers = {
    name: "Model",
    tokenType: "Type",
    tokens: "Total Tokens",
    cost: "Estimated Cost",
    rate: "Rate",
  };

  const cols = ["name", "tokenType", "tokens", "cost", "rate"];
  const widths = {};
  for (const col of cols) {
    widths[col] = Math.max(
      headers[col].length,
      ...rows.map((r) => r[col].length),
    );
  }

  const pad = (str, width) => str.padEnd(width);
  const headerLine = cols.map((c) => pad(headers[c], widths[c])).join(" | ");
  const separator = cols.map((c) => "-".repeat(widths[c])).join("-|-");

  lines.push(headerLine);
  lines.push(separator);

  for (const row of rows) {
    let line = cols.map((c) => pad(row[c], widths[c])).join(" | ");
    if (row.retirement) {
      line += ` (${row.retirement})`;
    }
    lines.push(line);
  }

  // Notes for models with comments
  const commented = comparisonResults.filter((r) => r.model?.comment);
  if (commented.length > 0) {
    lines.push("");
    for (const r of commented) {
      lines.push(`Note [${r.model?.name ?? "Unknown"}]: ${r.model.comment}`);
    }
  }

  // Cost projection (only when non-zero)
  if (requestsPerDay > 0) {
    lines.push("");
    lines.push(`Cost Projection (${numberFormat.format(requestsPerDay)} requests/day)`);
    for (const r of comparisonResults) {
      const unitCost = Number.parseFloat(r.totalCost ?? "0");
      if (!Number.isFinite(unitCost) || unitCost <= 0) continue;
      const daily = unitCost * requestsPerDay;
      const monthly = daily * 30;
      lines.push(
        `  ${r.model?.name ?? "Unknown"}: Daily ${currencyFormat.format(daily)} | Monthly ${currencyFormat.format(monthly)}`,
      );
    }
  }

  return lines.join("\n");
}

/**
 * Build a TSV (tab-separated values) version of single-model results
 * that pastes cleanly into spreadsheet applications.
 *
 * @param {{ model: object, images: object[], imageResults: object[], totalTokens: number, totalCost: string|number, requestsPerDay?: number }} params
 * @returns {string}
 */
export function formatResultsAsTsv({
  model,
  images,
  imageResults,
  totalTokens,
  totalCost,
  requestsPerDay,
}) {
  const isPatch = model?.tokenizationType === "patch";
  const unitLabel = isPatch ? "Patches" : "Tiles";
  const rows = [];

  rows.push(
    ["Image", "Original Size", "Qty", "Resized Size", unitLabel, "Tokens"].join(
      "\t",
    ),
  );

  const paired = (imageResults ?? []).map((result, i) => ({
    result,
    image: (images ?? [])[i],
    originalIndex: i,
  }));

  const validPairs = paired.filter(
    ({ result }) =>
      result &&
      typeof result.resizedHeight === "number" &&
      typeof result.resizedWidth === "number" &&
      result.tokenization,
  );

  validPairs.forEach(({ result, image, originalIndex }) => {
    const origSize = `${image?.width ?? "?"}x${image?.height ?? "?"}`;
    const qty = image?.multiplier ?? 1;
    const resized = `${result.resizedWidth}x${result.resizedHeight}`;
    const units = isPatch
      ? result.tokenization.totalPatches
      : result.tokenization.totalTiles;
    const tokens = result.tokenization.imageTokens;

    rows.push([originalIndex + 1, origSize, qty, resized, units, tokens].join("\t"));
  });

  rows.push(""); // blank separator row
  rows.push(["Total Tokens", totalTokens].join("\t"));

  const formattedCost = currencyFormat.format(Number(totalCost));
  const rate = `$${model?.costPerMillionTokens ?? "?"}/1M tokens`;
  rows.push(["Estimated Cost", `${formattedCost} (${rate})`].join("\t"));

  if (model?.name) {
    rows.push(["Model", model.name].join("\t"));
  }

  // Cost projection (only when requestsPerDay > 0 and cost is positive)
  const unitCost = Number.parseFloat(totalCost ?? "0");
  if (requestsPerDay > 0 && Number.isFinite(unitCost) && unitCost > 0) {
    const dailyCost = unitCost * requestsPerDay;
    const monthlyCost = dailyCost * 30;
    rows.push("");
    rows.push(["Requests/Day", requestsPerDay].join("\t"));
    rows.push(["Daily Cost", currencyFormat.format(dailyCost)].join("\t"));
    rows.push(["Monthly Cost (30d)", currencyFormat.format(monthlyCost)].join("\t"));
  }

  return rows.join("\n");
}

/**
 * Build a TSV (tab-separated values) version of comparison results
 * that pastes cleanly into spreadsheet applications.
 *
 * @param {{ comparisonResults: { model: object, totalTokens: number, totalCost: string|number, imageResults: object[] }[], requestsPerDay?: number }} params
 * @returns {string}
 */
export function formatComparisonAsTsv({ comparisonResults, requestsPerDay }) {
  const hasProjection = requestsPerDay > 0;
  const rows = [];

  const headers = ["Model", "Type", "Total Tokens", "Estimated Cost", "Rate", "Retirement"];
  if (hasProjection) {
    headers.push("Daily Cost", "Monthly Cost (30d)");
  }
  rows.push(headers.join("\t"));

  if (!comparisonResults || comparisonResults.length === 0) {
    return rows.join("\n");
  }

  for (const r of comparisonResults) {
    const name = r.model?.name ?? "Unknown";
    const tokenType =
      r.model?.tokenizationType === "patch" ? "Patch" : "Tile";
    const tokens = r.totalTokens;
    const cost = currencyFormat.format(Number(r.totalCost));
    const rate = `$${r.model?.costPerMillionTokens ?? "?"}/1M tokens`;
    const retirement = r.model?.retirementDate ?? "";

    const cols = [name, tokenType, tokens, cost, rate, retirement];
    if (hasProjection) {
      const unitCost = Number.parseFloat(r.totalCost ?? "0");
      const valid = Number.isFinite(unitCost) && unitCost > 0;
      const daily = valid ? unitCost * requestsPerDay : 0;
      const monthly = daily * 30;
      cols.push(
        valid ? currencyFormat.format(daily) : "-",
        valid ? currencyFormat.format(monthly) : "-",
      );
    }
    rows.push(cols.join("\t"));
  }

  return rows.join("\n");
}

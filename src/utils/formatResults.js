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
 * @param {{ model: object, images: object[], imageResults: object[], totalTokens: number, totalCost: string|number }} params
 * @returns {string}
 */
export function formatResultsAsText({
  model,
  images,
  imageResults,
  totalTokens,
  totalCost,
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

  // Per-image lines
  const paired = imageResults.map((result, i) => ({
    result,
    image: images[i],
  }));

  const validPairs = paired.filter(
    ({ result }) =>
      result &&
      typeof result.resizedHeight === "number" &&
      typeof result.resizedWidth === "number" &&
      result.tokenization,
  );

  validPairs.forEach(({ result, image }, i) => {
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
      `Image ${i + 1}: ${origW}x${origH}, Qty ${qty} - Resized to ${resized} - ${detail} - ${tokens} tokens`,
    );
  });

  lines.push(""); // blank separator

  // Totals
  const formattedTokens = numberFormat.format(totalTokens);
  const formattedCost = currencyFormat.format(Number(totalCost));
  const costRate = `$${model?.costPerMillionTokens ?? "?"}/1M tokens`;

  lines.push(`Total tokens: ${formattedTokens}`);
  lines.push(`Estimated cost: ${formattedCost} (${costRate})`);

  return lines.join("\n");
}

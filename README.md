# Azure OpenAI Image Token Calculator

[![CI](https://github.com/jamesmcroft/openai-image-token-calculator/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/jamesmcroft/openai-image-token-calculator/actions/workflows/ci.yml)

The Azure OpenAI Image Token Calculator is a simple application designed to estimate the number of tokens and the cost associated with processing images using Azure OpenAI's multimodal models, such as GPT-6, GPT-5, GPT-4.1, o-series, GPT-4o, and Computer Use. This tool helps users understand how tokens and costs are calculated based on the selected model's specifications and the number of images to be processed.

**Use the app**: https://jamesmcroft.github.io/openai-image-token-calculator/

## Usage

1. **Select a Model**: Browse the model cards using search and filter chips (Latest, Budget, Premium, Image Gen, Retiring) and tap a card to select it. In compare mode, select multiple models to see costs side by side.
2. **Add Images**: Click "Add Image" and configure the height, width, and quantity for each image in your request. Use presets for common sizes or enter custom dimensions.
3. **View Results**: Results update live as you change inputs. On desktop, the results panel is always visible on the right. On mobile and tablet, tap the bottom bar to view full results.
4. **Cost Projection**: Enter a "Requests per day" value in the results panel to see estimated daily and monthly costs.
5. **Share**: Copy results as text or a spreadsheet-friendly table, or copy a shareable link that encodes your full configuration.

Model prices are USD per million **uncached input tokens** for the deployment shown in the model name, using pay-as-you-go Standard pricing. GPT-6 Data Zone prices differ by location, so US, EU, and (where available) APAC are listed separately. The GPT-5.6 and GPT-6 rates were cross-checked against the [Azure model pricing catalog](https://github.com/mlflow/mlflow/blob/master/mlflow/utils/model_catalog/azure.json) on 7 October 2026; consult [Microsoft's Azure OpenAI pricing](https://azure.microsoft.com/en-us/pricing/details/azure-openai/#pricing) for the current advertised rates in your region. Output tokens, caching, long-context surcharges, and other processing tiers are not included. GPT-5.6 and GPT-6 family estimates use 32px patches, a 2,500-patch high-detail budget, and a 1.2 token multiplier; actual image token usage may vary by model and API detail setting.

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) installed on your machine (recommend using the LTS version)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/jamesmcroft/openai-image-token-calculator.git
   cd openai-image-token-calculator
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local server address (usually `http://localhost:5173`).

## Building the Application

To build the application for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory containing the compiled application.

## Contributing 🤝🏻

Contributions, issues and feature requests are welcome!

Feel free to check the [issues page](https://github.com/jamesmcroft/openai-image-token-calculator/issues). You can also take a look at the [contributing guide](https://github.com/jamesmcroft/openai-image-token-calculator/blob/main/CONTRIBUTING.md).

We actively encourage you to jump in and help with any issues, and if you find one, don't forget to log it!

## Support this project 💗

As many developers know, projects like this are built and maintained in maintainers' spare time. If you find this project useful, please **Star** the repo.

## Author

👤 **James Croft**

* Website: <https://www.jamescroft.co.uk>
* GitHub: [@jamesmcroft](https://github.com/jamesmcroft)
* LinkedIn: [@jmcroft](https://linkedin.com/in/jmcroft)

## License

This project is made available under the terms and conditions of the [MIT license](LICENSE).

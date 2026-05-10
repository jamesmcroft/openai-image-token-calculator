# Azure OpenAI Image Token Calculator

[![Build status](https://github.com/jamesmcroft/openai-image-token-calculator/actions/workflows/pr-validation.yml/badge.svg?branch=main)](https://github.com/jamesmcroft/openai-image-token-calculator/actions/workflows/pr-validation.yml)
[![GitHub Pages](https://github.com/jamesmcroft/openai-image-token-calculator/actions/workflows/github-pages.yml/badge.svg)](https://github.com/jamesmcroft/openai-image-token-calculator/actions/workflows/github-pages.yml)

The Azure OpenAI Image Token Calculator is a simple application designed to estimate the number of tokens and the cost associated with processing images using Azure OpenAI's multimodal models, such as GPT-5, GPT-4.1, o-series, GPT-4o, and Computer Use. This tool helps users understand the how the tokens and cost is calculated based on the selected model's specifications and the number of images to be processed.

**Use the app**: https://jamesmcroft.github.io/openai-image-token-calculator/

## Usage

1. **Select a Model**: Choose a model from the dropdown menu.
1. **Add Images**: Input the height and width of the images you will process in a single request. A multiplier can be applied also if you are processing many images of the same size.
1. **Calculate**: Click the "Calculate" button to get the token and cost estimates.
1. **View Results**: The results will display the token estimate and cost estimate based on the selected model.

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
* Github: [@jamesmcroft](https://github.com/jamesmcroft)
* LinkedIn: [@jmcroft](https://linkedin.com/in/jmcroft)

## License

This project is made available under the terms and conditions of the [MIT license](LICENSE).

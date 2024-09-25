# OpenAI Image Token Calculator

The OpenAI Image Token Calculator is a simple application designed to estimate the number of tokens and the cost associated with processing images using OpenAI's GPT-4o and 4o-mini models. This tool helps users understand the how the tokens and cost is calculated based on the selected model's specifications and the number of images to be processed.

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

## Contributing

Contributions are welcome! To contribute changes to the application:

1. Fork the repository.
2. Clone your forked repository.
3. Create a new branch for your changes.
4. Make your changes.
5. Commit your changes.
6. Push your changes to your forked repository.
7. Create a pull request!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

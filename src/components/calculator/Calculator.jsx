import { useState } from "react";
import { useBoundStore } from "../../stores";
import ModelSelector from "./ModelSelector";
import ImageEditor from "./ImageEditor";
import CalculatorOutput from "./CalculatorOutput";

function Calculator() {
  const [modelName, setModelName] = useState("");

  const runCalculation = useBoundStore((state) => state.runCalculation);

  const handleSubmit = (event) => {
    event.preventDefault();
    runCalculation();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <ModelSelector modelName={modelName} setModelName={setModelName} />

        <ImageEditor />
      </form>

      <CalculatorOutput />
    </div>
  );
}

export default Calculator;

import { useState } from "react";
import { useBoundStore } from "../../stores";
import ModelSelector from "./ModelSelector";
import ImageEditor from "./ImageEditor";
import CalculatorOutput from "./CalculatorOutput";
import { Button } from "@mui/material";

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

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Calculate
        </Button>
      </form>

      <CalculatorOutput />
    </div>
  );
}

export default Calculator;

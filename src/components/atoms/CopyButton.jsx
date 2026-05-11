import { useState, useEffect } from "react";
import { Button, Tooltip } from "@mui/material";
import { ContentCopy, Check, ErrorOutlined } from "@mui/icons-material";

export default function CopyButton({ getText, label = "Copy", tooltip, size = "small", variant = "outlined", sx }) {
  const [state, setState] = useState("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const icon =
    state === "copied" ? <Check fontSize="small" /> :
    state === "failed" ? <ErrorOutlined fontSize="small" /> :
    <ContentCopy fontSize="small" />;

  const color =
    state === "failed" ? "error" :
    state === "copied" ? "success" :
    "primary";

  const text =
    state === "copied" ? "Copied!" :
    state === "failed" ? "Failed" :
    label;

  const btn = (
    <Button
      size={size}
      variant={variant}
      startIcon={icon}
      color={color}
      onClick={state === "idle" ? handleCopy : undefined}
      disabled={state !== "idle"}
      sx={sx}
    >
      {text}
    </Button>
  );

  return tooltip ? <Tooltip title={tooltip}>{btn}</Tooltip> : btn;
}

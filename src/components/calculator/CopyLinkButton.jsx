import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Link, Check, ErrorOutlined } from "@mui/icons-material";

/**
 * Button that copies the current page URL to the clipboard.
 */
export default function CopyLinkButton() {
  const [copyState, setCopyState] = useState("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  const icon =
    copyState === "copied" ? (
      <Check />
    ) : copyState === "failed" ? (
      <ErrorOutlined />
    ) : (
      <Link />
    );

  const color =
    copyState === "failed"
      ? "error"
      : copyState === "copied"
        ? "success"
        : "primary";

  const label =
    copyState === "copied"
      ? "Copied!"
      : copyState === "failed"
        ? "Copy failed"
        : "Copy link";

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={icon}
      color={color}
      onClick={handleCopy}
      disabled={copyState !== "idle"}
    >
      {label}
    </Button>
  );
}

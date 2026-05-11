import { useState, useEffect, useId } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ContentCopy,
  Check,
  ArrowDropDown,
  TextSnippetOutlined,
  TableChartOutlined,
  ErrorOutlined,
} from "@mui/icons-material";

/**
 * A dropdown copy button that lets the user choose between plain-text
 * and spreadsheet-friendly (TSV) clipboard formats.
 *
 * @param {{ formats: { text: () => string, table: () => string } }} props
 */
export default function CopyResultsButton({ formats }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [copyState, setCopyState] = useState("idle");
  const menuId = useId();
  const buttonId = useId();
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCopy = async (getText) => {
    handleClose();
    try {
      await navigator.clipboard.writeText(getText());
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
      <ContentCopy />
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
        : "Copy results";

  const isIdle = copyState === "idle";

  return (
    <>
      <Button
        id={buttonId}
        size="small"
        variant="outlined"
        startIcon={icon}
        endIcon={isIdle ? <ArrowDropDown /> : undefined}
        color={color}
        onClick={isIdle ? handleOpen : undefined}
        disabled={!isIdle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {label}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        MenuListProps={{ "aria-labelledby": buttonId }}
      >
        <MenuItem onClick={() => handleCopy(formats.text)}>
          <ListItemIcon>
            <TextSnippetOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>As text</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleCopy(formats.table)}>
          <ListItemIcon>
            <TableChartOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>As table (for spreadsheets)</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

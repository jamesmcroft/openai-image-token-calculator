import { Stack } from "@mui/material";
import CopyButton from "../atoms/CopyButton";

export default function ActionBar({ copyFormats, linkUrl, sx }) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", ...sx }}>
      {copyFormats?.text && (
        <CopyButton
          getText={copyFormats.text}
          label="Text"
          tooltip="Copy as plain text"
        />
      )}
      {copyFormats?.table && (
        <CopyButton
          getText={copyFormats.table}
          label="Table"
          tooltip="Copy as table (for spreadsheets)"
        />
      )}
      {linkUrl !== undefined && (
        <CopyButton
          getText={() => linkUrl ?? window.location.href}
          label="Link"
          tooltip="Copy shareable link"
        />
      )}
    </Stack>
  );
}

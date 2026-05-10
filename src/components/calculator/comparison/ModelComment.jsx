import { Tooltip, IconButton } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

export default function ModelComment({ comment }) {
  if (!comment) return null;
  return (
    <Tooltip title={comment} arrow placement="top">
      <IconButton size="small" aria-label="Model note" sx={{ ml: 0.5 }}>
        <InfoOutlined fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  );
}

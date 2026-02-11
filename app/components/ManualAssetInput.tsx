import { useState } from "react";
import { useNavigate } from "react-router";
import ExcelUpload from "~/components/ExcelUpload";

interface ManualAssetInputProps {
  onBatchUpload: (ids: string[]) => void;
  isBatchLoading: boolean;
  batchError: Error | null;
}

export default function ManualAssetInput({
  onBatchUpload,
  isBatchLoading,
  batchError,
}: ManualAssetInputProps) {
  const navigate = useNavigate();
  const [assetId, setAssetId] = useState("");

  const handleSubmit = () => {
    const trimmedId = assetId.trim();
    if (!trimmedId) return;
    navigate(`/${trimmedId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleExcelUpload = (ids: string[]) => {
    setAssetId("");
    onBatchUpload(ids);
  };

  return (
    <>
      <input
        type="text"
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter Asset ID"
        style={{
          padding: "10px 16px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          width: "320px",
          outline: "none",
        }}
      />
      <span style={{ fontSize: "13px", color: "#888" }}>
        {isBatchLoading ? (
          "Loading..."
        ) : batchError ? (
          <span style={{ color: "red" }}>{batchError.message}</span>
        ) : (
          <>
            Press <strong>Enter</strong> to load player
          </>
        )}
      </span>
      <ExcelUpload onUpload={handleExcelUpload} />
    </>
  );
}

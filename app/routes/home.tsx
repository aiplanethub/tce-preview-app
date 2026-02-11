import { useState } from "react";
import type { Route } from "./+types/home";
import { Outlet, useNavigate, useLocation, useMatches } from "react-router";
import { ensureAuthenticated, logout } from "~/lib/auth";
import { useBatchAssetData } from "~/lib/tce-queries";
import VideoPlayerSkeleton from "~/components/VideoPlayerSkeleton";
import ExcelUpload from "~/components/ExcelUpload";
import AssetGrid from "~/components/AssetGrid";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TCE Assets Preview" },
    { name: "description", content: "Preview TCE Assets" },
  ];
}

export async function clientLoader() {
  const userInfo = await ensureAuthenticated();
  return userInfo;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [assetId, setAssetId] = useState("");
  const [batchAssetIds, setBatchAssetIds] = useState<string[]>([]);

  const {
    data: batchData,
    isLoading: isBatchLoading,
    error: batchError,
  } = useBatchAssetData(batchAssetIds);

  // Check if we're on /:assetId from grid (dialog mode) vs direct navigation
  const fromGrid = location.state?.fromGrid === true;
  const matches = useMatches();
  // If any match has params.assetId, we're on the asset child route
  const isAssetRoute = matches.some((m) => "assetId" in m.params);

  // Show layout content on index route, or on asset route when navigated from grid (dialog overlay)
  // Hide layout when asset route is active without grid context (direct nav / refresh)
  const showLayoutContent = !isAssetRoute || (fromGrid && !!batchData);

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

  const onAssetSelect = (asset: TCEAsset) =>
    navigate(`/${asset.assetId}`, {
      state: { fromGrid: true },
    });

  const handleExcelUpload = (ids: string[]) => {
    setAssetId("");
    setBatchAssetIds(ids);
  };

  const showIdleState = !batchData && !isBatchLoading;

  if (!showLayoutContent) {
    return <Outlet context={{ batchData }} />;
  }

  const navButtonStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
        }}
      >
        <button style={navButtonStyle} onClick={() => navigate("/")}>
          Home
        </button>
        <button style={navButtonStyle} onClick={logout}>
          Logout
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "16px 24px",
          ...(showIdleState ? { flex: 1, justifyContent: "center" } : {}),
        }}
      >
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          Preview TCE Assets
        </h1>
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
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {isBatchLoading && !batchData && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "24px",
            }}
          >
            <VideoPlayerSkeleton />
          </div>
        )}

        {batchData && batchData.assets.length > 0 && (
          <AssetGrid assets={batchData.assets} onSelect={onAssetSelect} />
        )}
      </div>

      <Outlet context={{ batchData }} />
    </div>
  );
}

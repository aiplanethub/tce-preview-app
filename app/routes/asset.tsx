import { useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useOutletContext,
} from "react-router";
import { redirectToLogin, logout } from "~/lib/auth";
import { useTCEPlayerData } from "~/lib/tce-queries";
import TCEPlayer from "~/components/TCEPlayer";
import PlayerDialog from "~/components/PlayerDialog";
import VideoPlayerSkeleton from "~/components/VideoPlayerSkeleton";

interface OutletContextType {
  batchData: {
    accessToken: string;
    expiryTime: number;
    expiresIn: number;
    assets: TCEAsset[];
  } | null;
}

export async function clientLoader() {
  if (!sessionStorage.getItem("token")) {
    redirectToLogin();
  }
  return null;
}

export default function Asset() {
  const { assetId: paramAssetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { batchData } = useOutletContext<OutletContextType>();
  const fromGrid = location.state?.fromGrid === true;

  const [inputValue, setInputValue] = useState(paramAssetId || "");

  // Find the asset in batch data when navigated from grid
  const gridAsset = batchData?.assets.find((a) => a.assetId === paramAssetId);

  // Only fetch individual data when NOT from grid
  const {
    data: playerData,
    isLoading,
    error,
  } = useTCEPlayerData(fromGrid && gridAsset ? "" : paramAssetId || "");

  const handleSubmit = () => {
    const trimmedId = inputValue.trim();
    if (!trimmedId) return;
    navigate(`/${trimmedId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Dialog mode: navigated from grid with batch data available
  if (fromGrid && gridAsset && batchData) {
    return (
      <PlayerDialog
        asset={gridAsset}
        accessToken={batchData.accessToken}
        expiryTime={batchData.expiryTime}
        expiresIn={batchData.expiresIn}
        onClose={() => navigate("/")}
      />
    );
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

  // Full page mode: direct navigation
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
        }}
      >
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          Preview TCE Asset
        </h1>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Asset ID"
          disabled={isLoading}
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
          {isLoading ? (
            "Loading..."
          ) : error ? (
            <span style={{ color: "red" }}>{error.message}</span>
          ) : (
            <>
              Press <strong>Enter</strong> to load player
            </>
          )}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        {isLoading && !playerData && (
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

        {playerData && (
          <TCEPlayer
            accessToken={playerData.accessToken}
            expiryTime={playerData.expiryTime}
            expiresIn={playerData.expiresIn}
            asset={playerData.asset}
          />
        )}
      </div>
    </div>
  );
}

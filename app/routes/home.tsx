import { useState, useEffect, useCallback } from "react";
import type { Route } from "./+types/home";
import {
  Outlet,
  useNavigate,
  useLocation,
  useMatches,
  useSearchParams,
} from "react-router";
import { ensureAuthenticated, logout } from "~/lib/auth";
import { useBatchAssetData } from "~/lib/tce-queries";
import VideoPlayerSkeleton from "~/components/VideoPlayerSkeleton";
import AssetGrid from "~/components/AssetGrid";

type Manifest = Record<string, { name: string; path: string }[]>;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [batchAssetIds, setBatchAssetIds] = useState<string[]>([]);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const selectedGrade = searchParams.get("grade") ?? "";
  const selectedFile = searchParams.get("book") ?? "";

  useEffect(() => {
    fetch("/azvasa/manifest.json")
      .then((r) => r.json())
      .then((data: Manifest) => setManifest(data))
      .catch(() => setManifest(null));
  }, []);

  const grades = manifest
    ? Object.keys(manifest).sort((a, b) => Number(a) - Number(b))
    : [];
  const filesForGrade =
    selectedGrade && manifest ? (manifest[selectedGrade] ?? []) : [];

  const loadAssetIds = useCallback(async (filePath: string) => {
    setFileLoading(true);
    try {
      const resp = await fetch(filePath);
      const ids: string[] = await resp.json();
      setBatchAssetIds(ids);
    } catch {
      setBatchAssetIds([]);
    } finally {
      setFileLoading(false);
    }
  }, []);

  // Auto-load when book param is present (e.g. on page load / shared URL)
  useEffect(() => {
    if (selectedFile) {
      loadAssetIds(selectedFile);
    }
  }, [selectedFile, loadAssetIds]);

  const handleGradeChange = (grade: string) => {
    setSearchParams(grade ? { grade } : {});
  };

  const handleBookChange = (book: string) => {
    if (book) {
      setSearchParams({ grade: selectedGrade, book });
    } else {
      setSearchParams({ grade: selectedGrade });
    }
  };

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

  const onAssetSelect = (asset: TCEAsset) =>
    navigate(`/${asset.assetId}?${searchParams.toString()}`, {
      state: { fromGrid: true },
    });

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

        {manifest && grades.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginTop: "8px",
            }}
          >
            <select
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
              }}
            >
              <option value="">Select Grade</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>

            {filesForGrade.length > 0 && (
              <select
                value={selectedFile}
                onChange={(e) => handleBookChange(e.target.value)}
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                  maxWidth: "320px",
                }}
              >
                <option value="">Select Book</option>
                {filesForGrade.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}

            {fileLoading && (
              <span style={{ fontSize: "13px", color: "#888" }}>
                Loading...
              </span>
            )}
          </div>
        )}

        {isBatchLoading && (
          <span style={{ fontSize: "13px", color: "#888" }}>
            Loading assets...
          </span>
        )}
        {batchError && (
          <span style={{ fontSize: "13px", color: "red" }}>
            {batchError.message}
          </span>
        )}
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

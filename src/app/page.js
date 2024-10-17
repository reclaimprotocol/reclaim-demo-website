"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const APP_ID = "0x486dD3B9C8DF7c9b263C75713c79EC1cf8F592F2";
const APP_SECRET =
  "0x1f86678fe5ec8c093e8647d5eb72a65b5b2affb7ee12b70f74e519a77b295887";

// Dynamically import all components that might use browser APIs
const DynamicQRCode = dynamic(() => import("react-qr-code"), { ssr: false });
const DynamicConfetti = dynamic(() => import("react-confetti"), { ssr: false });
const DynamicReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
});
const DynamicReclaimProofRequest = dynamic(
  () =>
    import("@reclaimprotocol/js-sdk").then((mod) => mod.ReclaimProofRequest),
  { ssr: false }
);

export default function Home() {
  const [url, setUrl] = useState("");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [myProviders, setMyProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [proofs, setProofs] = useState();
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
    // Move all browser-specific logic here
    let details = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;
    setIsMobileDevice(regexp.test(details));

    const fetchProviders = async () => {
      try {
        const response = await fetch(
          "https://api.reclaimprotocol.org/api/providers/verified"
        );
        const data = await response.json();
        if (data.providers) {
          const formattedProviders = data.providers.map((provider) => ({
            name: provider.name,
            providerId: provider.httpProviderId,
          }));
          console.log("formattedProviders", formattedProviders);
          setMyProviders(formattedProviders);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    if (proofs) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [proofs]);

  const copyToClipboard = async () => {
    if (isBrowser) {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
      } catch (err) {
        console.error("Failed to copy link: ", err);
      }
    }
  };

  const getVerificationReq = async (providerId) => {
    if (isBrowser) {
      try {
        setIsLoaded(true);
        const ReclaimProofRequest = (await import("@reclaimprotocol/js-sdk"))
          .ReclaimProofRequest;
        const reclaimClient = await ReclaimProofRequest.init(
          APP_ID,
          APP_SECRET,
          providerId,
          { log: false, acceptAiProviders: true }
        );
        const reclaimClientJson = reclaimClient.toJsonString();
        const sessionId = JSON.parse(reclaimClientJson).sessionId;
        reclaimClient.setRedirectUrl(
          `https://demo.reclaimprotocol.org/session/${sessionId}`
        );

        const requestUrl = await reclaimClient.getRequestUrl();
        const statusUrl = await reclaimClient.getStatusUrl();
        console.log("requestUrl", requestUrl);
        console.log("statusUrl", statusUrl);

        setUrl(requestUrl);
        setShowQR(true);
        setShowButton(false);
        setIsLoaded(false);

        await reclaimClient.startSession({
          onSuccess: async (proof) => {
            console.log("Verification success", proof);
            setProofs(proof);
            setShowQR(false);
          },
          onError: (error) => {
            console.error("Verification failed", error);
            console.log("error", error);
          },
        });
      } catch (error) {
        console.error("Error in getVerificationReq", error);
      }
    }
  };

  const handleButtonClick = (providerId) => {
    setIsCopied(false);
    setProofs(null);
    getVerificationReq(providerId);
  };

  if (!isBrowser) {
    return null; // or return a loading indicator
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white">
      {/* ... rest of your JSX ... */}
      {showQR && (
        <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
          {!isMobileDevice ? (
            <>
              <div className="mb-4 flex justify-center">
                <DynamicQRCode value={url} size={200} />
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                {isCopied ? "Copied!" : "Copy Link"}
              </button>
            </>
          ) : (
            <button
              onClick={() => window.open(url, "_blank")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Open Link
            </button>
          )}
        </div>
      )}

      {proofs && (
        <div className="bg-[#1e293b] p-6 rounded-lg shadow-xl mt-6">
          <h3 className="text-2xl font-semibold mb-4 text-blue-300">
            Proofs Received
          </h3>
          <div className="bg-[#0f172a] p-4 rounded-lg overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto pr-4">
              <DynamicReactJson
                src={proofs?.claimData}
                theme="monokai"
                displayDataTypes={false}
                collapsed={1}
                enableClipboard={false}
                style={{
                  backgroundColor: "transparent",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
                iconStyle="square"
                indentWidth={4}
                displayObjectSize={false}
              />
            </div>
          </div>
        </div>
      )}

      {showConfetti && (
        <DynamicConfetti
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
      {/* ... rest of your JSX ... */}
    </div>
  );
}

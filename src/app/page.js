"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import Image from "next/image";
import ReactJson from "react-json-view";

const APP_ID = "0x486dD3B9C8DF7c9b263C75713c79EC1cf8F592F2";
const APP_SECRET =
  "0x1f86678fe5ec8c093e8647d5eb72a65b5b2affb7ee12b70f74e519a77b295887";

export default function Home() {
  console.log(`
  _    _                              _     _      _             _ 
 | |  | |                            | |   (_)    (_)           | |
 | |  | | ___      __ _ _ __ ___     | |__  _ _ __ _ _ __   __ _| |
 | |/\\| |/ _ \\    / _\` | '__/ _ \\    | '_ \\| | '__| | '_ \\ / _\` | |
 \\  /\\  /  __/   | (_| | | |  __/    | | | | | |  | | | | | (_| |_|
  \\/  \\/ \\___|    \\__,_|_|  \\___|    |_| |_|_|_|  |_|_| |_|\\__, (_)
                                                            __/ |  
                                                           |___/   
 
If you are here, we're hiring hackers like you - integration engineering. 
You will be looking at chrome devtools and building reclaim providers
 
Apply :
https://x.com/madhavanmalolan/status/1792949714813419792
`);

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

  const { width, height } = useWindowSize();

  const urlRef = useRef(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const getVerificationReq = async (providerId) => {
    try {
      setIsLoaded(true);
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
          // Your business logic here
          setProofs(proof);
          setShowQR(false);
        },
        onError: (error) => {
          console.error("Verification failed", error);
          // Your business logic here to handle the error
          console.log("error", error);
        },
      });
    } catch (error) {
      console.error("Error in getVerificationReq", error);
      // Handle error gracefully, e.g., show a notification to the user
      // and possibly revert UI changes made before the error occurred
    }
  };

  const handleButtonClick = (providerId) => {
    setIsCopied(false);
    setProofs(null);
    getVerificationReq(providerId);
  };

  useEffect(() => {
    let details = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;

    let isMobileDevice = regexp.test(details);

    if (isMobileDevice) {
      setIsMobileDevice(true);
    } else {
      setIsMobileDevice(false);
    }
  }, []);

  useEffect(() => {
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
      }, 5000); // 10 seconds
    }
  }, [proofs]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white">
      <header className="bg-[#1e293b] py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <img
            src="https://avatars.githubusercontent.com/u/130321117?s=200&v=4"
            alt="Reclaim Protocol Logo"
            width={40}
            height={40}
            priority
            className="rounded-full"
          />
          <nav className="flex space-x-6">
            <a
              href="https://docs.reclaimprotocol.org/"
              className="text-white hover:text-blue-400 transition duration-300"
            >
              Docs
            </a>
            <a
              href="https://github.com/reclaimprotocol"
              className="text-white hover:text-blue-400 transition duration-300"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Reclaim Protocol Demo
          </h1>
          <p className="text-xl mb-12 text-center text-gray-300">
            Import user data from any Web Application
          </p>

          <div className="flex flex-col lg:flex-row gap-12 mb-16">
            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl order-2 lg:order-1 lg:w-1/2">
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                What is Reclaim Protocol?
              </h2>
              <p className="mb-4 text-gray-300">
                Reclaim Protocol is a privacy-preserving protocol that enables
                users to prove their data from centralized platforms without
                revealing the actual data.
              </p>
              <p className="mb-4 text-gray-300">With Reclaim, you can:</p>
              <ul className="list-disc list-inside mb-4 text-gray-300">
                <li>Prove ownership of online accounts</li>
                <li>
                  Verify credentials without revealing sensitive information
                </li>
                <li>Integrate with various web2 and web3 platforms</li>
              </ul>
              <a
                href="https://www.reclaimprotocol.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Learn More
              </a>
            </div>

            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl order-1 lg:order-2 lg:w-1/2">
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                Try it out
              </h2>
              <select
                value={selectedProviderId}
                onChange={(e) => {
                  setSelectedProviderId(e.target.value);
                  setShowQR(false);
                  setShowButton(false);
                  handleButtonClick(e.target.value);
                }}
                className="w-full px-4 py-2 text-lg text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
              >
                <option value="" disabled>
                  Select a provider
                </option>
                {myProviders.map((provider) => (
                  <option key={provider.providerId} value={provider.providerId}>
                    {provider.name}
                  </option>
                ))}
              </select>

              {isLoaded && (
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}

              {showQR && (
                <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
                  {!isMobileDevice ? (
                    <>
                      <div className="mb-4 flex justify-center">
                        <QRCode value={url} size={200} />
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
            </div>
          </div>

          {proofs && (
            <div className="bg-[#1e293b] p-6 rounded-lg shadow-xl mt-6">
              <h3 className="text-2xl font-semibold mb-4 text-blue-300">
                Proofs Received
              </h3>
              <div className="bg-[#0f172a] p-4 rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto pr-4">
                  <ReactJson
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

          {showConfetti && <Confetti width={width} height={height} />}
        </div>
      </main>

      <footer className="bg-[#1e293b] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="mt-4 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Reclaim Protocol. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

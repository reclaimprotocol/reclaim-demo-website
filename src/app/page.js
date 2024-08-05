"use client";

import { useState, useEffect, useRef } from 'react';

import QRCode from "react-qr-code";
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { Reclaim } from '@reclaimprotocol/js-sdk';
import { data } from 'autoprefixer';

const APP_ID = process.env.NEXT_PUBLIC_APP_ID
const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET

const providers = [
  { name: "Aadhaar Card Date of Birth", providerId: '5e1302ca-a3dd-4ef8-bc25-24fcc97dc800' },
  { name: "GitHub UserName", providerId: '6d3f6753-7ee6-49ee-a545-62f1b1822ae5' },
  { name: "Kaggle username", providerId: 'c94476a0-8a75-4563-b70a-bf6124d7c59b' },
  { name: "Steam ID", providerId: '1bba104c-f7e3-4b58-8b42-f8c0346cdeab' },
  { name: "Swiggy Address Book", providerId: '50fccb9e-d81c-4894-b4d1-111f6d33c7a0' },
  { name: "Swiggy last order price", providerId: '35db0668-6594-4114-9f89-def7ccafeaa2' },
  { name: "Uber Last Ride", providerId: '66ad968b-bcf5-4499-af76-53b95a475013' },
  { name: "Uber UID", providerId: '81dd6dc5-b50d-4276-b4cb-dc67bdcf919f' },
];




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


  const [url, setUrl] = useState('')
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false)

  const [showButton, setShowButton] = useState(true)

  const [myProviders, setMyProviders] = useState(providers)

  const [selectedProviderId, setSelectedProviderId] = useState('')

  const [proofs, setProofs] = useState()

  const { width, height } = useWindowSize()

  const urlRef = useRef(null);

  const reclaimClient = new Reclaim.ProofRequest(APP_ID);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      console.log('Link copied to clipboard');
    } catch(err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const getVerificationReq = async (providerId) => {
    try {
      setIsLoaded(true)
      const sessionData = await reclaimClient.buildProofRequest(providerId, true, 'V2Linking')
      reclaimClient.setRedirectUrl(`https://demo.reclaimprotocol.org/session/${sessionData.sessionId}`)
      reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET))

      const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest()
      console.log('requestUrl', requestUrl)
      console.log('statusUrl', statusUrl)

      setUrl(requestUrl)
      setShowQR(true)
      setShowButton(false)
      setIsLoaded(false)

      await reclaimClient.startSession({
        onSuccessCallback: proofs => {
          console.log('Verification success', proofs)
          // Your business logic here
          setProofs(proofs[0])
          setShowQR(false)
        },
        onFailureCallback: error => {
          console.error('Verification failed', error)
          // Your business logic here to handle the error
          console.log('error', error)
        }
      })
    } catch(error) {
      console.error('Error in getVerificationReq', error)
      // Handle error gracefully, e.g., show a notification to the user
      // and possibly revert UI changes made before the error occurred
    }
  }

  console.log('proofs', proofs)
  const handleButtonClick = (providerId) => {
    setIsCopied(false)
    setProofs(null)
    getVerificationReq(providerId)
  }

  useEffect(() => {
    let details = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;

    let isMobileDevice = regexp.test(details);

    if(isMobileDevice) {
      setIsMobileDevice(true)
    } else {
      setIsMobileDevice(false)
    }

  }, [])


  useEffect(() => {
    if(proofs) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // 10 seconds
    }
  }, [proofs]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 mt-8 gap-4 bg-black">
      <div className="z-10 w-full flex flex-col gap-4 items-center justify-center font-mono text-sm">
        <h2 className="text-slate-300 text-sm lg:text-4xl md:text-3xl sm:text-xl xs:text-xs text-nowrap">Welcome to Reclaim Protocol Demo</h2>
        <h4 className="text-slate-400 text-sm lg:text-xl md:text-lg sm:text-lg xs:text-xs">This demo uses <span className="text-slate-300 underline"><a href='https://www.npmjs.com/package/@reclaimprotocol/js-sdk'> @reclaimprotocol/js-sdk </a></span> to generate proofs of your web2 data</h4>
        <p className='text-slate-500'>Proofs generated by Reclaim Protocol are secure and private. <span className="text-slate-300 underline"><a href='https://blog.reclaimprotocol.org/posts/chacha-circuit-audit/'>Learn More</a></span></p>
        <select
          value={selectedProviderId}
          onChange={(e) => {
            setSelectedProviderId(e.target.value);
            setShowQR(false);
            setShowButton(false);
            handleButtonClick(e.target.value);
          }}
          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm md:text-base text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>Select a proof you want to generate today</option>
          {myProviders.map((provider) => (
            <option key={provider.providerId} value={provider.providerId}>
              {provider.name}
            </option>
          ))}
        </select>

        {/* {showButton && (<button className="bg-blue-500 mt-8 hover:bg-blue-700 lg:text-lg md:text-base sm:text-lg text-gray-200 font-semibold py-2 px-4 rounded"
          onClick={handleButtonClick}
        >Generate Proof Of Ownership Of  </button>)} */}

        {isLoaded && (<>
          <div role="status" className='mt-10'>
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>


          </div>
        </>)}
        {showQR && (
          <>
            {!isMobileDevice && (
              <>
                <input ref={urlRef} value={url} readOnly style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                {/* <button onClick={copyToClipboard} className="border-gray-500 border-2 px-2 hover:bg-gray-300 font-semibold rounded shadow">
                  {isCopied ? 'Copied!' : 'Copy Link'}</button> */}
                <div style={{ border: '16px solid white', marginTop: '20px' }}>
                  <QRCode value={url} />
                </div>

              </>
            )
            }
            {isMobileDevice && (
              <>
                <button onClick={() => window.open(url, "_blank")} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Open Link</button>
              </>
            )}
            <span className='text-gray-300'>
              <button onClick={copyToClipboard} className="border-gray-500 border-2 mt-8 px-2 hover:bg-gray-300 text-gray-400 font-semibold rounded shadow">
                {isCopied ? 'Copied!' : 'Copy Link'}</button>
            </span>
          </>
        )}
        {
          proofs && (
            <>
              <h3 className="text-slate-300 text-sm lg:text-2xl md:text-xl sm:text-lg xs:text-xs mt-8">Proofs Received</h3>
              <div style={{ maxWidth: '1000px' }}>
                <p> {JSON.stringify(proofs?.claimData)}</p>

              </div>

              {showConfetti && (
                <Confetti
                  width={width}
                  height={height}
                />
              )}
            </>
          )
        }
      </div>

    </main>
  );
}



// const objKeys = Object.keys(proof.extractedParameterValues)
// const objValues = Object.values(proof.extractedParameterValues)
// return (
//   <div key={index} className="flex flex-col gap-2 text-wrap justify-center items-center">
//     <pre className='text-wrap text-slate-400'>{objKeys.map((key, index) => {
//       return `${key}: ${objValues[index]}`
//     }).join('\n')}</pre>
//     {/* <code className='whitespace-pre-wrap'>{JSON.stringify(proof, null, 2)}</code> */}
//   </div>
// )
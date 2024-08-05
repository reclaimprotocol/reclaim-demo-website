"use client";

import { useState, useEffect } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

function ProofDisplay({ proof }) {
  const [expanded, setExpanded] = useState(false);

  const renderProofContent = (obj, depth = 0) => {
    return Object.entries(obj).map(([key, value]) => (
      <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
        <span className="proofKey">{key}:</span>
        <span className="proofValue">
          {typeof value === 'object' && value !== null
            ? expanded
              ? renderProofContent(value, depth + 1)
              : JSON.stringify(value).slice(0, 50) + "..."
            : String(value)
          }
        </span>
      </div>
    ));
  };

  return (
    <div className="proofDetails">
      {renderProofContent(proof)}
      <button
        className="expandButton"
        // add a box around the button with white border and padding of 5px
        // add a hover effect that changes the background color to #444
        style={{ border: '1px solid #fff', padding: '5px' }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Collapse' : 'Expand'} Proof
      </button>
    </div>
  );
}

export default function ViewSession({ params }) {
  const [sessionData, setSessionData] = useState({
    sessionId: '',
    status: '',
    updatedAt: '',
    proofs: [],
  });

  const { width, height } = useWindowSize();

  async function getSessionDetails() {
    const BACKEND_URL = 'https://api.reclaimprotocol.org';
    try {
      const response = await fetch(`${BACKEND_URL}/api/sdk/session/${params.slug}`);
      if (!response.ok) {
        throw new Error('Error fetching session details');
      }
      const data = await response.json();
      setSessionData({
        sessionId: data.session.sessionId,
        status: data.session.status,
        updatedAt: new Date(data.session.updatedAt).toLocaleString(),
        proofs: data.session.proofs,
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getSessionDetails();
    const interval = setInterval(getSessionDetails, 10000);
    return () => clearInterval(interval);
  }, [params.slug]);

  useEffect(() => {
    console.log(width, height);
  }
    , [width, height]);

  return (
    <>
        <Confetti
          width='550px'
          height='1000px'
          recycle={false}
          numberOfPieces={sessionData.status === 'SDK_RECEIVED' ? 500 : 0}
          run={sessionData.status === 'SDK_RECEIVED'}
        />
      <div className="container">
        <div className="sessionCard">
          <h1 className="title">Session Details</h1>
          {sessionData.status === 'SDK_RECEIVED' && (<h3 className="text-slate-300 text-lg lg:text-2xl md:text-xl sm:text-lg xs:text-lg mt-8 mb-4">Proofs Received</h3>)}
          <div className="infoItem">
            <span className="label">Session ID:</span>
            {sessionData.sessionId}
          </div>
          <div className="infoItem">
            <span className="label">Status:</span>
            {sessionData.status}
          </div>
          <div className="infoItem">
            <span className="label">Updated At:</span>
            {sessionData.updatedAt}
          </div>
          <div className="infoItem">
            <span className="label">Proof:</span>
            <ul className="proofsList">
              {sessionData.proofs.map((proof, index) => (
                <li key={index} className="proofItem">
                  <ProofDisplay proof={proof} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #000;
          color: #fff;
          font-family: Arial, sans-serif;
          padding: 2rem;
        }
        .sessionCard {
          background-color: #111;
          border-radius: 10px;
          padding: 2rem;
          width: 100%;
          max-width: 800px;
          box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
        }
        .title {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #333;
          padding-bottom: 0.5rem;
        }
        .infoItem {
          margin-bottom: 1rem;
        }
        .label {
          font-weight: bold;
          margin-right: 0.5rem;
        }
        .proofsList {
          list-style-type: none;
          padding-left: 0;
        }
        .proofItem {
          margin-bottom: 1rem;
          background-color: #222;
          padding: 1rem;
          border-radius: 5px;
          overflow-wrap: break-word;
        }
        .proofDetails {
          margin-top: 0.5rem;
          position: relative;
        }
        .proofKey {
          font-weight: bold;
          color: #4a90e2;
        }
        .proofValue {
          margin-left: 0.5rem;
        }
        .expandButton {
          background-color: #333;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 1rem;
          display: block;
        }
        .expandButton:hover {
          background-color: #444;
        }
      `}</style>
      </div>
    </>
  );
}
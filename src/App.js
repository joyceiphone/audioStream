import React, { useState, useRef, useEffect } from 'react';
import AudioMeter from './AudioMeter';
import Peer from 'simple-peer';

const App = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const [audioContext, setAudioContext] = useState(null);
  const [localSource, setLocalSource] = useState(null);
  const [localFilter, setLocalFilter] = useState(null);
  const [localGain, setLocalGain] = useState(null);
  const [filterEnabled, setFilterEnabled] = useState(true);

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8080');
  
    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
    };
  
    wsRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.signal && peer) {
        peer.signal(data.signal);
      }
    };
  
    wsRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      setConnected(false);
    };
  
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [peer]);

  const startStream = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(userStream);
      localAudioRef.current.srcObject = userStream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(audioContext);
      
      const source = audioContext.createMediaStreamSource(userStream);
      setLocalSource(source);
      
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 100;
      filter.Q.value = 0.75;
      setLocalFilter(filter);
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.75;
      setLocalGain(gainNode);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (!filterEnabled) {
        filter.disconnect();
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };

  const startCall = () => {
    const p = new Peer({ initiator: true, trickle: false, stream: localStream });

    p.on('signal', (data) => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ signal: data }));
      }
    });
  
    p.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    });
  
    p.on('error', (err) => {
      console.error('Peer connection error:', err);
    });
  
    setPeer(p);
    setIsCalling(true);
  };

  const toggleFilter = () => {
    if (localFilter) {
      if (filterEnabled) {
        localFilter.disconnect();
      } else {
        if (localSource) localSource.connect(localFilter);
        if (localGain) localFilter.connect(localGain);
      }
      setFilterEnabled(!filterEnabled);
    }
  };

  return (
    <div style={{marginTop: '50px',display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <button onClick={startStream} style={{marginRight: '10px'}}>Start Stream</button>
        <button onClick={startCall} disabled={isCalling} style={{marginRight: '10px'}}>Start Call</button>
        <button onClick={toggleFilter} style={{marginRight: '10px'}}>
          {filterEnabled ? 'Disable Filter' : 'Enable Filter'}
        </button>
      </div>
      <div>
        <p style={{textAlign: 'center'}}>Local Audio Stream:</p>
        <audio ref={localAudioRef} autoPlay muted style={{ width: '100%', maxWidth: '600px', border: '1px solid #ccc' }}/>
        <AudioMeter audioStream={localStream} />
      </div>
      <div>
        <p>Remote Audio Stream:</p>
        <audio ref={remoteAudioRef} autoPlay muted style={{ width: '100%', maxWidth: '600px', border: '1px solid #ccc' }}/>
        {remoteStream && <AudioMeter audioStream={remoteStream} />}
      </div>
  </div>
  );
};

export default App;
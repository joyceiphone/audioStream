import React, { useRef, useEffect } from 'react';

const AudioMeter = ({ audioStream }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (audioStream) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(audioStream);

      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i];
          ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
          ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
          x += barWidth;
        }

        requestAnimationFrame(draw);
      };

      draw();

      return () => {
        audioContext.close();
      };
    }
  }, [audioStream]);

  return <canvas ref={canvasRef} width="400" height="100" />;
};

export default AudioMeter;
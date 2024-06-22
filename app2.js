const canvas = document.getElementById('visualizer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// TODO when the window is resized, the canvas should be resized as well
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
const canvasCtx = canvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function getRandomBackgroundColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw a circle in the center
      // const centerX = canvas.width / 2;
      // const centerY = canvas.height / 2;
      // const radius = canvas.width / 3.14; // Radius of the circle
      // canvasCtx.beginPath();
      // canvasCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      // canvasCtx.fillStyle = 'black'
      // canvasCtx.fill();

      // Define thresholds for the lightning effect
      const amplitudeThreshold = 150; // Example threshold for amplitude
      const distortionThreshold = 15; // Example threshold for distortion

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = getRandomColor();

      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        const distortion = Math.sin(i / 10) * 10; // Add distortion effect

        // Check if the amplitude or distortion exceeds the threshold
        if (v > amplitudeThreshold / 128.0 || Math.abs(distortion) > distortionThreshold) {
          // Apply lightning effect
          canvasCtx.strokeStyle = '#FFFFFF'; // Bright color for lightning
          canvasCtx.lineWidth = 7; // Thicker line for emphasis
          canvasCtx.fillStyle = getRandomBackgroundColor();
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Revert to normal if not exceeding threshold
          canvasCtx.strokeStyle = getRandomColor();
          canvasCtx.lineWidth = // Random line width between 1 and 5
            Math.floor(Math.random() * 3) + 1 // divided by amplitude
            * v
        }


        if (i === 0) {
          canvasCtx.moveTo(x, y + distortion);
        } else {
          canvasCtx.lineTo(x, y + distortion);
        }



        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }


    draw();
  })
  .catch(err => {
    console.error('Error accessing the microphone: ', err);
  });

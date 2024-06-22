if (!localStorage.getItem('epilepsyConfirmation')) {
  // Step 2: Show confirmation dialog
  const userConfirmed = confirm("This application contains flashing lights which may potentially trigger seizures for people with photosensitive epilepsy. Do you confirm you don't have photosensitive epilepsy?");

  if (userConfirmed) {
    // Step 3: User confirmed, save flag in localStorage
    localStorage.setItem('epilepsyConfirmation', 'true');
    // Proceed with the application (the rest of your code)
  } else {
    // Step 4: User did not confirm, do not proceed
    alert("You cannot use this application due to the risk of seizures.");
    throw new Error("Application stopped due to epilepsy risk.");
  }
}

const canvas = document.getElementById('visualizer');
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

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 255, 0)';

      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
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

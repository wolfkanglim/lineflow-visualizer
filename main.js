const container = document.getElementById('container');
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const file = document.getElementById('fileupload');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let audioSource;
let analyser;
const audioCtx = new AudioContext();
const audio1 = document.getElementById('audio1');

//audio file upload
file.addEventListener('change', function(){
    const files = this.files;        
    audio1.src = URL.createObjectURL(files[0]);   
    audioSource = audioCtx.createMediaElementSource(audio1);
    analyser = audioCtx.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = 5;
    let barHeight;
    let x;

    function animate(){
        x = 0;       
        analyser.getByteFrequencyData(dataArray);
        drawVisualizer(bufferLength, x, barWidth /2, barHeight / 2, dataArray);
        requestAnimationFrame(animate);
    }  
    animate();
});

//visualization
function drawVisualizer(bufferLength, x, barWidth, barHeight,dataArray){   
    for(let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i];
        ctx.save();
        //let x = Math.sin(i * Math.PI / 180) + 120;
       // let y = Math.cos(i * Math.PI / 180) + 90;
        let x = Math.sin(i * Math.PI / 180) + 120;
        let y = Math.cos(i * Math.PI / 180) + 90;
        ctx.translate(canvas.width / 2 + x * 3, canvas.height  * 2 / 3);
        ctx.rotate(i + Math.PI * 4 / bufferLength);
        const hue2 = i * 0.9 + 280;
        const hue = i / bufferLength  * 20;
        ctx.fillStyle = 'hsl('+ hue2 +', 100%, 70%)';
        ctx.strokeStyle = 'hsl('+ hue2 +', 100%, 50%)';
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.globalCompositeOperation = 'source-over';    

        //Circle
        ctx.fillStyle =  'hsl(' + hue2 +', 100%, 90%)';
        ctx.beginPath();
        ctx.arc(0, barHeight / 2, barHeight / 15, 0, Math.PI * 4);
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.strokeStyle =  'hsl(' + hue +', 100%, 90%)';    
        ctx.restore();
        x += barWidth;
    }
};

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
let recording = false;
let mediaRecorder;
let recordedChunks;

recordBtn.addEventListener("click", () => {
   let dest = audioCtx.createMediaStreamDestination();
   audioSource.connect(dest);
   audioSource.connect(audioCtx.destination);
   let audioTrack = dest.stream.getAudioTracks()[0];   
   recording = !recording;
   if (recording) {
      recordBtn.style.backgroundColor = "#aaa";
      stopBtn.style.backgroundColor = 'blue';
      const canvasStream = canvas.captureStream(60);
      //video.srcObject = canvasStream;    
      mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp9'        
      }); 
      canvasStream.addTrack(audioTrack);
      recordedChunks = [];
      mediaRecorder.ondataavailable = e => {
         if (e.data.size > 0) {
            recordedChunks.push(e.data);
         }
      };
      mediaRecorder.start();
   } 
});

stopBtn.addEventListener('click', () => {
   recordBtn.style.backgroundColor = 'red';
   stopBtn.style.backgroundColor = '#aaa';
   mediaRecorder.stop();
   setTimeout(() => {
      const blob = new Blob(recordedChunks, {
         type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
      URL.revokeObjectURL(url);
   }, 0);
});




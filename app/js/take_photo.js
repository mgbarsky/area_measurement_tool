var constraints;
var imageCapture;
var mediaStream;

var video = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');
videoSelect.onchange = getStream;

// Get a list of available media input (and output) devices
// then get a MediaStream for the currently selected input device
function get_media() {
  navigator.mediaDevices
    .enumerateDevices()
    .then(gotDevices)
    .catch(error => {
      console.log('enumerateDevices() error: ', error);
    })
    .then(getStream);
}
// From the list of media devices available, set up the camera source <select>,
// then get a video stream from the default camera source.
function gotDevices(deviceInfos) {
  var no_video_found = true;
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    console.log('Found media input or output device: ', deviceInfo);
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      no_video_found = false;
      option.text = deviceInfo.label || 'Camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    }
  }
  if (no_video_found) {
    var option = document.createElement('option');
    option.value = -1;
    option.text = 'No camera found';
    videoSelect.appendChild(option);
  }
}

// Get a video stream from the currently selected camera source.
function getStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      track.stop();
    });
  }
  var videoSource = videoSelect.value;
  constraints = {
    video: { deviceId: videoSource ? { exact: videoSource } : undefined }
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(error => {
      console.log('getUserMedia error: ', error);
    });
}

// Display the stream from the currently selected camera source, and then
// create an ImageCapture object, using the video from the stream.
function gotStream(stream) {
  console.log('getUserMedia() got stream: ', stream);
  mediaStream = stream;
  video.srcObject = stream;
  imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
}

// Get an ImageBitmap from the currently selected camera source and
function grabFrame() {
  imageCapture
    .grabFrame()
    .then(function(imageBitmap) {
      canvas_init(imageBitmap);
      scale_point_arr = []; //init scale
      document.getElementById('areaVal').innerHTML = 0; //init area
      pix_area_conv_fac = 0; //init area count
      change_state('scale');
      console.log('Grabbed frame:', imageBitmap);
    })
    .catch(function(error) {
      console.log('grabFrame() error: ', error);
    });
}

//Get image from upload
function uploadPic() {
  //Read the image
  var file = document.querySelector('input[type=file]').files[0];
  var reader = new FileReader();

  if (file) {
    reader.readAsDataURL(file);
  }
  var url = URL.createObjectURL(file); // create an Object URL
  var img = new Image();
  img.src = url; // start convertion file to image

  img.onload = function() {
    canvas_init(this);
    scale_point_arr = []; //init scale
    document.getElementById('areaVal').innerHTML = 0; //init area
    pix_area_conv_fac = 0; //init area count
    change_state('scale');
  };
}

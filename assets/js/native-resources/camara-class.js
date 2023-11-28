class Camera {
	constructor(node) {
		this.node = node;
		this.video = document.getElementById('video');
		this.canvas = document.getElementById('canvas');
		this.context = this.canvas.getContext('2d');
		this.photo = document.getElementById('photo');
		this.startbutton = document.getElementById('startbutton');
		this.width = 320;
		this.height = 0;
		this.streaming = false;
		this.stream = null;
		this.constraints = {
			audio: false,
			video: {
				facingMode: 'user',
				width: { ideal: 320 },
				height: { ideal: 240 },
			},
		};
	}

	startCamera() {
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
				.getUserMedia(this.constraints)
				.then((stream) => {
					this.video.srcObject = stream;
					this.video.play();
				})
				.catch((err) => {
					console.log('An error occurred: ' + err);
				});
		} else {
			console.log('getUserMedia not supported');
		}
	}

	stopCamera() {
		if (this.stream) {
			this.stream.getTracks().forEach(function (track) {
				track.stop();
			});
		}
	}

	takePicture() {
		this.context.drawImage(this.video, 0, 0, this.width, this.height);
		var data = this.canvas.toDataURL('image/png');
		this.photo.setAttribute('src', data);
	}
}

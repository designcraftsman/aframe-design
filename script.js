AFRAME.registerComponent('custom-look-controls', {
    schema: {
      enabled: { default: true }
    },
    init: function () {
      this.yawObject = new THREE.Object3D();
      this.pitchObject = new THREE.Object3D();
      this.pitchObject.add(this.yawObject);
      this.el.object3D.add(this.pitchObject);

      this.mouseDown = false;
      this.bindMethods();
      this.addEventListeners();
    },
    bindMethods: function () {
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
    },
    addEventListeners: function () {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mouseup', this.onMouseUp);
    },
    removeEventListeners: function () {
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mousedown', this.onMouseDown);
      window.removeEventListener('mouseup', this.onMouseUp);
    },
    onMouseMove: function (event) {
      if (!this.data.enabled || !this.mouseDown) return;

      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      this.yawObject.rotation.y -= movementX * 0.002;
      this.pitchObject.rotation.x -= movementY * 0.002;
      this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
    },
    onMouseDown: function () {
      this.mouseDown = true;
    },
    onMouseUp: function () {
      this.mouseDown = false;
    }
  });

  AFRAME.registerComponent('camera-collider', {
    schema: {
      speed: {type: 'number', default: 0.1},
      radius: {type: 'number', default: 0.3}
    },
    init: function () {
      this.direction = new THREE.Vector3();
      this.keys = {
        forward: false,
        backward: false,
        left: false,
        right: false
      };

      this.bindMethods();
      this.addEventListeners();
    },
    bindMethods: function () {
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
    },
    addEventListeners: function () {
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
    },
    removeEventListeners: function () {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    },
    onKeyDown: function (event) {
      switch (event.key) {
        case 'z':
          this.keys.forward = true;
          break;
        case 'q':
          this.keys.left = true;
          break;
        case 's':
          this.keys.backward = true;
          break;
        case 'd':
          this.keys.right = true;
          break;
      }
    },
    onKeyUp: function (event) {
      switch (event.key) {
        case 'z':
          this.keys.forward = false;
          break;
        case 'q':
          this.keys.left = false;
          break;
        case 's':
          this.keys.backward = false;
          break;
        case 'd':
          this.keys.right = false;
          break;
      }
    },
    tick: function () {
      var cameraEl = this.el.sceneEl.querySelector('[camera]');
      var camera = cameraEl.getObject3D('camera');
      if (!camera) return;

      // Reset direction
      this.direction.set(0, 0, 0);

      // Determine movement direction based on keys pressed
      if (this.keys.forward) this.direction.z -= 1;
      if (this.keys.backward) this.direction.z += 1;
      if (this.keys.left) this.direction.x -= 1;
      if (this.keys.right) this.direction.x += 1;

      if (this.direction.length() > 0) {
        this.direction.normalize();

        // Apply the custom look controls' rotation to the direction
        var rotation = new THREE.Euler(0, cameraEl.components['custom-look-controls'].yawObject.rotation.y, 0, 'YXZ');
        this.direction.applyEuler(rotation);

        // Calculate next position
        var nextPosition = this.el.object3D.position.clone().add(this.direction.multiplyScalar(this.data.speed));

        // Use bounding sphere for collision detection
        var boundingSphere = new THREE.Sphere(nextPosition, this.data.radius);
        var collidableObjects = this.el.sceneEl.object3D.children.filter(child => child.el && child.el.classList && child.el.classList.contains('collidable'));

        var collisionDetected = collidableObjects.some(obj => {
          var objBoundingBox = new THREE.Box3().setFromObject(obj);
          return objBoundingBox.intersectsSphere(boundingSphere);
        });

        // Move if no collision detected
        if (!collisionDetected) {
          this.el.object3D.position.copy(nextPosition);
        }
      }
    },
    remove: function () {
      this.removeEventListeners();
    }
  });

  function showPDF() {
    const pdfViewer = document.getElementById('pdfViewer');
    const closePdfButton = document.getElementById('closeButton');
    closePdfButton.style.display = 'block';
    pdfViewer.style.display = 'block';
    pdfViewer.src = 'assets/projet12.pdf';
  }

  // Function to close the PDF viewer
  function closePDF() {
    const pdfViewer = document.getElementById('pdfViewer');
    const closePdfButton = document.getElementById('closeButton');
    closePdfButton.style.display = 'none';
    pdfViewer.style.display = 'none';
    pdfViewer.src = '';
  }

  // Wait for the DOM to be loaded before adding the event listener
  document.addEventListener('DOMContentLoaded', () => {
    const monitor = document.querySelectorAll('.pdf');
    monitor.forEach(element => {
        element.addEventListener('click', showPDF);
    });
    
    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', closePDF);
});

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('videoTutorial');
  setTimeout(() => {
    video.play();
  }, 5000); // 5000 milliseconds = 5 seconds delay
});
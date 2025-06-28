 const firebaseConfig = {
      apiKey: "AIzaSyAhORQNrvqQZFbtZMVJnrO20LoaImdXybk",
     authDomain: "starms-reviews.firebaseapp.com",
     projectId: "starms-reviews",
     storageBucket: "starms-reviews.firebasestorage.app",
     messagingSenderId: "165355383949",
     appId: "1:165355383949:web:7a5b37c333a21a1bbe46c4",
     measurementId: "G-FSRHTE72MN"
    };
    firebase.initializeApp(firebaseConfig);

    const loginForm = document.getElementById('login-form');
    const errorMsg  = document.getElementById('error-msg');

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email    = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = 'reviewmod.html';
        })
        .catch(err => {
          errorMsg.textContent = 'Login failed: ' + err.message;
        });
    });
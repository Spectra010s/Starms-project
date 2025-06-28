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
    const db = firebase.firestore();
    const auth = firebase.auth();

    auth.onAuthStateChanged(user => {
        if (!user) {
         window.location.href = 'loginmod.html';
         return;
        } else { 
         loadAdminReviews(); 
        }
    });

    const adminReviewsList = document.getElementById('adminReviewsList');

    function displayAdminReviews(reviews) {
      adminReviewsList.innerHTML = '';
      if (reviews.length === 0) {
        adminReviewsList.innerHTML = '<p class="no-reviews">No reviews to moderate.</p>';
        return;
      }
      reviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('review-item');
        const timestamp = review.timestamp ? new Date(review.timestamp.toDate()).toLocaleString() : 'N/A';
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<span style="color: ${i <= review.rating ? 'gold' : '#ccc'};">&#9733;</span>`;
        }
        reviewDiv.innerHTML = `
          <div class="review-item-content">
            <h3>${review.reviewerName}</h3>
            <p>Rating: ${starsHtml}</p>
            <p>${review.reviewText}</p>
            <small>Submitted on: ${timestamp}</small>
            <div class="actions">
              <button class="delete" data-id="${review.id}">Delete</button>
            </div>
          </div>
        `;
        adminReviewsList.appendChild(reviewDiv);
      });

      adminReviewsList.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', (e) => deleteReview(e.target.dataset.id));
      });
    }

    function loadAdminReviews() {
      db.collection("reviews")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          const reviews = [];
          snapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
          });
          displayAdminReviews(reviews);
        }, (error) => {
          console.error("Error listening to admin reviews: ", error);
          adminReviewsList.innerHTML = '<p class="error-message">Error loading reviews for moderation.</p>';
        });
    }

    function deleteReview(id) {
      db.collection("reviews").doc(id).delete();
    }


    document.getElementById('logoutBtn').onclick = () => {
      auth.signOut().then(() => window.location.href = 'loginmod.html');
    };

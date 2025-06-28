    const firebaseConfig = {
     apiKey: "AIzaSyAhORQNrvqQZFbtZMVJnrO20LoaImdXybk",
     authDomain: "starms-reviews.firebaseapp.com",
     projectId: "starms-reviews",
     storageBucket: "starms-reviews.firebasestorage.app",
     messagingSenderId: "165355383949",
     appId: "1:165355383949:web:7a5b37c333a21a1bbe46c4",
     measurementId: "G-FSRHTE72MN"
    };

   let currentSection = 'home';
   let currentRating = 0;
   let isMobileMenuOpen = false;

   const app = firebase.initializeApp(firebaseConfig);
   const db = firebase.firestore(app);
   const loader = document.querySelector('.starms-loader');
   const sections = document.querySelectorAll('.starms-section');
   const navLinks = document.querySelectorAll('.starms-nav-link');
   const mobileNavLinks = document.querySelectorAll('.starms-nav-mobile-link');
   const mobileMenuBtn = document.querySelector('.starms-nav-mobile-btn');
   const mobileMenu = document.querySelector('.starms-nav-mobile');
   const mobileMenuClose = document.querySelector('.starms-nav-mobile-close');
   const primaryButtons = document.querySelectorAll('.starms-btn.starms-btn-primary');
   const secondaryButtons = document.querySelectorAll('.starms-btn.starms-btn-secondary');
   const reviewsLoader = document.querySelector('.starms-reviews-loader');   

   function showToast(message) {
     alert(message);
    }

    function showLoader() {
      loader.classList.add('active');
        setTimeout(() => {
        loader.classList.remove('active');
        }, 1000); 
    }

    function showReviewsLoader() {
      reviewsLoader.classList.add('active');
    }

    function hideReviewsLoader() {
      reviewsLoader.classList.remove('active');
    }

    async function saveReview(review) {
      try {
        await db.collection("reviews").add({
          reviewerName: review.Name,
          rating: review.Rating,
          reviewText: review.Comment,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          approved: false
        });
        return true;
      } catch (err) {
        console.error("Error submitting review:", err);
        return false;
      }
    }

    document.getElementById('newsletter-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const action = "https://formspree.io/f/mkgbvynj"; 

      try {
        const response = await fetch(action, {
          method: "POST",
          body: data,
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          showToast("Thank you for subscribing to our newsletter!");
          form.reset();
        } else {
          showToast("Oops! Something went wrong.");
        }
      } catch {
        return false;
      }
    });

    function closeMobileMenu() {
      mobileMenu.style.display = 'none';
      isMobileMenuOpen = false;
    }

    function navigateToSection(sectionId, pushState = true) {
      if (!sectionId || !document.getElementById(sectionId)) {
        sectionId = 'reviews';
      }

      if (currentSection === sectionId) return;
       showLoader();

        sections.forEach(section => section.classList.remove('active'));

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
          targetSection.classList.add('active');
        }

        if (sectionId === 'home') {
          if (mobileMenuBtn) mobileMenuBtn.classList.remove('menu-open');
          if (mobileMenu) mobileMenu.style.display = 'none';
        }

        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
        if (pushState) {
          window.location.hash = sectionId;
        }
        currentSection = sectionId;
        localStorage.setItem('starms-last-section', sectionId);

        closeMobileMenu();
        window.scrollTo(0, 0);
        
        if (sectionId === 'reviews') {
         loadReviews();
        }
   
        if (window.AOS) AOS.refresh();
      }

    function toggleMobileMenu() {
      isMobileMenuOpen = !isMobileMenuOpen;
      mobileMenu.style.display = isMobileMenuOpen ? 'block' : 'none';
    }

    function loadReviews() {
      const reviewsList = document.getElementById('reviews-list');

      db.collection("reviews")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          reviewsList.innerHTML = '';
          if (snapshot.empty) {  
           reviewsList.innerHTML = `
              <div class="starms-no-reviews">
               <i class="fas fa-comments"></i>
               <h4>No Reviews Yet</h4>
               <p>Be the first to share your experience with STARMS Catering!</p>
              </div>
            `;
            return;
          }

          snapshot.forEach((doc) => {
            const review = doc.data();
            const stars = Array.from({ length: 5 }, (_, i)=>
              `<i class="fas fa-star ${i < review.rating ? '' : 'inactive'}"></i>`
            ).join('');
  
            const date = review.timestamp ? new Date(review.timestamp.toDate()).toLocaleDateString() : '';
            reviewsList.innerHTML += `
              <div class="starms-review">
                <div class="starms-review-header">
                  <span class="starms-review-author">${escapeHtml(review.reviewerName)}</span>
                  <span class="starms-review-date">${(date)}</span>
                </div>
                <div class="starms-review-rating">${stars}</div>
                <p class="starms-review-comment">${escapeHtml(review.reviewText)}</p>
              </div>
            `;
          });
        }, (error) => {
          reviewsList.innerHTML = '<p style="color:red;">Error loading reviews.</p>';
          throw(error);
        });
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async function handleReviewSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const name = formData.get('reviewerName');
      const comment = formData.get('reviewText');

      if (currentRating === 0) {
        showToast("Please select a rating before submitting your review.");
        return;
      }

      alert("Submitting your review...");
      showReviewsLoader();

      const success = await saveReview({
        Name: name,
        Rating: currentRating,
        Comment: comment,
        Date: new Date().toLocaleDateString()
      });

      if (success) {
        event.target.reset();
        currentRating = 0;
        updateStarRating();
        loadReviews();
        alert("Thank you for your feedback!");
        hideReviewsLoader();
      } else {
        showToast("Sorry, there was an error saving your review. Please try again.");
        hideReviewsLoader();
      }
    }

    function updateStarRating() {
      const stars = document.querySelectorAll('#star-rating i');
      stars.forEach((star, index) => {
        star.classList.toggle('active', index < currentRating);
      });
    }

    function toggleFaq(faqItem) {
      faqItem.classList.toggle('active');
    }

    document.getElementById('contact-form').addEventListener('submit', async function (e) { e.preventDefault();

    const form = e.target;
    const data = new FormData(form);
    const action = "https://formspree.io/f/mkgbvynj"; 

    try {
      const response = await fetch(action, {
        method: "POST",
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showToast("Thanks! Your message was sent.");
        form.reset();
      } else {
         showToast("Oops! Something went wrong.");
      }
      } catch (error) {
        showToast("Error sending message. Check internet.");
      }
    });

  
    async function handleNewsletterSubmit(event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      const email = formData.get('email');

      const success = saveSubscription(email);
      if (success) {
        showToast("Thank you for subscribing to our newsletter!");
        event.target.reset();
      } else {s
        showToast("You are already subscribed to our newsletter.");
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      if (mobileMenuBtn && mobileMenu && mobileMenuClose) {
        mobileMenuBtn.addEventListener('click', function() {
          isMobileMenuOpen = true;
          mobileMenu.style.display = 'block';
          document.body.classList.add('menu-open');
          
        });
          
        mobileMenuClose.addEventListener('click', function() {
          isMobileMenuOpen = false;
          mobileMenu.style.display = 'none';
          document.body.classList.remove('menu-open');
        });
      }  

      mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
          isMobileMenuOpen = false;
          mobileMenu.style.display = 'none';
          document.body.classList.remove('menu-open');
        });
      });

      const gallery = document.getElementById("gallery-items");
      const totalImages = 36;
      const folder = "images/"; 

      for (let i = 0; i <= totalImages; i++) {
        const div = document.createElement("div");
        div.className = "starms-gallery-item";
        div.setAttribute("data-aos", "zoom-in");
  
        const img = document.createElement("img");
        img.src = `${folder}event${i}.jpg`;
        img.alt = `Event ${i}`;
        img.loading = "lazy";

        div.appendChild(img);
        gallery.appendChild(div);
      }

      const eventTypeSelect = document.getElementById("event-type");
      const otherEventGroup = document.getElementById("other-event-group");
      const otherEventInput = document.getElementById("other-event-type");

      eventTypeSelect.addEventListener("change", function () {
        if (this.value === "other") {
          otherEventGroup.style.display = "block";
        } else {
          otherEventGroup.style.display = "none";
          otherEventInput.value = "";
        }
      });


      document.querySelectorAll('.starms-footer-links button').forEach(btn => {
        btn.addEventListener('click', function() {
          const section = btn.getAttribute('data-section');
          window.location.hash = section;
        });
      });

      navLinks.forEach(btn => {
        btn.addEventListener('click', function() {
          const section = btn.getAttribute('data-section');
          if (section && document.getElementById(section)) {
          window.location.hash = section;
         }
        });
      });

      mobileNavLinks.forEach(btn => {
        btn.addEventListener('click', function() {
          const section = btn.getAttribute('data-section');
          if (section && document.getElementById(section)) {
          window.location.hash = section;
          }
        });
      });

      primaryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const section = btn.getAttribute('data-section');
         window.location.hash = section;
        });
      });
      
      secondaryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const section = btn.getAttribute('data-section');
          window.location.hash = section;
        });
      });

      window.addEventListener('hashchange', function() {
       const sectionId = window.location.hash.replace('#', '') || 'home';
        navigateToSection(sectionId, false) 
      });

      const path = window.location.hash.replace('#', '') || 'home';
      if (document.getElementById(path)) {
       navigateToSection(path, false);
      } else {
       navigateToSection('home', false);
      }
    });

    document.getElementById('review-form').addEventListener('submit', handleReviewSubmit);

    const starRating = document.getElementById('star-rating');
    if (starRating) {
      starRating.addEventListener('click', e => {
        if (e.target.tagName === 'I') {
          currentRating = parseInt(e.target.dataset.rating);
          updateStarRating();
        }
      });

      starRating.addEventListener('mouseover', e => {
        if (e.target.tagName === 'I') {
          const hoverRating = parseInt(e.target.dataset.rating);
          const stars = starRating.querySelectorAll('i');
          stars.forEach((star, index) => {
            star.classList.toggle('active', index < hoverRating);
          });
        }
      });

      starRating.addEventListener('mouseleave', () => {
        updateStarRating();
      });
    }

    document.querySelectorAll('.starms-faq-question').forEach(question => {
      question.addEventListener('click', () => {
       const faqItem = question.closest('.starms-faq-item');
        toggleFaq(faqItem);
      });
    });

    document.addEventListener('click', e => {
      if (isMobileMenuOpen && !e.target.closest('.starms-nav')) {
        closeMobileMenu();
      }
    });

    const eventDateInput = document.getElementById('event-date');
    if (eventDateInput) {
      const today = new Date().toISOString().split('T')[0];
      eventDateInput.min = today;
    }
  
    AOS.init();

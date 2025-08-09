document.addEventListener("DOMContentLoaded", function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var navMenu = document.querySelector(".navMenu");
  var navLinks = document.querySelectorAll(".navList a");
  var ctaLink = document.querySelector(".cta a");

  // Check if elements exist to prevent errors
  if (!mobileToggle || !navMenu) {
    console.error("Navigation elements not found");
    return;
  }

  // Toggle mobile menu
  function toggleMenu() {
    var isActive = navMenu.classList.contains("active");
    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Open menu
  function openMenu() {
    navMenu.classList.add("active");
    mobileToggle.classList.add("active");
    mobileToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  }

  // Close menu
  function closeMenu() {
    navMenu.classList.remove("active");
    mobileToggle.classList.remove("active");
    mobileToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  // Toggle button click
  mobileToggle.addEventListener("click", function (e) {
    e.preventDefault();
    toggleMenu();
  });

  // Close menu when clicking nav links
  if (navLinks.length > 0) {
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener("click", function () {
        closeMenu();
      });
    }
  }

  // Close menu when clicking CTA
  if (ctaLink) {
    ctaLink.addEventListener("click", function () {
      closeMenu();
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    var isClickInsideNav = navMenu.contains(e.target);
    var isClickOnToggle = mobileToggle.contains(e.target);

    if (
      !isClickInsideNav &&
      !isClickOnToggle &&
      navMenu.classList.contains("active")
    ) {
      closeMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  // Close menu on window resize > 768px
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && navMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  // Prevent menu from closing when clicking inside menu area
  navMenu.addEventListener("click", function (e) {
    e.stopPropagation();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const mainSlider = document.querySelector(".mainSlider");
  if (!mainSlider) return;

  const slides = slider.querySelectorAll(".slide");
  const dots = slider.querySelectorAll(".dot");
  const prevButton = slider.querySelector(".slider-arrow-prev");
  const nextButton = slider.querySelector(".slider-arrow-next");

  //Wait time for the first slider (automatic)
  setInterval(function () {
    document.getElementById("radio" + counter).checked = true;
    counter++;
    if (counter > 3) {
      counter = 1;
    }
  }, 5000);
});

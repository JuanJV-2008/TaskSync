// The following code is used for detecting if elements in a timeline are in the viewport
// and applying a CSS class accordingly. The source for this code is the YouTube tutorial
// "https://www.youtube.com/watch?v=tscf35hDL0U&ab_channel=Onlinewebustaad".

// Select all timeline items
var items = document.querySelectorAll(".timeline li");

// Function to check if an element is in the viewport
function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Callback function to handle the elements in the viewport
function callbackFunc() {
  for (var i = 0; i < items.length; i++) {
    if (isElementInViewport(items[i])) {
      // If the item is in the viewport and does not have the "in-view" class, add it
      if (!items[i].classList.contains("in-view")) {
        items[i].classList.add("in-view");
      }
    } else if (items[i].classList.contains("in-view")) {
      // If the item is not in the viewport and has the "in-view" class, remove it
      items[i].classList.remove("in-view");
    }
  }
}

// Add event listeners to run the callback on page load and scroll
window.addEventListener("load", callbackFunc);
window.addEventListener("scroll", callbackFunc);

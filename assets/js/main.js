/*
	Story by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {
  var $window = $(window),
    $body = $("body"),
    $wrapper = $("#wrapper");

  // Breakpoints.
  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: ["361px", "480px"],
    xxsmall: [null, "360px"],
  });

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Browser fixes.

  // IE: Flexbox min-height bug.
  if (browser.name == "ie")
    (function () {
      var flexboxFixTimeoutId;

      $window
        .on("resize.flexbox-fix", function () {
          var $x = $(".fullscreen");

          clearTimeout(flexboxFixTimeoutId);

          flexboxFixTimeoutId = setTimeout(function () {
            if ($x.prop("scrollHeight") > $window.height())
              $x.css("height", "auto");
            else $x.css("height", "100vh");
          }, 250);
        })
        .triggerHandler("resize.flexbox-fix");
    })();

  // Object fit workaround.
  if (!browser.canUse("object-fit"))
    (function () {
      $(".banner .image, .spotlight .image").each(function () {
        var $this = $(this),
          $img = $this.children("img"),
          positionClass = $this
            .parent()
            .attr("class")
            .match(/image-position-([a-z]+)/);

        // Set image.
        $this
          .css("background-image", 'url("' + $img.attr("src") + '")')
          .css("background-repeat", "no-repeat")
          .css("background-size", "cover");

        // Set position.
        switch (positionClass.length > 1 ? positionClass[1] : "") {
          case "left":
            $this.css("background-position", "left");
            break;

          case "right":
            $this.css("background-position", "right");
            break;

          default:
          case "center":
            $this.css("background-position", "center");
            break;
        }

        // Hide original.
        $img.css("opacity", "0");
      });
    })();

  // Smooth scroll.
  $(".smooth-scroll").scrolly();
  $(".smooth-scroll-middle").scrolly({ anchor: "middle" });

  // Wrapper.
  $wrapper.children().scrollex({
    top: "30vh",
    bottom: "30vh",
    initialize: function () {
      $(this).addClass("is-inactive");
    },
    terminate: function () {
      $(this).removeClass("is-inactive");
    },
    enter: function () {
      $(this).removeClass("is-inactive");
    },
    leave: function () {
      var $this = $(this);

      if ($this.hasClass("onscroll-bidirectional"))
        $this.addClass("is-inactive");
    },
  });

  // Items.
  $(".items")
    .scrollex({
      top: "30vh",
      bottom: "30vh",
      delay: 50,
      initialize: function () {
        $(this).addClass("is-inactive");
      },
      terminate: function () {
        $(this).removeClass("is-inactive");
      },
      enter: function () {
        $(this).removeClass("is-inactive");
      },
      leave: function () {
        var $this = $(this);

        if ($this.hasClass("onscroll-bidirectional"))
          $this.addClass("is-inactive");
      },
    })
    .children()
    .wrapInner('<div class="inner"></div>');

  // Gallery.
  $(".gallery")
    .wrapInner('<div class="inner"></div>')
    .prepend(
      browser.mobile
        ? ""
        : '<div class="forward"></div><div class="backward"></div>'
    )
    .scrollex({
      top: "30vh",
      bottom: "30vh",
      delay: 50,
      initialize: function () {
        $(this).addClass("is-inactive");
      },
      terminate: function () {
        $(this).removeClass("is-inactive");
      },
      enter: function () {
        $(this).removeClass("is-inactive");
      },
      leave: function () {
        var $this = $(this);

        if ($this.hasClass("onscroll-bidirectional"))
          $this.addClass("is-inactive");
      },
    })
    .children(".inner")
    //.css('overflow', 'hidden')
    .css("overflow-y", browser.mobile ? "visible" : "hidden")
    .css("overflow-x", browser.mobile ? "scroll" : "hidden")
    .scrollLeft(0);

  // Style #1.
  // ...

  // Style #2.
  $(".gallery")
    .on("wheel", ".inner", function (event) {
      var $this = $(this),
        delta = event.originalEvent.deltaX * 10;

      // Cap delta.
      if (delta > 0) delta = Math.min(25, delta);
      else if (delta < 0) delta = Math.max(-25, delta);

      // Scroll.
      $this.scrollLeft($this.scrollLeft() + delta);
    })
    .on("mouseenter", ".forward, .backward", function (event) {
      var $this = $(this),
        $inner = $this.siblings(".inner"),
        direction = $this.hasClass("forward") ? 1 : -1;

      // Clear move interval.
      clearInterval(this._gallery_moveIntervalId);

      // Start interval.
      this._gallery_moveIntervalId = setInterval(function () {
        $inner.scrollLeft($inner.scrollLeft() + 5 * direction);
      }, 10);
    })
    .on("mouseleave", ".forward, .backward", function (event) {
      // Clear move interval.
      clearInterval(this._gallery_moveIntervalId);
    });

  // Lightbox.
  $(".gallery.lightbox")
    .on("click", "a", function (event) {
      var $a = $(this),
        $gallery = $a.parents(".gallery"),
        $modal = $gallery.children(".modal"),
        $modalImg = $modal.find("img"),
        href = $a.attr("href");

      // Not an image? Bail.
      if (!href.match(/\.(jpg|gif|png|mp4)$/)) return;

      // Prevent default.
      event.preventDefault();
      event.stopPropagation();

      // Locked? Bail.
      if ($modal[0]._locked) return;

      // Lock.
      $modal[0]._locked = true;

      // Set src.
      $modalImg.attr("src", href);

      // Set visible.
      $modal.addClass("visible");

      // Focus.
      $modal.focus();

      // Delay.
      setTimeout(function () {
        // Unlock.
        $modal[0]._locked = false;
      }, 600);
    })
    .on("click", ".modal", function (event) {
      var $modal = $(this),
        $modalImg = $modal.find("img");

      // Locked? Bail.
      if ($modal[0]._locked) return;

      // Already hidden? Bail.
      if (!$modal.hasClass("visible")) return;

      // Lock.
      $modal[0]._locked = true;

      // Clear visible, loaded.
      $modal.removeClass("loaded");

      // Delay.
      setTimeout(function () {
        $modal.removeClass("visible");

        setTimeout(function () {
          // Clear src.
          $modalImg.attr("src", "");

          // Unlock.
          $modal[0]._locked = false;

          // Focus.
          $body.focus();
        }, 475);
      }, 125);
    })
    .on("keypress", ".modal", function (event) {
      var $modal = $(this);

      // Escape? Hide modal.
      if (event.keyCode == 27) $modal.trigger("click");
    })
    .prepend(
      '<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>'
    )
    .find("img")
    .on("load", function (event) {
      var $modalImg = $(this),
        $modal = $modalImg.parents(".modal");

      setTimeout(function () {
        // No longer visible? Bail.
        if (!$modal.hasClass("visible")) return;

        // Set loaded.
        $modal.addClass("loaded");
      }, 275);
    });
})(jQuery);

let currentIndex = 0;
const items = document.querySelectorAll(".carousel-item");
const totalItems = items.length;

function showNextItem() {
  items[currentIndex].classList.remove("active");
  currentIndex = (currentIndex + 1) % totalItems;
  items[currentIndex].classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  items[currentIndex].classList.add("active");
  setInterval(showNextItem, 3000); // Change item every 3 seconds
});

document.addEventListener("DOMContentLoaded", function () {
  const quoteBoxes = document.querySelectorAll(".quote-box");

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function handleScroll() {
    quoteBoxes.forEach((quoteBox) => {
      if (isInViewport(quoteBox)) {
        quoteBox.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Trigger the scroll handler once to check the initial position
});

function resetZoom() {
  document.body.style.zoom = "100%";
}

window.onload = resetZoom;

function scrollToElement(event, elementId) {
  event.preventDefault();
  const element = document.getElementById(elementId);
  let offsetPosition;

  if (elementId === "workex") {
    // Scroll to the top of the "Experience" section
    offsetPosition = element.offsetTop;
  } else {
    // Center the element
    const elementRect = element.getBoundingClientRect();
    const elementPosition = elementRect.top + window.pageYOffset;
    offsetPosition =
      elementPosition - (window.innerHeight / 2 - elementRect.height / 2);
  }

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const timelineContainer = document.querySelector(".timeline-container");
  const timeline = document.querySelector(".timeline");
  const items = document.querySelectorAll(".timeline-item");
  let observerOptions = {
    threshold: 0.1,
  };

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Start the line animation
        timelineContainer.classList.add("scrolled");
        // Make items appear as the line "reaches" them
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("active");
          }, index * 400); // Delay for each item to create a sequential appearance
        });
        // Stop observing once the animation is triggered
        observer.disconnect();
      }
    });
  }, observerOptions);

  observer.observe(timelineContainer);
});

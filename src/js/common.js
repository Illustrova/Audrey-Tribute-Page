var mqls = window.matchMedia("(min-width: 768px)");
var slider = document.getElementsByClassName("slider"); //Find all sliders on the page
window.mySwipe = [];

for (var i = 0; i < slider.length; i++) {
	//Swipe instance classes has to be numbered, thus have unique class. It can be done automatically with Pug
	var prev = document.querySelector(".slider-prev-" + (i + 1));
	var next = document.querySelector(".slider-next-" + (i + 1));
	var swipe = document.querySelector(".mobile-slider-" + (i + 1));

	// Create new Swipe instance and push in array
	mySwipe.push(
		new Swipe(swipe, {
			startSlide: 0,
			draggable: true,
			continuous: true,
			disableScroll: false,
			stopPropagation: true
		})
	);

	// Slider controls
	prev.onclick = mySwipe[i].prev;
	next.onclick = mySwipe[i].next;
}

function mediaqueryresponse(mql) {
	for (var i = 0; i < slider.length; i++) {
		if (!mqls.matches) {
			mySwipe[i].setup();
		}
		else {
			mySwipe[i].kill();
		}
	}
}

mediaqueryresponse(mqls); // call listener function explicitly at run time
mqls.addListener(mediaqueryresponse); // attach listener function to listen in on state changes

//Scroll to top button
function scrollTo(element, to, duration) {
		var start = element.scrollTop,
				change = to - start,
				currentTime = 0,
				increment = 20;

		var animateScroll = function(){
				currentTime += increment;
				var val = Math.easeInOutQuad(currentTime, start, change, duration);
				element.scrollTop = val;
				if(currentTime < duration) {
						setTimeout(animateScroll, increment);
				}
		};
		animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

//Call
var buttonToTop = document.getElementById('totop');
buttonToTop.onclick = function () {
	 scrollTo(document.documentElement, 0, 1000);
};

window.addEventListener('scroll', function() {
	if (document.documentElement.scrollTop > 200) {
		buttonToTop.classList.add("visible");
						} else {
		buttonToTop.classList.remove("visible");
	}
});

//Conditionally add icon sprite stylesheet, if svg not supported
if (!Modernizr.svg) {
	var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = "text/css"
		link.href = "css/icons.css";
	document.head.appendChild(link);
}

//lazy load images
document.addEventListener("DOMContentLoaded", function(){
	if("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in  window.IntersectionObserverEntry.prototype){
		elements = document.querySelectorAll("img");

		var imageObserver = new IntersectionObserver(function(entries, observer){
			entries.forEach(function(entry){
				if(entry.isIntersecting){
					entry.target.setAttribute("src", entry.target.getAttribute("data-src"));
					entry.target.setAttribute("srcset", entry.target.getAttribute("data-srcset"));
					entry.target.setAttribute("sizes", entry.target.getAttribute("data-sizes"));

					imageObserver.unobserve(entry.target);
				}
			});
		});

		elements.forEach(function(image){
			imageObserver.observe(image);
		});
	}
});
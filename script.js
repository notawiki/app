/* 
- undo button
- try to make it work for Safari
- shadow on the main box element
- optimize code
*/

document.addEventListener('DOMContentLoaded', function () {
	// Setting variables
	var box = document.querySelector('.box'), 
		box_clicked = false,
		dot = document.querySelector('.dot'),
		dot_x = 0,
		dot_y = -250,
		dot_css = window.getComputedStyle(dot),
		dot_clip = dot_css.getPropertyValue('-webkit-clip-path').match(/([0-9]+)/g),
		box_offset = box.getBoundingClientRect(),
		masterpiece = document.getElementById('masterpiece'),
		old_min_x = box_offset.left,
		old_max_x = box_offset.right,
		new_min_x = 0,
		new_max_x = box_offset.right-box_offset.left,
		old_min_y = box_offset.top,
		old_max_y = box_offset.bottom,
		new_min_y = 0,
		new_max_y = box_offset.bottom-box_offset.top,
		ready = document.querySelector('.ready'),
		burst = document.querySelector('.burst'),
		animationEvent = whichAnimationEvent(),
		nothing = function(){};

	// Reset some width variables on window resize
	window.onresize = function() {
		box_offset = box.getBoundingClientRect(),
		old_min_x = box_offset.left,
		old_max_x = box_offset.right,
		new_min_x = 0,
		new_max_x = box_offset.right-box_offset.left;
	}

	// Remaping the range of the cursor's movement on the box to 0 -> box_width
	function remapRange(value, old_min, old_max, new_min, new_max, num) {
		return Math.floor(
			((( value - old_min ) / (old_max - old_min)) * (new_max - new_min) + new_min)-new_max+num
		);
	}

	// Moving the dot on mousemove
	box.onmousemove = function(e) {
		dot_x = remapRange(e.clientX, old_min_x, old_max_x, new_min_x, new_max_x, 180);
		dot_y = remapRange(e.clientY, old_min_y, old_max_y, new_min_y, new_max_y, -200);

		

		if(box_clicked == false) {
			dot.style.webkitClipPath = 'circle('+parseInt(dot_clip[0])+'px at ' + -dot_x + 'px ' + -dot_y + 'px)';
		}

		
	}

	// Multiple keystrokes - create an object to store keys
	var map = {};
	onkeydown = onkeyup = function(e){
	    e = e || event; // to deal with IE
	    map[e.keyCode] = e.type == 'keydown';

	    if(map[13] && map[93] && masterpiece === document.activeElement) {
	    	console.log("Cmd + Enter");
	    	submitNote();
	    }
	}

	// Animating the dot
	function animate (render, duration, easing, callback) {
	  var start = Date.now();
	  (function loop () {
	    var p = (Date.now()-start)/duration;
	    render(easing(p));
	    if (p > 1) {
	      render(1);
	      callback();
	    }
	    else {
	      requestAnimationFrame(loop);
	      render(easing(p));
	    }
	  }());
	}

	function submitNote(callback) {
		// Changing box_clicked to true so we have a persistent state
		box_clicked = true;

		// Turn the dot bluish (just because :))
		dot.classList.add('loaded');

		// Actually enlarging the dot using the outputed eased "p"
		function enlargeDot(p) {
	    	dot.style.webkitClipPath = 'circle('+(parseInt(dot_clip[0])*(p*4.5+1))+'px at ' + -dot_x + 'px ' + -dot_y + 'px)';
		}

		// Paint the body grey
		document.body.className = 'toggle';

		// Activate the loading image
		ready.classList.add('loading');

		// Enable Undo button, hide the Submit button
		document.querySelector('.undo').classList.remove('hidden');
		document.querySelector('.save').classList.add('hidden');
		document.querySelector('.ready-wrapper').classList.remove('hidden')

		// Initiate enlargeDot with timing and bezier settings
		animate(enlargeDot, 400, BezierEasing(0.645, 0.045, 0.355, 1.0), function(){dot_clip[0] = parseInt(dot_clip[0])*(4.5+1);});
	}

	// Clicking the dot
	dot.onclick = function() {
		submitNote();
	}

	// function show(el) {
	// 	for (var i = 0; i < )
	// }

	var one, two, three;

	var object = [one, two, three]

	console.log(object);

	var unClick = function() {
		setTimeout(
			function() {
				animate(function(p){
					dot.style.webkitClipPath = 'circle('+(parseInt(dot_clip[0])/(p*4.5+1))+'px at -65px 355px)';
				}, 1000, BezierEasing(.5, 0, 0.355, 0), function(){
					dot_clip[0] = 100;
					document.querySelector('.undo').classList.add('hidden');
					document.querySelector('.save').classList.remove('hidden');
					document.querySelector('.ready-wrapper').classList.add('hidden');
					document.querySelector('.ready-dot').classList.add('hidden');
					burst.classList.add('hidden');
					burst.classList.remove('explode');

					ready.classList.remove('loading', 'loaded');
				});
				
				document.body.className = '';

				

				box_clicked = false;
			}, 
		1000);
	};

	// Textarea make font-size change with length
	masterpiece.oninput = function(e) {
		var val = e.target.value.length;
		if (val >= 35 && val <= 100) {
			this.style.fontSize = "1.17em";
		}
		else if (val >= 100 && val <= 155) {
			this.style.fontSize = "1.1em";
		}
		else if (val >= 155) {
			this.style.fontSize = "1em";
		}
		else {
			this.style.fontSize = "1.25em";
		}
	}

	/* From Modernizr */
	function whichAnimationEvent(e){
	    var t;
	    var animations = {
	      'animation':'animationend',
	      'OAnimation':'oAnimationEnd',
	      'MozAnimation':'animationend',
	      'WebkitAnimation':'webkitAnimationEnd'
	    }

	    for(t in animations){
	        if( document.querySelector('.ready').style[t] !== undefined ){
	            return animations[t];
	        }
	    }
	}

	/* Listen for a transition! */
	animationEvent && document.querySelector('.ready').addEventListener(animationEvent, function() {
		ready.classList.add('loaded');
		burst.classList.remove('hidden');
		burst.classList.add('explode');
		document.querySelector('.ready-dot').classList.remove('hidden');
		unClick();
	});

	// Once
	function once(fn, context) { 
		var result;

		return function() { 
			if(fn) {
				result = fn.apply(context || this, arguments);
				fn = null;
			}

			return result;
		};
	}
});

 document.getElementById('logout').addEventListener('click', function() {
   session.signUserOut(window.location.origin);
 })

function showProfile(profile) {
   var person = new blockstack.Person(profile)
   document.getElementById('heading-name').innerHTML = person.name()
   document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
   document.getElementById('section-1').style.display = 'none'
   document.getElementById('section-2').style.display = 'block'
 }

 if (session.isUserSignedIn()) {
  const userData = session.loadUserData()
   showProfile(userData.profile)
 } else if (session.isSignInPending()) {
   session.handlePendingSignIn()
   .then(userData => {
     showProfile(userData.profile)
   })
 }

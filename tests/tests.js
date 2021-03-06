﻿var testEnvironment = {    
	setup: function () {
		$("#qunit-fixture").append("<section id='slide1'></section>" +
									"<section id='slide2'></section>" +
									"<section id='slide3'></section>");
		p5.start();
	},

	teardown: function () {
		p5.stop();
	}
};

module("navigation", testEnvironment);
	
test("Sets first slide as start slide", function () {
	ok($("#slide1").hasClass("current"));    
});

test("Moves to next slide on right arrow", function () {    
	fakeKeyboard.pressRightArrow();
	ok($("#slide2").hasClass("current"));
});

test("Moves to next slide on enter", function () {
	fakeKeyboard.pressEnter();
	ok($("#slide2").hasClass("current"));
});

test("Doesn't move past last slide", function () {
	fakeKeyboard.pressRightArrow(4);
	ok($("#slide3").hasClass("current"));
});

test("Moves to previous slide on left arrow", function() {
	fakeKeyboard.pressRightArrow()
				.pressLeftArrow();
	ok($("#slide1").hasClass("current"));
});

test("Moves to first slide on home", function() {
	fakeKeyboard.pressRightArrow()
				.pressHome();
	ok($("#slide1").hasClass("current"));
});

test("Moves to last slide on end", function () {    
	fakeKeyboard.pressEnd();
	ok($("#slide3").hasClass("current"));
});

module("History", testEnvironment);

test("Pushes state on move", function () {
	fakeKeyboard.pressRightArrow();
	strictEqual(lastState.url, "#1");
});

var animTestEnvironment = {
	setup: function () {
		$("#qunit-fixture").append("<section id='slide1'></section>" +
									"<section id='slide2' data-animation='testanimation'></section>" +
									"<section id='slide3'></section>");
		p5.start();
	},

	teardown: function () {
		p5.stop();
	}
};

module("Animation", animTestEnvironment);

test("Steps animation with right arrow", function () {
	fakeKeyboard.pressRightArrow(2);
	ok(lastAnimation.getState().stepCount == 1);
});

test("Cancels animation on left arrow", function () {
	fakeKeyboard.pressRightArrow(2)
				.pressLeftArrow();
	ok(lastAnimation.getState().isCancelled);
});

test("Resolved when stepping stops", function () {
	fakeKeyboard.pressRightArrow(4);
	ok(lastAnimation.getState().isResolved);
});

test("Moves to next slide when animation complete", function () {
	fakeKeyboard.pressRightArrow(5);
	ok($("#slide3").hasClass("current"));
});

module("array remove test");

test("Can remove object reference from Array", function () {
	var o1 = {};
	var o2 = {};
	var o3 = {};
	var array = [o1, o2, o3];

	array.remove(o2);
	ok(array.length == 2);
});

var lastState = null;

window.history.pushState = function(data, title, url) {
	lastState = {
			data:data,
			title:title,
			url:url
	};
};

var lastAnimation = null;

var testAnimation = function () {

	var stepCount = 0;
	var isCancelled = false;
	var deferred = $.Deferred();

	var complete = function () {
		$(window).unbind("killAnimations", complete);
		isCancelled = true;
		deferred.resolve();
	};

	$(window).bind("killAnimations", complete);

	lastAnimation = {
		done: deferred.promise(),
		step: function () {
			stepCount++;
			if (stepCount >= 3) {
				deferred.resolve();
			}
		},                
		getState: function () {
			return {                
				stepCount: stepCount,
				isCancelled: isCancelled,
				isResolved: deferred.isResolved()
			};
		}
	};

	return lastAnimation;
};

p5.registerAnimations({
	testanimation: testAnimation
});

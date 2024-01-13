"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
	console.debug("navAllStories", evt);
	hidePageComponents();
	putStoriesOnPage();
	$submitForm.hide();
	$favouriteStories.hide();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
	console.debug("navLoginClick", evt);
	hidePageComponents();
	$loginForm.show();
	$signupForm.show();
}

$navLogin.on("click", navLoginClick);

// stuff to run when the submit button is clicked
function navSubmitClick(evt) {
	console.debug("navSubmitClick", evt);
	$submitForm.show();
	$allStoriesList.show();
	$favouriteStories.hide();
}

$navSubmit.on("click", navSubmitClick);

function navFavouriteClick(evt) {
	$allStoriesList.hide();
	$submitForm.hide();
	$favouriteStories.show();
	addtofavoriteStoryList();
}
$navFavourite.on("click", navFavouriteClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
	console.debug("updateNavOnLogin");
	$(".main-nav-links").show();
	$navLogin.hide();
	$navLogOut.show();
	$navSubmit.show();
	$navFavourite.show();
	$navUserProfile.text(`${currentUser.username}`).show();
	$loginForm.hide();
	$signupForm.hide();
}

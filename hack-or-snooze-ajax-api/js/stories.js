"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
	const hostName = story.getHostName();
	return $(`
      <li id="${story.storyId}">
	  	<span class="star">
		  <i class="${currentUser.isFavorite(story) ? "fas" : "far"} fa-star"></i>
		</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	$allStoriesList.empty();
	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

async function submitStoryOnPage(evt) {
	evt.preventDefault();
	const title = $("#submit-title").val();
	const author = $("#submit-author").val();
	const url = $("#submit-url").val();
	const newStory = await storyList.addStory(currentUser, {
		title,
		author,
		url,
	});
	const $addStory = generateStoryMarkup(newStory);
	$allStoriesList.prepend($addStory);
	$submitForm.hide();
}

$submitForm.on("submit", submitStoryOnPage);

// function putFavoriteOnPage(user) {
// 	console.log("this is current user ===>", user);
// 	let userFavorite = user.favorites;
// 	for (let fav of userFavorite) {
// 		const $fav = generateStoryMarkup(fav);
// 		$favouriteStories.append($fav);
// 	}
// 	// const $fav = userFavorite[user.favorites.length - 1];
// 	// $favouriteStories.append($fav);
// }

function toggleFavorite(event) {
	event.preventDefault();
	const $evt = $(event.target);
	const $evtId = $($evt.closest("li")).attr("id");
	const $evtClass = $evt.attr("class");
	const story = storyList.stories.find((s) => s.storyId === $evtId);
	console.log("this is story====>", story);
	console.log("this is user ====>", currentUser);

	if ($evtClass.includes("far")) {
		console.log("setfavorite method");
		currentUser.setFavorite(story);
		$evt.toggleClass("fas far");
	} else {
		console.log("removefavorite method");
		currentUser.removeFavorite(story);
		$evt.toggleClass("fas far");
	}
}

$allStoriesList.on("click", ".star", toggleFavorite);

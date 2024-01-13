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

function generateStoryMarkup(story, status = false) {
	const hostName = story.getHostName();
	const currentUserTrue = Boolean(currentUser);

	return $(`
      <li id="${story.storyId}">
	  	${status ? addbin() : ""}
	  	${currentUserTrue ? addStarHtml(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function addStarHtml(story) {
	return `<span class="star">
		<i class="${currentUser.isFavorite(story) ? "fas" : "far"} fa-star"></i>
	</span>`;
}

function addbin() {
	return `<span class="trash-can">
		<i class="fas fa-trash-alt"></i>
	</span>`;
}

function addToFavoriteStoryList() {
	$favouriteStories.empty();
	if (currentUser.favorites.length === 0) {
		$favouriteStories.append("<h5>No favourite Stories added!</h5>");
	} else {
		for (let story of currentUser.favorites) {
			const newFav = generateStoryMarkup(story);
			$favouriteStories.append(newFav);
		}
	}
}

async function deleteStory(event) {
	const $target = $(event.target);
	const $id = $($target.closest("li")).attr("id");
	const $story = storyList.stories.find((s) => s.storyId === $id);
	await storyList.delStory($id, currentUser.loginToken);
	addMyStoryList();
}
$myStories.on("click", ".trash-can", deleteStory);

function addMyStoryList() {
	$myStories.empty();
	if (currentUser.ownStories.length === 0) {
		$myStories.append("<h5>No story added by User yet</h5>");
	} else {
		for (let story of currentUser.ownStories) {
			const newMyStory = generateStoryMarkup(story, true);
			$myStories.append(newMyStory);
		}
		console.log(currentUser.ownStories);
	}
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
	// currentUser.addRemoveMyStories(newStory, "add");
	$submitForm.hide();
	getAndShowStoriesOnStart();
}

$submitForm.on("submit", submitStoryOnPage);

function toggleFavorite(event) {
	event.preventDefault();
	const $evt = $(event.target);
	const $evtId = $($evt.closest("li")).attr("id");
	const $evtClass = $evt.attr("class");
	const story = storyList.stories.find((s) => s.storyId === $evtId);

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
$favouriteStories.on("click", ".star", toggleFavorite);
$myStories.on("click", ".star", toggleFavorite);

"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
	/** Make instance of Story from data object about story:
	 *   - {title, author, url, username, storyId, createdAt}
	 */

	constructor({ storyId, title, author, url, username, createdAt }) {
		this.storyId = storyId;
		this.title = title;
		this.author = author;
		this.url = url;
		this.username = username;
		this.createdAt = createdAt;
	}

	/** Parses hostname out of URL and returns it. */

	getHostName(story) {
		const url = new URL(story.url);
		const domain = url.hostname.replace(/^www\./, "");
		return domain;
	}
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
	constructor(stories) {
		this.stories = stories;
	}

	/** Generate a new StoryList. It:
	 *
	 *  - calls the API
	 *  - builds an array of Story instances
	 *  - makes a single StoryList instance out of that
	 *  - returns the StoryList instance.
	 */

	static async getStories() {
		// Note presence of `static` keyword: this indicates that getStories is
		//  **not** an instance method. Rather, it is a method that is called on the
		//  class directly. Why doesn't it make sense for getStories to be an
		//  instance method?

		// query the /stories endpoint (no auth required)
		const response = await axios({
			url: `${BASE_URL}/stories`,
			method: "GET",
		});
		// turn plain old story objects from API into instances of Story class
		const stories = response.data.stories.map((story) => new Story(story));
		// build an instance of our own class using the new array of stories
		return new StoryList(stories);
	}

	/** Adds story data to API, makes a Story instance, adds it to story list.
	 * - user - the current instance of User who will post the story
	 * - obj of {title, author, url}
	 *
	 * Returns the new Story instance
	 */

	// async addStory( /* user, newStory */) {
	//   // UNIMPLEMENTED: complete this function!
	// }
	async addStory(user, storyDetails) {
		// we post story to the api
		const response = await axios({
			url: `${BASE_URL}/stories`,
			method: "POST",
			data: { token: user.loginToken, story: storyDetails },
		});
		// We read the respone to get the story and add to new Story
		const recentStory = response.data.story;
		const newStory = new Story(recentStory);
		this.stories.unshift(newStory);
		user.ownStories.unshift(newStory);

		return newStory;

		// UNIMPLEMENTED: complete this function!
	}

	async delStory(id, token) {
		const response = await axios({
			url: `${BASE_URL}/stories/${id}`,
			method: "DELETE",
			data: { token },
		});
		console.log("this is response ===> ", response);
		this.stories = this.stories.filter((s) => s.storyId !== id);
		currentUser.favorites = currentUser.favorites.filter(
			(s) => s.storyId !== id
		);
		currentUser.ownStories = currentUser.ownStories.filter(
			(s) => s.storyId !== id
		);
		return response;
	}

	async updateCurrentStory(inputStory, change) {
		const response = await axios({
			url: `${BASE_URL}/stories/${inputStory.storyId}`,
			method: "PATCH",
			data: {
				token: currentUser.loginToken,
				story: change,
			},
		});
		const recentStroy = response.data.story;
		const newStory = new Story(recentStroy);
		return newStory;
	}
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
	/** Make user instance from obj of user data and a token:
	 *   - {username, name, createdAt, favorites[], ownStories[]}
	 *   - token
	 */

	constructor(
		{ username, name, createdAt, favorites = [], ownStories = [] },
		token
	) {
		this.username = username;
		this.name = name;
		this.createdAt = createdAt;

		// instantiate Story instances for the user's favorites and ownStories
		this.favorites = favorites.map((s) => new Story(s));
		this.ownStories = ownStories.map((s) => new Story(s));

		// store the login token on the user so it's easy to find for API calls.
		this.loginToken = token;
	}

	/** Register new user in API, make User instance & return it.
	 *
	 * - username: a new username
	 * - password: a new password
	 * - name: the user's full name
	 */

	static async signup(username, password, name) {
		const response = await axios({
			url: `${BASE_URL}/signup`,
			method: "POST",
			data: { user: { username, password, name } },
		});

		let { user } = response.data;

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories,
			},
			response.data.token
		);
	}

	/** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

	static async login(username, password) {
		const response = await axios({
			url: `${BASE_URL}/login`,
			method: "POST",
			data: { user: { username, password } },
		});

		let { user } = response.data;

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories,
			},
			response.data.token
		);
	}

	/** When we already have credentials (token & username) for a user,
	 *   we can log them in automatically. This function does that.
	 */

	static async loginViaStoredCredentials(token, username) {
		try {
			const response = await axios({
				url: `${BASE_URL}/users/${username}`,
				method: "GET",
				params: { token },
			});
			let { user } = response.data;

			return new User(
				{
					username: user.username,
					name: user.name,
					createdAt: user.createdAt,
					favorites: user.favorites,
					ownStories: user.stories,
				},
				token
			);
		} catch (err) {
			console.error("loginViaStoredCredentials failed", err);
			return null;
		}
	}
	// addRemoveMyStories(story, task) {
	// 	if (task === "add") {
	// 		this.ownStories.push(story);
	// 	} else {
	// 		this.ownStories = this.ownStories.filter(
	// 			(s) => s.storyId !== story.storyId
	// 		);
	// 	}
	// }
	setOwnStory(story, oldInd) {
		// const storyIndex = this.ownStories.indexOf()
		// console.log("this is the new input story ===> ", story);
		// console.log("this is currenUser Ownstories before == >", this.ownStories);
		// this.ownStories = this.ownStories.filter(
		// 	(s) => s.storyId !== story.storyId
		// );
		// this.ownStories.push(story);
		this.ownStories[oldInd] = story;
		// console.log("this is currenUser Ownstories after == >", this.ownStories);
	}
	updateFavStory(story, oldind) {
		if (oldind !== -1) {
			this.favorites[oldind] = story;
		}
	}

	async setFavorite(story) {
		this.favorites.push(story);
		await this.postOrDeleteFav(story, "POST");
	}

	async removeFavorite(story) {
		this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId);
		await this.postOrDeleteFav(story, "DELETE");
	}

	async postOrDeleteFav(story, task) {
		const token = this.loginToken;
		const response = await axios({
			url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
			method: task,
			data: { token },
		});
	}

	isFavorite(story) {
		return this.favorites.some((s) => s.storyId === story.storyId);
	}
}

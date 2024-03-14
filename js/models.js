"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: Represents a single story in the system
 ******************************************************************************/
class Story {
  /** Constructs an instance of Story from a data object */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Returns the hostname extracted from the story's URL */
  getHostName() {
    return new URL(this.url).host;
  }
}

/******************************************************************************
 * StoryList: Represents a list of Story instances
 ******************************************************************************/
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generates and returns a new StoryList by fetching stories from the API */
  static async getStories() {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    const stories = response.data.stories.map(story => new Story(story));
    return new StoryList(stories);
  }

  /** Adds a new story to the API and the story list, and returns the new Story instance */
  async addStory(user, { title, author, url }) {
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },
    });

    const story = new Story(response.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);

    return story;
  }

  /** Removes a story from the API and updates the story list and user's stories */
  async removeStory(user, storyId) {
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken },
    });

    this.stories = this.stories.filter(story => story.storyId !== storyId);
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }
}

/******************************************************************************
 * User: Represents a user in the system (used for the current user)
 ******************************************************************************/
class User {
  /** Constructs a User instance from user data and a token */
  constructor({ username, name, createdAt, favorites = [], ownStories = [] }, token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));
    this.loginToken = token;
  }

  /** Registers a new user with the API and returns a User instance */
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    return new User(response.data.user, response.data.token);
  }

  /** Logs in an existing user with the API and returns a User instance */
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    return new User(response.data.user, response.data.token);
  }

  /** Logs in a user with stored credentials and returns a User instance */
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      return new User(response.data.user, token);
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Adds a story to the user's favorites and updates the API */
  async addFavorite(story) {
    this.favorites.push(story);
    await this._addOrRemoveFavorite("add", story);
  }

  /** Removes a story from the user's favorites and updates the API */
  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }

  /** Helper method to update the API with favorite changes */
  async _addOrRemoveFavorite(newState, story) {
    const method = newState === "add" ? "POST" : "DELETE";
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token: this.loginToken },
    });
  }

  /** Checks if a story is a favorite of the user */
  isFavorite(story) {
    return this.favorites.some(s => s.storyId === story.storyId);
  }
}


"use strict";

// Holds the global list of stories, represented by an instance of StoryList
let storyList;

/** Loads and shows stories when the site initially loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * Renders HTML for an individual Story instance.
 * - story: An instance of Story
 * Returns the HTML markup for the story.
 */
function generateStoryMarkup(story, showDeleteBtn = false) {
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser); // Determines if the star for favorites should be shown

  return $(`
    <li id="${story.storyId}">
      <a href="${story.url}" target="a_blank" class="story-link">${story.title}</a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}

/** Fetches the list of stories from the server, generates their HTML, and displays them on the page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Generates HTML for a delete button used in story items. */
function getDeleteBtnHTML() {
  return `
    <span class="trash-can">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}

/** Generates HTML for a favorite/unfavorite star for stories. */
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far"; // Determine if the star should be solid or outline
  return `
    <span class="star">
      <i class="${starType} fa-star"></i>
    </span>`;
}

/** Handles the submission of the new story form. */
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // Collect form data
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };

  // Add story to the list
  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  // Hide and reset the form
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

/******************************************************************************
 * User's own stories management
 ******************************************************************************/

/** Displays the current user's stories. */
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();
  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true); // Show delete button
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

/******************************************************************************
 * Favorites list management and story favoriting functionality
 ******************************************************************************/

/** Displays the current user's favorites list. */
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();
  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Handles favoriting and unfavoriting a story. */
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // Toggle favorite status and star appearance
  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);

"use strict";

// Cache DOM elements for easy access
const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $storiesContainer = $("#stories-container");
const $ownStories = $("#my-stories");
const $favoritedStories = $("#favorited-stories");

const $storiesLists = $(".stories-list");

const $submitForm = $("#submit-form");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navSubmitStory = $("#nav-submit-story");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $userProfile = $("#user-profile");

/** Hides most page components to allow individual components to show themselves as needed. */
function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $userProfile,
    $submitForm,
  ];

  components.forEach(c => c.hide());
}

/** Main function to start the app. */
async function start() {
  console.debug("start");

  // Attempt to log in a remembered user, if credentials are in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // Update UI if a user is logged in
  if (currentUser) updateUIOnUserLogin();
}

// Begin the app once the DOM is fully loaded
console.warn(
  "HEY STUDENT: This program sends many debug messages to the console. " +
  "If you don't see the message 'start' below this, you're not seeing those helpful debug messages. " +
  "In your browser console, click on the menu 'Default Levels' and add 'Verbose'."
);
$(start);

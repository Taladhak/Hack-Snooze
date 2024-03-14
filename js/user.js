"use strict";

// Global variable to store the current logged-in user's instance
let currentUser;

/******************************************************************************
 * Handling user login, signup, and logout
 ******************************************************************************/

/** Handles login form submission and sets up the user instance if login is successful */
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // Retrieve username and password from form
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // Login user and set the current user instance
  currentUser = await User.login(username, password);

  // Reset the form and update the UI
  $loginForm.trigger("reset");
  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handles signup form submission and sets up the user instance if signup is successful */
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  // Retrieve name, username, and password from form
  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // Signup user and set the current user instance
  currentUser = await User.signup(username, password, name);

  // Reset the form and update the UI
  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handles logout button click by clearing credentials and reloading the page */
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Managing user credentials with localStorage
 ******************************************************************************/

/** Checks for stored user credentials and logs in the user if found */
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // Attempt to log in with stored credentials
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Stores current user credentials in localStorage for future sessions */
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * UI updates for user-related actions
 ******************************************************************************/

/** Updates the UI when a user logs in or signs up */
async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents();
  putStoriesOnPage();
  $allStoriesList.show();

  updateNavOnLogin();
  generateUserProfile();
  $storiesContainer.show();
}

/** Generates and displays the user profile section based on the current user's information */
function generateUserProfile() {
  console.debug("generateUserProfile");

  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}

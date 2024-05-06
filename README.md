# TheSluggers312Project
CSE 312 Project for group "The Sluggers"

# Our Website URL
# [SquidType](https://squidtype.me/)
Server is being hosted from deploy branch

# Project Part 3: Objective 3 (Creativity and Documentation)
A feature of our design that was added to our web app is the typing game on the main page (the page that includes the chat room). This game has numerous features of creativity, some of which cover other Objectives for the project. An example of a feature that isn't a subset of other requirements is the actual typing aspect of the game. To be more specific, the game allows you to type and it checks whether your typing is correct based on the displayed characters and the user's input characters. The text of the prompt highlights green when the typing is correct and begins to highlight red when the typing is incorrect (even if the typing is correct again, it will still be highlighted red for previous spelling mistakes until they are fixed). This creative feature allows the web app to be more interactive and fun as it allows for real-time feedback through an addicting game loop. The ability to compete against other users in a battle of skill is an especially enticing and creative feature.

# Creativity Feature: Testing Procedure
In order to access and interact with our creative feature, a user must navigate to the home page of our web app. 
- To access our home page, the user must first navigate to our website (either by clicking the above "Squid Type" hyperlink or by entering the web address in their browser "squidtype.me").
- Create two accounts in seperate browsers (e.g. firefox and chrome)
  - If the user is accessing the website for the first time or hasn't created an account yet, the user will be redirected to the login page, which allows you to register a new account or log into an existing one. Click the red "Sign Up!" button if you wish to sign up and register a new account on the website or simply log into an existing account if you have the login information.
- Once the user clicks the green "Login" button and logs into an account using the proper credentials, they will be redirected to the website's home page where the featured game is displayed next to the chat room.
- Start the game by clicking Ready on both browsers
  - To access this game, since the game is meant to be competitive, at least two separate users will have to click the red "Not ready" button to change it to a green "Ready" button.
  - Once two users are in the green "Ready" state, the countdown will begin.
- When the countdown finishes. The game will begin
  - Typing in characters and spelling words correctly, or incorrectly, as displayed by the prompt will highlight the text in green or red (respectively) to show visual feedback on the progress the user has in completing the challenge.
- Once game has started on one browser wait till the light turns red and beging typing
  - The game will end on both screen
- The Screen should display that the broswer you did not type has won and should display this on both browsers without refreshing during any of this period
- Finally the game should return to the lobby (ready up) screen
